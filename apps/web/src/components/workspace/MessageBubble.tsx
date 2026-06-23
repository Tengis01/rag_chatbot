import { Sparkles, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: ChatMessage;
  /** Optional lookup: documentId → filename. Used to label source chips. */
  documentNames?: Record<string, string>;
}

export function MessageBubble({ message, documentNames }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [expandedChunks, setExpandedChunks] = useState<Record<string, boolean>>({});

  const toggleChunk = (chunkId: string) => {
    setExpandedChunks((prev) => ({ ...prev, [chunkId]: !prev[chunkId] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex items-start gap-3", isUser && "justify-end")}
    >
      {/* Avatar — only for assistant */}
      {!isUser && (
        <div className="bg-gradient-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-xl shadow-glow">
          <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
      )}

      <div className={cn("flex max-w-[80%] flex-col gap-1", isUser && "items-end")}>
        {/* Bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-primary/15 text-foreground rounded-tr-md"
              : "glass text-foreground rounded-tl-md",
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>

          {/* Source chips — assistant messages only */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-3 border-t border-border/40 pt-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Эх сурвалж ({message.sources.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {message.sources.map((src) => {
                  const name = documentNames?.[src.documentId] ?? src.documentId.slice(0, 8);
                  const isExpanded = !!expandedChunks[src.chunkId];
                  return (
                    <div key={src.chunkId} className="w-full">
                      <button
                        onClick={() => toggleChunk(src.chunkId)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-secondary/40",
                          "px-2 py-0.5 text-[10px] text-primary-glow transition-colors",
                          "hover:border-primary/40 hover:bg-secondary/60",
                        )}
                      >
                        <FileText className="h-3 w-3" />
                        <span className="max-w-[180px] truncate">{name}</span>
                        {src.page !== undefined && (
                          <span className="text-muted-foreground">· p.{src.page}</span>
                        )}
                        <span className="text-muted-foreground">
                          ({Math.round(src.similarity * 100)}%)
                        </span>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            key="snippet"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-1 overflow-hidden rounded-lg border border-border/40 bg-background/60 px-3 py-2 font-mono text-[11px] leading-relaxed text-muted-foreground"
                          >
                            {src.content}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
