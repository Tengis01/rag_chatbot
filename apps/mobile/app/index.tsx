import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { getOnboardingComplete } from "../lib/storage";

export default function RootIndex() {
  useEffect(() => {
    async function checkOnboarding() {
      try {
        const complete = await getOnboardingComplete();
        if (complete) {
          router.replace("/workspace");
        } else {
          router.replace("/onboarding" as any);
        }
      } catch (err) {
        // If error, default to onboarding to be safe
        router.replace("/onboarding" as any);
      }
    }
    checkOnboarding();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color="#7c2bca" />
    </View>
  );
}