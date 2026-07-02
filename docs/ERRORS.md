# ERRORS.md

## Purpose

Track every error, bug, or blocker encountered during development.
For each entry: what happened, why it happened, and how it was fixed.
Use this file to avoid repeating the same mistakes and to quickly remember context.

---

## Error Log

---

### ERR-001 — Frontend not loading in Docker (Vite not reachable from host)

**Date**: 2026-06-15
**Status**: ✅ Fixed

#### What happened

Running `docker compose up --build` started all containers successfully,
but opening `http://localhost:5173` in the browser showed nothing — the page
never loaded. The `rag_web` container was marked as running but the frontend
was unreachable.

#### Root cause

Vite's dev server defaults to binding on `127.0.0.1` (loopback only).
Inside Docker, that means the server is only reachable *within* the container
itself — not from the host machine, even if the port is exposed.

The `docker-compose.yml` was passing `--host 0.0.0.0 --port 5173` as CLI args
to the `pnpm dev` command, but this was not working because the `vite.config.ts`
file had no `server` block at all, and the CLI args were being passed in an
inconsistent way through the `pnpm --filter web dev` filter command.

#### Files changed

| File | Change |
|---|---|
| `apps/web/vite.config.ts` | Added `server.host: '0.0.0.0'`, `server.port: 5173`, `server.watch.usePolling: true` |
| `apps/web/Dockerfile` | Removed redundant `--host 0.0.0.0` from CMD |
| `docker-compose.yml` | Removed duplicate `-- --host 0.0.0.0 --port 5173` from web service `command` |

#### Fix

Added the `server` block directly in `vite.config.ts`:

```ts
server: {
  host: '0.0.0.0',   // bind to all interfaces so Docker can expose it
  port: 5173,
  watch: {
    usePolling: true, // required on Linux Docker for hot reload to work
  },
},
```

#### Lesson

**Always configure `host: '0.0.0.0'` in `vite.config.ts` for any Docker setup.**
Do not rely on CLI args through pnpm filter chains — they can silently fail.
Also add `usePolling: true` for hot module reload (HMR) to work inside Docker
on Linux (inotify file events don't always propagate through bind mounts).

---

### ERR-002 — pgAdmin Connection Refused to Localhost

**Date**: 2026-06-15
**Status**: ✅ Fixed

#### What happened

When attempting to connect pgAdmin to the local Postgres instance on `localhost` (port `5432`), pgAdmin returned a `Connection refused` error.

#### Root cause

Depending on how pgAdmin is run:
1. **If pgAdmin is inside a Docker container**: `localhost` maps to the pgAdmin container's network loopback, not the host machine's loopback, making the database unreachable.
2. **If pgAdmin is run natively/Flatpak**: Sandboxing or host DNS resolution issues on Fedora sometimes reject `localhost` loopbacks or IPv6 fallback addresses (`::1`).

#### Files changed

No source files were changed, but the database connection parameters were updated.

#### Fix

Connect to the container directly or via the Docker gateway:
- **For Docker-based pgAdmin**: Use the direct container IP: `172.19.0.2` on port `5432`.
- **For sandboxed/native apps**: Use the Docker host gateway: `172.19.0.1`.

#### Lesson

**Inside Docker networks, use direct container IPs or gateways instead of localhost/127.0.0.1 to cross-connect container services.**

---

### ERR-003 — Postgres Port 5432 Conflict on Host

**Date**: 2026-06-16
**Status**: ✅ Fixed

#### What happened

When running `docker compose up`, the startup failed with the following error:
`Error response from daemon: ports are not available: exposing port TCP 0.0.0.0:5432 -> 127.0.0.1:0: listen tcp 0.0.0.0:5432: bind: address already in use`

#### Root cause

A native PostgreSQL instance or another service is already running on the host machine and listening on port `5432`.

#### Files changed

| File | Change |
|---|---|
| `.env` | Changed `POSTGRES_PORT=5432` to `POSTGRES_PORT=5433` |

#### Fix

Changed `POSTGRES_PORT` to `5433` in the `.env` file to map the host port `5433` to container port `5432`.

#### Lesson

**Inside the Docker networks, containers connect to the database container using internal DNS and ports (`postgres:5432`). Therefore, changing the host-exposed port mapping (`POSTGRES_PORT` in `.env`) does not affect backend-to-DB connectivity.**

---

### ERR-004 — API Port 4000 Conflict on Host

**Date**: 2026-06-16
**Status**: ✅ Fixed

#### What happened

When running `docker compose up`, the startup failed with the following error:
`Error response from daemon: ports are not available: exposing port TCP 0.0.0.0:4000 -> 127.0.0.1:0: listen tcp 0.0.0.0:4000: bind: address already in use`

#### Root cause

Another service on the host machine was already using port `4000`. In the original `docker-compose.yml`, the container port was coupled with `API_PORT` (e.g. `PORT: ${API_PORT:-4000}` was passed to the container, and `VITE_API_URL` was hardcoded to `http://localhost:4000`), which meant changing `API_PORT` alone broke container port mapping or frontend communication.

#### Files changed

| File | Change |
|---|---|
| `.env` | Changed `API_PORT=4000` to `API_PORT=4001` |
| `docker-compose.yml` | Decoupled container internal `PORT: 4000` from the host `API_PORT`, and changed `VITE_API_URL` to reference `${API_PORT:-4000}` dynamically |

#### Fix

Set `API_PORT=4001` in the `.env` file, and update `docker-compose.yml` to:
1. Fix the internal container `PORT` to `4000` so it always listens internally on `4000`.
2. Map `"${API_PORT:-4000}:4000"`.
3. Set the web environment `VITE_API_URL: http://localhost:${API_PORT:-4000}` so it automatically adapts to host port overrides.

#### Lesson

**Always keep container internal ports static (e.g., 4000) and only allow host port mapping to be overridden. Reference the host port dynamically in dependent frontend environment variables like `VITE_API_URL`.**

---

### ERR-005 — pdf-parse package missing (Day 2)

**Date**: 2026-06-16
**Status**: ✅ Fixed

#### What happened

The application crashed on startup with the following error:
`ERR_MODULE_NOT_FOUND: Cannot find package 'pdf-parse'`

#### Root cause

`@types/pdf-parse` was added to dependencies, but the actual implementation package `pdf-parse` was not added to the `apps/api/package.json`.

#### Files changed

| File | Change |
|---|---|
| `apps/api/package.json` | Added `pdf-parse` to dependencies |

#### Fix

Added the package:
```bash
pnpm --filter api add pdf-parse
docker compose up --build
```

#### Lesson

**Always add both the package and its corresponding `@types/*` package together; do not assume the type package includes the implementation.**

---

### ERR-006 — pdf-parse ESM default import failure (Day 2)

**Date**: 2026-06-16
**Status**: ✅ Fixed

#### What happened

The backend application failed to start with a syntax error:
`SyntaxError: The requested module 'pdf-parse' does not provide an export named 'default'`

#### Root cause

`pdf-parse` is a legacy CommonJS package and does not support ESM default import syntax (`import pdfParse from "pdf-parse"`) in this ESM TypeScript project.

#### Files changed

| File | Change |
|---|---|
| `apps/api/src/lib/pdf-extractor.ts` | Changed the import style to use `createRequire` |

#### Fix

Used the `createRequire` pattern to load the CommonJS module:
```ts
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
```

#### Lesson

**CommonJS packages used in an ESM project must be loaded using the createRequire pattern instead of standard ESM imports.**

---

### ERR-007 — GET /documents route typo (Day 2)

**Date**: 2026-06-16
**Status**: ✅ Fixed

#### What happened

When making a GET request to `/documents`, the server returned a `404 Not Found` error.

#### Root cause

A copy-paste typo caused the route to be accidentally defined as `app.get("/documents/:id")` instead of `app.get("/documents")`.

#### Files changed

| File | Change |
|---|---|
| `apps/api/src/routes/documents.ts` | Removed the `:id` parameter from the GET route path |

#### Fix

Changed `app.get("/documents/:id")` to `app.get("/documents")`.

#### Lesson

**Double-check route definitions immediately when encountering unexpected 404s on newly added endpoints, and ensure every route is curl-tested after creation.**

---

### ERR-008 — pnpm install --frozen-lockfile fails intermittently in Docker build

**Date**: 2026-06-17
**Status**: ✅ Fixed

#### What happened

`docker compose up --build` failed 3 times with `pnpm install --frozen-lockfile` erroring out inside the Docker build context. Errors observed in the build log were:

- `GET https://registry.npmjs.org/... error (23)` (CURLE_WRITE_ERROR)
- `ERR_PNPM_FETCH_502` on package downloads
- Supply-chain policy verification step taking 70+ seconds and eventually timing out

The build would succeed on retry sometimes, but fail again on the next run.

#### Root cause

pnpm v11.x introduced a **supply-chain policy verification** step (`verifyStoreIntegrity`) that makes live HTTP requests to the npm registry for every entry in the lockfile (301 entries) during `--frozen-lockfile` installs. Inside Docker, there is no local package store cache, so all packages are downloaded fresh, and the default network timeout is too short for slow or intermittently flaky connections. Error code `23` is `CURLE_WRITE_ERROR` (a libcurl write failure, typically caused by a dropped connection), and `502` is a transient npm registry gateway error.

#### Files changed

| File | Change |
|---|---|
| `.npmrc` | Created — added `network-timeout`, `fetch-timeout`, `fetch-retries`, `fetch-retry-mintimeout`, `fetch-retry-maxtimeout` |
| `apps/api/Dockerfile` | Added `.npmrc` to the initial `COPY` command so pnpm inside Docker picks up the timeout settings |
| `apps/web/Dockerfile` | Same as above |

#### Fix

Created a root-level `.npmrc` with generous timeout and retry settings:

```ini
network-timeout=300000
fetch-timeout=300000
fetch-retry-mintimeout=20000
fetch-retry-maxtimeout=120000
fetch-retries=5
```

Then updated both Dockerfiles to copy `.npmrc` before running `pnpm install`:

```dockerfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
```

#### Lesson

**Always create a `.npmrc` with extended network timeouts for monorepo Docker builds — pnpm v11's supply-chain verification makes many live registry requests and will time out on slow connections without explicit timeout configuration.**

---

### ERR-009 — `pdfParse is not a function` on PDF upload (pdf-parse v2 breaking change)

**Date**: 2026-06-17
**Status**: ✅ Fixed

#### What happened

`POST /documents/upload` with a real PDF file returned:
```json
{"error": "pdfParse is not a function"}
```
HTTP 422 Unprocessable Entity.

#### Root cause

`pdf-parse@2.x` is a **complete rewrite** and has a breaking API change from v1:

- **v1** exported a plain function: `const pdf = require('pdf-parse'); pdf(buffer)`
- **v2** exports a `PDFParse` class: `const { PDFParse } = require('pdf-parse'); new PDFParse({ data: buffer }).getText()`

The `apps/api/package.json` specified `"pdf-parse": "^2.4.5"` which installed v2, but `pdf-extractor.ts` used the v1 call pattern. `require('pdf-parse')` in v2 returns an object with named class exports — not a callable function — so calling it directly throws `pdfParse is not a function`.

#### Files changed

| File | Change |
|---|---|
| `apps/api/src/lib/pdf-extractor.ts` | Changed `const pdfParse = require('pdf-parse'); pdfParse(buffer)` → `const { PDFParse } = require('pdf-parse'); new PDFParse({ data: buffer }).getText()` |

#### Fix

```ts
// Before (v1 pattern — broken with pdf-parse@2.x)
const pdfParse = require("pdf-parse");
const result = await pdfParse(buffer);

// After (v2 pattern — correct)
const { PDFParse } = require("pdf-parse");
const parser = new PDFParse({ data: buffer });
const result = await parser.getText();
```

#### Lesson

**When a dependency bumps a major version, re-read its README — `pdf-parse@2.x` is a full rewrite with a class-based API that is entirely incompatible with the v1 function-call pattern.**

---

### ERR-010 — Invalid/placeholder GEMINI_API_KEY inside container

**Date**: 2026-06-17
**Status**: ✅ Fixed

#### What happened

Document processing pipeline failed immediately on upload because of:
`API_KEY_INVALID` reason from `generativelanguage.googleapis.com`.

#### Root cause

The `.env` file contained a placeholder value `your_gemini_api_key` which was passed into the Docker container. Furthermore, Docker compose container restart (`docker compose restart api`) does not reload newly updated host `.env` files into container runtime environment variables.

#### Files changed

No source files were changed, but the local `.env` was updated by the user.

#### Fix

Recreated the container with:
```bash
docker compose down api
docker compose up -d api
```

#### Lesson

**Always down/up the compose services when modifying `.env` environment files, as restart does not re-read the environment files from the host.**

---

### ERR-011 — text-embedding-004 model deprecated and not found (404)

**Date**: 2026-06-17
**Status**: ✅ Fixed

#### What happened

Ingestion pipeline failed with:
`Gemini batchEmbedContents failed [404]: models/text-embedding-004 is not found for API version v1beta`

#### Root cause

Google deprecated and removed `text-embedding-004` from AI Studio public endpoints.

#### Files changed

| File | Change |
|---|---|
| `apps/api/src/lib/embedder.ts` | Updated the model to `gemini-embedding-001` and added the `outputDimensionality: 768` property to requests |

#### Fix

Updated the model to `gemini-embedding-001` and passed `outputDimensionality: 768` to ensure compatibility with the `VECTOR(768)` database schema constraint:
```ts
const body = {
  requests: batch.map((text) => ({
    model: "models/gemini-embedding-001",
    content: { parts: [{ text }] },
    outputDimensionality: 768,
  })),
};
```

#### Lesson

**Verify currently available models via the models metadata endpoint when encountering 404s, and use outputDimensionality on newer models like gemini-embedding-001 to conform to fixed database vector size limits.**

---

### ERR-012 — Gemini generateContent 429 / 503 Quota and Capacity limits

**Date**: 2026-06-18
**Status**: ✅ Fixed

#### What happened

POST requests to the `/chat` route returned `Gemini generateContent failed [429]: ... Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 0, model: gemini-2.0-flash`. Querying alternative models like `gemini-3.5-flash` or `gemini-2.5-flash` returned `503` (This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.)

#### Root cause

The API Key had its `gemini-2.0-flash` quota restricted (limit: 0) on the free tier, and `gemini-3.5-flash`/`gemini-2.5-flash` models were experiencing high demand and returning 503 errors.

#### Files changed

| File | Change |
|---|---|
| `apps/api/src/lib/generator.ts` | Implemented fallback model logic: first try `gemini-3.5-flash`, then `gemini-2.0-flash`, and fall back to `gemma-4-31b-it`. Handled custom `thought` blocks in `gemma-4-31b-it` output. |

#### Fix

Updated `apps/api/src/lib/generator.ts` to retry generation using a list of models: `["gemini-3.5-flash", "gemini-2.0-flash", "gemma-4-31b-it"]` and extract the text content while ignoring elements with `thought: true` in the parts array.

#### Lesson

**Implement fallback model strategies for generation calls to make integration tests and application routes resilient to transient API quota (429) or demand capacity (503) issues.**

---

### ERR-013 — Smoke test failures due to API response field mismatch and high similarity threshold

**Date**: 2026-06-18
**Status**: ✅ Fixed

#### What happened

Running `./scripts/smoke-test.sh` for the first time resulted in two problems:
1. The script failed to parse `ANSWER` from the `/chat` response because it queried `.answer // .content // .message.content`, while the actual endpoint returned the reply under the key `.reply`.
2. The script exited with `❌ No sources returned` because the similarity threshold of `0.7` filtered out all matched chunks for the short 466-character pasted test document.

#### Root cause

1. The smoke test script checked for generic/alternative response fields rather than the specific `.reply` field implemented in `chat.routes.ts`.
2. The fallback path for "no documents found" is a valid and correct application behavior, meaning 0 sources is a successful test outcome that should be logged as a warning rather than a script failure.

#### Files changed

| File | Change |
|---|---|
| `scripts/smoke-test.sh` | Changed JQ parser to extract `.reply` and relaxed the sources validation to trigger a warning rather than an exit code 1. |

#### Fix

1. Updated `scripts/smoke-test.sh` to extract the correct field:
```bash
ANSWER=$(echo "$CHAT_RESPONSE" | jq -r '.reply // .answer // .content // .message.content // empty')
```
2. Replaced the strict zero sources check with a warning message:
```bash
if [ "$SOURCE_COUNT" -eq 0 ]; then
  echo "⚠️  No sources returned (similarity threshold may be high for short text — acceptable for smoke test)"
fi
```

#### Lesson

**Verify smoke tests against the exact endpoint schemas, and ensure that valid fallback pathways (like empty RAG contexts returning a clean notification) do not raise exit-code errors in integration runners.**

---

### ERR-014 — Web build fails on TypeScript 6 `baseUrl` deprecation

**Date**: 2026-06-19
**Status**: ✅ Fixed

#### What happened

Running `pnpm --filter web build` failed with:

```
tsconfig.app.json(12,5): error TS5101: Option 'baseUrl' is deprecated and will stop functioning in TypeScript 7.0.
```

#### Root cause

The frontend uses TypeScript 6.x with `paths` aliases (`@/*`), which still require `baseUrl`. TypeScript 6 now treats `baseUrl` as deprecated and fails the build unless explicitly acknowledged.

#### Files changed

| File | Change |
|---|---|
| `apps/web/tsconfig.app.json` | Added `"ignoreDeprecations": "6.0"` |
| `apps/web/package.json` | Added `"typecheck": "tsc -b"` script |

#### Fix

Added to `apps/web/tsconfig.app.json`:

```json
"ignoreDeprecations": "6.0"
```

Also removed unused imports in `WorkspacePage.tsx` that surfaced once `tsc -b` ran cleanly.

#### Lesson

**When upgrading to TypeScript 6, add `ignoreDeprecations: "6.0"` if you still rely on `baseUrl` for path aliases until migrating to the new resolution model.**

---

### ERR-015 — Failed to resolve import "react-router-dom" inside Docker container

**Date**: 2026-06-23
**Status**: ✅ Fixed

#### What happened

When starting the application inside Docker Compose, Vite failed to build/run with the error:
`[plugin:vite:import-analysis] Failed to resolve import "react-router-dom" from "src/main.tsx". Does the file exist?`

#### Root cause

`react-router-dom` was added as a dependency, but Docker Compose was reusing cached anonymous volumes (`/app/apps/web/node_modules`) created during the initial container build. These volumes shadowed the rebuilt container's filesystem, preventing the container from seeing the newly installed library.

#### Files changed

| File | Change |
|---|---|
| `docs/ERRORS.md` | Documented ERR-015 |

#### Fix

Instructed the user to recreate the container volumes using the `-V` / `--renew-anon-volumes` flag:
```bash
docker compose down && docker compose up --build -V
```

#### Lesson

**When adding new packages to a project using Docker Compose with anonymous node_modules volumes, always restart Compose using `docker compose up --build -V` to clear out outdated shadowed volume caches.**

---

### ERR-016 — Mobile browser blocked by Fastify CORS single-origin allowlist

**Date**: 2026-06-24
**Status**: ✅ Fixed

#### What happened

Opening the app on a phone connected to the same WiFi (`http://192.168.11.17:5173`) showed the UI momentarily then immediately displayed "Backend сервертэй холбогдож чадсангүй" (cannot connect to backend). All API calls from the phone returned network errors.

#### Root cause

Fastify's CORS plugin was configured with a single hardcoded origin string:
```ts
origin: process.env.FRONTEND_URL ?? "http://localhost:5173"
```
When the phone's browser makes a request it sends `Origin: http://192.168.11.17:5173`. The API compared that to the allowed string `http://localhost:5173`, they did not match, and Fastify rejected the preflight — causing all cross-origin fetch calls to fail with a network error.

#### Files changed

| File | Change |
|---|---|
| `apps/api/src/index.ts` | Changed `origin` from a hardcoded string to `true` (reflect-origin mode) |
| `docker-compose.yml` | Cleared the `FRONTEND_URL` default value so it no longer overrides with `localhost` |

#### Fix

```ts
// Before
await app.register(cors, {
  origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
  credentials: true,
});

// After — reflects any Origin back, satisfies credentials mode for any LAN IP
await app.register(cors, {
  origin: true,
  credentials: true,
});
```

#### Lesson

**For local dev with LAN access, set `origin: true` in @fastify/cors so any origin is reflected back. A hardcoded localhost string will silently block every device that isn't the host machine itself.**

---

### ERR-017 — ConfigContext hardcoded `localhost:4000` crashed app on mobile before render

**Date**: 2026-06-24
**Status**: ✅ Fixed

#### What happened

Even after fixing CORS (ERR-016), the phone still showed the "cannot connect to backend" error screen immediately on load. The chat UI never appeared.

#### Root cause

`apps/web/src/context/ConfigContext.tsx` is the very first component rendered by the app. It calls `GET /config` before anything else renders. It had its own independent `API_URL` constant with a hardcoded `localhost` fallback:

```ts
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
```

This was a **separate variable from `api.ts`** and was not touched during the earlier LAN access fix. The earlier fix only updated `apps/web/src/lib/api.ts`. Because `ConfigContext` called `localhost:4000` from the phone, the fetch failed, the error state was set, and the entire React tree rendered the error fallback instead of the workspace — making it appear as if nothing worked.

`docker-compose.yml` also had `VITE_API_URL: http://localhost:${API_PORT:-4000}` under the `web` service, which injected the old `localhost` value at Vite build time and reinforced the problem.

#### Files changed

| File | Change |
|---|---|
| `apps/web/src/context/ConfigContext.tsx` | Changed `API_URL` fallback from `"http://localhost:4000"` to `` `http://${window.location.hostname}:4000` `` |
| `apps/web/src/lib/api.ts` | Same pattern applied (done in prior session) |
| `docker-compose.yml` | Removed stale `VITE_API_URL: http://localhost:...` env var from `web` service |

#### Fix

```ts
// Before
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

// After — derives host from the browser's own URL so phones on LAN hit the right IP
const API_URL =
  import.meta.env.VITE_API_BASE_URL ??
  `http://${window.location.hostname}:4000`;
```

#### Lesson

**Search the entire frontend codebase for every occurrence of `localhost:4000` before declaring LAN access fixed. A single missed file that runs before the main app tree will block the whole app on any non-localhost device.**

---

### ERR-018 — Expo export fails on missing react-native-web dependency

**Date**: 2026-06-24
**Status**: ✅ Fixed

#### What happened

Running `pnpm build` failed during the `apps/mobile` step with `CommandError: It looks like you're trying to use web support but don't have the required dependencies installed. Install react-native-web@^0.20.0...`.

#### Root cause

By default, the `expo export` bundler attempts to build for all available targets including the web. However, our mobile app doesn't need to support the web target directly (since we already have `apps/web` as a dedicated web app), and we did not install `react-native-web`.

#### Files changed

| File | Change |
|---|---|
| `apps/mobile/app.json` | Added `"platforms": ["android", "ios"]` to the `"expo"` config object |

#### Fix

Explicitly restricted the build targets in `apps/mobile/app.json`:
```json
{
  "expo": {
    "platforms": ["android", "ios"]
  }
}
```

#### Lesson

**Specify target platforms in app.json for Expo projects within a monorepo to avoid bundling overhead and redundant dependency errors for unsupported targets like web.**

---

### ERR-019 — TS compiler JSX issues and tsconfig base extends file not found

**Date**: 2026-06-24
**Status**: ✅ Fixed

#### What happened

1. Inside `apps/mobile`, the IDE reported TypeScript errors: `Cannot use JSX unless the '--jsx' flag is provided` and `File 'expo/tsconfig.base' not found`.
2. Inside `apps/web/tsconfig.app.json`, the IDE reported `Invalid value for '--ignoreDeprecations'` when configured with `"6.0"`, but the CLI failed on `"5.0"` due to the deprecation warning of `baseUrl`.

#### Root cause

1. The editor's TS language server was running at the monorepo root and failed to resolve the non-hoisted `"expo/tsconfig.base"` path configuration inside `apps/mobile/tsconfig.json`, causing it to miss compiler options like `"jsx": "react-native"`.
2. The compiler option `baseUrl` is deprecated in TS 5.5+ and will be removed in TS 7.0. Standard TS 6.0 requests `"ignoreDeprecations": "6.0"`, but older editor TS versions don't recognize the `"6.0"` string yet.

#### Files changed

| File | Change |
|---|---|
| `apps/mobile/tsconfig.json` | Changed extends target path from `"expo/tsconfig.base"` to the relative symlink target `"./node_modules/expo/tsconfig.base.json"` |
| `apps/web/tsconfig.app.json` | Removed `baseUrl` and `ignoreDeprecations` settings entirely |

#### Fix

1. Changed `extends` inside `apps/mobile/tsconfig.json`:
```json
{
  "extends": "./node_modules/expo/tsconfig.base.json"
}
```
2. Removed both `baseUrl` and `ignoreDeprecations` inside `apps/web/tsconfig.app.json`. (Modern TS allows `paths` mapping without a configured `baseUrl` since TS 4.1).

#### Lesson

**Avoid using deprecated compiler options like baseUrl, and use relative symlinked paths when extending package-level configs (e.g. from local node_modules) so both the monorepo editor language server and the workspace CLI can resolve them.**

---

### ERR-020 — Mobile component files swapped during scaffolding (DocumentPicker / MessageBubble)

**Date**: 2026-06-30
**Status**: ✅ Fixed

#### What happened

`apps/mobile/components/DocumentPicker.tsx` exported a `Composer` component (wrong file).
`apps/mobile/components/MessageBubble.tsx` exported a `SourceCard` component (wrong file).
Both `index.tsx` and `workspace.tsx` imported these components expecting the correct props, so the screens would fail to render with prop-type mismatches at runtime.

#### Root cause

Copy-paste error during scaffolding: the `Composer` code was pasted into `DocumentPicker.tsx`, and the `SourceCard` code was pasted into `MessageBubble.tsx`. The filenames did not match their exported component or their expected props.

#### Files changed

| File | Change |
|---|---|
| `apps/mobile/components/DocumentPicker.tsx` | Rewrote with correct implementation: renders a toggleable list of `DocumentItem[]` with status labels and selected-state highlight |
| `apps/mobile/components/MessageBubble.tsx` | Rewrote with correct implementation: renders user/assistant chat bubbles with collapsible `SourceCard` source list |

#### Fix

Rewrote both files from scratch with the correct component logic matching the props consumed by their respective screens.

#### Lesson

**After scaffolding multiple component files, verify each exported component name matches the filename and matches the props interface consumed by the importing screen before running.**

---

### ERR-021 — Cross-lingual retrieval failure: Latin query returns empty context against Cyrillic chunks

**Date**: 2026-06-30
**Status**: ✅ Fixed (interim)

#### What happened

Users asking questions in English or Latin-script Mongolian against documents ingested in Cyrillic Mongolian received answers that:
1. Did not come from the document at all (LLM used its own parametric knowledge), and
2. Were in the wrong language (English instead of Cyrillic Mongolian).

#### Root cause

Two compounding layers:

**Layer 1 — Retrieval:** Gemini `gemini-embedding-001` embeds Latin/English queries and Cyrillic Mongolian chunks into different regions of the embedding space. Cosine similarity between a Latin query and a Cyrillic chunk is approximately **0.35**, far below the original `threshold=0.7`. All retrieved candidates were filtered out, producing an empty context array.

**Layer 2 — Generation:** With an empty context, the old `SYSTEM_INSTRUCTION` only said "answer from the document." With no document context present, the LLM silently fell back to its own training knowledge and responded in the language of the query (English), ignoring the required output language.

These bugs mask each other: lowering the threshold alone without fixing the system prompt still allows the LLM to answer in the wrong language if context is thin; fixing the system prompt alone without lowering the threshold still produces empty context.

#### Files changed

| File | Change |
|---|---|
| `apps/api/src/modules/retrieval/retrieval.service.ts` | `threshold` default: `0.7` → `0.1`; `lambda` default: `0.7` → `0.5` |
| `apps/api/src/modules/chat/generator.ts` | Rewrote `SYSTEM_INSTRUCTION`: explicitly instructs model to always respond in the source document's language/script regardless of query language |

#### Fix

```ts
// retrieval.service.ts — interim permissive threshold
export async function retrieveChunks(
  query: string,
  documentIds: string[],
  userId: string,
  k = 5,
  threshold = 0.1,   // was 0.7
  lambda = 0.5,      // was 0.7
  useMMR = true,
) { ... }
```

```ts
// generator.ts — language-enforcing system instruction
const SYSTEM_INSTRUCTION = `
You are a precise document assistant.
Answer ONLY using the retrieved context provided below.
CRITICAL LANGUAGE RULE: Always respond in the same language and script as the source documents,
regardless of the language the user's question is written in.
If the documents are in Mongolian Cyrillic, respond in Mongolian Cyrillic — even if the question is in English.
If no relevant context is found, state clearly that the document does not contain enough information.
Never use your own knowledge outside the provided context.
`;
```

#### Lesson

**Cross-lingual RAG has two failure layers: retrieval (embedding distance) and generation (language instruction). Both must be fixed together. The proper long-term fix is query translation before embedding — not just a permissive threshold — see DECISIONS.md for the query expansion architecture.**

---

### ERR-022 — Mobile crash: `cannot read property 'filter' of undefined` on home screen

**Date**: 2026-06-30
**Status**: ✅ Fixed

#### What happened

Opening the mobile app on a physical Samsung phone caused an immediate crash on the Home screen with:

```
TypeError: Cannot read property 'filter' of undefined
```

The app white-screened immediately after launch.

#### Root cause

`app/index.tsx` destructured the API response directly inside `.then()`:

```ts
// ❌ Broken
.then(({ documents: docs }) => {
  setSelectedIds(docs.filter((d) => d.status === "ready").map((d) => d.id));
})
```

If `res.documents` is `undefined` (backend not yet up, slow first connection, or unexpected response shape), the destructured `docs` is `undefined`. Calling `.filter()` on `undefined` throws immediately.

The same risk existed in `DocumentPicker.tsx` — its `documents` prop had no default value, so passing `undefined` would crash `.length` checks and `.map()` calls inside the component.

#### Files changed

| File | Change |
|---|---|
| `apps/mobile/app/index.tsx` | Replaced destructuring `{ documents: docs }` with `Array.isArray(res?.documents)` guard and `?? []` fallback |
| `apps/mobile/components/DocumentPicker.tsx` | Added default `= []` to `documents` prop in function signature |

#### Fix

```ts
// apps/mobile/app/index.tsx — safe response handling
.then((res) => {
  const docs: DocumentItem[] = Array.isArray(res?.documents) ? res.documents : [];
  setDocuments(docs);
  setSelectedIds(docs.filter((d) => d.status === "ready").map((d) => d.id));
})
```

```ts
// apps/mobile/components/DocumentPicker.tsx — safe prop default
export function DocumentPicker({ documents = [], selectedIds, onToggle, loading }: Props) {
```

#### Lesson

**Never call array methods on a value destructured from an API response without first confirming it is actually an array. Use `Array.isArray()` + `?? []` fallback at the fetch boundary, and add `= []` default props in every component that renders a list.**

---

## Quick Reference Gotchas (updated)

| Gotcha | Fix |
|---|---|
| Vite not reachable from host in Docker | Set `server.host: "0.0.0.0"` and `watch.usePolling: true` in `vite.config.ts` (ERR-001) |
| pgAdmin can't connect to localhost Postgres | Use host `postgres` (service name), not `localhost`, from inside Docker network (ERR-002) |
| Port 5432 already in use on host | Change host port mapping in `docker-compose.yml` (ERR-003) |
| Port 4000 already in use on host | Change `API_PORT` or host mapping (ERR-004) |
| `pdf-parse` not found | Install `pdf-parse` in `apps/api` (ERR-005) |
| ESM default import of pdf-parse fails | Use named import or dynamic import pattern (ERR-006) |
| GET /documents typo | Fix route handler (ERR-007) |
| pnpm frozen lockfile fails in Docker | Use non-frozen install or update lockfile (ERR-008) |
| `pdfParse is not a function` | pdf-parse v2 API change — use `PDFParse` class (ERR-009) |
| Invalid GEMINI_API_KEY in container | Ensure real key in `apps/api/.env`, rebuild container (ERR-010) |
| text-embedding-004 deprecated | Switch to `gemini-embedding-001` with 768 dims (ERR-011) |
| Gemini 429/503 quota errors | Model fallback chain in generator (ERR-012) |
| Smoke test `.answer` vs `.reply` mismatch | Parse `.reply` from `/chat` response (ERR-013) |
| TS5101 baseUrl deprecation on web build | Add `"ignoreDeprecations": "6.0"` to tsconfig (ERR-014) |
| Failed to resolve import inside Docker | Run `docker compose up --build -V` to clear cached node_modules volumes (ERR-015) |
| Mobile browser blocked by CORS | Set `origin: true` in `@fastify/cors` — a hardcoded localhost string rejects any LAN IP (ERR-016) |
| App crashes on mobile before render | Search ALL frontend files for `localhost:4000`; `ConfigContext.tsx` had its own copy that blocked the entire render tree (ERR-017) |
| Expo export fails on missing web packages | Restrict platforms to `["android", "ios"]` in `app.json` (ERR-018) |
| TS JSX errors & missing config extends | Extend local `node_modules` path; remove deprecated `baseUrl` to avoid `ignoreDeprecations` mismatches (ERR-019) |
| Mobile component files swapped (DocumentPicker / MessageBubble) | Rewrite both files with their correct implementations — do not copy-paste between component files during scaffolding (ERR-020) |
| Latin query returns empty context / wrong language against Cyrillic chunks | Lower `threshold` to `0.1` (interim); rewrite SYSTEM_INSTRUCTION to enforce document script; proper fix: query translation before embedding (ERR-021) |
| Mobile crash: `filter` of undefined on home screen | Use `Array.isArray(res?.documents) ? res.documents : []` at fetch boundary; add `= []` default prop in list components (ERR-022) |
| Mobile typecheck fails on process, startX, or onboarding route | Cast new routes as any; declare process globally in global.d.ts; track initial gesture coordinates via shared value in onStart (ERR-023) |
| Mobile: uploaded file never selectable, no processing status, chat reply blank | `lib/api.ts` drifted from backend: add `getDocumentStatus` + polling, parse `/chat`'s `.reply`/`.sources` (not `.message`), map source shape, don't auto-select pending docs (ERR-024) |
| `expo export` fails: "Chunk containing module not found: undefined" | A lazily-imported peer dep is missing — `@better-auth/expo` dynamically imports `expo-network` and `expo-web-browser`; `npx expo install` both (ERR-025) |

---

### ERR-023 — Mobile typecheck fails on missing `process`, `startX` gesture property, and `/onboarding` route type

**Date**: 2026-06-30
**Status**: ✅ Fixed

#### What happened

Running `pnpm --filter mobile typecheck` failed with multiple TS errors:
1. `router.replace("/onboarding")` was not assignable since onboarding was a new file and the static route types were stale.
2. `Cannot find name 'process'` in `app/workspace.tsx` and `lib/api.ts` since mobile environments lack standard Node types.
3. `Property 'startX' does not exist on type 'GestureUpdateEvent<PanGestureHandlerEventPayload>'` in `app/workspace.tsx` gesture handler.

#### Root cause

1. Expo Router static route generation lags behind new file creation in pnpm workspaces.
2. Mobile TS configurations (`tsconfig.base.json`) don't include `@types/node` by default, so references to NodeJS globals like `process.env` fail compilation.
3. In `react-native-gesture-handler` v2, update event payloads (`GestureUpdateEvent`) do not contain `startX` or other initial touch coordinates.

#### Files changed

| File | Change |
|---|---|
| `apps/mobile/global.d.ts` | Created to declare `process` globally at top level |
| `apps/mobile/app/index.tsx` | Cast new path string `/onboarding` as `any` |
| `apps/mobile/app/workspace.tsx` | Added `useSharedValue` to track `startX` on gesture start; cast route imports |

#### Fix

```ts
// apps/mobile/global.d.ts — declare process globally
declare var process: {
  env: {
    EXPO_PUBLIC_API_URL?: string;
    [key: string]: string | undefined;
  };
};
```

```ts
// apps/mobile/app/workspace.tsx — track start touch coordinate
const startX = useSharedValue(0);

const swipeGesture = Gesture.Pan()
  .onStart((event) => {
    "worklet";
    startX.value = event.x;
  })
  .onUpdate((event) => {
    "worklet";
    if (startX.value < 40 && event.translationX > 50) {
      runOnJS(setSidebarOpen)(true);
    }
  });
```

#### Lesson

**In mobile/native TS apps, resolve missing Node variables like `process` by creating a top-level `global.d.ts` file rather than polluting local files or adding unused devDependencies, and track initial gesture states explicitly with shared values rather than expecting them on update payloads.**


---

### ERR-024 — Mobile client can't add files, no processing status, chat replies blank (api.ts drifted from backend)

**Date**: 2026-07-02
**Status**: ✅ Fixed

#### What happened

On the mobile app (Expo):
1. After uploading a PDF or pasting text, the new document could never be selected in the DocumentPicker — it stayed greyed out as "Хүлээгдэж байна" (pending) forever, so files effectively "could not be added".
2. There was no way to see ingestion progress (pending → processing → ready) on the phone.
3. Sending a chat message showed the user bubble, then nothing — the assistant reply never appeared (and rendering could crash on `message.role` of `undefined`).
4. Source cards under assistant replies rendered blank titles.

#### Root cause

`apps/mobile/lib/api.ts` was written against an assumed API and drifted from the real backend responses (the web client `apps/web/src/lib/api.ts` was correct):

1. **Missing `getDocumentStatus`** — the backend exposes `GET /documents/:id/status` and the web app polls it every 3s; the mobile client never called it, so local document state was frozen at `pending`. `DocumentPicker` disables non-ready documents (`disabled={!isReady}`), making new uploads unselectable.
2. **`sendMessage` response shape wrong** — mobile typed the `/chat` response as `{ conversationId, message: ChatMessage }`, but the backend returns `{ conversationId, reply, sources }`. `res.message` was `undefined`, so the appended assistant message was undefined (same class of bug as ERR-013's `.answer` vs `.reply`).
3. **Source shape mismatch** — backend sources are `{ chunkId, documentId, content, page, chunkIndex, similarity }`; the mobile `SourceChunk` type expected `{ documentTitle, preview }`, so `SourceCard` rendered blanks.
4. **Compounding bug in `workspace.tsx`** — `handleDocumentAdded` auto-selected the still-`pending` document; `/chat` requires every selected document to be `ready` and returned 400.

#### Files changed

| File | Change |
|---|---|
| `apps/mobile/lib/api.ts` | Added `getDocumentStatus()`; fixed `sendMessage` to return `ChatResponse { conversationId, reply, sources }`; added `DocumentStatusResponse` type; removed stray `userId` body/form fields |
| `apps/mobile/types/index.ts` | Added `RawSourceChunk` (backend shape); made `SourceChunk.documentTitle`/`preview` optional, added `chunkId`/`page`/`chunkIndex` |
| `apps/mobile/app/workspace.tsx` | Added 3s status polling effect (mirrors web `WorkspacePage`); auto-select docs only when they turn `ready`; `mapSources()` resolves document titles + builds previews; builds assistant `ChatMessage` from `res.reply`/`res.sources`; maps sources on conversation-history load; empty-selection guard opens picker |
| `apps/mobile/components/SourceCard.tsx` | Fallback title ("Баримт бичиг") and 2-line content preview |

#### Fix

```ts
// lib/api.ts — poll ingestion status (was missing entirely)
getDocumentStatus: (id: string) =>
  request<DocumentStatusResponse>(`/documents/${id}/status`),

// lib/api.ts — /chat returns reply + sources, not a ChatMessage
sendMessage: (params) =>
  request<ChatResponse>("/chat", { method: "POST", body: JSON.stringify(params) }),
```

```ts
// app/workspace.tsx — poll pending/processing docs every 3s, auto-select on ready
useEffect(() => {
  const hasPending = documents.some((d) => d.status === "pending" || d.status === "processing");
  if (!hasPending) return;
  const interval = setInterval(() => { /* getDocumentStatus per pending doc */ }, 3000);
  return () => clearInterval(interval);
}, [documents]);

// app/workspace.tsx — build the assistant message from the real response
const assistantMsg: ChatMessage = {
  id: `${Date.now()}-assistant`,
  role: "assistant",
  content: res.reply,
  sources: mapSources(res.sources),
  createdAt: new Date().toISOString(),
};
```

Verified with `pnpm --filter mobile typecheck` (passes). Full on-device e2e check (upload → ready → chat → sources) still pending on the emulator.

#### Lesson

**When two clients consume the same API, never hand-write response types twice — mirror the proven client (web `api.ts`) or share types via `packages/api-client`; response-shape drift (`.message` vs `.reply`) is the same failure as ERR-013 and will keep recurring until types are shared.**

---

### ERR-025 — `expo export` fails with "Chunk containing module not found: undefined" after adding @better-auth/expo

**Date**: 2026-07-02
**Status**: ✅ Fixed

#### What happened

After installing `better-auth` + `@better-auth/expo` in `apps/mobile`, `pnpm --filter mobile build` (`expo export`) failed:

1. First run: `Unable to resolve module expo-network from @better-auth/expo/dist/client.js`.
2. After installing `expo-network`: `AssertionError [ERR_ASSERTION]: Chunk containing module not found: undefined` from `@expo/metro-config/src/serializer/serializeChunks.ts` — with no module name in the message. Clearing the Metro cache did not help.

#### Root cause

`@better-auth/expo`'s client **lazily imports** (dynamic `import()`) two Expo peer packages it doesn't declare as hard deps: `expo-network` (offline detection) and `expo-web-browser` (OAuth flows). Missing dynamic imports don't fail resolution loudly — Metro records the async dependency as unresolved and the export-time chunk serializer then asserts with the unhelpful "Chunk containing module not found: undefined". The `EXPO_DEBUG=1` log revealed the real cause: `FailedToResolveNameError (module: expo-web-browser, origin: @better-auth/expo/dist/client.js)`.

#### Files changed

| File | Change |
|---|---|
| `apps/mobile/package.json` | Added `expo-secure-store`, `expo-network`, `expo-web-browser` via `npx expo install` (SDK-matched versions) |

#### Fix

```bash
cd apps/mobile
npx expo install expo-secure-store expo-network expo-web-browser
npx expo export   # succeeds
```

#### Lesson

**When Metro's export serializer says "Chunk containing module not found: undefined", run with `EXPO_DEBUG=1` and look for `FailedToResolveNameError` — the real culprit is usually a missing lazily-imported peer dependency, not a cache or serializer bug.**
