import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

// TODO: API health endpoint-ийг polling хийж бодит төлөв харуулах
export function WorkspaceTopBar() {
  return (
    <header className="glass-strong relative z-20 flex h-16 items-center justify-between border-b border-border/40 px-6">
      {/* Left group */}
      <div className="flex items-center gap-3">
        {/* Back link */}
        <Link
          to="/"
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Буцах
        </Link>

        {/* Divider */}
        <span className="mx-1 h-4 w-px bg-border/60" aria-hidden="true" />

        {/* Logo lockup */}
        <div className="flex items-center gap-2">
          <div className="bg-gradient-primary shadow-glow flex h-7 w-7 items-center justify-center rounded-lg">
            <FileText className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold tracking-tight">RAG Чатбот</span>
        </div>
      </div>


      {/* Right: status pill */}
      <div className="flex items-center gap-2 rounded-full border border-border/50 bg-secondary/40 px-3 py-1 text-[11px] text-emerald-400/90">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
        Бүх систем бэлэн
      </div>
    </header>
  );
}
