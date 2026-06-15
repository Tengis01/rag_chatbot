-- ============================================================
-- 001_schema.sql
-- Initial schema for Document RAG Chatbot
-- Runs automatically on first container start (empty volume).
-- To re-apply: docker compose down -v && docker compose up --build
-- ============================================================

-- pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- documents
-- Stores uploaded PDFs and pasted text metadata
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL,
  filename    TEXT,
  source_type TEXT        NOT NULL CHECK (source_type IN ('pdf', 'text')),
  status      TEXT        NOT NULL DEFAULT 'processing'
                CHECK (status IN ('processing', 'ready', 'error')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents (user_id);

-- ============================================================
-- chunks
-- Stores text chunks + pgvector embeddings per document
-- VECTOR(768) matches Gemini text-embedding-004 output dimension
-- ============================================================
CREATE TABLE IF NOT EXISTS chunks (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  UUID        REFERENCES documents(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL,
  content      TEXT        NOT NULL,
  page         INT,
  chunk_index  INT,
  token_count  INT,
  embedding    VECTOR(768),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON chunks (document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_user_id     ON chunks (user_id);

-- HNSW index for fast approximate nearest-neighbor vector search
CREATE INDEX IF NOT EXISTS idx_chunks_embedding
  ON chunks USING hnsw (embedding vector_cosine_ops);

-- ============================================================
-- conversations
-- Chat sessions that persist across browser sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL,
  title      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations (user_id);

-- ============================================================
-- messages
-- Individual chat messages; sources is a JSONB array of chunk snippets
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID        REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL,
  role            TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT        NOT NULL,
  sources         JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages (conversation_id);

-- ============================================================
-- conversation_documents
-- Many-to-many: which documents belong to which conversation
-- ============================================================
CREATE TABLE IF NOT EXISTS conversation_documents (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  document_id     UUID REFERENCES documents(id)     ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, document_id)
);

-- ============================================================
-- match_chunks
-- Vector similarity search scoped to a user + document
-- ============================================================
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding    VECTOR(768),
  match_user_id      UUID,
  match_document_id  UUID,
  match_count        INT   DEFAULT 8,
  similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id          UUID,
  content     TEXT,
  page        INT,
  chunk_index INT,
  similarity  FLOAT
)
LANGUAGE SQL STABLE AS $$
  SELECT
    id,
    content,
    page,
    chunk_index,
    1 - (embedding <=> query_embedding) AS similarity
  FROM chunks
  WHERE user_id      = match_user_id
    AND document_id  = match_document_id
    AND 1 - (embedding <=> query_embedding) > similarity_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
