import { FastifyInstance } from "fastify";

import { DEMO_USER_ID } from "../../shared/constants.js";
import {
  getConversationMessages,
  getConversations,
} from "./conversation-store.js";

export async function conversationsRoute(app: FastifyInstance): Promise<void> {
  app.get("/conversations", async (_req, reply) => {
    const conversations = await getConversations(DEMO_USER_ID);

    return reply.send({
      conversations: conversations.map((conversation) => ({
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      })),
    });
  });

  app.get<{ Params: { id: string } }>(
    "/conversations/:id/messages",
    async (req, reply) => {
      const messages = await getConversationMessages(req.params.id, DEMO_USER_ID);

      if (!messages) {
        return reply.status(404).send({ error: "conversation not found" });
      }

      return reply.send({
        messages: messages.map((message) => ({
          id: message.id,
          role: message.role,
          content: message.content,
          sources: message.sources,
          createdAt: message.createdAt,
        })),
      });
    }
  );
}
