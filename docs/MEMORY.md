# MEMORY.md

## Purpose

This file helps AI agents continue from the last stopping point.
Update it after important progress.

## Current Project

Document RAG Chatbot MVP

## Selected Stack

- React + Vite frontend
- Fastify backend
- Local Postgres (pgvector/pgvector:pg16) via Docker Compose — **no Supabase**
- `pg` npm package for DB connection (DATABASE_URL)
- Gemini generation and embeddings
- pnpm workspace
- Turborepo

## Current Status

Infrastructure, config layer, dual ingestion paths, the complete Retrieval & Chat backend features, the module-based backend refactor, the decomposed Day 5 frontend UI/Landing components, and the newly scaffolded Expo + Expo Router + NativeWind mobile app are all fully functional and pass typecheck and production builds clean. The visible frontend copy has now been localized to Mongolian, and the web/mobile workspace packages are correctly integrated into the pnpm workspace.

Completed so far:

- Day 1 complete: monorepo running, schema applied, DB connected, `/health`, `/config` working.
- Day 2 complete: `/documents/upload`, `/documents/paste`, `/documents` (GET) working.
- Day 3 complete: Background embedding pipeline implemented. `POST /documents/upload` and `POST /documents/paste` now insert as `pending`, launch the processing pipeline asynchronously, and return immediate response. `/documents/:id/status` monitors processing state.
- Day 4 complete: Migrated `match_chunks` DB function to support `UUID[]`. Created retrieval with pgvector matching and MMR reranking. Created generator with model fallbacks (`gemini-3.5-flash` -> `gemini-2.0-flash` -> `gemma-4-31b-it`). Implemented `/chat`, `/conversations`, and `/conversations/:id/messages` endpoints with full query scoping by `user_id`.
- Refactor complete: Reorganized `apps/api/src/` from flat `lib/` + `routes/` to feature-module structure (`modules/documents`, `modules/ingestion`, `modules/retrieval`, `modules/chat`, `modules/conversations`, `shared/`). Health and config routes remain in `routes/`. Smoke test script added at `scripts/smoke-test.sh`. Placeholder `packages/api-client` added for future web/mobile shared code.
- Day 5 frontend & Component Decomp complete: Rebuilt `apps/web` with Tailwind, Framer Motion, React Router. Split monolithic files into clean sub-components: `Navbar`, `Hero`, `WorkspacePreview`, `Capabilities`, `MobileShowcase`, `FinalCta`, `Footer` for landing page; and `WorkspaceTopBar`, `ConversationSidebar`, `ChatThread`, `Composer`, `SourcesPanel`, `SourceCard`, `MessageBubble` for the workspace. Everything consumes the live backend `api.ts` client.
- Collapsible Sidebar & PDF Logo complete: Added smooth collapsible transition to the workspace sidebar column using grid layouts and `PanelLeftClose`/`PanelLeftOpen` icons. Replaced the Gemini-like `Sparkles` logo icon with a document `FileText` icon.
- Unified Import Modal & Document Manager complete: Moved PDF upload and Paste text buttons into a unified center-screen overlay triggered by a `+` button in the chat input bar. Added pre-upload size/character limit measurement bars matching session resource indicators. Moved the "+ New Chat" button to the top of the sidebar, and converted the document selection status badge in the chat header into a fully-functional document status dropdown popover.
- Landing Header Links & Cursor Spotlight complete: Removed the dull mockup navigation links from the landing header and replaced them with functional links pointing directly to the landing page sections (`#workspace-preview`, `#capabilities`, `#mobile`). Tightened the cursor spotlight blur radius and opacity for better contrast, and disabled the mouse-glow effect completely on `/workspace` routes.
- Mongolian UI localization complete: Translated the visible landing page, workspace UI, config/loading states, and fallback user-facing messages to Mongolian. Updated the UI font stack to include `Noto Sans` so Cyrillic/Mongolian text renders correctly.
- LAN / mobile access complete: App is now fully accessible from a phone on the same WiFi. Three issues fixed: (1) `api.ts` API_BASE changed to use `window.location.hostname` fallback. (2) `ConfigContext.tsx` had a separate hardcoded `localhost:4000` — fixed with same pattern. (3) Fastify CORS changed to `origin: true` (reflect-origin) so any LAN IP is accepted. Stale `VITE_API_URL` env var removed from docker-compose web service. See ERR-016, ERR-017.
- Mobile responsive improvements: The `WorkspacePreview` component is now dynamically scaled down to fit mobile viewport widths using `ResizeObserver` and CSS `transform: scale()`, keeping the desktop ratio intact on mobile. The redundant 3rd CTA button in the `Hero` section was removed, and bottom padding was adjusted to prevent layout overlap on smaller screens. Added a mobile slide-over drawer for the workspace sidebar using `AnimatePresence` and a menu toggle button (`PanelLeftOpen`) in the workspace header, resolving mobile document status tracking issues and preventing double-uploads. Document list buttons were also made text-adaptive for smaller screens.
- Mobile App Scaffolding: Configured `apps/mobile` with Expo, Expo Router (file-based navigation), and NativeWind (Tailwind CSS v3 for React Native). Generated customized config files, clean layout structure, and synchronized the monorepo package workspace.




## Current Local URLs

Frontend:    http://localhost:5173
Backend:     http://localhost:4000 (unless overridden by API_PORT in .env)
Health:      http://localhost:4000/health
Config:      http://localhost:4000/config
Status:      http://localhost:4000/documents/:id/status
Chat:        http://localhost:4000/chat
Conversations: http://localhost:4000/conversations

## Current Next Step

1. Connect the Expo mobile app to the live backend API (derive current hostname dynamically or support custom base URL configuration).
2. Build mobile-responsive screens/components (Home, Workspace document manager, message thread, composer) and wire them to fastify endpoints.
3. Conduct end-to-end testing of document ingestion and chat queries using the mobile emulator or live device.



## Demo User ID (MVP)

Until auth is added, use this fixed UUID as `user_id` in all queries:

```
00000000-0000-0000-0000-000000000001
```

## Important Constraints

- Keep MVP simple.
- Do not add OCR yet.
- Do not add payments yet.
- Do not expose DATABASE_URL or GEMINI_API_KEY to frontend — ever.
- Do not query documents across users.
- Always store messages so users can continue previous chats.
- Every DB query must include a `user_id` filter.
- Frontend config (limits, flags) comes from `GET /config`, not from `.env` files.
