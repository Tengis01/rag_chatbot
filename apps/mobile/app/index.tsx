import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Text className="mb-2 text-3xl font-bold text-foreground">RAG Chatbot</Text>
      <Text className="mb-8 text-center text-base text-muted-foreground">
        Ask your documents. Get grounded answers.
      </Text>
      <Link
        href="/workspace"
        className="rounded-full bg-primary px-8 py-3 text-base font-semibold text-white"
      >
        Start Asking
      </Link>
    </View>
  );
}
