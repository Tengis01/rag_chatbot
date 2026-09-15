import { FastifyInstance } from "fastify";
import { config } from "../shared/config.js";

export async function configRoute(app: FastifyInstance): Promise<void> {
    app.get("/config", async (_req, reply) => {
        return reply.send({
            appName: "Баримтын RAG Чатбот",
            maxUploadSizeMb: config.maxUploadSizeMb,
            supportedFileTypes: ["pdf"],
            maxPasteLength: config.maxPasteLength,
        })
    })
}
