import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { getOnboardingComplete } from "../lib/storage";
import { authClient } from "../lib/auth-client";

export default function RootIndex() {
  useEffect(() => {
    async function resolveStartScreen() {
      try {
        const complete = await getOnboardingComplete();
        if (!complete) {
          router.replace("/onboarding" as any);
          return;
        }

        // Onboarding done — route based on Better Auth session
        const { data: session } = await authClient.getSession();
        if (session) {
          router.replace("/workspace");
        } else {
          router.replace("/login" as any);
        }
      } catch (err) {
        // If error, default to onboarding to be safe
        router.replace("/onboarding" as any);
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
