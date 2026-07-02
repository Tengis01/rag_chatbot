import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Sparkles, LogIn, UserPlus } from "lucide-react-native";
import { authClient } from "../lib/auth-client";

type Mode = "signin" | "signup";

export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === "signup";

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!email.trim() || !password) {
      setError("Имэйл болон нууц үгээ оруулна уу.");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const result = isSignup
        ? await authClient.signUp.email({
            name: name.trim() || email.trim(),
            email: email.trim(),
            password,
          })
        : await authClient.signIn.email({
            email: email.trim(),
            password,
          });

      if (result.error) {
        setError(result.error.message ?? "Алдаа гарлаа. Дахин оролдоно уу.");
        return;
      }

      router.replace("/workspace");
    } catch {
      setError("Сервертэй холбогдож чадсангүй.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#09090b" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View className="items-center mb-8">
          <View className="items-center justify-center rounded-3xl bg-primary/10 p-5">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary">
              <Sparkles size={28} color="#fafafa" strokeWidth={1.5} />
            </View>
          </View>
          <Text className="mt-4 text-2xl font-bold text-foreground">RAG Чатбот</Text>
          <Text className="mt-1 text-sm text-muted-foreground">
            {isSignup ? "Шинэ бүртгэл үүсгэх" : "Бүртгэлдээ нэвтрэх"}
          </Text>
        </View>

        {/* Mode tabs */}
        <View className="flex-row rounded-xl border border-border bg-card p-1 mb-6">
          <Pressable
            onPress={() => switchMode("signin")}
            className={`flex-1 items-center rounded-lg py-2.5 ${
              mode === "signin" ? "bg-primary/20" : ""
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                mode === "signin" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Нэвтрэх
            </Text>
          </Pressable>
          <Pressable
            onPress={() => switchMode("signup")}
            className={`flex-1 items-center rounded-lg py-2.5 ${
              mode === "signup" ? "bg-primary/20" : ""
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                mode === "signup" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Бүртгүүлэх
            </Text>
          </Pressable>
        </View>

        {/* Form */}
        <View className="gap-4">
          {isSignup && (
            <View>
              <Text className="mb-1.5 text-xs font-medium text-muted-foreground">Нэр</Text>
              <TextInput
                className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground"
                placeholder="Таны нэр"
                placeholderTextColor="#71717a"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View>
            <Text className="mb-1.5 text-xs font-medium text-muted-foreground">Имэйл</Text>
            <TextInput
              className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground"
              placeholder="name@example.com"
              placeholderTextColor="#71717a"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
            />
          </View>

          <View>
            <Text className="mb-1.5 text-xs font-medium text-muted-foreground">Нууц үг</Text>
            <TextInput
              className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground"
              placeholder={isSignup ? "Дор хаяж 8 тэмдэгт" : "Нууц үг"}
              placeholderTextColor="#71717a"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error && (
            <View className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3">
              <Text className="text-xs text-red-400">{error}</Text>
            </View>
          )}

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            className={`flex-row items-center justify-center gap-2 rounded-2xl bg-primary py-4 shadow-glow ${
              submitting ? "opacity-60" : ""
            }`}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : isSignup ? (
              <UserPlus size={16} color="#ffffff" />
            ) : (
              <LogIn size={16} color="#ffffff" />
            )}
            <Text className="text-base font-semibold text-white">
              {isSignup ? "Бүртгүүлэх" : "Нэвтрэх"}
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => switchMode(isSignup ? "signin" : "signup")}
          className="mt-6 items-center pb-10"
        >
          <Text className="text-xs text-muted-foreground">
            {isSignup ? "Бүртгэлтэй юу? " : "Бүртгэлгүй юу? "}
            <Text className="text-primary-light">
              {isSignup ? "Нэвтрэх" : "Бүртгүүлэх"}
            </Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
