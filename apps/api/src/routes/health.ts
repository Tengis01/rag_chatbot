import { FastifyInstance } from "fastify";
import { db } from "../shared/db/db.js";
import { config } from "../shared/config.js";
import { isDraining, ingestionWork, chatWork } from "../shared/workload.js";

export async function healthRoute(app: FastifyInstance): Promise<void> {
  app.get("/health", async (_req, reply) => {
    try {
      await db.query("SELECT 1");
      return reply.send({
        ok: true,
        service: "document-rag-api",
        db: "connected",
        revision: config.revision,
        draining: isDraining(),
        activeIngestion: ingestionWork.active,
        activeChats: chatWork.active,
      });
    } catch {
      return reply.status(503).send({
        ok: false,
        service: "document-rag-api",
        db: "error",
      });
    }
  });
}
