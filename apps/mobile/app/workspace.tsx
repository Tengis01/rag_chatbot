import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Menu, Sparkles, FileText, Send, X, Plus } from "lucide-react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { runOnJS, useSharedValue } from "react-native-reanimated";
import { api } from "../lib/api";
import { MessageBubble } from "../components/MessageBubble";
import { Composer } from "../components/Composer";
import { DocumentPicker } from "../components/DocumentPicker";
import { Sidebar } from "../components/Sidebar";
import { UploadModal } from "../components/UploadModal";
import type { ChatMessage, DocumentItem, RawSourceChunk, SourceChunk } from "../types";

export default function WorkspaceScreen() {
  // Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Conversation & Message State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [isSending, setIsSending] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Documents selection
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [uploadVisible, setUploadVisible] = useState(false);

  // Greeting Ask Bar Input State
  const [greetingText, setGreetingText] = useState("");

  const scrollRef = useRef<ScrollView>(null);

  const fetchDocuments = (selectReady = false) => {
    setDocumentsLoading(true);
    api
      .listDocuments()
      .then((res) => {
        const docs = Array.isArray(res?.documents) ? res.documents : [];
        setDocuments(docs);
        if (selectReady) {
          // Default select ready documents
          setSelectedIds(docs.filter((d) => d.status === "ready").map((d) => d.id));
        }
      })
      .catch((err) => console.error("Error fetching documents:", err))
      .finally(() => setDocumentsLoading(false));
  };

  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments(true);
  }, []);

  // Poll processing documents until they become ready/failed (mirrors web workspace)
  useEffect(() => {
    const hasPending = documents.some(
      (d) => d.status === "pending" || d.status === "processing"
    );
    if (!hasPending) return;

    const interval = setInterval(() => {
      documents.forEach((doc) => {
        if (doc.status !== "pending" && doc.status !== "processing") return;
        api
          .getDocumentStatus(doc.id)
          .then((res) => {
            if (res.status === doc.status) return;
            setDocuments((prev) =>
              prev.map((d) => (d.id === doc.id ? { ...d, status: res.status } : d))
            );
            // Auto-select documents once they finish processing
            if (res.status === "ready") {
              setSelectedIds((prev) =>
                prev.includes(doc.id) ? prev : [...prev, doc.id]
              );
            }
          })
          .catch((err) => console.error(`Poll error for doc ${doc.id}:`, err));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [documents]);

  // Backend sources -> UI sources (resolve document titles, build previews)
  const mapSources = (sources?: RawSourceChunk[] | null): SourceChunk[] =>
    (Array.isArray(sources) ? sources : []).map((s) => ({
      chunkId: s.chunkId,
      documentId: s.documentId,
      documentTitle: documents.find((d) => d.id === s.documentId)?.title,
      preview: s.content ? s.content.slice(0, 160) : undefined,
      page: s.page,
      chunkIndex: s.chunkIndex,
      similarity: s.similarity,
    }));

  const handleOpenPicker = () => {
    setPickerVisible(true);
    fetchDocuments(false);
  };

  // Auto scroll to end on messages update
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Toggle document picker selection
  const toggleDoc = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // New documents start as "pending" — selection happens automatically
  // once polling sees them become "ready" (chat rejects non-ready docs).
  const handleDocumentAdded = (newDoc: DocumentItem) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  // Switch or load conversation from Sidebar
  const handleSelectConversation = async (id: string | undefined) => {
    setConversationId(id);
    if (!id) {
      // New Chat
      setMessages([]);
      setError(null);
      return;
    }

    setMessagesLoading(true);
    setError(null);
    try {
      const data = await api.listConversationMessages(id);
      const loaded: ChatMessage[] = (Array.isArray(data?.messages) ? data.messages : []).map(
        (msg) => ({
          ...msg,
          sources: mapSources(msg.sources),
        })
      );
      setMessages(loaded);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Send message handler
  async function handleSend(text: string) {
    if (!text.trim() || isSending) return;

    // Chat requires at least one ready document — guide the user to the picker
    if (selectedIds.length === 0) {
      setError("Эхлээд баримт бичиг сонгоно уу.");
      setPickerVisible(true);
      return;
    }
    setError(null);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      const res = await api.sendMessage({
        conversationId,
        documentIds: selectedIds,
        message: text,
      });
      setConversationId(res.conversationId);
      const assistantMsg: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: res.reply,
        sources: mapSources(res.sources),
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSending(false);
    }
  }

  // Handle empty state ask bar sending
  const handleGreetingSend = () => {
    const trimmed = greetingText.trim();
    if (!trimmed) return;
    handleSend(trimmed);
    setGreetingText("");
  };

  const startX = useSharedValue(0);

  // Swipe gesture to open sidebar (swiping right from left edge)
  const swipeGesture = Gesture.Pan()
    .onStart((event) => {
      "worklet";
      startX.value = event.x;
    })
    .onUpdate((event) => {
      "worklet";
      // Detect swipe right starting close to left edge (x < 40)
      if (startX.value < 40 && event.translationX > 50) {
        runOnJS(setSidebarOpen)(true);
      }
    });

  const hasMessages = messages.length > 0;

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={{ flex: 1, backgroundColor: "#09090b" }}>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeConversationId={conversationId}
          onSelectConversation={handleSelectConversation}
        />

        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: "#09090b" }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-border px-5 pb-4 pt-16 bg-background">
            <Pressable onPress={() => setSidebarOpen(true)} className="p-2 -ml-2">
              <Menu size={22} color="#fafafa" />
            </Pressable>

            <View className="flex-row items-center gap-2">
              <View className="h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Sparkles size={14} color="#fafafa" strokeWidth={2} />
              </View>
              <Text className="text-base font-bold text-foreground tracking-tight">RAG</Text>
            </View>

            {/* Placeholder to balance the header layout */}
            <View className="w-8 h-8" />
          </View>

          {/* Loading conversation messages */}
          {messagesLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#7c2bca" />
              <Text className="mt-3 text-sm text-muted-foreground">
                Чат ачааллаж байна...
              </Text>
            </View>
          ) : !hasMessages ? (
            /* Empty/Greeting State */
            <ScrollView
              className="flex-1 px-6"
              contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
              keyboardShouldPersistTaps="handled"
            >
              <View className="items-center justify-center pb-20">
                {/* Logo Mark */}
                <View className="mb-6 items-center justify-center rounded-3xl bg-primary/10 p-6 shadow-glow">
                  <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary">
                    <Sparkles size={32} color="#fafafa" strokeWidth={1.5} />
                  </View>
                </View>

                {/* Greeting text */}
                <Text className="text-2xl font-bold text-foreground text-center">
                  Сайн байна уу
                </Text>
                <Text className="mt-2 text-sm text-muted-foreground text-center">
                  Баримтуудтайгаа холбогдож асуулт асуугаарай.
                </Text>

                {/* Large Ask Bar */}
                <View className="w-full rounded-2xl bg-card border border-border p-4 mt-8">
                  <View className="flex-row items-center gap-2">
                    <TextInput
                      className="flex-1 text-sm text-foreground py-2"
                      placeholder="Баримт бичигтэйгээ чатлах..."
                      placeholderTextColor="#a1a1aa"
                      value={greetingText}
                      onChangeText={setGreetingText}
                      onSubmitEditing={handleGreetingSend}
                      returnKeyType="send"
                      multiline={false}
                    />
                  </View>

                  <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-border/40">
                    {/* Document Selector Pill */}
                    <Pressable
                      onPress={handleOpenPicker}
                      className="flex-row items-center gap-2 bg-muted rounded-full px-3 py-1.5"
                    >
                      <FileText size={14} color="#ceb3f6" />
                      <Text className="text-xs text-muted-foreground font-medium">
                        {selectedIds.length === 0
                          ? "Баримт бичиг сонгох"
                          : `${selectedIds.length} баримт сонгосон`}
                      </Text>
                    </Pressable>

                    {/* Send Button */}
                    <Pressable
                      onPress={handleGreetingSend}
                      disabled={!greetingText.trim()}
                      className={`h-9 w-9 items-center justify-center rounded-full ${
                        !greetingText.trim() ? "bg-muted opacity-50" : "bg-primary"
                      }`}
                    >
                      <Send size={14} color="#fafafa" />
                    </Pressable>
                  </View>
                </View>
              </View>
            </ScrollView>
          ) : (
            /* Active Chat Thread State */
            <View className="flex-1">
              <ScrollView
                ref={scrollRef}
                className="flex-1 px-4 py-4"
                keyboardShouldPersistTaps="handled"
              >
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}

                {isSending && (
                  <View className="mb-4 max-w-[80%] rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3">
                    <Text className="text-sm text-muted-foreground">Түр хүлээнэ үү...</Text>
                  </View>
                )}

                {error && (
                  <View className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3">
                    <Text className="text-sm text-red-400">{error}</Text>
                    <Pressable onPress={() => setError(null)} className="mt-1">
                      <Text className="text-xs text-primary-light">Dismiss</Text>
                    </Pressable>
                  </View>
                )}
              </ScrollView>

              {/* Composer */}
              <Composer onSend={handleSend} onOpenPicker={handleOpenPicker} disabled={isSending} />
            </View>
          )}

          {/* Document Picker Modal */}
          <Modal
            visible={pickerVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setPickerVisible(false)}
          >
            <View className="flex-1 justify-end bg-black/60">
              <View className="bg-card border-t border-border rounded-t-3xl p-6" style={{ maxHeight: "80%" }}>
                <View className="flex-row items-center justify-between border-b border-border pb-4 mb-4">
                  <View className="flex-row items-center gap-3">
                    <Text className="text-lg font-bold text-foreground">Баримт бичиг сонгох</Text>
                    <Pressable
                      onPress={() => {
                        setPickerVisible(false);
                        setUploadVisible(true);
                      }}
                      className="p-1.5 rounded-lg bg-primary/20"
                    >
                      <Plus size={16} color="#ceb3f6" />
                    </Pressable>
                  </View>
                  <Pressable onPress={() => setPickerVisible(false)} className="p-2 rounded-lg bg-muted">
                    <X size={16} color="#a1a1aa" />
                  </Pressable>
                </View>

                <ScrollView className="mb-6" showsVerticalScrollIndicator={false}>
                  <DocumentPicker
                    documents={documents}
                    selectedIds={selectedIds}
                    onToggle={toggleDoc}
                    loading={documentsLoading}
                    onAddPress={() => {
                      setPickerVisible(false);
                      setUploadVisible(true);
                    }}
                  />
                </ScrollView>

                <Pressable
                  onPress={() => setPickerVisible(false)}
                  className="items-center justify-center rounded-2xl bg-primary py-4 shadow-glow"
                >
                  <Text className="text-base font-semibold text-white">Дуусгах</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          {/* Document Upload / Paste Modal */}
          <UploadModal
            visible={uploadVisible}
            onClose={() => {
              setUploadVisible(false);
              setPickerVisible(true);
            }}
            onDocumentAdded={(newDoc) => {
              handleDocumentAdded(newDoc);
              setUploadVisible(false);
              setPickerVisible(true);
            }}
          />
        </KeyboardAvoidingView>
      </View>
    </GestureDetector>
  );
}