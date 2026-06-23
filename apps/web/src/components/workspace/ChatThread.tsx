import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import type { ChatMessage } from "@/types";
import { MessageBubble } from "@/components/workspace/MessageBubble";

interface ChatThreadProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  followUps?: string[];
  onFollowUpClick?: (text: string) => void;
  /** Optional lookup for source chip labels */
  documentNames?: Record<string, string>;
}

export function ChatThread({
  messages,
  isLoading = false,
  followUps = [],
  onFollowUpClick,
  documentNames,
}: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="scrollbar-thin flex flex-1 flex-col gap-4 overflow-y-auto p-5">
      {/* Empty state */}
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Эхлэхийн тулд асуултаа бичнэ үү.
          </p>
        </div>
      )}

      {/* Messages */}
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} documentNames={documentNames} />
      ))}

      {/* Typing indicator */}
      {isLoading && (
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="bg-gradient-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-xl shadow-glow">
            <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          {/* Bubble with 3 dots */}
          <div className="glass flex items-center gap-1 rounded-2xl rounded-tl-md px-4 py-3">
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      )}

      {/* Follow-up suggestion pills */}
      {!isLoading && followUps.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {followUps.map((text) => (
            <button
              key={text}
              onClick={() => onFollowUpClick?.(text)}
              className="rounded-full border border-border/50 bg-secondary/30 px-3 py-1.5 text-xs text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:bg-primary/10 hover:text-foreground"
            >
              {text}
            </button>
          ))}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
