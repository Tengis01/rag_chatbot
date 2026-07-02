import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Plus, MessageSquare, X, LogOut } from "lucide-react-native";
import { api } from "../lib/api";
import { authClient } from "../lib/auth-client";
import type { Conversation } from "../types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeConversationId: string | undefined;
  onSelectConversation: (id: string | undefined) => void;
}

const DRAWER_WIDTH = 280;

export function Sidebar({
  isOpen,
  onClose,
  activeConversationId,
  onSelectConversation,
}: SidebarProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: session } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut();
    router.replace("/login" as any);
  };

  const translateX = useSharedValue(-DRAWER_WIDTH);
  const backdropOpacity = useSharedValue(0);

  // Sync animation with isOpen prop
  useEffect(() => {
    if (isOpen) {
      translateX.value = withSpring(0, { damping: 20, stiffness: 150 });
      backdropOpacity.value = withTiming(0.5, { duration: 250 });
      // Fetch conversations when drawer opens
      setLoading(true);
      api
        .listConversations()
        .then((res) => {
          setConversations(
            Array.isArray(res?.conversations) ? res.conversations : []
          );
        })
        .catch((err) => console.error("Error loading conversations:", err))
        .finally(() => setLoading(false));
    } else {
      translateX.value = withSpring(-DRAWER_WIDTH, { damping: 20, stiffness: 150 });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isOpen]);

  const closeDrawer = () => {
    onClose();
  };

  const handleSelect = (id: string | undefined) => {
    onSelectConversation(id);
    closeDrawer();
  };

  // Pan gesture to swipe left (close)
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      "worklet";
      if (event.translationX < 0) {
        translateX.value = event.translationX;
        backdropOpacity.value = 0.5 * (1 + event.translationX / DRAWER_WIDTH);
      }
    })
    .onEnd((event) => {
      "worklet";
      if (event.translationX < -80 || event.velocityX < -500) {
        translateX.value = withSpring(-DRAWER_WIDTH, { damping: 20 }, (finished) => {
          if (finished) {
            runOnJS(closeDrawer)();
          }
        });
      } else {
        translateX.value = withSpring(0, { damping: 20 });
        backdropOpacity.value = withTiming(0.5, { duration: 200 });
      }
    });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={[StyleSheet.absoluteFill, { zIndex: 50 }]}
      pointerEvents={isOpen ? "auto" : "none"}
    >
      {/* Backdrop */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          backdropStyle,
          { backgroundColor: "#000000" },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
      </Animated.View>

      {/* Drawer */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            drawerStyle,
            {
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: DRAWER_WIDTH,
              height,
            },
          ]}
          className="bg-card border-r border-border"
        >
          <View
            style={{
              paddingTop: Math.max(insets.top, 16),
              paddingBottom: Math.max(insets.bottom, 16),
            }}
            className="flex-1 px-4"
          >
            {/* Header / New Chat */}
            <View className="flex-row items-center justify-between pb-4">
              <Pressable
                onPress={() => handleSelect(undefined)}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3 px-4 shadow-glow"
              >
                <Plus size={16} color="#fafafa" strokeWidth={2.5} />
                <Text className="text-sm font-semibold text-white">Шинэ чат</Text>
              </Pressable>
              <Pressable onPress={closeDrawer} className="ml-2 p-2 rounded-lg bg-muted">
                <X size={16} color="#a1a1aa" />
              </Pressable>
            </View>

            {/* Label */}
            <Text className="mt-4 px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              СҮҮЛИЙН ЧАТУУД
            </Text>

            {/* Chat List */}
            {loading && conversations.length === 0 ? (
              <View className="mt-10 items-center justify-center">
                <ActivityIndicator size="small" color="#7c2bca" />
              </View>
            ) : (
              <ScrollView className="flex-1 mt-1" showsVerticalScrollIndicator={false}>
                {conversations.length === 0 ? (
                  <Text className="mt-8 text-center text-xs text-muted-foreground px-4">
                    Өмнөх чат олдсонгүй
                  </Text>
                ) : (
                  <View className="gap-1">
                    {conversations.map((chat) => {
                      const isActive = chat.id === activeConversationId;
                      return (
                        <Pressable
                          key={chat.id}
                          onPress={() => handleSelect(chat.id)}
                          className={`flex-row items-center gap-3 rounded-xl p-3.5 transition-all ${
                            isActive ? "bg-primary/20" : "bg-transparent active:bg-muted"
                          }`}
                        >
                          <MessageSquare
                            size={16}
                            color={isActive ? "#ceb3f6" : "#a1a1aa"}
                            strokeWidth={isActive ? 2.5 : 2}
                          />
                          <Text
                            className={`flex-1 text-sm truncate ${
                              isActive
                                ? "text-foreground font-semibold"
                                : "text-muted-foreground"
                            }`}
                            numberOfLines={1}
                          >
                            {chat.title || "Чат"}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </ScrollView>
            )}

            {/* User + Logout */}
            <View className="mt-3 border-t border-border pt-3">
              {session && (
                <Text
                  className="px-2 pb-2 text-xs text-muted-foreground"
                  numberOfLines={1}
                >
                  {session.user.email}
                </Text>
              )}
              <Pressable
                onPress={handleLogout}
                className="flex-row items-center gap-3 rounded-xl p-3.5 active:bg-muted"
              >
                <LogOut size={16} color="#a1a1aa" />
                <Text className="text-sm text-muted-foreground">Гарах</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
