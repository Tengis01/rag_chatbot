import { FastifyInstance } from "fastify";
import { z } from "zod";

import { requireUser } from "../../shared/session.js";
import { db } from "../../shared/db/db.js";
import { embedText } from "../ingestion/embedder.js";
import { retrieveChunks } from "../retrieval/retrieval.service.js";
import { generateAnswer } from "./generator.js";
import {
  conversationBelongsToUser,
  createConversation,
  linkDocuments,
  saveMessage,
  touchConversation,
} from "../conversations/conversation-store.js";

const chatBodySchema = z.object({
  conversationId: z.string().uuid().optional(),
  documentIds: z.array(z.string().uuid()).min(1),
  message: z.string().trim().min(1),
  useMMR: z.boolean().optional().default(true),
  // Power-user retrieval controls (Priority 9). Defaults match the
  // interim cross-lingual fix (ERR-021) — see DECISIONS.md before changing.
  threshold: z.number().min(0).max(1).optional().default(0.1),
  lambda: z.number().min(0).max(1).optional().default(0.5),
});

const NO_CONTEXT_REPLY =
  "Сонгосон баримтуудаас энэ асуултад хамаарах хангалттай мэдээлэл олдсонгүй.";

async function getReadyDocumentIds(
  userId: string,
  documentIds: string[]
): Promise<string[]> {
  const result = await db.query(
    `SELECT id
     FROM documents
     WHERE user_id = $1
       AND id = ANY($2::uuid[])
       AND status = 'ready'`,
    [userId, documentIds]
  );

  return result.rows.map((row) => row.id as string);
}

async function resolveConversationId(
  userId: string,
  conversationId: string | undefined,
  message: string,
  documentIds: string[]
): Promise<string | null> {
  if (conversationId) {
    const owned = await conversationBelongsToUser(conversationId, userId);
    if (!owned) return null;

    await linkDocuments(conversationId, userId, documentIds);
    return conversationId;
  }

  const conversation = await createConversation(userId, message);
  await linkDocuments(conversation.id, userId, documentIds);
  return conversation.id;
}

export async function chatRoute(app: FastifyInstance): Promise<void> {
  app.post("/chat", async (req, reply) => {
    const user = await requireUser(req, reply);
    if (!user) return;

    const parsed = chatBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({
          error: "chat хүсэлт буруу байна",
        details: parsed.error.flatten(),
      });
    }

    const {
      conversationId: requestedConversationId,
      documentIds,
      message,
      useMMR,
      threshold,
      lambda,
    } = parsed.data;

    try {
      const readyDocumentIds = await getReadyDocumentIds(user.id, documentIds);
      if (readyDocumentIds.length !== documentIds.length) {
        return reply.status(400).send({
          error: "сонгосон баримтууд байх ёстой, хэрэглэгчид хамаарах ёстой, мөн бэлэн төлөвтэй байх ёстой",
        });
      }

      if (requestedConversationId) {
        const owned = await conversationBelongsToUser(
          requestedConversationId,
          user.id
        );
        if (!owned) {
          return reply.status(404).send({ error: "чат олдсонгүй" });
        }
      }

      const embedding = await embedText(message);
      const chunks = await retrieveChunks(
        embedding,
        user.id,
        readyDocumentIds,
        5,
        threshold,
        lambda,
        useMMR
      );

      if (chunks.length === 0) {
        const conversationId = await resolveConversationId(
          user.id,
          requestedConversationId,
          message,
          readyDocumentIds
        );

        if (!conversationId) {
          return reply.status(404).send({ error: "чат олдсонгүй" });
        }

        await saveMessage(conversationId, user.id, "user", message);
        await saveMessage(
          conversationId,
          user.id,
          "assistant",
          NO_CONTEXT_REPLY,
          []
        );
        await touchConversation(conversationId, user.id);

        return reply.send({
          conversationId,
          reply: NO_CONTEXT_REPLY,
          sources: [],
        });
      }

      const assistantReply = await generateAnswer(message, chunks);
      const conversationId = await resolveConversationId(
        user.id,
        requestedConversationId,
        message,
        readyDocumentIds
      );

      if (!conversationId) {
        return reply.status(404).send({ error: "чат олдсонгүй" });
      }

      await saveMessage(conversationId, user.id, "user", message);
      await saveMessage(
        conversationId,
        user.id,
        "assistant",
        assistantReply,
        chunks
      );
      await touchConversation(conversationId, user.id);

      return reply.send({
        conversationId,
        reply: assistantReply,
        sources: chunks.map((chunk) => ({
          chunkId: chunk.chunkId,
          documentId: chunk.documentId,
          content: chunk.content,
          page: chunk.page,
          chunkIndex: chunk.chunkIndex,
          similarity: chunk.similarity,
        })),
      });
    } catch (err) {
      req.log.error(err);
      const message =
        err instanceof Error ? err.message : "chat хүсэлт амжилтгүй боллоо";
      return reply.status(500).send({ error: message });
    }
  });
}
