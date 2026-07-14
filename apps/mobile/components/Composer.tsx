import { useState } from "react";
import { View, TextInput, Pressable, Text, ActivityIndicator } from "react-native";
import { Plus, Shuffle } from "lucide-react-native";

interface Props {
  onSend: (text: string) => void;
  onOpenPicker?: () => void;
  disabled?: boolean;
  /** MMR rerank toggle — "Олон талт хариу" (mirrors the web composer pill). */
  useMMR?: boolean;
  onToggleMMR?: () => void;
}

export function Composer({ onSend, onOpenPicker, disabled, useMMR, onToggleMMR }: Props) {
  const [text, setText] = useState("");

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  }

  return (
    <View className="flex-row items-center gap-2 border-t border-border bg-background px-4 py-3">
      {onOpenPicker && (
        <Pressable
          onPress={onOpenPicker}
          className="h-10 w-10 items-center justify-center rounded-full bg-muted/40"
        >
          <Plus size={18} color="#a1a1aa" />
        </Pressable>
      )}

      {onToggleMMR && (
        <Pressable
          onPress={onToggleMMR}
          accessibilityLabel="Олон талт хариу"
          accessibilityState={{ selected: !!useMMR }}
          className={`h-10 w-10 items-center justify-center rounded-full border ${
            useMMR ? "border-primary/50 bg-primary/20" : "border-transparent bg-muted/40"
          }`}
        >
          <Shuffle size={16} color={useMMR ? "#ceb3f6" : "#a1a1aa"} />
        </Pressable>
      )}

      <TextInput
        className="flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-sm text-foreground"
        placeholder="Ask anything..."
        placeholderTextColor="#a1a1aa"
        value={text}
        onChangeText={setText}
        onSubmitEditing={handleSend}
        returnKeyType="send"
        editable={!disabled}
        multiline={false}
      />

      <Pressable
        onPress={handleSend}
        disabled={disabled || !text.trim()}
        className={`h-10 w-10 items-center justify-center rounded-full ${
          disabled || !text.trim() ? "bg-muted" : "bg-primary"
        }`}
      >
        {disabled ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text className="text-sm font-bold text-white">↑</Text>
        )}
      </Pressable>
    </View>
  );
}
