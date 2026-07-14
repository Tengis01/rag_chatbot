import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  UploadCloud,
  XCircle,
  FolderOpen,
  RefreshCw,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { api } from "@/lib/api";
import { useConfig } from "@/context/ConfigContext";
import type { ChatMessage, Conversation, DocumentItem, SourceChunk } from "@/types";
import { cn } from "@/lib/utils";
import { WorkspaceTopBar } from "@/components/workspace/WorkspaceTopBar";
import { useToast } from "@/components/layout/ToastProvider";
import { ConversationSidebar } from "@/components/workspace/ConversationSidebar";
import { ChatThread, ChatThreadSkeleton } from "@/components/workspace/ChatThread";
import { Composer } from "@/components/workspace/Composer";
import { SourcesPanel } from "@/components/workspace/SourcesPanel";

// ---------------------------------------------------------------------------
// Helper: build a documentId → filename lookup map from the doc list
// ---------------------------------------------------------------------------
function buildNameMap(docs: DocumentItem[]): Record<string, string> {
  return Object.fromEntries(docs.map((d) => [d.id, d.filename]));
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Байт";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Байт", "КБ", "МБ", "ГБ"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

const DOCUMENT_STATUS_LABELS: Record<DocumentItem["status"], string> = {
  pending: "хүлээгдэж байна",
  processing: "боловсруулж байна",
  ready: "бэлэн",
  failed: "алдаатай",
};

const SOURCE_TYPE_LABELS: Record<DocumentItem["sourceType"], string> = {
  pdf: "PDF",
  text: "текст",
};

// Suggested starter questions shown in the empty chat state (design.md §6.2 chips)
const SUGGESTED_QUESTIONS = [
  "Энэ баримтын гол санааг нэгтгэн хэлнэ үү",
  "Хамгийн чухал 5 ойлголтыг жагсаана уу",
  "Энэ баримтад юуны тухай өгүүлдэг вэ?",
];

// ---------------------------------------------------------------------------
// Inline error banner appended into the thread instead of a global error bar
// ---------------------------------------------------------------------------
interface InlineErrorBannerProps {
  message: string;
  onRetry: () => void;
  onDismiss: () => void;
}
function InlineErrorBanner({ message, onRetry, onDismiss }: InlineErrorBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex items-center justify-between rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-red-400"
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>{message}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onRetry}
          className="rounded-lg border border-destructive/40 px-3 py-1 text-xs hover:bg-destructive/20 transition-colors"
        >
          Дахин оролдох
        </button>
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-300 transition-colors px-1"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}

export function WorkspacePage() {
  const config = useConfig();
  const { toast } = useToast();

  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showDocPopover, setShowDocPopover] = useState(false);

  // Import Modal States
  const [showImportModal, setShowImportModal] = useState(false);
  const [activeImportTab, setActiveImportTab] = useState<"file" | "text">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteText, setPasteText] = useState("");

  // Loading / status
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [pastingText, setPastingText] = useState(false);

  // Inline send-error state (rendered in the chat thread)
  const [sendError, setSendError] = useState<string | null>(null);
  const [lastSendParams, setLastSendParams] = useState<{ text: string; docIds: string[] } | null>(null);

  // Retrieval controls (Priority 8/9): MMR toggle + threshold/lambda sliders
  const [useMMR, setUseMMR] = useState(true);
  const [retrieval, setRetrieval] = useState({ threshold: 0.1, lambda: 0.5 });

  const [loadingConversations, setLoadingConversations] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------------------
  // Derived
  // -------------------------------------------------------------------------
  const documentNameMap = buildNameMap(documents);

  const latestAssistantSources: SourceChunk[] = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant" && messages[i].sources?.length) {
        return messages[i].sources!;
      }
    }
    return [];
  })();

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  // -------------------------------------------------------------------------
  // Effects
  // -------------------------------------------------------------------------
  useEffect(() => {
    void loadDocuments();
    void loadConversations();
  }, []);

  // Auto-select ready documents when they load/update
  useEffect(() => {
    const readyIds = documents.filter((d) => d.status === "ready").map((d) => d.id);
    setSelectedDocumentIds((prev) => {
      const next = [...prev];
      let changed = false;
      readyIds.forEach((id) => {
        if (!next.includes(id)) {
          next.push(id);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [documents]);

  useEffect(() => {
    if (activeConversationId) {
      void loadMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  // Document status polling
  useEffect(() => {
    const hasPending = documents.some(
      (d) => d.status === "pending" || d.status === "processing",
    );
    if (!hasPending) return;

    const interval = setInterval(() => {
      documents.forEach((doc) => {
        if (doc.status === "pending" || doc.status === "processing") {
          api
            .getDocumentStatus(doc.id)
            .then((res) => {
              if (res.status !== doc.status) {
                setDocuments((prev) =>
                  prev.map((d) =>
                    d.id === doc.id ? { ...d, status: res.status, errorMessage: res.errorMessage } : d,
                  ),
                );
              }
            })
            .catch((err: unknown) => {
              console.error(`Poll error for doc ${doc.id}:`, err);
            });
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [documents]);

  // -------------------------------------------------------------------------
  // Data loaders
  // -------------------------------------------------------------------------
  const loadDocuments = async () => {
    try {
      const data = await api.listDocuments();
      setDocuments(data);
      if (selectedDocumentIds.length === 0) {
        setSelectedDocumentIds(data.filter((d) => d.status === "ready").map((d) => d.id));
      }
    } catch (err: unknown) {
      console.error(err);
      toast("Баримтын жагсаалтыг ачаалж чадсангүй.", "error");
    }
  };

  const loadConversations = async () => {
    try {
      const res = await api.listConversations();
      setConversations(res.conversations);
    } catch (err: unknown) {
      console.error(err);
      toast("Чатын жагсаалтыг ачаалж чадсангүй.", "error");
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (convId: string) => {
    setLoadingMessages(true);
    setSendError(null);
    try {
      const res = await api.listConversationMessages(convId);
      setMessages(res.messages);
    } catch (err: unknown) {
      console.error(err);
      toast("Мессежийн түүхийг ачаалж чадсангүй.", "error");
    } finally {
      setLoadingMessages(false);
    }
  };

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setSendError(null);
  };

  const handleNewConversation = () => {
    setActiveConversationId(undefined);
    setMessages([]);
    setSendError(null);
  };

  const handleToggleDocument = (docId: string) => {
    setSelectedDocumentIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId],
    );
  };

  const handleFileIngest = async () => {
    if (!selectedFile) return;

    const maxSize = (config.maxUploadSizeMb ?? 20) * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast(`Файл ${config.maxUploadSizeMb ?? 20} MB хязгаараас хэтэрсэн байна.`, "error");
      return;
    }

    setUploadingFile(true);
    try {
      const res = await api.uploadDocument(selectedFile);
      const newDoc: DocumentItem = {
        id: res.documentId,
        filename: res.filename,
        sourceType: "pdf",
        status: res.status,
        createdAt: new Date().toISOString(),
      };
      setDocuments((prev) => [newDoc, ...prev]);
      setSelectedDocumentIds((prev) => [...prev, newDoc.id]);
      setShowImportModal(false);
      setSelectedFile(null);
      toast("Баримт хүлээн авлаа — боловсруулж эхэллээ.", "success");
    } catch (err: unknown) {
      console.error(err);
      toast(err instanceof Error ? err.message : "Файл оруулж чадсангүй.", "error");
    } finally {
      setUploadingFile(false);
    }
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteText.trim()) return;

    setPastingText(true);
    try {
      const title = pasteTitle.trim() || "Хуулсан текст";
      const res = await api.pasteDocument(title, pasteText.trim());
      const newDoc: DocumentItem = {
        id: res.documentId,
        filename: res.filename,
        sourceType: "text",
        status: res.status,
        createdAt: new Date().toISOString(),
      };
      setDocuments((prev) => [newDoc, ...prev]);
      setSelectedDocumentIds((prev) => [...prev, newDoc.id]);
      setShowImportModal(false);
      setPasteTitle("");
      setPasteText("");
      toast("Текст хүлээн авлаа — боловсруулж эхэллээ.", "success");
    } catch (err: unknown) {
      console.error(err);
      toast(err instanceof Error ? err.message : "Текст хадгалж чадсангүй.", "error");
    } finally {
      setPastingText(false);
    }
  };

  const doSend = async (text: string, docIds: string[]) => {
    // Optimistic user message
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);
    setSendError(null);
    setLastSendParams({ text, docIds });

    try {
      const res = await api.sendMessage({
        conversationId: activeConversationId,
        documentIds: docIds,
        message: text,
        useMMR,
        threshold: retrieval.threshold,
        lambda: retrieval.lambda,
      });

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: res.reply,
        sources: res.sources,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // If new conversation, set it as active and refresh the list
      if (!activeConversationId) {
        setActiveConversationId(res.conversationId);
        void loadConversations();
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Алдаа гарлаа.";
      setSendError(msg);
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = (text: string) => {
    if (isSending || !text.trim()) return;

    const readyDocIds = documents
      .filter((d) => selectedDocumentIds.includes(d.id) && d.status === "ready")
      .map((d) => d.id);

    if (readyDocIds.length === 0) {
      toast("Асуулт асуухаас өмнө дор хаяж нэг бэлэн баримт сонгоно уу.", "error");
      return;
    }

    void doSend(text, readyDocIds);
  };

  const handleRetry = () => {
    if (!lastSendParams) return;
    void doSend(lastSendParams.text, lastSendParams.docIds);
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="flex h-screen flex-col bg-background">
      <WorkspaceTopBar />

      <div className={cn(
        "grid flex-1 grid-cols-1 overflow-hidden transition-all duration-300",
        isSidebarCollapsed
          ? "lg:grid-cols-[48px_1fr_300px]"
          : "lg:grid-cols-[280px_1fr_300px]"
      )}>
        {/* Mobile Backdrop */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* LEFT — Conversation sidebar container */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-zinc-950 border-r border-border/40 overflow-hidden transition-all duration-300",
          "lg:static lg:bg-zinc-950/20 lg:translate-x-0 lg:z-auto",
          isMobileSidebarOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0",
          isSidebarCollapsed ? "lg:w-12 lg:items-center lg:py-4" : "lg:w-full"
        )}>
          {/* On desktop when collapsed: show only the single Open button */}
          <div className="hidden lg:block">
            {isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                title="Sidebar нээх"
                className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <PanelLeftOpen className="h-4.5 w-4.5" />
              </button>
            )}
          </div>

          {/* If NOT collapsed, or if we are on mobile (where isMobileSidebarOpen is true): show full content */}
          <div className={cn(
            "flex-1 flex-col overflow-hidden",
            isSidebarCollapsed ? "lg:hidden flex" : "flex"
          )}>
            {/* Sidebar Header with Close button */}
            <div className="flex items-center justify-between border-b border-border/40 p-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Чатууд
              </span>
              <button
                onClick={() => {
                  setIsSidebarCollapsed(true);
                  setIsMobileSidebarOpen(false);
                }}
                title="Sidebar хураах"
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <PanelLeftClose className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Conversation sidebar takes full height */}
            <div className="flex-1 overflow-hidden">
              <ConversationSidebar
                conversations={conversations}
                loading={loadingConversations}
                activeId={activeConversationId ?? ""}
                onSelect={(id) => {
                  handleSelectConversation(id);
                  setIsMobileSidebarOpen(false); // Close mobile drawer on selection
                }}
                onNew={() => {
                  handleNewConversation();
                  setIsMobileSidebarOpen(false); // Close mobile drawer on new conversation
                }}
              />
            </div>
          </div>
        </div>

        {/* CENTER — Chat area */}
        <div className="flex h-full flex-col overflow-hidden">
          {/* Chat header */}
          <div className="flex-shrink-0 border-b border-border/40 px-6 py-4">
            <div className="flex items-center gap-3">
              {/* Mobile Sidebar Toggle Button */}
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                title="Цэс нээх"
                className="rounded-xl border border-border/50 bg-secondary/40 p-2 text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>

              <h2 className="text-base font-semibold tracking-tight truncate max-w-[120px] sm:max-w-none">
                {activeConversation?.title ?? "Шинэ чат"}
              </h2>
              <div className="relative">
                <button
                  onClick={() => setShowDocPopover(!showDocPopover)}
                  className="flex items-center gap-1.5 rounded-full border border-border/50 bg-secondary/40 px-2.5 py-1 text-[10px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-150"
                >
                  <FolderOpen className="h-3 w-3 text-primary-glow" />
                  <span className="hidden sm:inline">{documents.length} баримт оруулсан</span>
                  <span className="sm:hidden">{documents.length} баримт</span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-primary-glow hidden sm:inline">{selectedDocumentIds.length} идэвхтэй</span>
                  <span className="text-primary-glow sm:hidden">{selectedDocumentIds.length} идэвхтэй</span>
                </button>

                {showDocPopover && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowDocPopover(false)}
                    />
                    <div className="glass-strong absolute left-0 mt-2 z-40 w-72 rounded-xl border border-border/60 p-3 shadow-elevated">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground">Оруулсан баримтууд</span>
                        <button
                          onClick={() => void loadDocuments()}
                          title="Төлөв шинэчлэх"
                          className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="scrollbar-thin max-h-60 space-y-1.5 overflow-y-auto pr-1">
                        {documents.length === 0 ? (
                          <p className="py-6 text-center text-xs text-muted-foreground">Одоогоор баримт оруулаагүй байна.</p>
                        ) : (
                          documents.map((doc) => {
                            const isSelected = selectedDocumentIds.includes(doc.id);
                            return (
                              <div
                                key={doc.id}
                                className={cn(
                                  "flex items-center gap-2 rounded-lg border p-2 transition-colors",
                                  isSelected ? "border-primary/30 bg-primary/5" : "border-transparent hover:bg-secondary/40"
                                )}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  disabled={doc.status !== "ready"}
                                  onChange={() => handleToggleDocument(doc.id)}
                                  className="h-3.5 w-3.5 cursor-pointer rounded border-border bg-background text-primary disabled:opacity-40"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="block truncate text-xs font-medium text-foreground">{doc.filename}</span>
                                    {doc.status === "pending" || doc.status === "processing" ? (
                                      <Loader2 className="h-3 w-3 shrink-0 animate-spin text-primary" />
                                    ) : doc.status === "ready" ? (
                                      <CheckCircle2 className="h-3 w-3 shrink-0 text-green-500" />
                                    ) : (
                                      <XCircle className="h-3 w-3 shrink-0 text-red-500" />
                                    )}
                                  </div>
                                  <span className="mt-0.5 block text-[9px] capitalize text-muted-foreground">
                                    {SOURCE_TYPE_LABELS[doc.sourceType]} · {DOCUMENT_STATUS_LABELS[doc.status]}
                                  </span>
                                  {doc.status === "failed" && doc.errorMessage && (
                                    <span
                                      className="mt-0.5 block truncate text-[9px] text-red-400"
                                      title={doc.errorMessage}
                                    >
                                      {doc.errorMessage}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Loading messages state */}
          {loadingMessages ? (
            <ChatThreadSkeleton />
          ) : (
            <ChatThread
              messages={messages}
              isLoading={isSending}
              documentNames={documentNameMap}
              followUps={SUGGESTED_QUESTIONS}
              onFollowUpClick={handleSend}
              hasReadyDocuments={documents.some((d) => d.status === "ready")}
              onUploadClick={() => {
                setSelectedFile(null);
                setActiveImportTab("file");
                setShowImportModal(true);
              }}
            />
          )}

          {/* Inline send error */}
          <AnimatePresence>
            {sendError && (
              <div className="px-5 pb-2">
                <InlineErrorBanner
                  message={sendError}
                  onRetry={handleRetry}
                  onDismiss={() => setSendError(null)}
                />
              </div>
            )}
          </AnimatePresence>

          {/* Composer — pinned at bottom */}
          <div className="flex-shrink-0 p-4">
            <Composer
              onSend={handleSend}
              onPlusClick={() => {
                setSelectedFile(null);
                setPasteTitle("");
                setPasteText("");
                setActiveImportTab("file");
                setShowImportModal(true);
              }}
              disabled={isSending}
              useMMR={useMMR}
              onToggleMMR={() => setUseMMR((v) => !v)}
              retrieval={retrieval}
              onRetrievalChange={setRetrieval}
            />
          </div>
        </div>

        {/* RIGHT — Sources panel */}
        <div className="hidden border-l border-border/40 lg:block">
          <SourcesPanel
            sources={latestAssistantSources}
            documentNames={documentNameMap}
          />
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Unified Import Modal                                               */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence>
        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-strong w-full max-w-xl rounded-2xl p-6 shadow-elevated"
            >
              <div className="mb-6 flex border-b border-border/40">
                <button
                  type="button"
                  onClick={() => setActiveImportTab("file")}
                  className={cn(
                    "pb-2.5 px-4 text-sm font-semibold border-b-2 transition-colors",
                    activeImportTab === "file"
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  Файл оруулах
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImportTab("text")}
                  className={cn(
                    "pb-2.5 px-4 text-sm font-semibold border-b-2 transition-colors",
                    activeImportTab === "text"
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  Текст хуулах
                </button>
              </div>

              {activeImportTab === "file" ? (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border/60 hover:border-primary/50 transition-colors rounded-xl p-8 text-center cursor-pointer bg-secondary/10"
                  >
                    <UploadCloud className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">PDF сонгох эсвэл энд чирж оруулна уу</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">PDF файл {config.maxUploadSizeMb ?? 20}MB хүртэл</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setSelectedFile(file);
                      }}
                      className="hidden"
                    />
                  </div>

                  {selectedFile && (() => {
                    const maxBytes = (config.maxUploadSizeMb ?? 20) * 1024 * 1024;
                    const percent = Math.min((selectedFile.size / maxBytes) * 100, 100);
                    const isOverLimit = selectedFile.size > maxBytes;
                    return (
                      <div className="rounded-xl border border-border/50 bg-secondary/20 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold truncate max-w-[70%]">{selectedFile.name}</span>
                          <span className="text-xs font-medium text-muted-foreground">{formatBytes(selectedFile.size)}</span>
                        </div>
                        <div className="relative h-2 w-full bg-secondary/60 rounded-full overflow-hidden mb-1">
                          <div
                            style={{ width: `${percent}%` }}
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              isOverLimit ? "bg-red-500" : "bg-primary-glow"
                            )}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>Хэмжээ: хязгаарын {percent.toFixed(0)}%</span>
                          <span>Дээд хэмжээ: {config.maxUploadSizeMb ?? 20} MB</span>
                        </div>
                        {isOverLimit && (
                          <p className="text-red-400 text-xs mt-2">Файл {config.maxUploadSizeMb ?? 20} MB хязгаараас хэтэрсэн байна.</p>
                        )}
                      </div>
                    );
                  })()}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowImportModal(false);
                        setSelectedFile(null);
                      }}
                      className="rounded-xl border border-border bg-secondary/20 px-4 py-2 text-xs font-semibold hover:bg-secondary/40"
                    >
                      Болих
                    </button>
                    <button
                      type="button"
                      onClick={handleFileIngest}
                      disabled={!selectedFile || uploadingFile || selectedFile.size > (config.maxUploadSizeMb ?? 20) * 1024 * 1024}
                      className="bg-gradient-primary shadow-glow flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      {uploadingFile && <Loader2 className="h-3 w-3 animate-spin" />}
                      Баримт боловсруулах
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePasteSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                      Баримтын гарчиг
                    </label>
                    <input
                      type="text"
                      value={pasteTitle}
                      onChange={(e) => setPasteTitle(e.target.value)}
                      placeholder="Жишээ: 2025 оны борлуулалтын тайлан"
                      className="w-full rounded-xl border border-border bg-secondary/20 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                      Агуулга (хамгийн багадаа 10 тэмдэгт)
                    </label>
                    <textarea
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      required
                      rows={6}
                      placeholder="Markdown, код, log эсвэл тайлангаа энд хуулж наана уу…"
                      className="scrollbar-thin w-full rounded-xl border border-border bg-secondary/20 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {(() => {
                    const maxChars = config.maxPasteLength ?? 500000;
                    const percent = Math.min((pasteText.length / maxChars) * 100, 100);
                    const isOverLimit = pasteText.length > maxChars;
                    return (
                      <div className="rounded-xl border border-border/50 bg-secondary/20 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold">Тэмдэгтийн тоо</span>
                          <span className="text-xs font-medium text-muted-foreground">{pasteText.length.toLocaleString()} тэмдэгт</span>
                        </div>
                        <div className="relative h-2 w-full bg-secondary/60 rounded-full overflow-hidden mb-1">
                          <div
                            style={{ width: `${percent}%` }}
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              isOverLimit ? "bg-red-500" : "bg-primary-glow"
                            )}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>Урт: хязгаарын {percent.toFixed(0)}%</span>
                          <span>Дээд хэмжээ: {maxChars.toLocaleString()} тэмдэгт</span>
                        </div>
                        {isOverLimit && (
                          <p className="text-red-400 text-xs mt-2">Агуулга {maxChars.toLocaleString()} тэмдэгтийн хязгаараас хэтэрсэн байна.</p>
                        )}
                      </div>
                    );
                  })()}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowImportModal(false);
                        setPasteTitle("");
                        setPasteText("");
                      }}
                      className="rounded-xl border border-border bg-secondary/20 px-4 py-2 text-xs font-semibold hover:bg-secondary/40"
                    >
                      Болих
                    </button>
                    <button
                      type="submit"
                      disabled={pastingText || pasteText.trim().length < 10 || pasteText.length > (config.maxPasteLength ?? 500000)}
                      className="bg-gradient-primary shadow-glow flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      {pastingText && <Loader2 className="h-3 w-3 animate-spin" />}
                      Текст боловсруулах
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
