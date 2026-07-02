# DB_SCHEMA.md

## Database

This project uses **local Postgres with pgvector** running as a Docker container (`pgvector/pgvector:pg16`).

There is **no Supabase client, Supabase auth, or Supabase storage** involved.
The backend connects directly to Postgres using the `pg` npm package via `DATABASE_URL`.

### Default Local Dev Credentials

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=rag_chatbot
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/rag_chatbot
```

These are the fixed local dev defaults — do not change them for local development.

### Applying the Schema

The SQL init scripts in `infra/postgres/init/` only run **once**, on first container start with an empty volume.

To re-apply after schema changes:

```bash
docker compose down -v   # ⚠️ destroys all local DB data
docker compose up --build
```

---

## Required Extension

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## Tables

### documents

Stores uploaded PDFs and pasted text metadata.

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  filename TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'text')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'failed', 'error')),
  chunk_count INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### chunks

Stores document chunks and their embeddings.

```sql
CREATE TABLE chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  page INT,
  chunk_index INT,
  token_count INT,
  embedding VECTOR(768),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

> ⚠️ `VECTOR(768)` matches Gemini `gemini-embedding-001` output (768 dimensions).
> Confirm the model before changing this dimension — it cannot be changed after data is inserted.

### conversations

Stores chat sessions.

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### messages

Stores chat messages.

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sources JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### conversation_documents

Links conversations to documents (many-to-many).

```sql
CREATE TABLE conversation_documents (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, document_id)
);
```

---

## Vector Search Function

```sql
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding VECTOR(768),
  match_user_id UUID,
  match_document_ids UUID[],
  match_count INT DEFAULT 20,
  similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  page INT,
  chunk_index INT,
  similarity FLOAT
)
LANGUAGE SQL STABLE AS $$
  SELECT
    id,
    document_id,
    content,
    page,
    chunk_index,
    1 - (embedding <=> query_embedding) AS similarity
  FROM chunks
  WHERE user_id = match_user_id
    AND document_id = ANY(match_document_ids)
    AND 1 - (embedding <=> query_embedding) > similarity_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
```

---

## Indexes

```sql
-- HNSW index for fast approximate nearest-neighbor search
CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);

-- Standard indexes for common query patterns
CREATE INDEX ON documents (user_id);
CREATE INDEX ON chunks (document_id);
CREATE INDEX ON chunks (user_id);
CREATE INDEX ON conversations (user_id);
CREATE INDEX ON messages (conversation_id);
```

---

## Security Rules

- Every query must filter by `user_id`.
- No cross-user data access is allowed.
- For MVP: use a fixed demo UUID as `user_id` until auth is added.
- Demo UUID: `'00000000-0000-0000-0000-000000000001'`

---

## Auth Tables (Better Auth — `infra/postgres/init/002_auth.sql`)

Better Auth manages these four tables itself (do not write to them from app code).
Column names are camelCase and must stay quoted. IDs are UUIDs (generated app-side
via `advanced.database.generateId`), so they are compatible with the `user_id UUID`
columns on the app tables above.

| Table | Purpose |
|---|---|
| `"user"` | One row per account — `email` (unique), `name`, `emailVerified` |
| `"session"` | Active login sessions — unique `token` (cookie), `expiresAt`, `userId` FK |
| `"account"` | Credentials per provider — for email+password, the **scrypt-hashed** password is in `"password"` |
| `"verification"` | Short-lived tokens (email verification / password reset) |

- `documents.user_id`, `chunks.user_id`, `conversations.user_id`, `messages.user_id` now hold real `"user"."id"` values (the `DEMO_USER_ID` constant is no longer used by routes).
- Applying this schema follows the same rule as `001_schema.sql`: init scripts only run on a fresh volume (`docker compose down -v && docker compose up --build`).
