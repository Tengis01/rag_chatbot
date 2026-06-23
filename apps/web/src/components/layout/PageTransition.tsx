import { motion } from "framer-motion";
import type { ReactNode } from "react";

const easeOutQuint = [0.22, 1, 0.36, 1] as const;

export function PageTransition({
  children,
  variant,
}: {
  children: ReactNode;
  variant: "landing" | "workspace";
}) {
  const initialScale = variant === "landing" ? 0.99 : 1.01;

  return (
    <motion.div
      initial={{ opacity: 0, scale: initialScale }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.5, ease: easeOutQuint }}
    >
      {children}
    </motion.div>
  );
}
