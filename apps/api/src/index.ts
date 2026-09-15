import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";

import { healthRoute } from "./routes/health.js";
import { configRoute } from "./routes/config.js";
import { documentsRoute } from "./modules/documents/documents.routes.js";
import { chatRoute } from "./modules/chat/chat.routes.js";
import { conversationsRoute } from "./modules/conversations/conversations.routes.js";
import { auth } from "./shared/auth.js";
import { runMigrations } from "./shared/db/migrate.js";
import { config } from "./shared/config.js";
import { chatWork, ingestionWork } from "./shared/workload.js";

// bodyLimit: the documented paste limit is 500k CHARS — Cyrillic is 2 bytes/char
// in UTF-8 (~1MB), which exceeded Fastify's 1MB default (ERR-027).
const app = Fastify({
  logger: { redact: ["req.headers.cookie", "req.headers.authorization", "res.headers.set-cookie"] },
  bodyLimit: 4 * 1024 * 1024,
  // Production API is reachable only through the private Nginx network.
  trustProxy: config.production ? 1 : false,
});

// Apply pending SQL migrations before accepting traffic
await runMigrations();

// Sweep orphaned ingestion jobs: extracted text lives in memory, so any
// document still pending/processing after a restart can never finish.
// Fail it honestly so the UI shows why instead of spinning forever.
const { db } = await import("./shared/db/db.js");
const orphans = await db.query(
  `UPDATE documents
   SET status = 'failed',
       error_message = 'Сервер дахин эхэлсэн тул боловсруулалт тасалдсан. Баримтаа дахин оруулна уу.',
       updated_at = NOW()
   WHERE status IN ('pending', 'processing')
   RETURNING id`
);
if (orphans.rowCount) {
  console.warn(`[startup] failed ${orphans.rowCount} orphaned processing document(s)`);
}

// ─── Plugins ─────────────────────────────────────────────────────
await app.register(cors, {
  // Allow any origin so the app works from a phone on the same WiFi.
  // `true` tells @fastify/cors to reflect the request Origin back,
  // which satisfies credentials mode without hardcoding an IP/hostname.
  origin: config.production ? [config.frontendURL!] : true,
  credentials: true,
});

await app.register(multipart, { limits: { fileSize: config.maxUploadSizeMb * 1024 * 1024, files: 1, fields: 2, parts: 3 } });

// ─── Better Auth ─────────────────────────────────────────────────
// Bridges Fastify requests to Better Auth's Fetch-API handler.
// All auth endpoints live under /api/auth/* (sign-up, sign-in,
// sign-out, get-session, ...).
app.route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  async handler(request, reply) {
    const url = new URL(request.url, config.authURL ?? `http://${request.headers.host}`);
    const headers = new Headers();
    Object.entries(request.headers).forEach(([key, value]) => {
      if (value) headers.append(key, value.toString());
    });

    const webRequest = new Request(url.toString(), {
      method: request.method,
      headers,
      body: request.body ? JSON.stringify(request.body) : undefined,
    });

    const response = await auth.handler(webRequest);

    reply.status(response.status);
    response.headers.forEach((value, key) => {
      if (key !== "set-cookie") reply.header(key, value);
    });
    const cookies = response.headers.getSetCookie();
    if (cookies.length) reply.header("set-cookie", cookies);
    reply.send(response.body ? await response.text() : null);
  },
});

// ─── Routes ──────────────────────────────────────────────────────
await app.register(healthRoute);
await app.register(configRoute);
await app.register(documentsRoute);
await app.register(chatRoute);
await app.register(conversationsRoute);

// ─── Start ───────────────────────────────────────────────────────
const port = Number(process.env.PORT ?? 4000);
// Maintenance drain must finish before stopping this single API process.
for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.once(signal, () => {
    if (ingestionWork.active || chatWork.active) app.log.warn("Stopping with active work; drain before deployment");
    app.close().then(() => db.end()).catch((err) => { app.log.error(err); process.exitCode = 1; });
  });
}
app.listen({ port, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
