import { View, Text } from "react-native";
import type { SourceChunk } from "../types";

export function SourceCard({ source }: { source: SourceChunk }) {
  const percent = Math.round(source.similarity * 100);

  return (
    <View className="mb-2 rounded-xl border border-border bg-card p-3">
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 text-sm font-medium text-foreground" numberOfLines={1}>
          {source.documentTitle}
        </Text>
        <Text className="ml-2 text-xs font-semibold text-primary-light">
          {percent}%
        </Text>
      </View>

      <View className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-muted">
        <View
          className="h-full bg-primary"
          style={{ width: `${percent}%` }}
        />
      </View>
    </View>
  );
}