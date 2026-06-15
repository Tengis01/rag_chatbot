export type MessageRole = "user" | "assistant";

export type ChatSource = {
  documentId: string;
  filename: string;
  page?: number | null;
  snippet: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  sources?: ChatSource[];
  createdAt: string;
};
