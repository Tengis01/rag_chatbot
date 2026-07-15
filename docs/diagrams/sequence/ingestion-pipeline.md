# Ingestion Pipeline Sequence

Баримт оруулснаас (PDF upload / текст paste) эхлээд `ready` болтол хүрэх бүрэн арын боловсруулалтын урсгал. Код: `apps/api/src/modules/documents` (routes) + `apps/api/src/modules/ingestion` (pipeline.ts, chunker.ts, embedder.ts, vector-store.ts).

```mermaid
sequenceDiagram
    actor User as "User"
    participant UI as "Frontend"
    participant API as "Documents Route"
    participant Store as "documentTextStore (in-memory)"
    participant Pipe as "Pipeline"
    participant Chk as "Chunker"
    participant Emb as "Embedder"
    participant Gem as "Gemini API"
    participant VS as "Vector Store"
    participant DB as "PostgreSQL"

    alt PDF upload
        User->>UI: PDF файл сонгоно (≤20MB)
        UI->>API: POST /documents/upload (multipart)
        API->>API: pdf-parse текст ялгана
    else Text paste
        User->>UI: Текст буулгана (10–500,000 тэмдэгт)
        UI->>API: POST /documents/paste
    end

    API->>DB: INSERT documents (status=pending)
    API->>Store: saveDocumentText(id, extractedText)
    API->>Pipe: setImmediate(processDocument(id, text))
    API-->>UI: 201 {id, status: "pending"} — шууд буцна

    loop 3 сек тутам (pending/processing байхад л)
        UI->>API: GET /documents/:id/status
        API-->>UI: {status, chunkCount?, errorMessage?}
    end

    Pipe->>DB: updateDocumentStatus(processing)
    Pipe->>Chk: chunkText(text)
    Note over Chk: ~500 токен/хэсэг, 15% давхцал,<br/>кирилл-мэдрэг токен тооцоо (2.5 vs 4 тэмдэгт/токен)
    Chk-->>Pipe: chunks[]

    Pipe->>Emb: embedTexts(chunks)
    loop Багц бүрд (≤15 хэсэг / ~6000 токен, 3с завсарлагатай)
        Emb->>Gem: batchEmbedContents (gemini-embedding-001, 768d)
        alt 429 / 5xx
            Gem-->>Emb: RESOURCE_EXHAUSTED
            Emb->>Emb: exponential backoff (≤8 оролдлого, retryDelay дагана)
            Emb->>Gem: retry
        end
        Gem-->>Emb: embeddings [768]
    end
    Emb-->>Pipe: embeddings[]

    Pipe->>VS: storeChunks(documentId, chunks, embeddings)
    VS->>DB: BEGIN → DELETE old chunks → INSERT 50 мөрийн багцаар → COMMIT
    Note over VS,DB: Транзакц — хагас дутуу хадгалалт боломжгүй (idempotent)

    alt Амжилттай
        Pipe->>DB: updateDocumentStatus(ready, chunkCount)
    else Алдаа гарвал
        Pipe->>DB: setDocumentError(failed, error_message)
    end
    Pipe->>Store: deleteDocumentText(id) — finally

    UI-->>User: Баримт "ready" → автоматаар сонгогдоно
```

## Гол шинж чанарууд

- **Шууд хариу**: боловсруулалт минутаар үргэлжилж болох тул HTTP хариуг хүлээлгэдэггүй — `setImmediate` + status polling.
- **Rate-limit хамгаалалт**: Gemini үнэгүй түвшний TPM квот (~20–25k токен/мин, ERR-027) — багцлалт, 3с pacing, backoff.
- **Алдаа ил тод**: `failed` болсон шалтгаан `documents.error_message`-д хадгалагдаж, UI дээр харагдана.
- **In-memory store-ийн хязгаар**: ялгасан текст санах ойд түр хадгалагддаг тул API restart хийхэд pending/processing баримтууд орфан болдог — startup sweep тэдгээрийг `failed` болгодог.
