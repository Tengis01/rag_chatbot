import { View, Text, Pressable, ActivityIndicator } from "react-native";
import type { DocumentItem } from "../types";

interface Props {
  documents: DocumentItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  loading: boolean;
  onAddPress?: () => void;
}

const STATUS_LABELS: Record<DocumentItem["status"], string> = {
  pending: "Хүлээгдэж байна",
  processing: "Боловсруулж байна",
  ready: "Бэлэн",
  failed: "Алдаа",
};

const STATUS_COLORS: Record<DocumentItem["status"], string> = {
  pending: "text-yellow-400",
  processing: "text-blue-400",
  ready: "text-emerald-400",
  failed: "text-red-400",
};

export function DocumentPicker({ documents = [], selectedIds, onToggle, loading, onAddPress }: Props) {
  if (loading) {
    return (
      <View className="mt-20 items-center justify-center">
        <ActivityIndicator size="large" color="#a78bfa" />
        <Text className="mt-3 text-sm text-muted-foreground">
          Баримт бичгүүдийг ачааллаж байна...
        </Text>
      </View>
    );
  }

  if (documents.length === 0) {
    return (
      <View className="mt-12 items-center justify-center px-6 gap-4">
        <Text className="text-center text-sm text-muted-foreground">
          Баримт бичиг олдсонгүй. PDF файл оруулах эсвэл текст нааж эхэлнэ үү.
        </Text>
        {onAddPress && (
          <Pressable
            onPress={onAddPress}
            className="flex-row items-center gap-2 bg-primary/20 border border-primary/30 rounded-xl px-4 py-2.5"
          >
            <Text className="text-sm font-semibold text-primary-light">Баримт нэмэх</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View className="gap-2">
      {documents.map((doc) => {
        const isSelected = selectedIds.includes(doc.id);
        const isReady = doc.status === "ready";

        return (
          <Pressable
            key={doc.id}
            onPress={() => isReady && onToggle(doc.id)}
            disabled={!isReady}
            className={`rounded-xl border p-4 ${
              isSelected
                ? "border-primary bg-primary/10"
                : "border-border bg-card"
            } ${!isReady ? "opacity-50" : ""}`}
          >
            <View className="flex-row items-center justify-between">
              <Text
                className="flex-1 text-sm font-medium text-foreground"
                numberOfLines={1}
              >
                {doc.title}
              </Text>

              {isSelected && (
                <View className="ml-2 h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Text className="text-xs font-bold text-white">✓</Text>
                </View>
              )}
            </View>

            <Text className={`mt-1 text-xs ${STATUS_COLORS[doc.status]}`}>
              {STATUS_LABELS[doc.status]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}