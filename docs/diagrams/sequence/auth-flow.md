# Auth Flow Sequence

Better Auth нь тусдаа үйлчилгээ биш — API процессын дотор ажиллаж, аппликейшнтэй нэг pg Pool хуваалцана. Код: `apps/api/src/shared/auth.ts` (betterAuth instance), `index.ts` (Fastify → Fetch bridge, `/api/auth/*`), `shared/session.ts` (`requireUser()`).

## Бүртгэл / нэвтрэлт

```mermaid
sequenceDiagram
    actor User as "Хэрэглэгч"
    participant Web as "Web (React)"
    participant Mob as "Mobile (Expo)"
    participant API as "Fastify API"
    participant BA as "Better Auth (in-process)"
    participant DB as "PostgreSQL"

    rect rgb(245, 245, 255)
    note over User,DB: Вэб — бүртгэл + нэвтрэлт
    User->>Web: имэйл + нууц үг (≥8 тэмдэгт)
    Web->>API: POST /api/auth/sign-up/email<br/>(credentials: "include")
    API->>BA: Fetch-bridge (Fastify req → Request)
    BA->>DB: INSERT "user" (UUID id via generateId)
    BA->>DB: INSERT "account" (scrypt-hashed password)
    BA->>DB: INSERT "session" (unique token, expiresAt)
    BA-->>Web: Set-Cookie: better-auth.session_token
    note over Web: Хөтөч cookie-г автоматаар хадгална
    end

    rect rgb(245, 255, 245)
    note over User,DB: Мобайл — ижил урсгал, cookie хадгалалт өөр
    User->>Mob: имэйл + нууц үг
    Mob->>API: POST /api/auth/sign-in/email<br/>(@better-auth/expo client)
    API->>BA: Fetch-bridge
    BA->>DB: SELECT "account" → scrypt verify
    BA->>DB: INSERT "session"
    BA-->>Mob: session cookie
    note over Mob: Cookie SecureStore-д шифрлэгдэн хадгалагдана
    end
```

## Хамгаалагдсан хүсэлт (401 guard + user_id шүүлт)

```mermaid
sequenceDiagram
    participant Client as "Клиент (Web cookie / Mobile getCookie())"
    participant Route as "Protected route"
    participant Sess as "requireUser()"
    participant BA as "Better Auth"
    participant DB as "PostgreSQL"

    Client->>Route: GET /documents (Cookie header)
    Route->>Sess: requireUser(req, reply)
    Sess->>BA: auth.api.getSession(headers)
    BA->>DB: SELECT "session" JOIN "user" WHERE token = ?

    alt session хүчинтэй
        BA-->>Sess: { user }
        Sess-->>Route: user
        Route->>DB: SELECT ... WHERE user_id = user.id
        Note over Route,DB: Давхар шүүлт: бүх асуулга —<br/>match_chunks хүртэл — user_id-аар хязгаарлагдана
        Route-->>Client: 200 өгөгдөл (зөвхөн өөрийнх)
    else session байхгүй / дууссан
        Sess-->>Client: 401 Unauthorized
    end
```

## Тэмдэглэл

- Нээлттэй route зөвхөн 3: `/health`, `/config`, `/api/auth/*` — бусад бүх route `requireUser()`-ээр эхэлнэ.
- Better Auth ID-ууд `advanced.database.generateId`-ээр UUID үүсдэг тул app хүснэгтүүдийн `user_id UUID`-тай шууд нийцнэ.
- Auth хүснэгтүүдийн багана нэрс camelCase — SQL-д заавал хашилттай (`"userId"`, `"expiresAt"`).
- Мобайл дээр `@better-auth/expo` нь `expo-secure-store`/`expo-network`/`expo-web-browser` peer deps шаарддаг — устгавал `expo export` эвдэрнэ (ERR-025).
