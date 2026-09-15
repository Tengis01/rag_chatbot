import { FastifyInstance } from "fastify";
import { extractTextFromPDF } from "./pdf-extractor.js";
import { storeDocumentText, getDocumentById } from "./document-store.js";
import { db } from "../../shared/db/db.js";
import { requireUser } from "../../shared/session.js";
import { processDocument } from "../ingestion/pipeline.js";

import { config } from "../../shared/config.js";
import { ingestionWork, isDraining } from "../../shared/workload.js";

const MAX_FILE_SIZE = config.maxUploadSizeMb * 1024 * 1024;

export async function documentsRoute(app: FastifyInstance): Promise<void> {

    app.post("/documents/upload", async (req, reply) => {
        const user = await requireUser(req, reply);
        if (!user) return;

        const release = ingestionWork.acquire(user.id);
        if (!release) return reply.header("Retry-After", "30").status(isDraining() ? 503 : 429).send({ error: "Боловсруулалт завгүй байна. Түр хүлээгээд дахин оролдоно уу." });
        let background = false;
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

            if (data.file.truncated || buffer.length > MAX_FILE_SIZE) {
                return reply.status(413).send({ error: `Файл хэт том байна (${config.maxUploadSizeMb}MB-с ихгүй байх ёстой)` });
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
                 [user.id, data.filename]
            );

            const documentId: string = insertResult.rows[0].id;

            storeDocumentText(documentId, extractedText);

            // Keep the admission slot until the asynchronous pipeline finishes.
            background = true;
            setImmediate(() => {
                processDocument(documentId, extractedText).catch((err) => {
                    console.error("upload pipeline error:", err);
                }).finally(release);
            });

            return reply.status(201).send({
                documentId,
                filename: data.filename,
                sourceType: "pdf",
                status: "pending",
                extractedTextLength: extractedText.length,
            });
        } catch (err) {
            if (err instanceof app.multipartErrors.RequestFileTooLargeError) {
                return reply.status(413).send({ error: `Файл хэт том байна (${config.maxUploadSizeMb}MB-с ихгүй байх ёстой)` });
            }
            req.log.error(err);
            return reply.status(500).send({ error: "Файл боловсруулах явцад алдаа гарлаа" });
        } finally {
            if (!background) release();
        }
    });

    app.post("/documents/paste", async (req, reply) => {
        const user = await requireUser(req, reply);
        if (!user) return;

        const body = req.body as { text?: string; title?: string };
        const text = typeof body?.text === "string" ? body.text.trim() : "";
        const title = typeof body?.title === "string" ? body.title.trim().slice(0, 255) || "Хуулсан текст" : "Хуулсан текст";

        if (!text) {
            return reply.status(400).send({ error: "Текст хоосон байна"});
        }
        if (text.length < 10) {
            return reply.status(400).send({ error: "Текст маш богино байна (10 тэмдэгтээс их байх ёстой)"});
        }
        if (text.length > config.maxPasteLength) {
            return reply.status(400).send({ error: `Текст хэт урт байна (${config.maxPasteLength} тэмдэгтээс ихгүй байх ёстой)`});
        }

        const release = ingestionWork.acquire(user.id);
        if (!release) return reply.header("Retry-After", "30").status(isDraining() ? 503 : 429).send({ error: "Боловсруулалт завгүй байна. Түр хүлээгээд дахин оролдоно уу." });
        let background = false;
        try {
            const insertResult = await db.query(
                `INSERT INTO documents (user_id, filename, source_type, status)
                 VALUES ($1, $2, 'text', 'pending')
                 RETURNING id`,
                [user.id, title]
            );

            const documentId: string = insertResult.rows[0].id;

            storeDocumentText(documentId, text);

            // Keep the admission slot until the asynchronous pipeline finishes.
            background = true;
            setImmediate(() => {
                processDocument(documentId, text).catch((err) => {
                    console.error("paste pipeline error:", err);
                }).finally(release);
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
        } finally {
            if (!background) release();
        }
    });

    app.get("/documents", async (req, reply) => {
        const user = await requireUser(req, reply);
        if (!user) return;

        try {
            const result = await db.query(
                `SELECT id, filename, source_type, status, error_message, created_at
                 FROM documents
                 WHERE user_id = $1
                 ORDER BY created_at DESC`,
                [user.id]
            );

            const documents = result.rows.map((row) => ({
                id: row.id,
                filename: row.filename,
                sourceType: row.source_type,
                status: row.status,
                errorMessage: row.error_message ?? null,
                createdAt: row.created_at,
            }));

            return reply.send(documents);
        } catch (err) {
            req.log.error(err);
            return reply.status(500).send({ error: "Баримт бичгийн мэдээллийг авах явцад алдаа гарлаа" });
        }
    });

    app.get<{ Params: { id: string } }>("/documents/:id/status", async (req, reply) => {
        const user = await requireUser(req, reply);
        if (!user) return;

        try {
            const { id } = req.params;
            const doc = await getDocumentById(id);

            if (!doc) {
                return reply.status(404).send({ error: "баримт олдсонгүй" });
            }

            // Ensure user owns this document
            if (doc.user_id !== user.id) {
                return reply.status(403).send({ error: "хандах эрхгүй" });
            }

            return reply.send({
                id: doc.id,
                status: doc.status,
                chunkCount: doc.chunk_count ?? 0,
                title: doc.filename,
                filename: doc.filename,
                errorMessage: doc.error_message ?? null,
                updatedAt: doc.updated_at,
            });
        } catch (err) {
            req.log.error(err);
            return reply.status(500).send({ error: "Баримтын төлөвийг шалгахад алдаа гарлаа" });
        }
    });

}
