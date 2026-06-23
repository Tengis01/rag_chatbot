import type { ChatMessage, Conversation, SourceChunk } from "@/types";

// ---------------------------------------------------------------------------
// Зөвхөн landing page-ийн workspace preview-д ашиглах mock data.
// Live /workspace page нь заавал src/lib/api.ts ашиглана.
// ---------------------------------------------------------------------------

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "mock-1",
    title: "Төслийн архитектур",
    createdAt: "2026-06-18T10:00:00Z",
    updatedAt: "2026-06-18T10:05:00Z",
  },
  {
    id: "mock-2",
    title: "Өгөгдлийн сангийн schema",
    createdAt: "2026-06-18T11:00:00Z",
    updatedAt: "2026-06-18T11:12:00Z",
  },
  {
    id: "mock-3",
    title: "4 дэх өдрийн backend",
    createdAt: "2026-06-18T12:00:00Z",
    updatedAt: "2026-06-18T12:30:00Z",
  },
  {
    id: "mock-4",
    title: "Embedding pipeline",
    createdAt: "2026-06-18T13:00:00Z",
    updatedAt: "2026-06-18T13:22:00Z",
  },
  {
    id: "mock-5",
    title: "UI төлөвлөлт",
    createdAt: "2026-06-18T14:00:00Z",
    updatedAt: "2026-06-18T14:45:00Z",
  },
];

export const MOCK_SOURCES: SourceChunk[] = [
  {
    chunkId: "src-1",
    documentId: "doc-1",
    content:
      "Postgres хүснэгтүүд: documents, chunks, embeddings (vector(768)). Косинус төстэй байдлын хайлтад pgvector extension болон HNSW index ашиглана.",
    similarity: 0.97,
  },
  {
    chunkId: "src-2",
    documentId: "doc-2",
    content:
      "Чатын санах ой өмнөх харилцан яриаг хадгална. Retrieval нь сонгосон баримтаас хамгийн тохирох хэсгүүдийг ашиглан асуултыг баяжуулна.",
    similarity: 0.91,
  },
  {
    chunkId: "src-3",
    documentId: "doc-3",
    content:
      "4 дэх өдөр: backend холболт дууссан. Векторжуулах pipeline нь gemini-embedding-001 (768d) ашиглана. Хэсгийн хэмжээ 500 token, overlap 15%.",
    similarity: 0.86,
  },
];

export const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    role: "user",
    content: "Энэ төсөл ямар өгөгдлийн сан ашигладаг вэ?",
    createdAt: "2026-06-18T11:05:00Z",
  },
  {
    id: "msg-2",
    role: "assistant",
    content:
      "Энэ төсөл 768 хэмжээст вектор хадгалахын тулд pgvector extension-тэй Postgres ашигладаг. Local development орчин Docker Compose-оор (pgvector/pgvector:pg16) ажиллана. Вектор хайлтыг match_chunks SQL function-оор косинусын зай ашиглан хийдэг.",
    sources: MOCK_SOURCES,
    createdAt: "2026-06-18T11:05:02Z",
  },
];

export const MOCK_FOLLOW_UPS = [
  "Баримтыг хураангуйл",
  "pgvector-ийг тайлбарла",
  "Юу өөрчлөгдсөн бэ",
  "Арын серверийн алдааг ол",
];
