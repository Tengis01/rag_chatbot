import { FileText, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export function MobileShowcase() {
  return (
    <section id="mobile" className="overflow-hidden py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-glow">
              Хаанаас ч ашиглана
            </p>
            <h2 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
              Таны мэдлэг,
              <br />
              <span className="text-gradient">таны халаасанд.</span>
            </h2>
            <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
              Баримт, эх сурвалж, grounded хариултуудаа гар утаснаасаа ашиглах
              боломжтой туршлагын загвар.
            </p>
            {/* Non-interactive pills */}
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-border/50 bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                Концепт жишээ
              </span>
              <span className="rounded-full border border-border/50 bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                Удахгүй
              </span>
            </div>
          </motion.div>

          {/* Right phone mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="flex justify-center"
          >
            <div className="relative">
              {/* Glow behind phone */}
              <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 blur-[100px]" />

              {/* Phone shell */}
              <motion.div
                animate={{ scale: [1, 1.015, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="shadow-elevated relative h-[600px] w-[290px] rounded-[48px] border border-border/60 bg-card p-3"
              >
                {/* Notch */}
                <div className="absolute left-1/2 top-3 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-background" />

                {/* Screen */}
                <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-background">
                  <div
                    className="grid-bg absolute inset-0 opacity-50"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ backgroundImage: "var(--gradient-hero)" }}
                  />

                  {/* Mini UI */}
                  <div className="relative flex h-full flex-col px-4 pt-8">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4">
                      <div className="flex items-center gap-1.5">
                        <div className="bg-gradient-primary flex h-7 w-7 items-center justify-center rounded-lg">
                          <FileText className="h-3.5 w-3.5 text-primary-foreground" />
                        </div>
                        <span className="text-xs font-semibold">RAG</span>
                      </div>
                      <div className="h-7 w-7 rounded-full bg-secondary/60" />
                    </div>

                    {/* Chat bubbles — decorative, not using MessageBubble */}
                    <div className="flex-1 space-y-3">
                      {/* User bubble */}
                      <div className="glass ml-8 rounded-2xl rounded-tr-md p-3">
                        <p className="text-[10px]">pgvector-ийг тайлбарла</p>
                      </div>

                      {/* Assistant bubble */}
                      <div className="glass mr-8 rounded-2xl rounded-tl-md p-3">
                        <p className="text-[10px] leading-relaxed">
                          pgvector нь embedding хадгалж cosine similarity
                          хайлт хийх Postgres extension юм.
                        </p>
                        <span className="mt-2 inline-block rounded bg-primary/15 px-1.5 py-0.5 text-[8px] text-primary-glow">
                          DB_SCHEMA.md
                        </span>
                      </div>
                    </div>

                    {/* Input bar */}
                    <div className="pb-6 pt-3">
                      <div className="flex items-center gap-2 rounded-full border border-border/50 bg-secondary/60 px-3 py-2">
                        <MessageSquare className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                          Асуултаа бичнэ үү…
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
