# Database ER Diagram

Бүх өгөгдөл нэг локал PostgreSQL (pgvector/pgvector:pg16) санд: аппликейшны 5 хүснэгт (`infra/postgres/init/001_schema.sql` + migrations) ба Better Auth-ийн 4 хүснэгт (`002_auth.sql`). Дэлгэрэнгүй SQL: [DB_SCHEMA.md](../DB_SCHEMA.md).

```mermaid
erDiagram
    user ||--o{ session : "logs in"
    user ||--o{ account : "credentials"
    user ||--o{ documents : "owns"
    user ||--o{ conversations : "owns"
    documents ||--o{ chunks : "split into"
    conversations ||--o{ messages : "contains"
    conversations ||--o{ conversation_documents : ""
    documents ||--o{ conversation_documents : ""

    user {
        UUID id PK
        TEXT name
        TEXT email UK
        BOOLEAN emailVerified
        TIMESTAMPTZ createdAt
    }

    session {
        UUID id PK
        TEXT token UK "session cookie"
        UUID userId FK
        TIMESTAMPTZ expiresAt
    }

    account {
        UUID id PK
        UUID userId FK
        TEXT providerId "credential"
        TEXT password "scrypt hash"
    }

    verification {
        UUID id PK
        TEXT identifier
        TEXT value
        TIMESTAMPTZ expiresAt
    }

    documents {
        UUID id PK
        UUID user_id "session user"
        TEXT filename
        TEXT source_type "pdf | text"
        TEXT status "pending | processing | ready | failed"
        INT chunk_count
        TEXT error_message "migration 003"
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    chunks {
        UUID id PK
        UUID document_id FK "ON DELETE CASCADE"
        UUID user_id "denormalized — JOIN-гүй шүүлт"
        TEXT content
        INT page
        INT chunk_index
        INT token_count
        VECTOR_768 embedding "HNSW cosine индекс"
        TIMESTAMPTZ created_at
    }

    conversations {
        UUID id PK
        UUID user_id
        TEXT title
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    messages {
        UUID id PK
        UUID conversation_id FK "ON DELETE CASCADE"
        UUID user_id "denormalized"
        TEXT role "user | assistant"
        TEXT content
        JSONB sources "snapshot — баримт устсан ч үлдэнэ"
        TIMESTAMPTZ created_at
    }

    conversation_documents {
        UUID conversation_id PK "FK, CASCADE"
        UUID document_id PK "FK, CASCADE"
    }
```

## Design notes

- **`VECTOR(768)`** нь `gemini-embedding-001`-ийн `outputDimensionality: 768`-тай заавал тэнцүү — өгөгдөл орсны дараа өөрчлөх боломжгүй.
- **HNSW индекс** (`vector_cosine_ops`) — `match_chunks` функцийн ойролцоо хайлтыг ~O(log n) болгодог.
- **`user_id` denormalization** — `chunks`/`messages` дээр шууд хадгалснаар `match_chunks` JOIN-гүйгээр хэрэглэгчээр шүүдэг (аюулгүй байдлын шүүлт хамгийн гүн давхаргад).
- **`sources` JSONB snapshot** — хариулт үүссэн агшны эх сурвалжууд; эх баримт устсан ч түүхэн мессежийн ишлэл хадгалагдана.
- **Auth хүснэгтүүд** — Better Auth өөрөө удирдана (app кодоос бичихгүй); багана нэрс camelCase тул SQL-д заавал хашилттай (`"userId"`). ID-ууд `advanced.database.generateId`-ээр UUID тул app хүснэгтүүдийн `user_id UUID`-тай шууд нийцнэ.
- **Schema өөрчлөлт** — `init/` хөлдөөсөн; бүх өөрчлөлт `infra/postgres/migrations/NNN_*.sql`, API асахад автоматаар хэрэгжинэ (`schema_migrations`-д бүртгэнэ).
