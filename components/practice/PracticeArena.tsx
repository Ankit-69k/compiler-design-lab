"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Lightbulb,
  Eye,
  EyeOff,
  CheckCircle2,
  Star,
  Zap,
  Trophy,
  Lock,
} from "lucide-react";
import { practiceProblems, PracticeProblem } from "@/data/practice-problems";
import { DifficultyBadge } from "@/components/ui/Badge";
import { NeonButton } from "@/components/ui/NeonButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

const DIFFICULTY_ORDER = ["Beginner", "Intermediate", "Advanced"];

export function PracticeArena() {
  const [selected, setSelected] = useState<PracticeProblem | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());
  const [filterDifficulty, setFilterDifficulty] = useState<string>("All");
  const [xp, setXp] = useState(0);

  const filtered =
    filterDifficulty === "All"
      ? practiceProblems
      : practiceProblems.filter((p) => p.difficulty === filterDifficulty);

  const handleSolve = (problem: PracticeProblem) => {
    if (!solvedIds.has(problem.id)) {
      setSolvedIds((s) => new Set([...s, problem.id]));
      setXp((x) => x + problem.xp);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Practice Arena</h1>
          <p className="text-slate-400">Master compiler design through hands-on problems</p>
        </div>
        {/* XP */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Zap size={16} className="text-amber-400" fill="currentColor" />
            <span className="text-amber-400 font-bold">{xp} XP</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <Trophy size={16} className="text-violet-400" />
            <span className="text-violet-400 font-bold">{solvedIds.size} Solved</span>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["All", ...DIFFICULTY_ORDER].map((d) => (
          <button
            key={d}
            onClick={() => setFilterDifficulty(d)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm border transition-all",
              filterDifficulty === d
                ? "bg-indigo-600 text-white border-indigo-500"
                : "bg-white/4 text-slate-400 border-white/8 hover:bg-white/8"
            )}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Problem List */}
        <div className="space-y-3">
          {filtered.map((problem, i) => (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => {
                  setSelected(problem);
                  setShowHint(false);
                  setShowSolution(false);
                }}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all",
                  selected?.id === problem.id
                    ? "bg-indigo-500/15 border-indigo-500/50"
                    : "bg-white/3 border-white/8 hover:bg-white/6",
                  solvedIds.has(problem.id) && "border-emerald-500/30"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {solvedIds.has(problem.id) ? (
                      <CheckCircle2 size={18} className="text-emerald-400" />
                    ) : (
                      <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-200 truncate">{problem.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <DifficultyBadge difficulty={problem.difficulty} />
                      <span className="text-xs text-amber-400 flex items-center gap-0.5">
                        <Star size={10} fill="currentColor" />
                        {problem.xp} XP
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Problem Detail */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Title */}
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-bold text-white">{selected.title}</h2>
                  <div className="flex items-center gap-2 shrink-0">
                    <DifficultyBadge difficulty={selected.difficulty} />
                    <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg flex items-center gap-1">
                      <Star size={11} fill="currentColor" />
                      {selected.xp} XP
                    </span>
                  </div>
                </div>

                {/* Problem Statement */}
                <GlassCard className="p-5">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Problem Statement</div>
                  <pre className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed font-mono">
                    {selected.statement}
                  </pre>
                </GlassCard>

                {/* Input/Output */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GlassCard className="p-4">
                    <div className="text-xs text-cyan-400 uppercase tracking-wider mb-2">Input</div>
                    <pre className="text-slate-300 text-sm font-mono whitespace-pre-wrap">{selected.input}</pre>
                  </GlassCard>
                  <GlassCard className="p-4">
                    <div className="text-xs text-emerald-400 uppercase tracking-wider mb-2">Expected Output</div>
                    <pre className="text-slate-300 text-sm font-mono whitespace-pre-wrap">{selected.output}</pre>
                  </GlassCard>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <NeonButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowHint(!showHint)}
                  >
                    <Lightbulb size={14} />
                    {showHint ? "Hide Hint" : "Show Hint"}
                  </NeonButton>
                  <NeonButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowSolution(!showSolution)}
                  >
                    {showSolution ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showSolution ? "Hide Solution" : "Reveal Solution"}
                  </NeonButton>
                  {!solvedIds.has(selected.id) && (
                    <NeonButton size="sm" onClick={() => handleSolve(selected)}>
                      <CheckCircle2 size={14} /> Mark as Solved
                    </NeonButton>
                  )}
                  {solvedIds.has(selected.id) && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm">
                      <CheckCircle2 size={14} /> Solved! +{selected.xp} XP
                    </div>
                  )}
                </div>

                {/* Hint */}
                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <div className="flex gap-3 p-4 rounded-xl bg-amber-500/8 border border-amber-500/20">
                        <Lightbulb size={16} className="text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-amber-200 text-sm leading-relaxed">{selected.hint}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Solution */}
                <AnimatePresence>
                  {showSolution && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <GlassCard className="p-5 border-emerald-500/20">
                        <div className="text-xs text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <CheckCircle2 size={12} /> Solution
                        </div>
                        <pre className="text-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
                          {selected.solution}
                        </pre>
                      </GlassCard>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-80 text-center"
              >
                <Trophy size={48} className="text-slate-700 mb-4" />
                <p className="text-slate-500">Select a problem to start practicing</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
