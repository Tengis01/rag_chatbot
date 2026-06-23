export interface DocumentItem {
  id: string;
  filename: string;
  sourceType: "pdf" | "text";
  status: "pending" | "processing" | "ready" | "failed";
  createdAt: string;
}

export interface SourceChunk {
  chunkId: string;
  documentId: string;
  content: string;
  page?: number;
  chunkIndex?: number;
  similarity: number;
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
  createdAt: string;
  updatedAt: string;
}
