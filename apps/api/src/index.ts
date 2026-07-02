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

const app = Fastify({ logger: true });

// ─── Plugins ─────────────────────────────────────────────────────
await app.register(cors, {
  // Allow any origin so the app works from a phone on the same WiFi.
  // `true` tells @fastify/cors to reflect the request Origin back,
  // which satisfies credentials mode without hardcoding an IP/hostname.
  origin: true,
  credentials: true,
});

await app.register(multipart);

// ─── Better Auth ─────────────────────────────────────────────────
// Bridges Fastify requests to Better Auth's Fetch-API handler.
// All auth endpoints live under /api/auth/* (sign-up, sign-in,
// sign-out, get-session, ...).
app.route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  async handler(request, reply) {
    const url = new URL(request.url, `http://${request.headers.host}`);
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
    response.headers.forEach((value, key) => reply.header(key, value));
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
app.listen({ port, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
