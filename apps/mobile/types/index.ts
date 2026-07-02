export interface DocumentItem {
  id: string;
  title: string;
  status: "pending" | "processing" | "ready" | "failed";
  createdAt: string;
}

export interface SourceChunk {
  chunkId?: string;
  documentId: string;
  documentTitle?: string;
  similarity: number;
  preview?: string;
  page?: number;
  chunkIndex?: number;
  icon?: "database" | "book" | "file-code" | "file-text";
}

/** Raw source shape returned by the backend (/chat and stored message sources). */
export interface RawSourceChunk {
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
  updatedAt: string;
}