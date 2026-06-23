import { useRef } from "react";
import { FileUp, Search, ShieldCheck, Brain } from "lucide-react";
import { motion } from "framer-motion";

const CARDS = [
  {
    icon: FileUp,
    title: "PDF ба текст оруулах",
    desc: "PDF файл оруулах эсвэл текст хуулж наахад баримтыг автоматаар хэсэгчлэн задлаж, векторжуулж, индекс үүсгэнэ.",
  },
  {
    icon: Search,
    title: "Вектор хайлт",
    desc: "768 хэмжээст векторуудыг pgvector ашиглан косинус төстэй байдлаар хурдан хайна.",
  },
  {
    icon: ShieldCheck,
    title: "Эх сурвалжтай хариулт",
    desc: "Хариулт бүр ашигласан хэсэгтэйгээ холбогдоно. Таамагласан хариултыг багасгана.",
  },
  {
    icon: Brain,
    title: "Чатын санах ой",
    desc: "Өмнөх асуулт, хариултын дарааллыг хадгалж үргэлжлүүлэн ажиллана.",
  },
];

function TiltCard({
  icon: Icon,
  title,
  desc,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  delay: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(0)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform =
        "perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0)";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="glass group relative h-full overflow-hidden rounded-3xl p-7 transition-transform duration-200"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-colors duration-300 group-hover:bg-primary/20" />

        {/* Icon */}
        <div className="bg-gradient-primary shadow-glow mb-5 flex h-11 w-11 items-center justify-center rounded-2xl">
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>

        <h3 className="mb-2 text-lg font-semibold tracking-tight">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
      </div>
    </motion.div>
  );
}

export function Capabilities() {
  return (
    <section id="capabilities" className="py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-glow">
            Боломжууд
          </p>
          <h2 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
            <span className="text-gradient">Эх сурвалжтай</span> ухаалаг хайлт
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Баримтаа хайж болохуйц, найдвартай, хурдан мэдлэгийн сан болгоход
            шаардлагатай үндсэн хэсгүүдийг нэгтгэсэн.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card, i) => (
            <TiltCard
              key={card.title}
              icon={card.icon}
              title={card.title}
              desc={card.desc}
              delay={i * 0.08}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
