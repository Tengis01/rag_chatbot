import { createAuthClient } from "better-auth/react";

// Better Auth клиент — API дээрх /api/auth/* endpoint-үүдтэй ярилцана.
// Session нь httpOnly cookie-гоор хадгалагдана (credentials: include).
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  `http://${window.location.hostname}:4000`;

export const authClient = createAuthClient({
  baseURL: API_BASE,
});

export const { signIn, signUp, signOut, useSession } = authClient;
