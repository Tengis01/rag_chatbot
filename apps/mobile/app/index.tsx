import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { getOnboardingComplete } from "../lib/storage";
import { authClient } from "../lib/auth-client";
import { resolveApiBase } from "../lib/api-base";

const SESSION_CHECK_TIMEOUT_MS = 5000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
}

export default function RootIndex() {
  useEffect(() => {
    async function resolveStartScreen() {
      // 1. Onboarding gate — only ever shown while incomplete
      const complete = await getOnboardingComplete().catch(() => false);
      if (!complete) {
        router.replace("/onboarding" as any);
        return;
      }

      // 2. Onboarding done — decide login vs workspace from the session.
      //    ANY failure here (API unreachable, timeout, no session) lands on
      //    /login — NEVER back on /onboarding (that caused the boot loop).
      try {
        // Probe home/office/emulator API addresses first (2s per candidate)
        await withTimeout(resolveApiBase(), SESSION_CHECK_TIMEOUT_MS);

        const { data: session } = await withTimeout(
          authClient.getSession(),
          SESSION_CHECK_TIMEOUT_MS
        );
        router.replace(session ? "/workspace" : ("/login" as any));
      } catch {
        router.replace("/login" as any);
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
