# Jarvis deployment verification — 2026-09-15

## Current state

Public web and API are reachable over HTTPS as of 2026-09-16. Laptop and Jarvis probes return HTTP 200 with valid TLS for `https://ragchatbot.dev` and `https://api.ragchatbot.dev/health`. The web serves the expected Mongolian Vite HTML; `/assets/index-3IXtBdTv.js` returns 200 with `application/javascript`.

Tunnel `jarvis-rag` is running with zero restarts and four registered QUIC connections. Configuration version 2 routes both hostnames to `http://web:8080`. The user corrected the apex's old proxied A record (`91.195.240.94`) to the tunnel CNAME `ccff4150-cbf8-4f18-af7f-e9b19b81d469.cfargotunnel.com`; transient 525 responses cleared on subsequent probes. ERR-062 through ERR-064 are fixed. Wildcard/www records were not changed or accepted as working application routes.

The existing synthetic smoke script also passed through the public HTTPS API: health/config, signup/session and secure cookies, hostile-origin rejection, user isolation, oversized upload 413, malformed PDF 422 and admission cleanup. The script was transformed in memory to use `node:https` and the public API base, then run in the VM API container; no script source changed. Its synthetic data was cleaned up and no Gemini calls were made. The user also completed a real web acceptance test without issues. Mobile session and live RAG acceptance remain pending.

Manual production deployment runs on `jarvis` under `/home/tengis/rag-chatbot`, Compose `rag-prod`. Cloudflare zone activation and nameservers `marek.ns.cloudflare.com` / `mckinley.ns.cloudflare.com` are confirmed. User reported the initial SHA-pinned CI/GHCR workflow run completed without issue. Jarvis has authenticated to private GHCR packages and now runs the first verified GHCR release.

- API/Web: `ghcr.io/tengis01/{rag-api,rag-web}:sha-37e3fca3f10de6b0ab1ebab79201c27b85f4fd38`. The validated release is stored owner-only in `state/release.env`, so normal Compose commands retain it rather than falling back to historical manual images.
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
| Operational rollback | Drained API, made pre-deploy `rag-20260916T055152-590682.dump`, rebuilt the identical VM archive as `rollback-test-20260916-1e81efb`, switched API/web, then restored `manual-60653da1fc21`. Candidate and final ingress health were DB-connected; final web returned HTTP 200. Postgres, tunnel and Valheim were not restarted. |
| GHCR access boundary | Anonymous `docker pull` for API/web tag `sha-7395fe0...` returned `unauthorized`; use a Jarvis-only classic token limited to `read:packages`, then pull and verify labels before deployment. |
| Manual GHCR release | Pulled and OCI-label-verified API/Web SHA images, drained admission, created `rag-20260916T072841-627051.dump`, recreated only API/Web, and confirmed internal/public health at revision `sha-37e3fca3f10de6b0ab1ebab79201c27b85f4fd38`. Postgres, Cloudflare and Valheim were unchanged. |
| Restricted GitHub deployment | Dedicated forced-command key and production environment secrets were configured. One `workflow_dispatch` deployment passed. `main` auto-deploy remains disabled. |
| Compatible version rollback | `release-ghcr.sh` deployed GHCR release `sha-7395fe042204af07b853fe06b9bf1f413dade8cd`, then deployed `sha-37e3fca3f10de6b0ab1ebab79201c27b85f4fd38` again. Each transition drained the API, created a dump, recreated only API/web, and passed healthchecks. Final public API reports `37e3…`, web is HTTP 200, and Valheim stayed up. |
| Active-work maintenance | A synthetic authenticated paste held `activeIngestion:1`. After enabling drain, another authenticated paste returned `503` with `Retry-After: 30`. The admitted workload completed, its synthetic account/documents were deleted, the marker was removed, and final health reported `draining:false` with zero active work. |

Snapshot after checks: API ~86 MiB / 1.5 GiB cap, PostgreSQL ~25 MiB / 2 GiB, Nginx ~6 MiB / 256 MiB; Valheim ~1.48 GiB. Root disk ~13 GB used, 49 GB free. These are idle snapshots, not load-test results.

Backups on VM under `backups/`:

- `rag-20260915T115617-217610.dump`: restored successfully in scratch DB; includes the synthetic persistence fixture only.
- `rag-20260915T115636-218392.dump`: clean database after test fixture removal.
- `rag-20260916T053557-584015.dump`: created by the daily wrapper after lock/retention changes; checksum and scratch restore passed with one document and one applied migration.
- `rag-20260916T055152-590682.dump`: pre-operational-rollback dump; `backup.sh` checksum validation passed before the API/web image switch.

Private laptop copies belong under the Git-ignored `backups/` directory with their `.sha256` files. The new daily-wrapper dump was copied and passed local SHA-256 verification. Jarvis user cron runs `daily-backup.sh` at 19:00 UTC / 03:00 Asia/Ulaanbaatar with seven-day checksum-guarded retention; cron service is active and a repeated installer call created no duplicate entry. Recurring offsite replication remains unconfigured because no always-available encrypted destination has been selected.

## Required before calling the deployment complete

- Real mobile session/cookie check; small live document ingestion/chat/source test using the verified Gemini credential. The user reports the real web acceptance test passed. Credential acceptance alone does not prove selected model availability, embedding quota or RAG correctness.
- No claim of zero downtime: the single API intentionally drains before replacement.
- Configure daily backup/retention, offsite cadence and final-week restore/export. Confirm exact Azure expiry and NSG rules.
- Demonstrate an intentionally failed candidate release and its automatic rollback before enabling automatic deployment. Mobile/live RAG acceptance is still deferred.

Report sources and PDF are unchanged. No GitHub configuration, domain purchase, account credentials disclosure or Azure firewall/subscription mutation was performed.
