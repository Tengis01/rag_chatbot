# Deployment Diagrams

## 1. Одоогийн орчин — Docker Compose (локал / LAN dev)

Код: `docker-compose.yml`. Нэг командаар бүрэн стек: `pnpm docker:up`.

```mermaid
flowchart TB
    subgraph Host["Хөгжүүлэгчийн машин"]
        subgraph Compose["Docker Compose (default network)"]
            PG[("postgres<br/>pgvector/pgvector:pg16<br/>127.0.0.1:5432 (зөвхөн локал)")]
            APIC["api<br/>Node + Fastify (ESM)<br/>0.0.0.0:4000"]
            WEBC["web<br/>Vite dev server<br/>0.0.0.0:5173"]
            PGA["pgadmin (--profile tools)<br/>127.0.0.1:5050"]
        end
        VOL1[/"postgres_data<br/>(named volume — build-д устдаггүй)"/]
        VOL2[/"pgadmin_data"/]
        ENV["apps/api/.env + compose env<br/>GEMINI_API_KEY · BETTER_AUTH_SECRET · DATABASE_URL"]
    end

    Browser["Вэб хөтөч<br/>(localhost эсвэл LAN IP)"] -->|":5173"| WEBC
    Browser -->|":4000 (api.ts hostname fallback)"| APIC
    Phone["Утас — Expo Go<br/>(LAN, api-base probe)"] -->|":4000"| APIC
    APIC -->|"pg Pool :5432"| PG
    PGA -.-> PG
    PG === VOL1
    PGA === VOL2
    ENV -.->|"нууцууд зөвхөн сервер талд"| APIC
    APIC -->|"HTTPS REST"| GEM["Gemini API<br/>(цорын ганц гадаад хамаарал)"]
```

- `postgres` зөвхөн `127.0.0.1`-д холбогдсон — LAN-аас сан руу шууд хандах боломжгүй.
- Web контейнерт API хаяг тохируулаагүй — клиент `window.location.hostname:4000` fallback ашигладаг тул LAN-аас нээхэд автоматаар зөв хост руу очно (ERR-016/017).
- API асахдаа `infra/postgres/migrations/`-ийн хэрэгжээгүй файлуудыг автоматаар хэрэгжүүлнэ.

## 2. Зорилтот орчин — Azure VM "Monarch" (Priority 5, төлөвлөгдсөн)

VM: Standard D4as v5, Ubuntu 24.04, static IP 40.82.138.44. **Game сервертэй хуваалцдаг** — RAG зөвхөн `~/rag-chatbot/` дотор, өөрийн compose-той.

```mermaid
flowchart TB
    Internet(("Интернэт"))
    subgraph Azure["Azure VM Monarch (Korea Central)"]
        NSG["NSG firewall<br/>22 (SSH) · 80/443 (нээх ёстой)"]
        subgraph RAG["~/rag-chatbot (тусдаа compose)"]
            NGX["Nginx reverse proxy<br/>+ Let's Encrypt SSL"]
            WEBP["web — static build<br/>(Vite dev биш!)"]
            APIP["api :4000"]
            PGP[("postgres + pgvector<br/>дотоод network only")]
            BK["pg_dump nightly cron"]
        end
        GAME["~/necesse (game server)<br/>14159/udp — БҮҮ ХҮР"]
    end
    Internet --> NSG --> NGX
    NGX -->|"/"| WEBP
    NGX -->|"/api"| APIP
    APIP --> PGP
    BK -.-> PGP
    APIP -->|HTTPS| GEMP["Gemini API"]
```

- Production дүрмүүд: deploy скрипт бүр `cd ~/rag-chatbot` хийж эхэлнэ; **хэзээ ч** `docker system prune -a` / `docker compose down -v` хийхгүй; CORS/trustedOrigins-ыг reflect-any-origin-оос бодит домэйн болгож чангална.
- Vercel дээр `apps/web`-ийг тусад нь байршуулах хувилбар нээлттэй (тэгвэл VM дээр зөвхөн API үлдэнэ).
