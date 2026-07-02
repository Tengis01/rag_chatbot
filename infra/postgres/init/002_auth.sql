-- ─────────────────────────────────────────────────────────────────
-- Better Auth core schema (email + password)
--
-- Better Auth runs inside the Fastify API and stores all auth data
-- in THIS local Postgres:
--   "user"         — one row per account (email lives here)
--   "session"      — active login sessions (cookie token per device)
--   "account"      — credentials per provider; for email+password the
--                    scrypt-HASHED password is stored in "password"
--   "verification" — short-lived tokens (email verification, reset)
--
-- Column names are camelCase (Better Auth's default mapping), so they
-- must stay quoted. IDs are UUIDs because the app generates them via
-- advanced.database.generateId = randomUUID() — this keeps them
-- compatible with the existing UUID user_id columns on documents,
-- chunks, conversations and messages.
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE "user" (
  "id" UUID PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  "image" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "session" (
  "id" UUID PRIMARY KEY,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" UUID NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE "account" (
  "id" UUID PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" UUID NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMPTZ,
  "refreshTokenExpiresAt" TIMESTAMPTZ,
  "scope" TEXT,
  "password" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "verification" (
  "id" UUID PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ON "session" ("userId");
CREATE INDEX ON "account" ("userId");
CREATE INDEX ON "verification" ("identifier");
