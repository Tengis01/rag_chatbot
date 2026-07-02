import type { FastifyReply, FastifyRequest } from "fastify";

import { auth } from "./auth.js";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

/** Convert Fastify's header object into a Fetch API Headers instance. */
export function toWebHeaders(req: FastifyRequest): Headers {
  const headers = new Headers();
  Object.entries(req.headers).forEach(([key, value]) => {
    if (value === undefined) return;
    headers.append(key, Array.isArray(value) ? value.join(",") : value.toString());
  });
  return headers;
}

/** Resolve the logged-in user from the request's session cookie, or null. */
export async function getSessionUser(req: FastifyRequest): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: toWebHeaders(req) });
  if (!session) return null;
  const { id, email, name } = session.user;
  return { id, email, name };
}

/**
 * Guard for protected routes. Sends 401 and returns null when there is
 * no valid session; handlers must `return` immediately in that case.
 */
export async function requireUser(
  req: FastifyRequest,
  reply: FastifyReply
): Promise<SessionUser | null> {
  const user = await getSessionUser(req);
  if (!user) {
    reply.status(401).send({ error: "Нэвтрээгүй байна" });
    return null;
  }
  return user;
}
