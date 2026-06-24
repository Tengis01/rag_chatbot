import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function WorkspaceScreen() {
  return (
    <View className="flex-1 bg-background px-4 pt-16">
      <Link href="/" className="mb-6 text-sm text-primary-light">
        ← Back
      </Link>
      <Text className="mb-1 text-xl font-bold text-foreground">Workspace</Text>
      <Text className="text-sm text-muted-foreground">
        Chat UI — Phase 2-д холбогдоно
      </Text>
    </View>
  );
}
