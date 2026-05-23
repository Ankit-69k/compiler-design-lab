"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export function GlassCard({
  children,
  className,
  hover = false,
  glow = false,
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={cn(
        "rounded-xl border border-white/8 bg-white/4 backdrop-blur-sm",
        glow && "shadow-[0_0_20px_rgba(99,102,241,0.2)]",
        hover && "cursor-pointer transition-all duration-200 hover:border-indigo-500/30 hover:bg-white/6",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
