import { FastifyInstance } from "fastify";
import { z } from "zod";

import { DEMO_USER_ID } from "../lib/constants.js";
import { db } from "../lib/db.js";
import { embedText } from "../lib/embedder.js";
import { retrieveChunks } from "../lib/retrieval.js";
import { generateAnswer } from "../lib/generator.js";
import {
  conversationBelongsToUser,
  createConversation,
  linkDocuments,
  saveMessage,
  touchConversation,
} from "../lib/conversation-store.js";

const chatBodySchema = z.object({
  conversationId: z.string().uuid().optional(),
  documentIds: z.array(z.string().uuid()).min(1),
  message: z.string().trim().min(1),
});

const NO_CONTEXT_REPLY =
  "I couldn't find relevant content in the selected documents.";

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
    const parsed = chatBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "invalid chat request",
        details: parsed.error.flatten(),
      });
    }

    const { conversationId: requestedConversationId, documentIds, message } =
      parsed.data;

    try {
      const readyDocumentIds = await getReadyDocumentIds(DEMO_USER_ID, documentIds);
      if (readyDocumentIds.length !== documentIds.length) {
        return reply.status(400).send({
          error: "selected documents must exist, belong to the user, and be ready",
        });
      }

      if (requestedConversationId) {
        const owned = await conversationBelongsToUser(
          requestedConversationId,
          DEMO_USER_ID
        );
        if (!owned) {
          return reply.status(404).send({ error: "conversation not found" });
        }
      }

      const embedding = await embedText(message);
      const chunks = await retrieveChunks(
        embedding,
        DEMO_USER_ID,
        readyDocumentIds
      );

      if (chunks.length === 0) {
        const conversationId = await resolveConversationId(
          DEMO_USER_ID,
          requestedConversationId,
          message,
          readyDocumentIds
        );

        if (!conversationId) {
          return reply.status(404).send({ error: "conversation not found" });
        }

        await saveMessage(conversationId, DEMO_USER_ID, "user", message);
        await saveMessage(
          conversationId,
          DEMO_USER_ID,
          "assistant",
          NO_CONTEXT_REPLY,
          []
        );
        await touchConversation(conversationId, DEMO_USER_ID);

        return reply.send({
          conversationId,
          reply: NO_CONTEXT_REPLY,
          sources: [],
        });
      }

      const assistantReply = await generateAnswer(message, chunks);
      const conversationId = await resolveConversationId(
        DEMO_USER_ID,
        requestedConversationId,
        message,
        readyDocumentIds
      );

      if (!conversationId) {
        return reply.status(404).send({ error: "conversation not found" });
      }

      await saveMessage(conversationId, DEMO_USER_ID, "user", message);
      await saveMessage(
        conversationId,
        DEMO_USER_ID,
        "assistant",
        assistantReply,
        chunks
      );
      await touchConversation(conversationId, DEMO_USER_ID);

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
        err instanceof Error ? err.message : "chat request failed";
      return reply.status(500).send({ error: message });
    }
  });
}
