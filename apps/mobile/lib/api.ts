import type { ChatMessage, Conversation, DocumentItem, RawSourceChunk } from "../types";
import { authClient } from "./auth-client";
import { invalidateApiBase, resolveApiBase } from "./api-base";

/** Session cookie stored in SecureStore by the Better Auth expo plugin. */
function authHeaders(): Record<string, string> {
  const cookie = authClient.getCookie();
  return cookie ? { Cookie: cookie } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const doFetch = async () => {
    const base = await resolveApiBase();
    return fetch(`${base}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
        ...(init?.headers ?? {}),
      },
      ...init,
    });
  };

  let res: Response;
  try {
    res = await doFetch();
  } catch (err) {
    // Network failure — the cached base may be stale (e.g. moved from
    // office WiFi to home). Re-probe once, then give up.
    invalidateApiBase();
    res = await doFetch();
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export interface ChatResponse {
  conversationId: string;
  reply: string;
  sources: RawSourceChunk[];
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
  listDocuments: async (): Promise<{ documents: DocumentItem[] }> => {
    const arr = await request<any[]>("/documents");
    const documents = arr.map((item) => ({
      id: item.id,
      title: item.filename || "Баримт бичиг",
      status: item.status || "pending",
      errorMessage: item.errorMessage ?? null,
      createdAt: item.createdAt || new Date().toISOString(),
    }));
    return { documents };
  },

  listConversations: () =>
    request<{ conversations: Conversation[] }>("/conversations"),

  listConversationMessages: (conversationId: string) =>
    request<{
      messages: (Omit<ChatMessage, "sources"> & { sources?: RawSourceChunk[] | null })[];
    }>(`/conversations/${conversationId}/messages`),

  /**
   * Poll a document's ingestion status (pending -> processing -> ready/failed).
   */
  getDocumentStatus: (id: string) =>
    request<DocumentStatusResponse>(`/documents/${id}/status`),

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

  /**
   * Upload a PDF file picked from the device.
   * fileUri  — the local file:// URI returned by expo-document-picker
   * fileName — display name (e.g. "report.pdf")
   */
  uploadPdf: async (fileUri: string, fileName: string): Promise<DocumentItem> => {
    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      name: fileName,
      type: "application/pdf",
    } as any);

    const base = await resolveApiBase();
    const res = await fetch(`${base}/documents/upload`, {
      method: "POST",
      headers: authHeaders(),
      body: formData,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Upload error ${res.status}: ${text}`);
    }
    const data = await res.json();
    return {
      id: data.documentId,
      title: data.filename || fileName,
      status: data.status || "pending",
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Paste raw text as a document.
   */
  pasteText: async (params: { title: string; content: string }): Promise<DocumentItem> => {
    const data = await request<any>("/documents/paste", {
      method: "POST",
      body: JSON.stringify({
        title: params.title,
        text: params.content,
      }),
    });
    return {
      id: data.documentId,
      title: data.filename || params.title,
      status: data.status || "pending",
      createdAt: new Date().toISOString(),
    };
  },
};