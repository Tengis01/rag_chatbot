# Jarvis deployment verification — 2026-09-15

## Current state

Manual production build/deploy runs on `jarvis` under `/home/tengis/rag-chatbot`, Compose `rag-prod`. The user registered **ragchatbot.dev at Name.com** and is adding it to Cloudflare. No Cloudflare token, tunnel, DNS change, public HTTPS test or GitHub workflow has been completed by this task.

- API: `rag-api:manual-60653da1fc21`, web: `rag-web:manual-60653da1fc21`.
- Source archive SHA-256: `60653da1fc21a4b88036bb8a989aa87d27070aca0a766b1fa87e5ea78cb9a5b5`, 94 selected source files, 191,657 bytes. Contains no env, dependencies, Git metadata or report. Built **on the VM**. This is a worktree archive, not a committed Git revision. Compose's tmpfs/network fixes and later verification scripts were transferred separately.
- Build evidence copied on VM to `/home/tengis/rag-chatbot/evidence/rag-api-build.log` and `rag-web-build.log`; `evidence/deployment-config.sha256` records the corrected Compose and helper scripts. Temporary originals under `/tmp` are not the durable copies.
- First API image manifest list: `sha256:6fe064e4046c880aa89652c8992124ac006c76d2e9c60ab61ff6bd90db06e978`; web: `sha256:d434964b4464071cc809fcc2c40f53c8d86d8b7c49daca72f0b0fc99df0a4ec4`. These are local built images, not GHCR-published artifacts.

## Passed checks

| Check | Observed result |
|---|---|
| Workspace | `pnpm typecheck`, `pnpm build`: 5/5 success each; API/web rebuilt, unchanged mobile/shared tasks cached |
| Regression tests | Three named tests pass via `node --import tsx tests/production.test.ts`: production settings validation, admission/drain semantics, Gemini retry cancellation; fetch mocked |
| Container builds | Node 24 / pnpm 11.6.0 frozen-lockfile multi-stage API/web builds succeed on Jarvis |
| Image inspection | API uid 1000; packaged `003_document_error_message.sql`; env/source/report/Git/tsx absent from API runtime |
| Production config | Compose validates; Nginx `nginx -t` passes; `.env` mode 600, fresh random DB/auth secrets; unchanged local development env |
| Services | Postgres, API, web healthy; API `/health` returns DB connected and `manual-60653da1fc21` |
| Host routing | Host curl through 127.0.0.1:8080 + API hostname returns health; API/DB have no host bindings |
| Auth | Synthetic signup/session succeeds through Nginx; separate Secure/HttpOnly cookies; untrusted signup origin 403; untrusted CORS origin not reflected |
| Isolation | User B cannot list/read user A's synthetic document; cross-user chat selection fails before Gemini is contacted |
| Input handling | A 20 MiB + 1 byte upload returns 413; malformed PDF returns 422; ingestion/chat slots return to zero |
| Gemini credential | Official read-only model listing returns HTTP 200 / 50 models; no generation/embedding requests made |
| Drain | API reports maintenance true, no active work; drain script finishes. Maintenance flag removed after verification |
| Backup/restore | Custom pg_dump with checksum restored into a new scratch DB; one synthetic document and one migration present; scratch DB removed |
| Persistence | Stopped only RAG API, force-recreated only RAG Postgres container, restarted API: synthetic document count remains 1 and migration row remains. Fixture then deleted |
| Valheim | Container stays up (4 days), original UDP 2456–2457 bindings intact; no edits/restarts/data changes |

Snapshot after checks: API ~86 MiB / 1.5 GiB cap, PostgreSQL ~25 MiB / 2 GiB, Nginx ~6 MiB / 256 MiB; Valheim ~1.48 GiB. Root disk ~13 GB used, 49 GB free. These are idle snapshots, not load-test results.

Backups on VM under `backups/`:

- `rag-20260915T115617-217610.dump`: restored successfully in scratch DB; includes the synthetic persistence fixture only.
- `rag-20260915T115636-218392.dump`: clean database after test fixture removal.

Private laptop copies belong under the Git-ignored `backups/` directory with their `.sha256` files. Both named dumps were copied successfully and passed local SHA-256 verification. No automated daily schedule is installed yet.

## Required before calling the deployment complete

- Receive Cloudflare's assigned nameservers, finish registrar delegation and named tunnel. Token goes into a private VM file, not chat.
- Real HTTPS browser and mobile session/cookie checks; small live document ingestion/chat/source test using the verified Gemini credential. Credential acceptance alone does not prove selected model availability, embedding quota or RAG correctness.
- Demonstrate maintenance rejection during active work and a compatible previous-image rollback. First release has no previous production version; no claim of zero downtime.
- Configure daily backup/retention, offsite cadence and final-week restore/export. Confirm exact Azure expiry and NSG rules.
- Commit reviewed deployment source; project-specific checkout key, CI/GHCR, restricted SSH release workflow, pinned actions/images and failed-CI/deploy/rollback demonstrations.

Report sources and PDF are unchanged. No Git commit/push, GitHub configuration, domain purchase, account credentials disclosure or Azure firewall/subscription mutation was performed.
