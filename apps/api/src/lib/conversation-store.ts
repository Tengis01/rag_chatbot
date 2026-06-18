import { db } from "./db.js";
import type { RetrievedChunk } from "./retrieval.js";

export interface ConversationSummary {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: unknown;
  createdAt: Date;
}

function titleFrom(value?: string): string {
  const title = value?.trim() || "New conversation";
  return title.length > 80 ? title.slice(0, 80) : title;
}

function sourcePayload(sources?: RetrievedChunk[]): unknown[] | null {
  if (!sources) return null;

  return sources.map((source) => ({
    chunkId: source.chunkId,
    documentId: source.documentId,
    content: source.content,
    page: source.page,
    chunkIndex: source.chunkIndex,
    similarity: source.similarity,
  }));
}

export async function createConversation(
  userId: string,
  title?: string
): Promise<{ id: string; title: string; createdAt: Date }> {
  const result = await db.query(
    `INSERT INTO conversations (user_id, title)
     VALUES ($1, $2)
     RETURNING id, title, created_at`,
    [userId, titleFrom(title)]
  );

  const row = result.rows[0];
  return {
    id: row.id as string,
    title: row.title as string,
    createdAt: row.created_at as Date,
  };
}

export async function getConversations(
  userId: string
): Promise<ConversationSummary[]> {
  const result = await db.query(
    `SELECT id, title, created_at, updated_at
     FROM conversations
     WHERE user_id = $1
     ORDER BY updated_at DESC, created_at DESC`,
    [userId]
  );

  return result.rows.map((row) => ({
    id: row.id as string,
    title: row.title as string,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  }));
}

export async function conversationBelongsToUser(
  conversationId: string,
  userId: string
): Promise<boolean> {
  const result = await db.query(
    `SELECT 1
     FROM conversations
     WHERE id = $1 AND user_id = $2`,
    [conversationId, userId]
  );

  return (result.rowCount ?? 0) > 0;
}

export async function getConversationMessages(
  conversationId: string,
  userId: string
): Promise<StoredMessage[] | null> {
  const owned = await conversationBelongsToUser(conversationId, userId);
  if (!owned) return null;

  const result = await db.query(
    `SELECT id, role, content, sources, created_at
     FROM messages
     WHERE conversation_id = $1 AND user_id = $2
     ORDER BY created_at ASC`,
    [conversationId, userId]
  );

  return result.rows.map((row) => ({
    id: row.id as string,
    role: row.role as "user" | "assistant",
    content: row.content as string,
    sources: row.sources,
    createdAt: row.created_at as Date,
  }));
}

export async function saveMessage(
  conversationId: string,
  userId: string,
  role: "user" | "assistant",
  content: string,
  sources?: RetrievedChunk[]
): Promise<{ id: string }> {
  const result = await db.query(
    `INSERT INTO messages (conversation_id, user_id, role, content, sources)
     SELECT $1, $2, $3, $4, $5::jsonb
     WHERE EXISTS (
       SELECT 1 FROM conversations WHERE id = $1 AND user_id = $2
     )
     RETURNING id`,
    [
      conversationId,
      userId,
      role,
      content,
      sources ? JSON.stringify(sourcePayload(sources)) : null,
    ]
  );

  if ((result.rowCount ?? 0) === 0) {
    throw new Error("conversation not found");
  }

  return { id: result.rows[0].id as string };
}

export async function linkDocuments(
  conversationId: string,
  userId: string,
  documentIds: string[]
): Promise<void> {
  if (documentIds.length === 0) return;

  await db.query(
    `INSERT INTO conversation_documents (conversation_id, document_id)
     SELECT $1, d.id
     FROM documents d
     WHERE d.user_id = $2
       AND d.id = ANY($3::uuid[])
       AND EXISTS (
         SELECT 1 FROM conversations c WHERE c.id = $1 AND c.user_id = $2
       )
     ON CONFLICT DO NOTHING`,
    [conversationId, userId, documentIds]
  );
}

export async function getConversationDocuments(
  conversationId: string,
  userId: string
): Promise<string[] | null> {
  const owned = await conversationBelongsToUser(conversationId, userId);
  if (!owned) return null;

  const result = await db.query(
    `SELECT cd.document_id
     FROM conversation_documents cd
     JOIN documents d ON d.id = cd.document_id
     WHERE cd.conversation_id = $1 AND d.user_id = $2
     ORDER BY cd.document_id`,
    [conversationId, userId]
  );

  return result.rows.map((row) => row.document_id as string);
}

export async function touchConversation(
  conversationId: string,
  userId: string
): Promise<void> {
  await db.query(
    `UPDATE conversations
     SET updated_at = NOW()
     WHERE id = $1 AND user_id = $2`,
    [conversationId, userId]
  );
}
