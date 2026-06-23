import { Link } from "react-router-dom";
import { Upload, FileText, ArrowRight } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { FileCode, Database, BookOpen } from "lucide-react";

// Floating document card
function FloatingCard({
  title,
  icon: Icon,
  className,
  xFactor,
  yFactor,
  floatY,
  floatDuration,
  floatDelay = 0,
  mouseX,
  mouseY,
}: {
  title: string;
  icon: React.ElementType;
  className: string;
  xFactor: number;
  yFactor: number;
  floatY: number[];
  floatDuration: number;
  floatDelay?: number;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  mouseY: ReturnType<typeof useMotionValue<number>>;
}) {
  const x = useTransform(mouseX, (v) => v * xFactor);
  const y = useTransform(mouseY, (v) => v * yFactor);

  return (
    <motion.div
      style={{ x, y }}
      animate={{ y: floatY }}
      transition={{
        y: {
          duration: floatDuration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: floatDelay,
        },
      }}
      className={`glass shadow-elevated hidden lg:flex absolute items-center gap-2 rounded-2xl px-3 py-2 ${className}`}
    >
      <Icon className="h-4 w-4 text-primary-glow shrink-0" />
      <span className="text-xs font-medium">{title}</span>
    </motion.div>
  );
}

export function Hero() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    mouseX.set(((e.clientX - left) / width - 0.5) * 30);
    mouseY.set(((e.clientY - top) / height - 0.5) * 30);
  };

  return (
    <section
      className="relative min-h-screen overflow-hidden pt-40"
      onMouseMove={handleMouseMove}
    >
      {/* Background grid */}
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-50" />
      {/* Hero gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      />

      {/* Floating orbs */}
      <motion.div
        className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-primary/30 blur-[120px]"
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-0 right-1/4 h-[28rem] w-[28rem] rounded-full bg-accent/20 blur-[140px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Particles */}
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute h-1 w-1 rounded-full bg-primary-glow/60"
          style={{
            left: `${(i * 37 + 11) % 100}%`,
            top: `${(i * 53 + 7) % 80}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 4 + (i % 5),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}

      {/* Floating document cards */}
      <FloatingCard
        title="DB_SCHEMA.md"
        icon={FileCode}
        className="left-[8%] top-[28%] w-44"
        xFactor={0.6}
        yFactor={0.6}
        floatY={[0, -12, 0]}
        floatDuration={6}
        mouseX={mouseX}
        mouseY={mouseY}
      />
      <FloatingCard
        title="вектор · 768d"
        icon={Database}
        className="right-[10%] top-[22%] w-48"
        xFactor={-0.4}
        yFactor={-0.4}
        floatY={[0, 14, 0]}
        floatDuration={7}
        floatDelay={0.5}
        mouseX={mouseX}
        mouseY={mouseY}
      />
      <FloatingCard
        title="MEMORY.md"
        icon={BookOpen}
        className="bottom-[26%] right-[18%] w-40"
        xFactor={0.3}
        yFactor={0.3}
        floatY={[0, -10, 0]}
        floatDuration={5.5}
        floatDelay={1}
        mouseX={mouseX}
        mouseY={mouseY}
      />

      {/* Center content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Эх сурвалжтай AI · pgvector дээр ажиллана
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl"
        >
          <span className="text-gradient block">Баримтаасаа асуу.</span>
          <span className="block text-foreground/90">Эх сурвалжтай хариулт ав.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground"
        >
          PDF оруулах, текст хуулж наах, өөрийн мэдлэгийн сангаас эх
          сурвалжтай хариулт авах боломжтой.
        </motion.p>

        {/* Button row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/workspace"
            className="bg-gradient-primary shadow-glow inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
          >
            <Upload className="h-4 w-4" />
            Баримт оруулах
          </Link>
          <Link
            to="/workspace"
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-secondary/60 px-6 py-3.5 text-sm font-medium text-foreground backdrop-blur transition-all hover:scale-[1.03] hover:bg-secondary"
          >
            <FileText className="h-4 w-4" />
            Текст оруулах
          </Link>
          <Link
            to="/workspace"
            className="group inline-flex items-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Ажлын талбарыг нээх
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
