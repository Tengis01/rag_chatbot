import { FastifyInstance } from "fastify";

export async function configRoute(app: FastifyInstance): Promise<void> {
    app.get("/config", async (_req, reply) => {
        return reply.send({
            appName: "Document RAG Chatbot",
            maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB ?? 20),
            supportedFileTypes: ["pdf"],
            maxPasteLength: Number(process.env.MAX_PASTE_LENGTH ?? 500000),
        })
    })
}