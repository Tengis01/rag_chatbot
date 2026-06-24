import { useEffect, useRef, useState } from "react";
import { Sparkles, MessageSquare, CheckCircle2, FileText, ChevronDown } from "lucide-react";
import { MOCK_CONVERSATIONS, MOCK_MESSAGES, MOCK_SOURCES, MOCK_FOLLOW_UPS } from "@/data/mock";

// The glass shell is always rendered at this pixel width.
// ResizeObserver scales it down to fit any viewport.
const DESIGN_WIDTH = 960;
// Chrome bar (~48 px) + content grid (560 px) = 608 px total glass height.
const GLASS_HEIGHT = 608;

// Static decorative workspace preview — aria-hidden, pointer-events-none
export function WorkspacePreview() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      if (!wrapperRef.current) return;
      const available = wrapperRef.current.clientWidth;
      setScale(Math.min(1, available / DESIGN_WIDTH));
    };

    update();

    const ro = new ResizeObserver(update);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  const scaledHeight = Math.round(GLASS_HEIGHT * scale);

  return (
    <section
      id="workspace-preview"
      aria-hidden="true"
      className="relative -mt-24 pb-32"
    >
      <div
        className="mx-auto max-w-7xl px-6"
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {/*
          Measure available width here.
          Height is forced to the scaled visual height so the section
          collapses correctly — CSS transform does not affect layout flow.
        */}
        <div
          ref={wrapperRef}
          style={{
            width: "100%",
            height: scaledHeight,
            overflow: "hidden",
            display: "flex",
            // Center on desktop when no scaling is needed
            justifyContent: scale >= 1 ? "center" : "flex-start",
          }}
        >
          {/* Inner scaler: always 960 px wide, scaled down to fit */}
          <div
            style={{
              width: DESIGN_WIDTH,
              flexShrink: 0,
              transformOrigin: "top left",
              transform: `scale(${scale})`,
            }}
          >
            {/* Outer glass shell */}
            <div className="glass-strong shadow-elevated overflow-hidden rounded-[28px]">
              {/* Window chrome */}
              <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
                  <span className="ml-2 text-xs text-muted-foreground">ажлын-талбар.rag</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-secondary/40 px-2.5 py-1 text-xs text-muted-foreground">
                  DB_SCHEMA.md
                  <ChevronDown className="h-3 w-3" />
                </div>
              </div>

              {/* Three-column content — always desktop layout */}
              <div className="grid h-[560px] grid-cols-12">
                {/* LEFT SIDEBAR */}
                <div className="col-span-3 flex flex-col gap-2 border-r border-border/40 p-3">
                  {/* New Chat */}
                  <button className="bg-gradient-primary shadow-glow flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-primary-foreground">
                    + Шинэ чат
                  </button>
                  {/* Search */}
                  <div className="relative">
                    <input
                      readOnly
                      placeholder="Чат хайх"
                      className="w-full rounded-lg border border-border/50 bg-secondary/40 py-2 pl-9 pr-3 text-xs placeholder:text-muted-foreground/70 focus:outline-none"
                    />
                  </div>
                  {/* Label */}
                  <p className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    Сүүлд ашигласан чатууд
                  </p>
                  {/* Conversation list */}
                  <div className="scrollbar-thin space-y-0.5 overflow-y-auto">
                    {MOCK_CONVERSATIONS.map((c, i) => (
                      <div
                        key={c.id}
                        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs ${
                          i === 1
                            ? "bg-primary/15 text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        <MessageSquare
                          className={`h-3.5 w-3.5 shrink-0 ${i === 1 ? "text-primary-glow" : ""}`}
                        />
                        <span className="truncate">{c.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CENTER PANEL */}
                <div className="col-span-6 flex flex-col">
                  {/* Header */}
                  <div className="border-b border-border/40 px-6 py-4">
                    <h2 className="text-base font-semibold tracking-tight">
                      Өгөгдлийн сангийн schema
                    </h2>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="flex items-center gap-1 rounded-full border border-border/50 bg-secondary/40 px-2.5 py-1 text-[10px] text-muted-foreground">
                        <FileText className="h-3 w-3 text-primary-glow" />
                        4 баримт сонгосон
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400/90">
                        <CheckCircle2 className="h-3 w-3" />
                        Бүх систем бэлэн
                      </span>
                    </div>
                  </div>

                  {/* Chat content */}
                  <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-6 py-6">
                    {MOCK_MESSAGES.map((msg) =>
                      msg.role === "user" ? (
                        <div key={msg.id} className="flex justify-end">
                          <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-primary/15 px-4 py-2.5 text-sm">
                            {msg.content}
                          </div>
                        </div>
                      ) : (
                        <div key={msg.id} className="flex gap-3">
                          <div className="bg-gradient-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-xl">
                            <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                          </div>
                          <div className="glass max-w-[80%] rounded-2xl rounded-tl-md px-4 py-2.5 text-sm leading-relaxed">
                            <p>{msg.content}</p>
                            {msg.sources && (
                              <div className="mt-2 flex flex-wrap gap-1.5 border-t border-border/40 pt-2">
                                {msg.sources.map((s) => (
                                  <span
                                    key={s.chunkId}
                                    className="rounded-md border border-border/50 bg-secondary/40 px-2 py-0.5 text-[10px] text-muted-foreground"
                                  >
                                    DB_SCHEMA.md
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ),
                    )}

                    {/* Follow-up chips */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {MOCK_FOLLOW_UPS.map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full border border-border/50 bg-secondary/30 px-3 py-1.5 text-xs text-muted-foreground"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Input bar */}
                  <div className="border-t border-border/40 p-4">
                    <div className="flex items-center gap-2 rounded-2xl border border-border/50 bg-secondary/40 px-4 py-3 focus-within:border-primary/40 focus-within:bg-secondary/60">
                      <input
                        readOnly
                        placeholder="Баримтынхаа талаар асуу…"
                        className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/60 focus:outline-none"
                      />
                      <button className="bg-gradient-primary flex h-8 w-8 items-center justify-center rounded-xl text-primary-foreground">
                        →
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDEBAR */}
                <div className="col-span-3 flex flex-col border-l border-border/40">
                  <div className="border-b border-border/40 px-4 py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                      Эх сурвалжууд
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {MOCK_SOURCES.length} хэсэг · дээд зэрэглэлийн хайлт
                    </p>
                  </div>
                  <div className="scrollbar-thin space-y-2 overflow-y-auto p-3">
                    {MOCK_SOURCES.map((src) => (
                      <div
                        key={src.chunkId}
                        className="rounded-xl border border-border/50 bg-secondary/30 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">
                            {src.chunkId === "src-1"
                              ? "DB_SCHEMA.md"
                              : src.chunkId === "src-2"
                                ? "MEMORY.md"
                                : "TASKS.md"}
                          </span>
                          <span className="text-[10px] font-semibold text-primary-glow">
                            {Math.round(src.similarity * 100)}%
                          </span>
                        </div>
                        <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="bg-gradient-primary h-full rounded-full"
                            style={{ width: `${Math.round(src.similarity * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
