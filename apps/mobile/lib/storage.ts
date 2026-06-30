import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "rag_chatbot:onboarding_complete";

export async function getOnboardingComplete(): Promise<boolean> {
  const value = await AsyncStorage.getItem(ONBOARDING_KEY);
  return value === "true";
}

export async function setOnboardingComplete(value: boolean): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, value ? "true" : "false");
}
