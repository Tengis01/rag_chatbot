import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "error" | "success" | "info";

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  return useContext(ToastContext);
}

const KIND_STYLES: Record<ToastKind, { border: string; icon: React.ReactNode }> = {
  error: {
    border: "border-destructive/40",
    icon: <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />,
  },
  success: {
    border: "border-emerald-500/40",
    icon: <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />,
  },
  info: {
    border: "border-primary/40",
    icon: <Info className="h-4 w-4 shrink-0 text-primary-glow" />,
  },
};

const AUTO_DISMISS_MS = 5000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, kind: ToastKind = "info") => {
      const id = nextId.current++;
      setToasts((prev) => [...prev.slice(-3), { id, kind, message }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast stack — bottom-right */}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-80 flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "glass-strong pointer-events-auto flex items-start gap-2.5 rounded-xl border p-3 shadow-elevated",
                KIND_STYLES[t.kind].border,
              )}
            >
              {KIND_STYLES[t.kind].icon}
              <p className="flex-1 text-xs leading-relaxed text-foreground">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
