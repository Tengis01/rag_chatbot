import type { ChatMessage, Conversation, DocumentItem } from "../types";

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";
// Physical device (USB or WiFi): use your machine's LAN IP (192.168.1.10)
// Android emulator only: use http://10.0.2.2:4000 instead
// Override permanently via EXPO_PUBLIC_API_URL in apps/mobile/.env

export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  listDocuments: async (): Promise<{ documents: DocumentItem[] }> => {
    const arr = await request<any[]>("/documents");
    const documents = arr.map((item) => ({
      id: item.id,
      title: item.filename || "Баримт бичиг",
      status: item.status || "pending",
      createdAt: item.createdAt || new Date().toISOString(),
    }));
    return { documents };
  },

  listConversations: () =>
    request<{ conversations: Conversation[] }>("/conversations"),

  sendMessage: (params: {
    conversationId?: string;
    documentIds: string[];
    message: string;
  }) =>
    request<{ conversationId: string; message: ChatMessage }>("/chat", {
      method: "POST",
      body: JSON.stringify({
        userId: DEMO_USER_ID,
        conversationId: params.conversationId,
        documentIds: params.documentIds,
        message: params.message,
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
    formData.append("userId", DEMO_USER_ID);

    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: "POST",
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
        userId: DEMO_USER_ID,
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