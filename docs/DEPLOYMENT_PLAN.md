# Azure Jarvis deployment — суралцах ба хэрэгжүүлэх төлөвлөгөө

Төлөвлөсөн: 2026-09-14. Хэрэгжүүлж эхэлсэн: 2026-09-15. Одоогийн бодит явцыг `DEPLOYMENT_VERIFICATION.md`-ээс үзнэ.

Зорилго: Ubuntu VM дээр RAG үйлчилгээг гараар байршуулж, ажиллагааг нь тайлбарлаж чаддаг болох; дараа нь баталгаажсан deployment-ийг GitHub Actions + GHCR-ээр автоматжуулах. Хэрэглэгч энэ дарааллыг сонгосон. Valheim-ийн их ачааллыг гол асуудал болгохгүй; shared VM-ийн файлууд, өгөгдөл, үйлчилгээний тусгаарлалтыг хадгална.

## 1. Баталгаажсан эхлэх төлөв

Өмнөх ярианы SSH read-only шалгалтаар:

| Зүйл | Бодит төлөв |
|---|---|
| SSH | `ssh jarvis`, хэрэглэгч `tengis` |
| VM | Azure `Standard_D4as_v5`, 4 vCPU, x86_64; Korea Central гэж хэрэглэгч баталсан |
| OS | Ubuntu 24.04.5 LTS, GUI байхгүй |
| RAM | Нийт ~15.6 GiB; шалгах үед ~13 GiB available |
| Диск | Root filesystem 61 GB; 8.2 GB ашигласан, 53 GB сул |
| Docker | Engine 29.8.0, Compose 5.5.1; одоогийн SSH хэрэглэгч ашиглаж чадна |
| Valheim | `valheim-valheim-1`, шалгах үед ~1.535 GiB RAM; UDP 2456–2457 нийтэлсэн |
| Valheim-ийн байрлал | `/home/tengis/valheim/docker-compose.yml`; `config/` → `/config`, `data/` → `/opt/valheim` bind mount |
| UFW | Идэвхтэй; TCP 22, UDP 2456–2457 зөвшөөрсөн. Azure NSG-ийн бодит дүрэм тусад нь шалгах шаардлагатай |
| Domain | Хэрэглэгч Name.com дээр `ragchatbot.dev` авсан; Cloudflare zone/nameserver тохируулж байна (2026-09-15) |
| Хугацаа | Хэрэглэгчийн хэлснээр 27 хоног. Azure дээрх яг дуусах огноо/цагийг тэмдэглэнэ |
| Repository | Төлөвлөлт эхлэхэд `main` цэвэр, HEAD `7bc797b` (`reportv3`); өмнөх Git recovery-ийн uncommitted гэсэн тэмдэглэл түүхэн болсон |

Энэ нь нэг удаагийн хэмжилт; ачааллын туршилтын дүн биш. Хуучин баримтын `Monarch` IP/user-ийг шинэ deployment-д ашиглахгүй.

## 2. Байгуулах бүтэц

```text
Browser / Expo app
        │ HTTPS
Cloudflare: DNS + edge TLS
        │ Tunnel
Jarvis VM: cloudflared → Nginx → Fastify → PostgreSQL + pgvector
                          │        │
                     Vite dist     └── Gemini API

Jarvis VM: Valheim — одоогийн тусдаа Compose project
```

- Сонгосон хаяг: `ragchatbot.dev` — web; `api.ragchatbot.dev` — API/auth.
- RAG байрлал: `/home/tengis/rag-chatbot`; тогтмол Compose project name: `rag-prod`.
- Nginx web-ийн static файлуудыг үйлчилж, API hostname-ийн хүсэлтийг Fastify руу reverse proxy хийнэ. Host/protocol header, upload limit, timeout-ыг энд тохируулна.
- PostgreSQL нь persistent named volume ашиглана. API, DB-ийн портыг нийтэд publish хийхгүй. Эхний оношилгоонд Nginx-ийг зөвхөн `127.0.0.1:8080` дээр гаргаж болно.
- Cloudflare Tunnel outbound холболт ашигладаг тул RAG web-д зориулж VM-ийн 80/443 inbound портыг нээх шаардлагагүй. Valheim-ийн UDP хандалт одоогийнхоороо байна. [Cloudflare Tunnel](https://developers.cloudflare.com/tunnel/)
- Эхний шатанд Docker image-ийг **VM дээр гараар build** хийнэ. Дараагийн шатанд ижил Dockerfile-уудаар **GitHub Actions дээр build → GHCR → VM pull** болгоно.
- Одоогийн ingestion RAM-д ажил хадгалдаг, startup дээр pending ажлыг failed болгодог тул эхний production хувилбар **нэг API instance** байна. Зэрэг хоёр API асаах blue/green deploy-г одоохондоо ашиглахгүй.

## 3. Үе шат ба дууссаныг батлах шалгуур

### Үе 0 — Орчин, domain, зорилгоо тогтоох

Хийх ажил:

- Баталгаажсан VM inventory-г ашиглаж, Azure NSG, хугацааны эцэс, сэргээх backup-ын байршлыг тэмдэглэх.
- Student Pack-аас нэг domain бүртгэх; registrar нэвтрэлт/баталгаажуулалтыг хэрэглэгч өөрийн account-аар гүйцэтгэнэ.
- Эхний production DB-г шинээр үүсгэхээр төлөвлөнө. Хуучин chatbot өгөгдөл хэрэгтэй бол тусдаа `pg_dump`/restore ажлыг тодорхойлж байж шилжүүлнэ.
- Valheim-ийн config/world backup байгаа эсэхийг шалгах; game service restart хийхийг RAG-ийн ажилтай холбохгүй.

Дууссан шалгуур: domain нэр тодорхой, VM/SSH/expiry тэмдэглэгдсэн, project/volume/port тусгаарлалт тодорхой.

### Үе 1 — Production-д хэрэгтэй код, Docker тохиргоо бэлдэх

Одоогийн Dockerfile/Compose нь `tsx watch`, Vite dev server, source bind mount ашиглаж байгаа тул дараах ажлыг хийнэ:

- API build/runtime stage: TypeScript compile → production dependency → `node dist/index.js`; runtime-ийг non-root хэрэглэгчээр ажиллуулах.
- Web build stage: Vite build → Nginx static runtime. Node 24 болон lockfile-ийн pnpm хувилбарыг хэвээр ашиглах.
- Тусдаа production Compose, healthcheck, DB readiness, persistent volume, restart policy, log rotation, боломжийн memory limit бэлдэх. Local dev Compose-г хадгалах.
- Docker build context/final image-д `.env`, SSH key, report ZIP/PDF, node cache оруулахгүй байхыг шалгах.
- Production-д `BETTER_AUTH_SECRET`, DB password, Gemini key-г VM-ийн `apps/api/.env`-д owner-only эрхээр хадгалах; missing secret үед startup-ийг зогсоох.
- Better Auth-ийн `BETTER_AUTH_URL`/baseURL, secure cookie, зөвшөөрсөн web origin, `ragchatbot://` app scheme болон proxy header handling-ийг ил тод тохируулах. `http://host:4000` fallback-ийг production frontend-д ашиглахгүй. Web API client, auth client, ConfigContext гурвын URL-ыг нийцүүлэх. [Better Auth options](https://better-auth.com/docs/reference/options), [Fastify integration](https://better-auth.com/docs/integrations/fastify)
- UI дээрх 20 MB upload тохиргоог multipart/Nginx-ийн бодит limit-тэй нийцүүлж, хэтэрсэн хүсэлтэд ойлгомжтой 413 өгөх.
- Gemini generation-д нийт хугацааны хязгаар, cancellation нэмэх; fallback бүр нийлээд proxy-ийн timeout-оос урт болохгүй байх. Cloudflare-ийн одоогийн proxy read timeout 125 секунд гэж баримтжуулсан; tunnel болон Nginx-ийн тохиргоог мөн шалгана. Эхний зорилт: ~90 секундэд амжилт эсвэл тодорхой алдаа. [Cloudflare limits](https://developers.cloudflare.com/fundamentals/reference/connection-limits/)
- Auth, upload, chat хүсэлтэд тохирсон rate/concurrency limit бэлдэх; Gemini quota-г бодит credential-аар шалгах. Үнэгүй quota-г хязгааргүй гэж тооцохгүй.
- Compiled API image дотор SQL migration path болон init schema зөв байрласан, production-д migration folder байхгүй үед чимээгүй алгасахгүйг шалгах.

Дууссан шалгуур: `pnpm typecheck`, `pnpm build`, production image build, Compose validation амжилттай; түр DB дээр schema/migration шалгалт давсан; final image-д secret байхгүй.

### Үе 2 — VM дээр гараар анхны deployment хийх

- Repo-г project-specific read-only deploy key-ээр `/home/tengis/rag-chatbot` руу clone хийх. Хувийн laptop-ийн SSH private key-г VM рүү хуулж ашиглахгүй.
- Баталгаажсан commit-ийг сонгож, environment болон volume-оо бэлдэх.
- VM дээр Dockerfile-уудаар гараар image build хийх; commit SHA-гаар tag өгөх.
- Тогтмол `rag-prod` project нэртэй Compose-оор postgres → api → web-ийг асаах.
- Localhost хандалтаар `/health`, DB connectivity, Nginx routing, migration log, container user/port/volume-ийг шалгах.
- Container restart-ийн дараа туршилтын DB өгөгдөл үлдэж байгааг батлах.

Дууссан шалгуур: VM дээр app healthy; DB persist хийдэг; browser-д өгөх static bundle бэлэн; Valheim-ийн container/volume өөрчлөгдөөгүй. Энэ үед хэрэглэгч Docker build, image, container, network, volume-ийн үүргийг тайлбарлаж чаддаг болсон байна.

### Үе 3 — Domain, Cloudflare, HTTPS холбох

- Domain-оо Cloudflare Free zone-д нэмэх, registrar дээр Cloudflare-ийн оноосон nameserver-уудыг тавих. Хэрэв өмнө DNS record нэмсэн бол шилжүүлэхдээ хадгалах. [Nameserver setup](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)
- Тогтмол нэртэй Tunnel болон VM дээр `cloudflared` service/container бэлдэх; token-ыг secret file-д хадгалах.
- `ragchatbot.dev`, `api.ragchatbot.dev` hostname-уудыг Nginx рүү чиглүүлэх; default/unknown hostname-д catch-all хариу өгөх.
- Cloudflare edge HTTPS, origin Host/proto forwarding, Nginx virtual host, API cookie/CORS тохиргоог шалгах. Tunnel-ийн VM доторх HTTP hop болон browser-ийн HTTPS hop-ийг ялгаж тайлбарлана.
- Auth/API хариуг cache хийхгүй; static asset caching-ийг тусад нь тохируулах.

Дууссан шалгуур: domain-аар HTTPS ажиллана; web sign-up/login/logout/session refresh амжилттай; mixed-content/CORS алдаа байхгүй; DB болон 4000/5173 порт нийтэд нээлттэй биш. Edge TLS-д тусдаа paid SSL шаардлагагүй. [Universal SSL](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/)

### Үе 4 — Бодит ажиллагаа, backup, гараар rollback

- Зөвшөөрсөн жижиг test document-оор upload/paste → ready → chat → sources → refresh урсгалыг шалгах. Энэ live smoke test Gemini quota ашиглана; энгийн CI build бүр дээр ажиллуулахгүй.
- Хоёр test account-аар document/conversation isolation болон anonymous 401 хариуг шалгах.
- Mobile API base-ийг production HTTPS хаяг руу тохируулж, compatible Expo client дээр auth/chat шалгах. VM дээр Metro/Expo Go ажиллуулахгүй; EAS/store release тусдаа ирээдүйн ажил.
- Ingestion хийж байх үеийн restart/deploy бодлогыг шалгах. Шинэ ingestion авахыг түр зогсоогоод active ажлыг дуусгах; хугацаандаа дуусаагүй бол deployment-ийг хойшлуулах. Single-instance update богино тасалдалтай байж болно.
- Өдөр тутмын `pg_dump` backup, retention, backup failure log бэлдэх. Эхний off-VM хуулбарыг laptop руу авч, **тусдаа түр DB** дээр restore хийж rows/login/document өгөгдлийг батлах.
- Өмнөх image tag руу гараар rollback хийж `/health` болон хувилбарын SHA-г шалгах. DB schema нь өмнөх image-тэй нийцэх ёстой; image rollback нь DB rollback биш. Destructive migration эсвэл data restore-г автоматаар хийхгүй.
- Runbook-д start/status/logs/restart/backup/restore/deploy/rollback командыг бодит үр дүнтэй нь бичих.

Дууссан шалгуур: end-to-end smoke, isolation, persistence, backup restore, гараар rollback бүгд батлагдсан. Эдгээр дууссаны дараа CI/CD шат эхэлнэ.

### Үе 5 — GitHub Actions CI + GHCR

- `feature/*` → PR → `main` гэсэн энгийн branch урсгал ашиглах; эхний хувилбарт тусдаа staging VM шаардлагагүй.
- PR дээр frozen install, typecheck/build, production image build, secret шаардахгүй regression шалгалтууд ажиллах.
- `main` дээр ижил Dockerfile-уудаар GitHub-hosted Linux runner image build хийнэ. API болон web image-ийг нэг commit SHA-гаар GHCR-д publish хийнэ; deploy хийхдээ digest-ийг тогтооно.
- Actions publishing-д хамгийн бага шаардлагатай `GITHUB_TOKEN` permission ашиглах; third-party action version-ийг immutable SHA-гаар pin хийх. [GitHub image publishing](https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images)
- Private GHCR image татах VM credential-д шаардлагатай package read эрх л олгох. Нууц үгийг shell argument/log-д гаргахгүй. [GHCR authentication](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- Тест алдаатай commit-оор workflow унаж publish/deploy болохгүйг зориуд үзүүлэх. Хуурамч тест эсвэл production дээр санамсаргүй эвдрэл үүсгэхгүй.

Дууссан шалгуур: CI green; нэг SHA-ийн API/web image GHCR-д байна; VM тэдгээрийг гараар pull хийж, өмнө шалгасан deploy командаар ажиллуулж чадна.

### Үе 6 — Баталгаажсан deployment-ийг автоматжуулах

Эхний сонголт: GitHub Actions → тусдаа deployment SSH key → VM дээрх тогтмол release script. Ингэснээр өмнөх гараар хийсэн командуудын яг аль нь автомат болсныг харахад амар.

- GitHub runner-оос VM-ийн SSH хүрэх эсэхийг шалгана. Одоогийн UFW 22 нээлттэй боловч NSG ба runner connectivity-г урьдчилж таамаглахгүй. Хэрэв policy нь source IP-г хязгаарласан бол deployment transport-ийг pull timer болгох эсвэл түр зөвшөөрөгдсөн network path сонгох; firewall-ийг чимээгүй өргөжүүлэхгүй.
- Deployment key-г хувийн login key-ээс тусгаарлах; `authorized_keys` forced command/forwarding restriction болон root-owned release script-ээр зөвшөөрөгдөх ажиллагааг хязгаарлах. Host key fingerprint-ийг баталгаажуулж pin хийх.
- Script нь зөвхөн `/home/tengis/rag-chatbot`, `rag-prod`, зөвшөөрөгдсөн image names/SHA/digest дээр ажиллана. Дурын shell команд эсвэл дурын directory хүлээж авахгүй.
- Дараалал: deployment lock → image pull → disk check → шинэ ingestion-ийг түр хязгаарлах/active ажлыг дуусгах → backup/migration preflight → app container update → local/public health ба revision check → амжилттай release тэмдэглэх.
- DB volume болон database service-ийг application update бүрээр дахин үүсгэхгүй. Volume устгах `down -v`, VM-wide image/volume prune командыг ашиглахгүй.
- Алдаа гарвал schema-compatible өмнөх app image-ийг сэргээж, health шалгах. Нөхөн сэргээх нь бүтэлгүй бол ил тод failed deployment үлдээнэ.
- Эхлээд `workflow_dispatch`-ээр гараар trigger хийж туршина. Дараа нь CI амжилттай `main` update дээр auto deploy идэвхжүүлнэ. Нэг зэрэг нэг deployment; явагдаж буй deployment-ийг дараагийн push-аар дундуур нь таслахгүй.
- Docs/report-only өөрчлөлт нь app deploy хийхгүй. Production Compose/infra өөрчлөлт нь versioned release file sync ба тусдаа review шаарддаг; зөвхөн image солих pipeline тэдгээрийг автоматаар шинэчилсэн гэж үзэхгүй.

Дууссан шалгуур: жижиг UI өөрчлөлт push → CI → GHCR → VM → browser хүртэл автоматаар гарч, ажиллаж буй SHA таарна. Failed CI deployment үүсгэхгүй; rollback батлагдсан; VM дээр шинэ image build хийгдээгүй байна.

## 4. Domain ба зардлын сонголт

Nameserver-ийг тусад нь түрээслэх шаардлагагүй. Registrar дээр domain бүртгэлтэй байна; DNS-ийг Cloudflare-д хариуцуулна.

| Сонголт | Хэрэглэх нөхцөл |
|---|---|
| Name.com Student offer — санал | Боломжтой стандарт `.dev`, `.app`, `.software` зэрэг нэрээс нэгийг сонгох; эхний жил үнэгүй. Payment method шаардаж болох бөгөөд domain болон дагалдах security үйлчилгээний renewal-ийг checkout дээр шалгах |
| Namecheap `.me` — өөр сонголт | Student Pack-аас нэг жилийн domain саналтай; тухайн account/сургуулийн eligibility болон нэрийн боломжийг redemption үед шалгах |
| Cloudflare Free | DNS + edge TLS + Tunnel; registrar дээр domain-оо хэвээр хадгална |
| GitHub Actions | Account quota дотор эхлэх; одоогийн Pro allowance 3,000 минут/сар. Artifact retention-ийг богино байлгах |
| GHCR | Container image storage/bandwidth одоогоор үнэгүй; энэ нь бусад бүх GitHub Packages/Actions хэрэглээ үнэгүй гэсэн үг биш |

[Student Pack](https://education.github.com/pack/), [Name.com нөхцөл](https://www.name.com/partner/github-students), [Namecheap offer](https://nc.me/landing/github), [Actions allowance](https://docs.github.com/en/billing/reference/product-usage-included), [GHCR billing](https://docs.github.com/en/billing/concepts/product-billing/github-packages).

Хэрэглэгч Name.com дээр `ragchatbot.dev` авсан. Domain-ийн renewal/auto-renew тохиргоог registrar account дээрээ шалгана. Domain нь VM-ийн 27 хоног дуусахад хамт дуусахгүй.

## 5. Өдөр тутмын ажиллагаа ба 27 хоногийн төгсгөл

- Эхний memory cap-ийн санал: API 1.5 GiB, PostgreSQL 2 GiB, Nginx/cloudflared тус бүр 128–256 MiB; хэмжилтээр өөрчилнө. Энэ нь load test-ийн баталгаа биш.
- Нэг container-ийн log-ийг жишээлбэл 10 MB × 3 файлаар эргүүлэх. Current/previous RAG image-ийг үлдээж, цэвэрлэгээг зөвхөн RAG image ID/label-аар хийх. Доод тал нь 15 GB free space хадгалахыг deployment-ийн эхний босго болгох.
- Өдөр бүр health, RAM/disk, failed ingestion, backup timestamp шалгах. Хувийн баримтын текст, password, token-ыг log-д бичихгүй.
- Off-VM backup-ийн эхний арга: laptop руу SSH-ээр татах; laptop унтарсан үед үүнийг автомат найдвартай backup гэж тооцохгүй. Тогтмол offsite хэрэгтэй бол private, encrypted R2 backup-ыг тусдаа сонгож идэвхжүүлнэ. R2 Standard free tier нь 10 GB-month, ажиллагааны квоттой; хадгалалтын хэмжээгээр retention тогтооно. [R2 pricing](https://developers.cloudflare.com/r2/pricing/)
- Сүүлийн долоо хоногт restore-оо дахин туршиж, дараагийн хостыг сонгоно. Дуусахаас 2–3 хоногийн өмнө шинэчлэл багасгаж, эцсийн DB dump, deployment config, шаардлагатай secret recovery, image digest-үүдийг VM-ээс гадна хадгална. Valheim world backup-ын бүрэн бүтэн байдлыг тусад нь батална; тоглоомын binary cache-ийг world өгөгдөлтэй андуурахгүй.
- Дараагийн хост дээр restore → health/auth/chat test → DNS/Tunnel чиглүүлэлт солих дарааллаар шилжинэ.
- Хугацааны эцэст Azure resource зардлаа шалгана: deallocation нь compute төлбөрийг зогсоож болох ч disk/network үлдэж төлбөртэй байж болно. Resource устгах эсвэл subscription upgrade хийхийг төлөвлөгөө өөрөө гүйцэтгэх зөвшөөрөл гэж үзэхгүй. [Azure states/billing](https://learn.microsoft.com/en-us/azure/virtual-machines/states-billing)

## 6. Ажлын дараалал, нотлох материал

Өдрүүд нь ажлын ойролцоо төлөвлөлт; Azure-ийн баталгаажсан дуусах огноог гол хугацаа болгоно. Domain verification/DNS propagation хугацаа өөр байж болно.

| Хугацаа | Гол үр дүн |
|---|---|
| Эхний 1–2 өдөр | Production тохиргоо, VM дээр manual build/deploy, domain + HTTPS |
| 3–4 дэх өдөр | Auth/RAG/mobile smoke, DB persistence, backup restore, гараар rollback |
| 5–7 дахь өдөр | CI + GHCR, manual trigger CD, дараа нь main auto deploy |
| Үлдсэн хугацаа | Алдаа засвар, monitoring, demo, runbook/нотлох материал |
| Хугацаа дуусахаас 7 хоногийн өмнө | Restore rehearsal, дараагийн хост/хадгалалтын шийдвэр |
| Хугацаа дуусахаас 2–3 хоногийн өмнө | Эцсийн backup, шилжилт эсвэл архивлалт |

Бэлтгэх файлууд: production Docker targets, `compose.prod.yml`, Nginx config, production env example, release/backup/restore scripts, `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `docs/DEPLOYMENT_RUNBOOK.md`, `docs/DEPLOYMENT_VERIFICATION.md`. Нэр/байршлыг хэрэгжүүлэхэд одоогийн repo convention-той нийцүүлнэ.

Хамгаалалт/demo-д үзүүлэх нотолгоо: VM дээрх manual build log, container/network/volume тайлбар, HTTPS browser, хоёр хэрэглэгчийн isolation test, restore-ийн үр дүн, CI failed/passed run, GHCR SHA/digest, VM-ийн running version, deploy ба rollback demonstration. Screenshot/log-д secret оруулахгүй. Одоогийн баталсан дадлагын тайланг энэ ажлаар автоматаар өөрчлөхгүй.

2026-09-15: production тохиргоо хэрэгжүүлж, Jarvis дээр эхний manual build/deploy-г хийж байна. Domain бүртгэлтэй болсон. Бодит шалгалт, үлдсэн ажил: `DEPLOYMENT_VERIFICATION.md`; ажиллуулах заавар: `DEPLOYMENT_RUNBOOK.md`. Actions/GHCR нь manual deployment-ийн шалгууруудын дараах шат хэвээр.
