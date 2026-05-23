import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "blue" | "purple" | "green" | "yellow" | "red" | "cyan";
  className?: string;
}

const variants = {
  blue: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  purple: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  yellow: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  red: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
};

const difficultyMap: Record<string, "green" | "yellow" | "red"> = {
  Beginner: "green",
  Easy: "green",
  Intermediate: "yellow",
  Medium: "yellow",
  Advanced: "red",
  Hard: "red",
};

export function Badge({ children, variant = "blue", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const variant = difficultyMap[difficulty] ?? "blue";
  return <Badge variant={variant}>{difficulty}</Badge>;
}
