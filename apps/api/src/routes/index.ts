import type { FastifyInstance } from "fastify";
import { pool } from "../lib/db.js";

// Non-secret runtime config served to the frontend.
// NEVER include DATABASE_URL, GEMINI_API_KEY, or any secret here.
const runtimeConfig = {
  appName: "Document RAG Chatbot",
  maxUploadSizeMb: 20,
  supportedFileTypes: ["pdf", "txt"],
  supportedExtensions: [".pdf", ".txt"],
  maxChunkSize: 500,
  chunkOverlap: 50,
  similarityThreshold: 0.7,
  maxRetrievedChunks: 8,
};

export async function configRoutes(app: FastifyInstance) {
  app.get("/config", async (_req, reply) => {
    return reply.send(runtimeConfig);
  });
}

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async (_req, reply) => {
    try {
      await pool.query("SELECT 1");
      return reply.send({
        ok: true,
        service: "document-rag-api",
        db: "connected",
      });
    } catch (err) {
      app.log.error(err, "DB health check failed");
      return reply.send({
        ok: false,
        service: "document-rag-api",
        db: "error",
      });
    }
  });
}
