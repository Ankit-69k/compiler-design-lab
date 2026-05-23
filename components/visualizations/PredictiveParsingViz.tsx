"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, StepForward } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";

interface ParseStep {
  stack: string[];
  input: string[];
  action: string;
  actionType: "match" | "expand" | "accept" | "error";
}

const PARSE_STEPS: ParseStep[] = [
  { stack: ["$", "E"], input: ["id", "+", "id", "*", "id", "$"], action: "Expand: M[E,id] → E → TE'", actionType: "expand" },
  { stack: ["$", "E'", "T"], input: ["id", "+", "id", "*", "id", "$"], action: "Expand: M[T,id] → T → FT'", actionType: "expand" },
  { stack: ["$", "E'", "T'", "F"], input: ["id", "+", "id", "*", "id", "$"], action: "Expand: M[F,id] → F → id", actionType: "expand" },
  { stack: ["$", "E'", "T'", "id"], input: ["id", "+", "id", "*", "id", "$"], action: "Match: id = id, pop stack, advance input", actionType: "match" },
  { stack: ["$", "E'", "T'"], input: ["+", "id", "*", "id", "$"], action: "Expand: M[T',+] → T' → ε (empty production)", actionType: "expand" },
  { stack: ["$", "E'"], input: ["+", "id", "*", "id", "$"], action: "Expand: M[E',+] → E' → +TE'", actionType: "expand" },
  { stack: ["$", "E'", "T", "+"], input: ["+", "id", "*", "id", "$"], action: "Match: + = +, pop stack, advance input", actionType: "match" },
  { stack: ["$", "E'", "T"], input: ["id", "*", "id", "$"], action: "Expand: M[T,id] → T → FT'", actionType: "expand" },
  { stack: ["$", "E'", "T'", "F"], input: ["id", "*", "id", "$"], action: "Expand: M[F,id] → F → id", actionType: "expand" },
  { stack: ["$", "E'", "T'", "id"], input: ["id", "*", "id", "$"], action: "Match: id = id, pop stack, advance input", actionType: "match" },
  { stack: ["$", "E'", "T'"], input: ["*", "id", "$"], action: "Expand: M[T',*] → T' → *FT'", actionType: "expand" },
  { stack: ["$", "E'", "T'", "F", "*"], input: ["*", "id", "$"], action: "Match: * = *, pop stack, advance input", actionType: "match" },
  { stack: ["$", "E'", "T'", "F"], input: ["id", "$"], action: "Expand: M[F,id] → F → id", actionType: "expand" },
  { stack: ["$", "E'", "T'", "id"], input: ["id", "$"], action: "Match: id = id, pop stack, advance input", actionType: "match" },
  { stack: ["$", "E'", "T'"], input: ["$"], action: "Expand: M[T',$] → T' → ε", actionType: "expand" },
  { stack: ["$", "E'"], input: ["$"], action: "Expand: M[E',$] → E' → ε", actionType: "expand" },
  { stack: ["$"], input: ["$"], action: "✅ ACCEPT! Both stack top and input = $", actionType: "accept" },
];

const actionColors = {
  match: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  expand: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  accept: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  error: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

export function PredictiveParsingViz() {
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const current = PARSE_STEPS[stepIndex];

  const play = async () => {
    setPlaying(true);
    for (let i = stepIndex; i < PARSE_STEPS.length - 1; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      setStepIndex((s) => s + 1);
    }
    setPlaying(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-white">Predictive Parsing Trace</h3>
          <p className="text-sm text-slate-400">Input: id + id * id $</p>
        </div>
        <div className="flex gap-2">
          <NeonButton variant="secondary" size="sm" onClick={() => { setStepIndex(0); setPlaying(false); }}>
            <RotateCcw size={14} /> Reset
          </NeonButton>
          <NeonButton variant="secondary" size="sm" onClick={() => setStepIndex(s => Math.max(0, s - 1))} disabled={stepIndex === 0}>
            ← Prev
          </NeonButton>
          <NeonButton variant="secondary" size="sm" onClick={() => setStepIndex(s => Math.min(PARSE_STEPS.length - 1, s + 1))} disabled={stepIndex === PARSE_STEPS.length - 1}>
            <StepForward size={14} /> Next
          </NeonButton>
          <NeonButton size="sm" onClick={play} disabled={playing || stepIndex === PARSE_STEPS.length - 1}>
            <Play size={14} fill="currentColor" /> {playing ? "Playing..." : "Auto Play"}
          </NeonButton>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-white/5 rounded-full">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
          animate={{ width: `${((stepIndex + 1) / PARSE_STEPS.length) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Stack Visualization */}
        <GlassCard className="p-5">
          <h4 className="text-sm font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> Parse Stack (TOS at bottom)
          </h4>
          <div className="flex flex-col gap-1 items-center min-h-48">
            <AnimatePresence mode="popLayout">
              {[...current.stack].reverse().map((sym, i) => (
                <motion.div
                  key={`${sym}-${i}-${stepIndex}`}
                  initial={{ opacity: 0, y: -15, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.8 }}
                  className={`w-32 text-center py-2 rounded-lg font-mono text-sm font-bold border ${
                    i === 0
                      ? "bg-indigo-500/25 border-indigo-500/60 text-indigo-200 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                      : "bg-white/4 border-white/10 text-slate-300"
                  }`}
                >
                  {sym}
                  {i === 0 && (
                    <span className="ml-2 text-[10px] text-indigo-400">← TOS</span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </GlassCard>

        {/* Input Buffer */}
        <GlassCard className="p-5">
          <h4 className="text-sm font-semibold text-violet-400 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400" /> Input Buffer
          </h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {current.input.map((sym, i) => (
              <motion.div
                key={`${sym}-${i}`}
                className={`px-3 py-2 rounded-lg font-mono text-sm font-bold border ${
                  i === 0
                    ? "bg-violet-500/25 border-violet-500/60 text-violet-200 shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                    : "bg-white/4 border-white/10 text-slate-400"
                }`}
              >
                {sym}
                {i === 0 && <span className="block text-[10px] text-violet-400 text-center">↑</span>}
              </motion.div>
            ))}
          </div>

          {/* Action */}
          <div className={`p-3 rounded-lg border text-sm font-medium ${actionColors[current.actionType]}`}>
            <div className="text-[10px] uppercase tracking-wider mb-1 opacity-70">Action</div>
            {current.action}
          </div>

          {/* Step counter */}
          <div className="mt-3 text-xs text-slate-500">
            Step {stepIndex + 1} of {PARSE_STEPS.length}
          </div>
        </GlassCard>
      </div>

      {/* Parse History */}
      <GlassCard className="p-5">
        <h4 className="text-sm font-semibold text-slate-300 mb-3">Parse History</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-slate-500 border-b border-white/8">
                <th className="text-left py-2 pr-4">#</th>
                <th className="text-left py-2 pr-4">Stack</th>
                <th className="text-left py-2 pr-4">Input</th>
                <th className="text-left py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {PARSE_STEPS.slice(0, stepIndex + 1).map((s, i) => (
                <tr
                  key={i}
                  className={`border-b border-white/4 ${
                    i === stepIndex ? "bg-indigo-500/10" : ""
                  }`}
                >
                  <td className="py-1.5 pr-4 text-slate-500">{i + 1}</td>
                  <td className="py-1.5 pr-4 text-cyan-300">{s.stack.join(" ")}</td>
                  <td className="py-1.5 pr-4 text-violet-300">{s.input.join(" ")}</td>
                  <td className={`py-1.5 ${actionColors[s.actionType].split(" ")[0]}`}>
                    {s.action.replace("✅ ", "")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
