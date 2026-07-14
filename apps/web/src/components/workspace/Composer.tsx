import { useEffect, useState } from "react";
import { Send, Plus, Shuffle, SlidersHorizontal } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface RetrievalSettings {
  threshold: number;
  lambda: number;
}

interface ComposerProps {
  onSend: (text: string) => void;
  onPlusClick?: () => void;
  disabled?: boolean;
  /** MMR rerank toggle (Priority 8) — user-facing label avoids the "MMR" jargon. */
  useMMR?: boolean;
  onToggleMMR?: () => void;
  /** Power-user retrieval controls (Priority 9). */
  retrieval?: RetrievalSettings;
  onRetrievalChange?: (next: RetrievalSettings) => void;
}

// Cycled placeholder phrases (design.md §6.2 typewriter spec)
const PLACEHOLDER_PHRASES = [
  "Жишээ: энэ баримтын гол санаа юу вэ?",
  "Жишээ: хамгийн чухал ойлголтуудыг жагсаа",
  "Баримтаасаа юу ч асуугаарай…",
];
const TYPE_MS = 70;
const DELETE_MS = 30;
const PAUSE_MS = 1200;

function useTypewriter(phrases: string[], active: boolean): string {
  const [text, setText] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!active) return;
    const phrase = phrases[phraseIdx % phrases.length];

    let delay = deleting ? DELETE_MS : TYPE_MS;
    if (!deleting && text === phrase) delay = PAUSE_MS;

    const timer = setTimeout(() => {
      if (!deleting) {
        if (text === phrase) {
          setDeleting(true);
        } else {
          setText(phrase.slice(0, text.length + 1));
        }
      } else {
        if (text === "") {
          setDeleting(false);
          setPhraseIdx((i) => i + 1);
        } else {
          setText(phrase.slice(0, text.length - 1));
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [text, deleting, phraseIdx, phrases, active]);

  return active ? text : phrases[0];
}

export function Composer({
  onSend,
  onPlusClick,
  disabled = false,
  useMMR = true,
  onToggleMMR,
  retrieval,
  onRetrievalChange,
}: ComposerProps) {
  const [text, setText] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const canSend = !disabled && text.trim().length > 0;
  const placeholder = useTypewriter(PLACEHOLDER_PHRASES, text.length === 0);

  const submit = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="relative">
      {/* Retrieval settings popover (Priority 9) */}
      <AnimatePresence>
        {showSettings && retrieval && onRetrievalChange && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShowSettings(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="glass-strong absolute bottom-full right-0 z-40 mb-2 w-72 rounded-xl border border-border/60 p-4 shadow-elevated"
            >
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-foreground">
                Хайлтын нарийвчлал
              </p>

              <label className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Хамаарлын босго</span>
                <span className="font-semibold text-primary-glow">
                  {retrieval.threshold.toFixed(2)}
                </span>
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={retrieval.threshold}
                onChange={(e) =>
                  onRetrievalChange({ ...retrieval, threshold: Number(e.target.value) })
                }
                className="mb-3 w-full accent-[hsl(217_91%_60%)]"
              />

              <label className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Олон талт байдал (λ)</span>
                <span className="font-semibold text-primary-glow">
                  {retrieval.lambda.toFixed(2)}
                </span>
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={retrieval.lambda}
                onChange={(e) =>
                  onRetrievalChange({ ...retrieval, lambda: Number(e.target.value) })
                }
                className="mb-2 w-full accent-[hsl(217_91%_60%)]"
              />

              <p className="text-[10px] leading-relaxed text-muted-foreground/70">
                Босго өндөр байх тусам зөвхөн ойр хамааралтай хэсгүүд сонгогдоно.
                Анхдагч утгууд кросс-хэл хайлтад тохируулагдсан.
              </p>
              <button
                onClick={() => onRetrievalChange({ threshold: 0.1, lambda: 0.5 })}
                className="mt-2 text-[10px] text-primary-glow hover:underline"
              >
                Анхдагч утга сэргээх
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="glass flex items-center gap-2 rounded-full px-4 py-2 transition-colors focus-within:border-primary/40">
        {onPlusClick && (
          <button
            onClick={onPlusClick}
            disabled={disabled}
            title="Баримт эсвэл текст оруулах"
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Plus className="h-4.5 w-4.5" />
          </button>
        )}

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "flex-1 bg-transparent text-sm placeholder:text-muted-foreground/60",
            "focus:outline-none disabled:opacity-50",
          )}
        />

        {/* MMR toggle (Priority 8) */}
        {onToggleMMR && (
          <button
            onClick={onToggleMMR}
            disabled={disabled}
            title={
              useMMR
                ? "Олон талт хариу: асаалттай — өөр өөр хэсгүүдээс хариулна"
                : "Олон талт хариу: унтраалттай — зөвхөн хамгийн ойр хэсгүүдээс хариулна"
            }
            className={cn(
              "flex flex-shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-all duration-150",
              useMMR
                ? "border-primary/40 bg-primary/15 text-primary-glow"
                : "border-border/50 bg-secondary/30 text-muted-foreground hover:text-foreground",
            )}
          >
            <Shuffle className="h-3 w-3" />
            <span className="hidden sm:inline">Олон талт хариу</span>
          </button>
        )}

        {/* Retrieval settings (Priority 9) */}
        {retrieval && onRetrievalChange && (
          <button
            onClick={() => setShowSettings((v) => !v)}
            disabled={disabled}
            title="Хайлтын нарийвчлалын тохиргоо"
            className={cn(
              "rounded-full p-1.5 transition-colors",
              showSettings
                ? "bg-primary/15 text-primary-glow"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        )}

        {/* Send button — shows pulsing dots while in-flight */}
        <button
          onClick={submit}
          disabled={!canSend}
          aria-label={disabled ? "Илгээж байна…" : "Мессеж илгээх"}
          className={cn(
            "bg-gradient-primary shadow-glow flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
            "text-primary-foreground transition-all hover:scale-105",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
        >
          {disabled ? (
            <span className="flex gap-0.5">
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-foreground"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-foreground"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-foreground"
                style={{ animationDelay: "300ms" }}
              />
            </span>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
