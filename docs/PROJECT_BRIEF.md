# PROJECT_BRIEF.md

## Product Name

Document RAG Chatbot

## Product Goal

Build a deployable MVP where users can upload or paste documents and ask questions about them.

The chatbot should answer only using the uploaded document content and show source snippets.

## Target MVP Experience

A user should be able to:

1. Open the app.
2. Upload a PDF or paste text.
3. Wait until the document is processed.
4. Start or open a conversation.
5. Ask questions about the document.
6. Get grounded answers.
7. See source snippets.
8. Leave and later continue the same chat.

## Architecture

```text
React + Vite frontend
        |
        v
Fastify backend
        |
        |---- Gemini API
        |
        v
Local Postgres + pgvector (Docker)
```

## Main Data Concepts

### Document

A file or pasted text uploaded by the user.

### Chunk

A small piece of extracted document text. Each chunk has an embedding vector.

### Conversation

A chat session that can continue later.

### Message

A user or assistant message inside a conversation.

### Source

A chunk used by the assistant to answer a question.

## Planned Database Tables

- documents
- chunks
- conversations
- messages
- conversation_documents

## Production Deployment Target

Azure Ubuntu VM (`jarvis`) with separate RAG Docker Compose services: Nginx + compiled Vite frontend, Fastify API and local PostgreSQL/pgvector. Public domains: `ragchatbot.dev` and `api.ragchatbot.dev` via Cloudflare Tunnel (public connection pending). Manual VM build/deployment first, then GitHub Actions + GHCR. See `DEPLOYMENT_PLAN.md` and current `DEPLOYMENT_VERIFICATION.md`.

## MVP Principle

The priority is a working RAG flow, not perfect UI.

Retrieval quality, chunking, citations, and persistent conversations are more important than advanced features.
