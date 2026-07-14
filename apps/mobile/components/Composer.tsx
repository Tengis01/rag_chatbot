import { useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  Text,
  ActivityIndicator,
  Modal,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Plus, Shuffle, SlidersHorizontal } from "lucide-react-native";

export interface RetrievalSettings {
  threshold: number;
  lambda: number;
}

interface Props {
  onSend: (text: string) => void;
  onOpenPicker?: () => void;
  disabled?: boolean;
  /** MMR rerank toggle — "Олон талт хариу" (same standard as the web composer). */
  useMMR?: boolean;
  onToggleMMR?: () => void;
  /** Power-user retrieval controls (threshold + lambda, mirrors web). */
  retrieval?: RetrievalSettings;
  onRetrievalChange?: (next: RetrievalSettings) => void;
}

/** Slider emits float noise (0.15000000002) — snap to the 0.05 step grid. */
const snap = (v: number) => Math.round(v * 20) / 20;

export function Composer({
  onSend,
  onOpenPicker,
  disabled,
  useMMR,
  onToggleMMR,
  retrieval,
  onRetrievalChange,
}: Props) {
  const [text, setText] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  }

  return (
    <View className="flex-row items-center gap-2 border-t border-border bg-background px-3 py-3">
      {onOpenPicker && (
        <Pressable
          onPress={onOpenPicker}
          className="h-10 w-10 items-center justify-center rounded-full bg-muted/40"
        >
          <Plus size={18} color="#a1a1aa" />
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

      {/* MMR toggle — right of the input, same as web */}
      {onToggleMMR && (
        <Pressable
          onPress={onToggleMMR}
          accessibilityLabel="Олон талт хариу"
          accessibilityState={{ selected: !!useMMR }}
          className={`flex-row items-center gap-1 rounded-full border px-2 py-1.5 ${
            useMMR ? "border-primary/50 bg-primary/20" : "border-border/50 bg-muted/40"
          }`}
        >
          <Shuffle size={12} color={useMMR ? "#ceb3f6" : "#a1a1aa"} />
          <Text
            style={{ fontSize: 9, maxWidth: 52 }}
            numberOfLines={2}
            className={useMMR ? "text-primary-light font-medium" : "text-muted-foreground"}
          >
            Олон талт хариу
          </Text>
        </Pressable>
      )}

      {/* Retrieval settings — right of the MMR pill, same as web */}
      {retrieval && onRetrievalChange && (
        <Pressable
          onPress={() => setShowSettings(true)}
          accessibilityLabel="Хайлтын нарийвчлалын тохиргоо"
          className={`h-10 w-10 items-center justify-center rounded-full ${
            showSettings ? "bg-primary/20" : "bg-muted/40"
          }`}
        >
          <SlidersHorizontal size={16} color={showSettings ? "#ceb3f6" : "#a1a1aa"} />
        </Pressable>
      )}

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

      {/* Retrieval settings popover (threshold + lambda, mirrors web Composer) */}
      {retrieval && onRetrievalChange && (
        <Modal
          visible={showSettings}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSettings(false)}
        >
          <Pressable
            className="flex-1 justify-end bg-black/40"
            onPress={() => setShowSettings(false)}
          >
            <Pressable
              onPress={() => {}}
              className="self-end mr-3 mb-20 w-72 rounded-2xl border border-border bg-card p-4"
            >
              <Text className="mb-3 text-[10px] font-bold uppercase tracking-wider text-foreground">
                Хайлтын нарийвчлал
              </Text>

              <View className="mb-1 flex-row items-center justify-between">
                <Text className="text-xs text-muted-foreground">Хамаарлын босго</Text>
                <Text className="text-xs font-semibold text-primary-light">
                  {retrieval.threshold.toFixed(2)}
                </Text>
              </View>
              <Slider
                minimumValue={0}
                maximumValue={1}
                step={0.05}
                value={retrieval.threshold}
                onValueChange={(v) =>
                  onRetrievalChange({ ...retrieval, threshold: snap(v) })
                }
                minimumTrackTintColor="#7c2bca"
                maximumTrackTintColor="#3f3f46"
                thumbTintColor="#9c69ed"
                style={{ marginBottom: 12 }}
              />

              <View className="mb-1 flex-row items-center justify-between">
                <Text className="text-xs text-muted-foreground">Олон талт байдал (λ)</Text>
                <Text className="text-xs font-semibold text-primary-light">
                  {retrieval.lambda.toFixed(2)}
                </Text>
              </View>
              <Slider
                minimumValue={0}
                maximumValue={1}
                step={0.05}
                value={retrieval.lambda}
                onValueChange={(v) =>
                  onRetrievalChange({ ...retrieval, lambda: snap(v) })
                }
                minimumTrackTintColor="#7c2bca"
                maximumTrackTintColor="#3f3f46"
                thumbTintColor="#9c69ed"
                style={{ marginBottom: 8 }}
              />

              <Text className="text-[10px] leading-4 text-muted-foreground/70">
                Босго өндөр байх тусам зөвхөн ойр хамааралтай хэсгүүд сонгогдоно.
                Анхдагч утгууд кросс-хэл хайлтад тохируулагдсан.
              </Text>
              <Pressable
                onPress={() => onRetrievalChange({ threshold: 0.1, lambda: 0.5 })}
                className="mt-2"
              >
                <Text className="text-[10px] text-primary-light">Анхдагч утга сэргээх</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}
