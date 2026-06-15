# AGENTS.md

## Project

This repository is a Document RAG Chatbot MVP.

The goal is to build a deployable chatbot where users can upload or paste documents, ask questions, and receive answers grounded only in those documents.

## Read These First

Before making code changes, read these files:

1. `docs/PROJECT_BRIEF.md`
2. `docs/MEMORY.md`
3. `docs/TASKS.md`
4. `docs/DECISIONS.md`
5. `docs/SUPABASE_PLAN.md`
6. `docs/ERRORS.md`

After important work, update:

- `docs/MEMORY.md`
- `docs/TASKS.md`
- `docs/DECISIONS.md` if an architecture decision changed
- `docs/ERRORS.md` if a new error was encountered or fixed

## Tech Stack

Frontend:

- React
- Vite
- TypeScript

Backend:

- Fastify
- TypeScript

Database:

- Supabase Postgres
- pgvector

AI:

- Gemini generation
- Gemini embeddings

Monorepo:

- pnpm workspace
- Turborepo

## Repository Layout

```text
apps/web
  React + Vite frontend

apps/api
  Fastify backend

packages/shared
  Shared TypeScript types

docs
  Project planning, memory, tasks, and database plan
```

## Local Development

From repository root:

```bash
pnpm dev
pnpm build
pnpm typecheck
```

Frontend only:

```bash
pnpm --filter web dev
```

Backend only:

```bash
pnpm --filter api dev
```

Expected local URLs:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:4000
Health:   http://localhost:4000/health
```

## Engineering Rules

- Use TypeScript.
- Keep the MVP simple.
- Do not add new frameworks without a clear reason.
- Keep route handlers thin.
- Put reusable logic in `lib/` or `services/`.
- Prefer small functions with clear names.
- Validate API inputs.
- Do not silently swallow errors.
- Return clear error messages.
- Do not over-engineer before the core RAG flow works.

## ERRORS.md Rules

`docs/ERRORS.md` is the permanent record of every problem hit in this project.

### When to write an entry

Write a new entry in `docs/ERRORS.md` whenever any of the following happens:

- A command fails and you had to investigate why.
- A service does not start, connect, or respond as expected.
- A build or typecheck fails.
- A Docker, networking, or environment issue blocks progress.
- A library, API, or config behaves differently than documented.
- You spend more than a few minutes debugging anything.
- A workaround is used instead of a clean fix — document both.

### What every entry must include

Each entry must have all of the following fields. Do not skip any.

1. **ERR-ID** — Sequential number (ERR-001, ERR-002, …). Never reuse an ID.
2. **Date** — When it was encountered.
3. **Status** — `✅ Fixed`, `⚠️ Workaround`, or `🔲 Open`.
4. **What happened** — The exact symptom. What you saw, what command you ran, what the error message said.
5. **Root cause** — Why it happened. Be specific. "It failed" is not a root cause.
6. **Files changed** — Table of every file touched to fix it.
7. **Fix** — The exact code change, command, or config that resolved it.
8. **Lesson** — One sentence. What to remember so this never happens again.

### After fixing an error

- Set status to `✅ Fixed`.
- Add a row to the **Quick Reference Gotchas** table at the bottom of `ERRORS.md`.
- If the fix changes architecture or tooling decisions, also update `docs/DECISIONS.md`.

### Rules

- Never delete an entry, even if it seems trivial later.
- If the same error happens again, add a note to the existing entry — do not create a duplicate.
- Keep the ERR-IDs strictly sequential. Read the file before assigning a new ID.
- Write entries in plain language. Future-you and other agents must understand them without extra context.

## Security Rules

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to frontend.
- Never expose `GEMINI_API_KEY` to frontend.
- Backend-only secrets must stay in `apps/api/.env`.
- Frontend env vars must only use the `VITE_` prefix and must not contain secrets.
- Scope documents, chunks, conversations, and messages by `user_id`.
- Do not allow one user to query another user's documents.

## RAG Rules

The chatbot must answer only from retrieved document context.

RAG flow:

1. Extract text from uploaded PDF or pasted text.
2. Split text into chunks.
3. Generate embeddings for chunks.
4. Store chunks and embeddings in Supabase pgvector.
5. Embed the user question.
6. Retrieve relevant chunks using vector similarity.
7. Apply a similarity threshold.
8. Generate an answer using only retrieved context.
9. Store assistant answer and sources.
10. Show source snippets in the frontend.

If no relevant context is found, return a clear answer saying the uploaded document does not contain enough information.

## MVP Scope

Build these first:

- PDF upload
- Text paste
- Document list
- Conversation list
- Persistent messages
- RAG chat endpoint
- Source snippets
- Basic frontend chat UI

Do not build yet:

- OCR
- Payments
- Team workspace
- Admin dashboard
- Mobile app
- Complex analytics
- Multi-agent workflow

## Verification

Before saying work is complete, run relevant checks:

```bash
pnpm typecheck
pnpm build
```

For backend changes, also test:

```bash
curl http://localhost:4000/health
```

## Codex Working Style

When the task is complex:

1. Inspect the repo.
2. Read the docs listed above.
3. Make a short plan.
4. Implement in small steps.
5. Run checks.
6. Summarize changed files.
7. Update `docs/MEMORY.md` and `docs/TASKS.md`.

Do not make large unrelated changes.
