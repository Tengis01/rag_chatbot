import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export function CursorSpotlight() {
  const [pos, setPos] = useState({ x: -600, y: -600 });
  const location = useLocation();

  useEffect(() => {
    const handleMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  if (location.pathname.startsWith("/workspace")) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30"
      style={{
        background: `radial-gradient(280px circle at ${pos.x}px ${pos.y}px, hsl(var(--primary) / 0.12), transparent 75%)`,
      }}
    />
  );
}