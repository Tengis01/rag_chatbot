import { randomUUID } from "node:crypto";
import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";

import { db } from "./db/db.js";

/**
 * Better Auth server instance.
 *
 * - Runs inside this Fastify process; exposes /api/auth/* endpoints.
 * - Persists users/sessions/accounts in the local Postgres via the
 *   shared pg Pool (tables created by infra/postgres/init/002_auth.sql).
 * - Email+password: the password is scrypt-hashed into "account"."password".
 */
export const auth = betterAuth({
  database: db,
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-insecure-secret-change-me",
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  // Dev/MVP: reflect the request origin (matches CORS `origin: true`) so the
  // app keeps working from LAN IPs on phones. Tighten to an allowlist in prod.
  // "ragchatbot://" is the Expo app scheme used by the expo plugin.
  trustedOrigins: (request) => {
    const origin = request?.headers.get("origin");
    return origin ? ["ragchatbot://", origin] : ["ragchatbot://"];
  },
  plugins: [expo()],
  advanced: {
    database: {
      // Keep ids as UUIDs so they are compatible with the existing
      // UUID user_id columns on documents/chunks/conversations/messages.
      generateId: () => randomUUID(),
    },
  },
});
