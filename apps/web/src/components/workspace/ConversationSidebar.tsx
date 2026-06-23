import { useState } from "react";
import { MessageSquare, Plus, Search } from "lucide-react";
import type { Conversation } from "@/types";
import { cn } from "@/lib/utils";

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
}: ConversationSidebarProps) {
  const [query, setQuery] = useState("");

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="glass flex h-full flex-col">
      {/* New Chat button */}
      <div className="p-3 pb-2">
        <button
          onClick={onNew}
          className={cn(
            "bg-gradient-primary shadow-glow flex w-full items-center justify-center gap-2",
            "rounded-full px-4 py-2.5 text-sm font-medium text-primary-foreground",
            "transition-transform hover:scale-[1.02]",
          )}
        >
          <Plus className="h-4 w-4" />
          Шинэ чат
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Чат хайх"
            className={cn(
              "w-full rounded-lg border border-border/50 bg-muted py-2 pl-9 pr-3",
              "text-xs placeholder:text-muted-foreground/70",
              "focus:outline-none focus:ring-1 focus:ring-primary/40",
            )}
          />
        </div>
      </div>

      {/* Label */}
      <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Сүүлд ашигласан чатууд
      </p>

      {/* List */}
      <div className="scrollbar-thin flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
        {filtered.length === 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">
            {query ? "Илэрц олдсонгүй" : "Одоогоор чат байхгүй."}
          </p>
        )}
        {filtered.map((conv) => {
          const isActive = conv.id === activeId;
          return (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-all duration-150",
                isActive
                  ? "border-l-2 border-primary bg-primary/10 text-foreground"
                  : "border-l-2 border-transparent text-muted-foreground hover:bg-muted/50",
              )}
            >
              <MessageSquare
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  isActive ? "text-primary-glow" : "",
                )}
              />
              <span className="truncate">{conv.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
