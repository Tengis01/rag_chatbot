export type MessageRole = "user" | "assistant";

export type ChatSource = {
  chunkId?: string;
  documentId: string;
  filename?: string;
  page?: number | null;
  chunkIndex?: number | null;
  content?: string;
  snippet?: string;
  similarity?: number;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  sources?: ChatSource[];
  createdAt: string;
};

export type ChatRequest = {
  conversationId?: string;
  documentIds: string[];
  message: string;
};

export type ChatResponse = {
  conversationId: string;
  reply: string;
  sources: ChatSource[];
};
