import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";

import { healthRoute } from "./routes/health.js";
import { configRoute } from "./routes/config.js";
import { documentsRoute } from "./modules/documents/documents.routes.js";
import { chatRoute } from "./modules/chat/chat.routes.js";
import { conversationsRoute } from "./modules/conversations/conversations.routes.js";

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
