import type { ChatMessage, Conversation, DocumentItem } from "@/types";

import { API_BASE } from "./api-base";

// MVP үед ашиглах тогтмол demo хэрэглэгч.
export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include", // session cookie-г хамт илгээнэ (Better Auth)
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API алдаа ${res.status}: ${text || res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export interface UploadResponse {
  documentId: string;
  filename: string;
  sourceType: "pdf";
  status: "pending";
  extractedTextLength: number;
}

export interface PasteResponse {
  documentId: string;
  filename: string;
  sourceType: "text";
  status: "pending";
  extractedTextLength: number;
}

export interface ChatResponse {
  conversationId: string;
  reply: string;
  sources: {
    chunkId: string;
    documentId: string;
    content: string;
    page?: number;
    chunkIndex?: number;
    similarity: number;
  }[];
}

export interface DocumentStatusResponse {
  id: string;
  status: DocumentItem["status"];
  chunkCount: number;
  title: string;
  filename: string;
  errorMessage: string | null;
  updatedAt: string;
}

export const api = {
  // Documents
  listDocuments: () => request<DocumentItem[]>("/documents"),

  getDocumentStatus: (id: string) =>
    request<DocumentStatusResponse>(`/documents/${id}/status`),

  uploadDocument: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return fetch(`${API_BASE}/documents/upload`, {
      method: "POST",
      credentials: "include",
      body: form,
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API алдаа ${res.status}: ${text || res.statusText}`);
      }
      return res.json() as Promise<UploadResponse>;
    });
  },

  pasteDocument: (title: string, text: string) =>
    request<PasteResponse>("/documents/paste", {
      method: "POST",
      body: JSON.stringify({ title, text }),
    }),

  // Conversations
  listConversations: () => request<{ conversations: Conversation[] }>("/conversations"),

  listConversationMessages: (conversationId: string) =>
    request<{ messages: ChatMessage[] }>(`/conversations/${conversationId}/messages`),

  // Chat
  sendMessage: (params: {
    conversationId?: string;
    documentIds: string[];
    message: string;
    useMMR?: boolean;
    threshold?: number;
    lambda?: number;
  }) =>
    request<ChatResponse>("/chat", {
      method: "POST",
      body: JSON.stringify({
        conversationId: params.conversationId,
        documentIds: params.documentIds,
        message: params.message,
        useMMR: params.useMMR,
        threshold: params.threshold,
        lambda: params.lambda,
      }),
    }),
};
