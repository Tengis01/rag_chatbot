import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";

const app = Fastify({
  logger: true
});

await app.register(cors, {
  origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
  credentials: true
});

await app.register(multipart);

app.get("/health", async () => {
  return {
    ok: true,
    service: "document-rag-api"
  };
});

const port = Number(process.env.PORT ?? 4000);

app.listen({ port, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});