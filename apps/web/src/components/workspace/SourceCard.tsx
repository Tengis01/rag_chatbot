import { FileCode, Database, BookOpen, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { SourceChunk } from "@/types";
import { cn } from "@/lib/utils";

// Map document filename extensions / known names to icons
function SourceIcon({ filename }: { filename: string }) {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".sql") || lower.includes("schema")) {
    return <Database className="h-3.5 w-3.5 text-primary-glow" />;
  }
  if (lower.endsWith(".md") || lower.includes("memory") || lower.includes("tasks")) {
    return <BookOpen className="h-3.5 w-3.5 text-primary-glow" />;
  }
  if (lower.endsWith(".ts") || lower.endsWith(".tsx") || lower.endsWith(".js")) {
    return <FileCode className="h-3.5 w-3.5 text-primary-glow" />;
  }
  return <FileText className="h-3.5 w-3.5 text-primary-glow" />;
}

interface SourceCardProps {
  source: SourceChunk;
  /** Optional: provide the filename/title of the document this chunk came from. */
  documentName?: string;
}

export function SourceCard({ source, documentName }: SourceCardProps) {
  const [hovered, setHovered] = useState(false);
  const pct = Math.round(source.similarity * 100);
  const label = documentName ?? `баримт-${source.documentId.slice(0, 6)}`;
  const preview =
    source.content.length > 90
      ? `${source.content.slice(0, 90)}…`
      : source.content;

  return (
    <motion.div
      layout
      className={cn(
        "block w-full rounded-xl border border-border/50 bg-secondary/30 p-3 text-left",
        "transition-colors duration-200 hover:border-primary/40 hover:bg-secondary/60",
      )}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Row 1: icon + name + match % */}
      <div className="flex items-center gap-2">
        <span className="flex-shrink-0 rounded-lg bg-primary/15 p-1.5">
          <SourceIcon filename={label} />
        </span>
        <span className="min-w-0 flex-1 truncate text-xs font-medium">
          {label}
        </span>
        <span className="flex-shrink-0 text-[10px] font-semibold text-primary-glow">
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="bg-gradient-primary h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* Hover-expand preview */}
      <motion.div
        initial={false}
        animate={
          hovered
            ? { opacity: 1, height: "auto", marginTop: 8 }
            : { opacity: 0, height: 0, marginTop: 0 }
        }
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <p className="text-[10.5px] leading-relaxed text-muted-foreground">
          {preview}
        </p>
      </motion.div>
    </motion.div>
  );
}
