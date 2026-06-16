import { FastifyInstance } from "fastify";
import { db } from "../lib/db.js";

export async function healthRoute(app: FastifyInstance): Promise<void> {
  app.get("/health", async (_req, reply) => {
    try {
      await db.query("SELECT 1");
      return reply.send({
        ok: true,
        service: "document-rag-api",
        db: "connected",
      });
    } catch {
      return reply.send({
        ok: false,
        service: "document-rag-api",
        db: "error",
      });
    }
  });
}