import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

// Better Auth Expo client.
// The session cookie returned by the API is persisted in the device's
// SecureStore (encrypted) and attached to authClient requests automatically.
// For our own fetches in lib/api.ts we attach it via authClient.getCookie().
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

export const authClient = createAuthClient({
  baseURL: API_BASE,
  plugins: [
    expoClient({
      scheme: "ragchatbot",
      storagePrefix: "ragchatbot",
      storage: SecureStore,
    }),
  ],
});
