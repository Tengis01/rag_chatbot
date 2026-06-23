import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Интерактив жишээ", href: "#workspace-preview" },
  { label: "Боломжууд", href: "#capabilities" },
  { label: "Гар утасны хувилбар", href: "#mobile" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <div
        className={cn(
          "flex w-full max-w-7xl items-center justify-between rounded-2xl px-5 py-3 transition-all duration-300",
          scrolled ? "glass-strong shadow-elevated" : "bg-transparent",
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-gradient-primary shadow-glow flex h-8 w-8 items-center justify-center rounded-xl">
            <FileText className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold tracking-tight">RAG Чатбот</span>
        </div>

        {/* Nav links — hidden on mobile */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <Link
          to="/workspace"
          className={cn(
            "bg-gradient-primary shadow-glow rounded-xl px-4 py-2 text-sm font-medium text-primary-foreground",
            "transition-all hover:scale-[1.03] hover:shadow-[0_0_40px_hsl(var(--primary)/0.4)]",
          )}
        >
          Асууж эхлэх
        </Link>
      </div>
    </motion.header>
  );
}
