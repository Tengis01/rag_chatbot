import type { SourceChunk } from "@/types";
import { SourceCard } from "@/components/workspace/SourceCard";

interface SourcesPanelProps {
  sources: SourceChunk[];
  /** Optional lookup: documentId → filename, forwarded to SourceCard */
  documentNames?: Record<string, string>;
}

export function SourcesPanel({ sources, documentNames }: SourcesPanelProps) {
  return (
    <div className="glass scrollbar-thin flex h-full flex-col overflow-y-auto p-4">
      {/* Header */}
      <div className="mb-3 flex-shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Эх сурвалжууд
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {sources.length} хэсэг · дээд зэрэглэлийн хайлт
        </p>
      </div>

      {/* Cards or empty state */}
      {sources.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-center text-xs text-muted-foreground">
            Асуулт асуусны дараа эх сурвалжууд энд харагдана.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sources.map((src) => (
            <SourceCard
              key={src.chunkId}
              source={src}
              documentName={documentNames?.[src.documentId]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
