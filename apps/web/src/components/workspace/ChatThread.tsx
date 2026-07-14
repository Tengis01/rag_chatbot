import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FileText, Sparkles, UploadCloud } from "lucide-react";
import type { ChatMessage } from "@/types";
import { MessageBubble } from "@/components/workspace/MessageBubble";

interface ChatThreadProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  followUps?: string[];
  onFollowUpClick?: (text: string) => void;
  /** Optional lookup for source chip labels */
  documentNames?: Record<string, string>;
  /** Empty-state guidance: whether any document is ready, and the upload CTA */
  hasReadyDocuments?: boolean;
  onUploadClick?: () => void;
}

/** Skeleton bubbles shown while a conversation's history loads. */
export function ChatThreadSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden p-5">
      {[64, 40, 72].map((w, i) => (
        <div key={i} className={i % 2 === 0 ? "flex justify-end" : "flex items-start gap-3"}>
          {i % 2 !== 0 && (
            <div className="h-7 w-7 shrink-0 animate-pulse rounded-xl bg-secondary/60" />
          )}
          <div
            className="h-14 animate-pulse rounded-2xl bg-secondary/40"
            style={{ width: `${w}%`, animationDelay: `${i * 150}ms` }}
          />
        </div>
      ))}
    </div>
  );
}

export function ChatThread({
  messages,
  isLoading = false,
  followUps = [],
  onFollowUpClick,
  documentNames,
  hasReadyDocuments = true,
  onUploadClick,
}: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="scrollbar-thin flex flex-1 flex-col gap-4 overflow-y-auto p-5">
      {/* Empty state — guided card, not a blank panel */}
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass max-w-md rounded-3xl p-8 text-center shadow-card"
          >
            <div className="bg-gradient-primary shadow-glow mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl">
              {hasReadyDocuments ? (
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              ) : (
                <FileText className="h-5 w-5 text-primary-foreground" />
              )}
            </div>

            {hasReadyDocuments ? (
              <>
                <h3 className="text-base font-semibold tracking-tight">
                  Баримтаасаа асуугаарай
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  Асуулт бүрийн хариулт таны оруулсан баримтад үндэслэнэ —
                  эх сурвалжууд нь хажууд харагдана.
                </p>
                {followUps.length > 0 && (
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
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
              </>
            ) : (
              <>
                <h3 className="text-base font-semibold tracking-tight">
                  Эхлээд баримт оруулна уу
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  PDF файл эсвэл текст оруулсны дараа түүнтэйгээ чатлах боломжтой болно.
                </p>
                {onUploadClick && (
                  <button
                    onClick={onUploadClick}
                    className="bg-gradient-primary shadow-glow mx-auto mt-5 flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
                  >
                    <UploadCloud className="h-4 w-4" />
                    Баримт оруулах
                  </button>
                )}
              </>
            )}
          </motion.div>
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
