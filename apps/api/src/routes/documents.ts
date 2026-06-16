import { FastifyInstance } from "fastify";
import { extractTextFromPDF } from "../lib/pdf-extractor.js";
import { storeDocumentText } from "../lib/document-store.js";
import { db } from "../lib/db.js";
import { DEMO_USER_ID } from "../lib/constants.js";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export async function documentsRoute(app: FastifyInstance): Promise<void> {

    app.post("/documents/upload", async (req, reply) => {
        try {
            const data = await req.file();

            if (!data) {
                return reply.status(400).send({ error: "Файл олдсонгүй"});
            }

            const isPdf = data.mimetype === "application/pdf" || data.filename.toLowerCase().endsWith(".pdf");

            if (!isPdf) {
                return reply.status(400).send({ error: "Зөвхөн PDF файлуудыг хүлээн авна"});
            }

            const chunks: Buffer[] = [];
            for await (const chunk of data.file) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);

            if (buffer.length > MAX_FILE_SIZE) {
                return reply.status(400).send({ error: "Файл хэт том байна (20MB-с ихгүй байх ёстой)"});
            }

            let extractedText: string;
            try {
                extractedText = await extractTextFromPDF(buffer);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "PDF текстийг гаргаж чадсангүй";
                return reply.status(422).send({ error: message });
            }

            const insertResult = await db.query(
                `INSERT INTO documents (user_id, filename, source_type, status)
                 VALUES ($1, $2, 'pdf_upload', 'processed') RETURNING id`,
                 [DEMO_USER_ID, data.filename]
            );

            const documentId: string = insertResult.rows[0].id;

            await db.query(
                `UPDATE documents SET status = 'ready' WHERE id = $1`,
                [documentId]
            );

            storeDocumentText(documentId, extractedText);

            return reply.status(201).send({
                documentId,
                filename: data.filename,
                sourceType: "pdf",
                status: "ready",
                extractedTextLength: extractedText.length,
                textPreview: extractedText.slice(0, 300),
            });
        } catch (err) {
            req.log.error(err);
            return reply.status(500).send({ error: "Файл боловсруулах явцад алдаа гарлаа" });
        }
    });

    app.post("/documents/paste", async (req, reply) => {
        const body = req.body as { text?: string; title?: string };
        const text = body?.text?.trim() ?? "";
        const title = body?.title?.trim() || "Pasted text";

        if (!text) {
            return reply.status(400).send({ error: "Текст хоосон байна"});
        }
        if (text.length < 10) {
            return reply.status(400).send({ error: "Текст маш богино байна (10 тэмдэгтээс их байх ёстой)"});
        }
        if (text.length > 500000) {
            return reply.status(400).send({ error: "Текст хэт урт байна (500,000 тэмдэгтээс ихгүй байх ёстой)"});
        }

        try {
            const insertResult = await db.query(
                `INSERT INTO documents (user_id, filename, source_type, status)
                 VALUES ($1, $2, 'text', 'ready')
                 RETURNING id`,
                [DEMO_USER_ID, title]
            );

            const documentId: string = insertResult.rows[0].id;

            storeDocumentText(documentId, text);

            return reply.status(201).send({
                documentId,
                filename: title,
                sourceType: "text",
                status: "ready",
                extractedTextLength: text.length,
                textPreview: text.slice(0, 300),
            });
        } catch (err) {
            req.log.error(err);
            return reply.status(500).send({ error: "Текст боловсруулах явцад алдаа гарлаа" });
        }
    });

    app.get("/documents", async (req, reply) => {
        try {
            const result = await db.query(
                `SELECT id, filename, source_type, status, created_at
                 FROM documents
                 WHERE user_id = $1
                 ORDER BY created_at DESC`,
                [DEMO_USER_ID]
            );

            const documents = result.rows.map((row) => ({
                id: row.id,
                filename: row.filename,
                sourceType: row.source_type,
                status: row.status,
                createdAt: row.created_at,
            }));

            return reply.send(documents);
        } catch (err) {
            req.log.error(err);
            return reply.status(500).send({ error: "Баримт бичгийн мэдээллийг авах явцад алдаа гарлаа" });
        }
    });

}