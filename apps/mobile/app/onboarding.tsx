import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import PagerView from "react-native-pager-view";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sparkles, FileText, ShieldCheck, ArrowRight } from "lucide-react-native";
import { setOnboardingComplete } from "../lib/storage";

const COLORS = {
  bg: "#09090b",
  fg: "#fafafa",
  primary: "#7c2bca",
  primaryLight: "#9c69ed",
  muted: "#27272a",
  mutedFg: "#a1a1aa",
  card: "#0f0c14",
  border: "#3f3f46",
};

const slides = [
  {
    icon: Sparkles,
    title: "RAG Chatbot",
    subtitle: "Баримтаасаа асуу.",
    body: "PDF оруулах, текст хуулж наах, өөрийн мэдлэгийн сангаас эх сурвалжтай хариулт авах боломжтой.",
  },
  {
    icon: FileText,
    title: "PDF & Текст оруулах",
    subtitle: null,
    body: "PDF файл оруулах эсвэл текст хуулж наахад баримтыг автоматаар хэсэгчлэн задлаж, векторжуулж, индекс үүсгэнэ.",
  },
  {
    icon: ShieldCheck,
    title: "Эх сурвалжтай хариулт",
    subtitle: null,
    body: "Хариулт бүр ашигласан хэсэгтэйгээ холбогдох тул таамагласан, худал хариулт өгөх эрсдлийг хамгийн бага түвшинд байлгана.",
  },
  {
    icon: Sparkles,
    title: "Ярилцахад бэлэн үү?",
    subtitle: null,
    body: "Хэдхэн секундэд эхэлнэ. Илүү тохиргоо шаардахгүй. Зөвхөн таны баримтад тулгуурласан хариултыг аваарай.",
    isFinal: true,
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Shared scroll progress (0 → 3)
  const progress = useSharedValue(0);

  const handlePageScroll = (e: any) => {
    progress.value = e.nativeEvent.position + e.nativeEvent.offset;
  };

  const handlePageSelected = (e: any) => {
    setCurrentPage(e.nativeEvent.position);
  };

  const handleSkip = () => {
    pagerRef.current?.setPage(3);
  };

  const handleStart = async () => {
    await setOnboardingComplete(true);
    // Back through the root index: it routes to /login or /workspace
    // depending on whether a Better Auth session exists.
    router.replace("/");
  };

  return (
    <View style={[styles.root, { backgroundColor: COLORS.bg }]}>
      {/* Skip Button */}
      {currentPage < 3 && (
        <Pressable
          onPress={handleSkip}
          style={[styles.skipBtn, { top: Math.max(insets.top + 8, 20) }]}
        >
          <Text style={styles.skipText}>Алгасах</Text>
        </Pressable>
      )}

      {/* PagerView — MUST use style={{ flex: 1 }}, not className */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageScroll={handlePageScroll}
        onPageSelected={handlePageSelected}
      >
        {slides.map((slide, index) => {
          const Icon = slide.icon;
          return (
            <View
              key={index.toString()}
              style={[styles.slide, { backgroundColor: COLORS.bg }]}
            >
              {/* Icon badge */}
              <View style={styles.iconBadge}>
                <View style={[styles.iconBox, { backgroundColor: COLORS.primary }]}>
                  <Icon size={40} color={COLORS.fg} strokeWidth={1.5} />
                </View>
              </View>

              {/* Text content */}
              <Text style={[styles.title, { color: COLORS.fg }]}>{slide.title}</Text>

              {slide.subtitle && (
                <Text style={[styles.subtitle, { color: COLORS.primaryLight }]}>
                  {slide.subtitle}
                </Text>
              )}

              <Text style={[styles.body, { color: COLORS.mutedFg }]}>{slide.body}</Text>

              {/* Final slide CTA */}
              {slide.isFinal && (
                <View style={styles.ctaContainer}>
                  <Pressable
                    onPress={handleStart}
                    style={[styles.startBtn, { backgroundColor: COLORS.primary }]}
                  >
                    <Text style={styles.startBtnText}>Асууж эхлэх</Text>
                    <ArrowRight size={18} color="#ffffff" strokeWidth={2.5} />
                  </Pressable>

                  <Pressable
                    onPress={() => setDontShowAgain(!dontShowAgain)}
                    style={styles.checkboxRow}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: dontShowAgain ? COLORS.primary : COLORS.border,
                          backgroundColor: dontShowAgain ? COLORS.primary : COLORS.card,
                        },
                      ]}
                    >
                      {dontShowAgain && (
                        <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>✓</Text>
                      )}
                    </View>
                    <Text style={{ color: COLORS.mutedFg, fontSize: 14 }}>Дахиж харуулахгүй</Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}
      </PagerView>

      {/* Dot indicator */}
      <View
        style={[
          styles.dotsRow,
          { paddingBottom: Math.max(insets.bottom + 8, 24) },
        ]}
      >
        {slides.map((_, index) => {
          const isActive = currentPage === index;
          return (
            <View
              key={index}
              style={{
                height: 8,
                width: isActive ? 24 : 8,
                borderRadius: 4,
                backgroundColor: isActive ? COLORS.primary : COLORS.muted,
                marginHorizontal: 4,
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  skipBtn: {
    position: "absolute",
    right: 24,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: "#9c69ed",
    fontSize: 14,
    fontWeight: "500",
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  iconBadge: {
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: "rgba(124,43,202,0.1)",
    padding: 24,
  },
  iconBox: {
    height: 80,
    width: 80,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  title: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
  },
  body: {
    textAlign: "center",
    fontSize: 15,
    lineHeight: 24,
    marginTop: 12,
  },
  ctaContainer: {
    marginTop: 40,
    width: "100%",
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
  },
  startBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    gap: 8,
    paddingVertical: 8,
  },
  checkbox: {
    height: 20,
    width: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    borderWidth: 1,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 12,
  },
});
