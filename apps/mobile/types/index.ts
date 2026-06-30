export interface DocumentItem {
  id: string;
  title: string;
  status: "pending" | "processing" | "ready" | "failed";
  createdAt: string;
}

export interface SourceChunk {
  documentId: string;
  documentTitle: string;
  similarity: number;
  preview: string;
  icon?: "database" | "book" | "file-code" | "file-text";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceChunk[];
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}