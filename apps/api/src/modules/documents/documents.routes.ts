import { FastifyInstance } from "fastify";
import { extractTextFromPDF } from "./pdf-extractor.js";
import { storeDocumentText, getDocumentById } from "./document-store.js";
import { db } from "../../shared/db/db.js";
import { DEMO_USER_ID } from "../../shared/constants.js";
import { processDocument } from "../ingestion/pipeline.js";

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
                 VALUES ($1, $2, 'pdf', 'pending') RETURNING id`,
                 [DEMO_USER_ID, data.filename]
            );

            const documentId: string = insertResult.rows[0].id;

            storeDocumentText(documentId, extractedText);

            // Start pipeline in the background using setImmediate
            setImmediate(() => {
                processDocument(documentId, extractedText).catch((err) => {
                    console.error("upload pipeline error:", err);
                });
            });

            return reply.status(201).send({
                documentId,
                filename: data.filename,
                sourceType: "pdf",
                status: "pending",
                extractedTextLength: extractedText.length,
            });
        } catch (err) {
            req.log.error(err);
            return reply.status(500).send({ error: "Файл боловсруулах явцад алдаа гарлаа" });
        }
    });

    app.post("/documents/paste", async (req, reply) => {
        const body = req.body as { text?: string; title?: string };
        const text = body?.text?.trim() ?? "";
        const title = body?.title?.trim() || "Хуулсан текст";

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
                 VALUES ($1, $2, 'text', 'pending')
                 RETURNING id`,
                [DEMO_USER_ID, title]
            );

            const documentId: string = insertResult.rows[0].id;

            storeDocumentText(documentId, text);

            // Start pipeline in the background using setImmediate
            setImmediate(() => {
                processDocument(documentId, text).catch((err) => {
                    console.error("paste pipeline error:", err);
                });
            });

            return reply.status(201).send({
                documentId,
                filename: title,
                sourceType: "text",
                status: "pending",
                extractedTextLength: text.length,
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

    app.get<{ Params: { id: string } }>("/documents/:id/status", async (req, reply) => {
        try {
            const { id } = req.params;
            const doc = await getDocumentById(id);

            if (!doc) {
                return reply.status(404).send({ error: "баримт олдсонгүй" });
            }

            // Ensure user owns this document
            if (doc.user_id !== DEMO_USER_ID) {
                return reply.status(403).send({ error: "хандах эрхгүй" });
            }

            return reply.send({
                id: doc.id,
                status: doc.status,
                chunkCount: doc.chunk_count ?? 0,
                title: doc.filename,
                filename: doc.filename,
                updatedAt: doc.updated_at,
            });
        } catch (err) {
            req.log.error(err);
            return reply.status(500).send({ error: "Баримтын төлөвийг шалгахад алдаа гарлаа" });
        }
    });

}
