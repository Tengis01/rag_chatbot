import { FastifyInstance } from "fastify";

import { requireUser } from "../../shared/session.js";
import {
  getConversationMessages,
  getConversations,
} from "./conversation-store.js";

export async function conversationsRoute(app: FastifyInstance): Promise<void> {
  app.get("/conversations", async (req, reply) => {
    const user = await requireUser(req, reply);
    if (!user) return;

    const conversations = await getConversations(user.id);

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
      const user = await requireUser(req, reply);
      if (!user) return;

      const messages = await getConversationMessages(req.params.id, user.id);

      if (!messages) {
        return reply.status(404).send({ error: "чат олдсонгүй" });
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
