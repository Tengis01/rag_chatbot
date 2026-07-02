import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, LogIn, UserPlus, Loader2 } from "lucide-react";

import { signIn, signUp } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

export function LoginPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === "signup";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    try {
      const result = isSignup
        ? await signUp.email({ name: name.trim() || email.trim(), email: email.trim(), password })
        : await signIn.email({ email: email.trim(), password });

      if (result.error) {
        setError(result.error.message ?? "Алдаа гарлаа. Дахин оролдоно уу.");
        return;
      }

      navigate("/workspace");
    } catch {
      setError("Сервертэй холбогдож чадсангүй.");
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  return (
    <div className="grid-bg flex min-h-screen items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-strong shadow-elevated w-full max-w-md rounded-[28px] p-8"
      >
        {/* Logo */}
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <div className="bg-gradient-primary shadow-glow flex h-10 w-10 items-center justify-center rounded-xl">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">RAG Чатбот</span>
        </Link>

        {/* Mode tabs */}
        <div className="mb-6 flex rounded-xl border border-border/50 bg-secondary/30 p-1">
          {(
            [
              { key: "signin", label: "Нэвтрэх" },
              { key: "signup", label: "Бүртгүүлэх" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => switchMode(tab.key)}
              className={cn(
                "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                mode === tab.key
                  ? "bg-primary/15 text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Нэр
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Таны нэр"
                className="w-full rounded-xl border border-border/50 bg-secondary/40 px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-primary/40 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Имэйл
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-xl border border-border/50 bg-secondary/40 px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-primary/40 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Нууц үг
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignup ? "Дор хаяж 8 тэмдэгт" : "Нууц үг"}
              className="w-full rounded-xl border border-border/50 bg-secondary/40 px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-primary/40 focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-xs text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-gradient-primary shadow-glow flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSignup ? (
              <UserPlus className="h-4 w-4" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {isSignup ? "Бүртгүүлэх" : "Нэвтрэх"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {isSignup ? "Бүртгэлтэй юу? " : "Бүртгэлгүй юу? "}
          <button
            type="button"
            onClick={() => switchMode(isSignup ? "signin" : "signup")}
            className="text-primary-glow hover:underline"
          >
            {isSignup ? "Нэвтрэх" : "Бүртгүүлэх"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
