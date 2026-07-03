import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

import { getApiBaseSync } from "./api-base";

// Better Auth Expo client.
// The session cookie returned by the API is persisted in the device's
// SecureStore (encrypted) and attached to authClient requests automatically.
// For our own fetches in lib/api.ts we attach it via authClient.getCookie().
//
// baseURL is fixed at construction, but the API address is only known after
// liveness probing (home/office/emulator — see api-base.ts). customFetchImpl
// rewrites the request origin to the currently resolved base at call time;
// app/index.tsx awaits resolveApiBase() before the first auth call.
export const authClient = createAuthClient({
  baseURL: getApiBaseSync(),
  plugins: [
    expoClient({
      scheme: "ragchatbot",
      storagePrefix: "ragchatbot",
      storage: SecureStore,
    }),
  ],
  fetchOptions: {
    customFetchImpl: async (input, init) => {
      const url = new URL(input.toString());
      const base = new URL(getApiBaseSync());
      url.protocol = base.protocol;
      url.host = base.host;
      return fetch(url.toString(), init);
    },
  },
});
