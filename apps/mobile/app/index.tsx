import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { getOnboardingComplete } from "../lib/storage";
import { authClient } from "../lib/auth-client";
import { resolveApiBase, withTimeout } from "../lib/api-base";

const SESSION_CHECK_TIMEOUT_MS = 5000;

export default function RootIndex() {
  useEffect(() => {
    async function resolveStartScreen() {
      // "Дахиж харуулахгүй" opt-out. Policy: it only suppresses onboarding
      // while a valid login session exists — once the login expires (or the
      // user signs out), onboarding shows again.
      const optedOut = await getOnboardingComplete().catch(() => false);

      try {
        // Probe home/office/emulator API addresses first (2s per candidate)
        await withTimeout(resolveApiBase(), SESSION_CHECK_TIMEOUT_MS);

        const { data: session } = await withTimeout(
          authClient.getSession(),
          SESSION_CHECK_TIMEOUT_MS
        );

        if (session) {
          router.replace(optedOut ? "/workspace" : ("/onboarding" as any));
        } else {
          // Session expired / signed out — the opt-out expired with it.
          router.replace("/onboarding" as any);
        }
      } catch {
        // API unreachable — session state unknown. Onboarding routes directly
        // to /login (never back through "/"), so this cannot boot-loop.
        router.replace(optedOut ? ("/login" as any) : ("/onboarding" as any));
      }
    }
    resolveStartScreen();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color="#7c2bca" />
    </View>
  );
}
