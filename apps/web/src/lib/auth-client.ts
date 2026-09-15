import { createAuthClient } from "better-auth/react";

// Better Auth клиент — API дээрх /api/auth/* endpoint-үүдтэй ярилцана.
// Session нь httpOnly cookie-гоор хадгалагдана (credentials: include).
import { API_BASE } from "./api-base";

export const authClient = createAuthClient({
  baseURL: API_BASE,
});

export const { signIn, signUp, signOut, useSession } = authClient;
