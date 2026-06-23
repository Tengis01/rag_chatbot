import { useState } from "react";
import { Send, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComposerProps {
  onSend: (text: string) => void;
  onPlusClick?: () => void;
  disabled?: boolean;
}

export function Composer({ onSend, onPlusClick, disabled = false }: ComposerProps) {
  const [text, setText] = useState("");

  const canSend = !disabled && text.trim().length > 0;

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
    <div className="glass flex items-center gap-2 rounded-full px-4 py-2">
      {onPlusClick && (
        <button
          onClick={onPlusClick}
          disabled={disabled}
          title="Баримт эсвэл текст оруулах"
          className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
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
        placeholder="Жишээ: энэ баримтын гол санаа юу вэ?"
        className={cn(
          "flex-1 bg-transparent text-sm placeholder:text-muted-foreground/60",
          "focus:outline-none disabled:opacity-50",
        )}
      />

      {/* Send button — shows pulsing dot while in-flight */}
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
  );
}
