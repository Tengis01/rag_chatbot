import { Link } from "react-router-dom";
import { ArrowRight, Upload } from "lucide-react";
import { motion } from "framer-motion";

export function FinalCta() {
  return (
    <section id="cta" className="py-32">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="glass shadow-elevated relative overflow-hidden rounded-[32px] px-8 py-20 text-center"
        >
          {/* Inner gradient overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{ backgroundImage: "var(--gradient-hero)" }}
          />

          {/* Floating orb */}
          <motion.div
            className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/30 blur-[100px]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Content */}
          <div className="relative z-10">
            <h2 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">
              Өөрийн мэдлэгтэй
              <br />
              <span className="text-gradient">ярилцахад бэлэн үү?</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
              Хэдхэн секундэд эхэлнэ. Илүү тохиргоо шаардахгүй. Зөвхөн таны
              баримтад тулгуурласан хариулт.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/workspace"
                className="group bg-gradient-primary shadow-glow inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
              >
                Асууж эхлэх
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/workspace"
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-secondary/60 px-6 py-3.5 text-sm font-medium backdrop-blur transition-all hover:scale-[1.03] hover:bg-secondary"
              >
                <Upload className="h-4 w-4" />
                Баримт оруулах
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
