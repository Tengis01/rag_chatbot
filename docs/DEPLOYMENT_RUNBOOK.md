# Jarvis production runbook

Target: `ssh jarvis`, `/home/tengis/rag-chatbot`, Compose project `rag-prod`.
Web: `https://ragchatbot.dev`; API: `https://api.ragchatbot.dev`.
Public web/API HTTPS, synthetic API smoke and user-reported real web acceptance passed on 2026-09-16. Mobile and live RAG acceptance remain pending; see DEPLOYMENT_VERIFICATION.md.

## What runs where

Nginx serves the compiled Vite app and proxies the API hostname to Fastify. PostgreSQL/pgvector owns `rag-prod_postgres_data`. API and database have no published ports. Only Nginx is published on host **127.0.0.1:8080**. The optional cloudflared profile joins Nginx's private network and makes outbound connections. Valheim remains a separate project under `/home/tengis/valheim`.

The first release uses an inspected source archive (no Git credentials, `.env`, dependencies, or report) built manually on the VM. Its `manual-<archive-hash>` revision is **not a Git commit**. New deploy scripts copied later and the corrected Compose configuration are recorded separately. Before CI/CD, commit the reviewed work, use a project-scoped read-only checkout key and switch to actual commit/digest releases.

## First build / everyday checks

On the VM:

```bash
cd /home/tengis/rag-chatbot
scripts/deploy/compose.sh config --quiet
scripts/deploy/compose.sh ps
curl -fsS -H 'Host: api.ragchatbot.dev' http://127.0.0.1:8080/health
curl -fsS -H 'Host: ragchatbot.dev' http://127.0.0.1:8080/ > /dev/null
scripts/deploy/compose.sh logs --tail=50 api
scripts/deploy/compose.sh exec -T web nginx -t
docker stats --no-stream
df -h /
```

Do not paste full `docker compose config`, `.env`, `docker inspect`, or request cookies into chat/logs. The wrapper always chooses the production file/project and backend env file. Existing local `docker-compose.yml` and development commands are unchanged.

First-build commands (replace the revision/tag consistently for a future build):

```bash
docker build -f infra/docker/Dockerfile.prod --target api --build-arg APP_REVISION=manual-60653da1fc21 -t rag-api:manual-60653da1fc21 .
docker build -f infra/docker/Dockerfile.prod --target web --build-arg APP_REVISION=manual-60653da1fc21 --build-arg VITE_API_BASE_URL=https://api.ragchatbot.dev -t rag-web:manual-60653da1fc21 .
scripts/deploy/compose.sh up -d --wait postgres api web
scripts/deploy/compose.sh exec -T api node --input-type=module < scripts/deploy/smoke.mjs
```

The smoke script creates and removes its own synthetic accounts/documents, verifies cookies/origin/isolation/upload rejection, and makes no Gemini calls. Run before public launch; repeated runs can hit auth rate limits. Local API regression tests: from `apps/api`, run `node --import tsx tests/production.test.ts`. Required workspace checks: `pnpm typecheck` and `pnpm build`.

## Settings and credentials

VM-only `apps/api/.env`, mode 600, holds production DB password/URL, Better Auth secret and Gemini key. Start from `apps/api/.env.production.example`; create independent random DB/auth secrets. API startup rejects absent production secrets, insecure public origins and unsupported limits. Never use development DB credentials for this deployment. Changing `POSTGRES_PASSWORD` in env does not rotate an existing database password; coordinate an explicit DB password change.

`API_IMAGE`, `WEB_IMAGE` select the release. For Compose builds/deployments, `APP_REVISION_OVERRIDE` records its identity and safely overrides the VM env-file fallback; do not pass `APP_REVISION` directly because the production `--env-file` supplies that name. Public web API URL is baked into Vite at image build time. Mobile uses `EXPO_PUBLIC_API_URL=https://api.ragchatbot.dev` when running/building a compatible Expo client; no Metro service is deployed on the VM. Native device testing remains a separate acceptance gate.

## GHCR image pull (after the first green CI run)

Images are private by default. On Jarvis, create a GitHub **classic** personal access token with only `read:packages`; do not grant repository, write, delete, workflow, or admin scopes. Keep it private and do not paste it into chat. Give Docker a RAG-specific owner-only credential location, then log in and pull an immutable full SHA:

```bash
mkdir -p -m 700 ~/.config/rag-chatbot/ghcr-docker
export DOCKER_CONFIG="$HOME/.config/rag-chatbot/ghcr-docker"
read -rsp 'GitHub PAT (read:packages): ' ghcr_token
printf '\n'
printf '%s' "$ghcr_token" | docker login ghcr.io --username Tengis01 --password-stdin
unset ghcr_token
cd /home/tengis/rag-chatbot
scripts/deploy/pull-ghcr.sh EXACT_40_CHARACTER_COMMIT_SHA
```

The helper pulls `ghcr.io/tengis01/rag-api:sha-<commit>` and `rag-web:sha-<commit>`, then requires both OCI revision labels to match. It deliberately does **not** restart or deploy any container. Keep `DOCKER_CONFIG` set for future GHCR pulls, or export it again in the same shell. After the pull check, use the normal drain/backup procedure and explicitly review the image switch; image pull is not automatic deployment.

## Restricted manual deploy workflow

The repository now includes `.github/workflows/deploy.yml`, but it is `workflow_dispatch` only. Before enabling a run, create a separate Ed25519 deployment key on the laptop; never reuse the personal `jarvis` login key. Add its public key to Jarvis with the forced command and forwarding restrictions below, using the already installed entrypoint:

```text
command="/home/tengis/rag-chatbot/scripts/deploy/ssh-release-entrypoint.sh",no-agent-forwarding,no-port-forwarding,no-X11-forwarding,no-pty ssh-ed25519 AAAA... rag-deploy
```

Save these GitHub Actions **production environment** secrets: `JARVIS_HOST` (VM address), `JARVIS_USER` (`tengis`), `JARVIS_DEPLOY_KEY` (private key) and `JARVIS_KNOWN_HOSTS` (the exact hashed `ssh-keyscan` line for the VM). Review the environment before the first `workflow_dispatch`; the workflow validates a full SHA, uses the pinned host key, invokes only the forced release entrypoint, and checks public revision after deployment. Confirm GitHub runner-to-VM SSH reachability first; do not widen Azure NSG/UFW rules silently.

## Cloudflare + Name.com (user account step)

1. Add `ragchatbot.dev` to Cloudflare and choose Free. Keep any existing DNS/email records that are needed.
2. Copy the **two nameservers assigned to this zone** into Name.com's domain nameserver settings, replacing the old authoritative nameservers. Do not invent nameserver values. Wait until Cloudflare reports the zone Active.
3. Create a named remotely managed Cloudflare Tunnel, e.g. `jarvis-rag`. Set two published application routes: `ragchatbot.dev` → `http://web:8080`, and `api.ragchatbot.dev` → `http://web:8080`. This hostname resolves inside the Compose network. Preserve the original HTTP Host header; Nginx uses it to select the web/API virtual host.
4. Retrieve the full `eyJ...` token from Tunnel → Add a replica → Docker installation command (the value after `--token`), **not the tunnel UUID**. Save just the connector token privately on Jarvis at `secrets/cloudflare-tunnel-token`, mode 600. The file owner must match the connector UID/GID: Jarvis uses 1000:1000. Token is not an account password or the whole generated install command. Do not send it in chat. The connector reads it using `--token-file`; it is not in command-line arguments or image layers.
5. Run `scripts/deploy/compose.sh --profile tunnel up -d --no-deps --force-recreate cloudflared` (recreation remounts a token file replaced by the editor). Confirm Tunnel Healthy and edge certificate Active. Enable HTTPS redirect in Cloudflare. Avoid cache rules covering API/auth; origin returns `Cache-Control: no-store`.
6. Test real browser signup/login/logout/session refresh, document ingestion/chat/sources and cross-user isolation over HTTPS, then a real mobile client. An HTTP localhost smoke does not prove browser TLS/cookie behavior. Do not open API/DB or Valheim-related ports for this task.

[Cloudflare Tunnel setup](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/get-started/create-remote-tunnel/), [full DNS setup](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/).

## Drain, backup, restore and update

The API supports **one replica**. Upload/paste reserves one slot per user, at most two concurrent ingestion jobs; chats use one per user, at most four globally. Chat embedding/generation retries share a 90-second cancellation deadline. Nginx also rate-limits auth/ingestion/chat by client IP. These are modest MVP limits, not a distributed quota system.

Before replacing an existing API:

```bash
scripts/deploy/drain.sh
scripts/deploy/backup.sh
```

Drain creates `state/drain`: new ingestion/chat receive 503, already admitted work continues. It waits up to 10 minutes, then **defers** deployment if work remains; maintenance stays enabled. Inspect the situation, retry, or explicitly `rm state/drain` to reopen without deployment. Never restart an active ingestion just to meet a deployment timeout.

The dump is an owner-only custom-format `pg_dump` plus SHA-256 file under `backups/`. Validate by restoring into a **new scratch database**, automatically dropped after the check:

```bash
scripts/deploy/restore-check.sh backups/rag-EXACT_FILENAME.dump
```

Run `scripts/deploy/daily-backup.sh` for a verified dump plus retention. It keeps the latest seven calendar days, validates a dump checksum before removing its older pair, and uses locks so a scheduled/manual backup cannot overlap. On Jarvis, install the user cron once with `scripts/deploy/install-backup-cron.sh`; it runs daily at **03:00 Asia/Ulaanbaatar** (`19:00 UTC`) and writes `backups/daily-backup.log`. Confirm it with `crontab -l` and inspect the first scheduled log the next day.

Copy both dump and checksum off the VM (private laptop directory). A dump remaining on the 27-day VM is not an offsite backup. The initial laptop copy exists; recurring offsite transfer requires an always-available, encrypted destination and is deliberately not pretended to be automatic.

After a successful drain/backup and migration compatibility review, change only the selected image references, then `scripts/deploy/compose.sh up -d --no-deps --wait api web`. Check health/revision and smoke tests, then remove `state/drain`. Keep current and previous images. PostgreSQL stays running with the same volume.

Rollback uses the previous API/web references only if the existing schema is compatible. If a migration is destructive/incompatible, stop and plan recovery explicitly; do not automatically restore a database over new user data. The same-source operational rollback and the first GHCR release are now demonstrated. Never `down -v`, globally prune Docker, or modify Valheim resources.

## Remaining automation and exit

After HTTPS/manual acceptance: GitHub Actions checks/builds → GHCR images with SHA/digests → manual release workflow → automatic main releases using the same proven procedure. Restricted deployment scripts/workflow are prepared; deployment key setup, runner reachability/NSG review, workflow dispatch and automatic deployment remain to be implemented.

Confirm exact Azure expiry. During the last week, rehearse restore again; export DB, needed secrets/configs and image references off VM 2–3 days before expiry. Verify Valheim world backup separately. Azure resource deletion or subscription changes require a separate user instruction.
