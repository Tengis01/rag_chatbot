import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import type { ChatMessage } from "../types";
import { SourceCard } from "./SourceCard";

interface Props {
  message: ChatMessage;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";
  const [showSources, setShowSources] = useState(false);
  const hasSources = (message.sources?.length ?? 0) > 0;

  return (
    <View className={`mb-4 ${isUser ? "items-end" : "items-start"}`}>
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "rounded-br-sm bg-primary"
            : "rounded-bl-sm border border-border bg-card"
        }`}
      >
        <Text
          className={`text-sm leading-relaxed ${
            isUser ? "text-white" : "text-foreground"
          }`}
        >
          {message.content}
        </Text>
      </View>

      {!isUser && hasSources && (
        <View className="mt-1 max-w-[80%]">
          <Pressable onPress={() => setShowSources((v) => !v)} className="py-1">
            <Text className="text-xs text-primary-light">
              {showSources
                ? "▲ Эх сурвалж нуух"
                : `▼ ${message.sources!.length} эх сурвалж`}
            </Text>
          </Pressable>

          {showSources && (
            <View className="mt-1 gap-1">
              {message.sources!.map((src, i) => (
                <SourceCard key={i} source={src} />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}