"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, StepForward, ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";

const EXAMPLE_GRAMMAR = [
  { lhs: "E", rhs: ["T", "E'"] },
  { lhs: "E'", rhs: ["+", "T", "E'"] },
  { lhs: "E'", rhs: ["ε"] },
  { lhs: "T", rhs: ["F", "T'"] },
  { lhs: "T'", rhs: ["*", "F", "T'"] },
  { lhs: "T'", rhs: ["ε"] },
  { lhs: "F", rhs: ["(", "E", ")"] },
  { lhs: "F", rhs: ["id"] },
];

const STEPS = [
  {
    step: 1,
    title: "Initialize FIRST sets",
    description: "Start with empty FIRST sets for all non-terminals. Add terminals directly.",
    highlight: ["F"],
    firstSets: { E: [], "E'": [], T: [], "T'": [], F: ["(", "id"] },
    followSets: {},
    activeNT: "F",
  },
  {
    step: 2,
    title: "Compute FIRST(T')",
    description: "T' → *FT' gives *, T' → ε gives ε",
    highlight: ["T'"],
    firstSets: { E: [], "E'": [], T: [], "T'": ["*", "ε"], F: ["(", "id"] },
    followSets: {},
    activeNT: "T'",
  },
  {
    step: 3,
    title: "Compute FIRST(T)",
    description: "T → FT', FIRST(T) = FIRST(F) = {(, id} since F cannot derive ε",
    highlight: ["T"],
    firstSets: { E: [], "E'": [], T: ["(", "id"], "T'": ["*", "ε"], F: ["(", "id"] },
    followSets: {},
    activeNT: "T",
  },
  {
    step: 4,
    title: "Compute FIRST(E')",
    description: "E' → +TE' gives +, E' → ε gives ε",
    highlight: ["E'"],
    firstSets: { E: [], "E'": ["+", "ε"], T: ["(", "id"], "T'": ["*", "ε"], F: ["(", "id"] },
    followSets: {},
    activeNT: "E'",
  },
  {
    step: 5,
    title: "Compute FIRST(E)",
    description: "E → TE', FIRST(E) = FIRST(T) = {(, id} since T cannot derive ε",
    highlight: ["E"],
    firstSets: {
      E: ["(", "id"],
      "E'": ["+", "ε"],
      T: ["(", "id"],
      "T'": ["*", "ε"],
      F: ["(", "id"],
    },
    followSets: {},
    activeNT: "E",
  },
  {
    step: 6,
    title: "Initialize FOLLOW sets",
    description: "FOLLOW(E) = {$} since E is start symbol. Also add ) from F → (E)",
    highlight: ["E"],
    firstSets: {
      E: ["(", "id"],
      "E'": ["+", "ε"],
      T: ["(", "id"],
      "T'": ["*", "ε"],
      F: ["(", "id"],
    },
    followSets: { E: ["$", ")"], "E'": [], T: [], "T'": [], F: [] },
    activeNT: "E",
  },
  {
    step: 7,
    title: "Compute FOLLOW(E')",
    description: "E → TE', E' is at end → FOLLOW(E') = FOLLOW(E) = {$, )}",
    highlight: ["E'"],
    firstSets: {
      E: ["(", "id"],
      "E'": ["+", "ε"],
      T: ["(", "id"],
      "T'": ["*", "ε"],
      F: ["(", "id"],
    },
    followSets: { E: ["$", ")"], "E'": ["$", ")"], T: [], "T'": [], F: [] },
    activeNT: "E'",
  },
  {
    step: 8,
    title: "Compute FOLLOW(T)",
    description: "E → TE': add FIRST(E')-{ε} = {+}. Since ε∈FIRST(E'), also add FOLLOW(E).",
    highlight: ["T"],
    firstSets: {
      E: ["(", "id"],
      "E'": ["+", "ε"],
      T: ["(", "id"],
      "T'": ["*", "ε"],
      F: ["(", "id"],
    },
    followSets: { E: ["$", ")"], "E'": ["$", ")"], T: ["+", "$", ")"], "T'": [], F: [] },
    activeNT: "T",
  },
  {
    step: 9,
    title: "Compute FOLLOW(T')",
    description: "T → FT', T' at end → FOLLOW(T') = FOLLOW(T) = {+, $, )}",
    highlight: ["T'"],
    firstSets: {
      E: ["(", "id"],
      "E'": ["+", "ε"],
      T: ["(", "id"],
      "T'": ["*", "ε"],
      F: ["(", "id"],
    },
    followSets: {
      E: ["$", ")"],
      "E'": ["$", ")"],
      T: ["+", "$", ")"],
      "T'": ["+", "$", ")"],
      F: [],
    },
    activeNT: "T'",
  },
  {
    step: 10,
    title: "Compute FOLLOW(F) — Complete!",
    description: "T → FT': add FIRST(T')-{ε} = {*}. Since ε∈FIRST(T'), also add FOLLOW(T).",
    highlight: ["F"],
    firstSets: {
      E: ["(", "id"],
      "E'": ["+", "ε"],
      T: ["(", "id"],
      "T'": ["*", "ε"],
      F: ["(", "id"],
    },
    followSets: {
      E: ["$", ")"],
      "E'": ["$", ")"],
      T: ["+", "$", ")"],
      "T'": ["+", "$", ")"],
      F: ["*", "+", "$", ")"],
    },
    activeNT: "F",
  },
];

const nonTerminals = ["E", "E'", "T", "T'", "F"];
const ntColors: Record<string, string> = {
  E: "text-cyan-400",
  "E'": "text-blue-400",
  T: "text-violet-400",
  "T'": "text-purple-400",
  F: "text-indigo-400",
};

export function FirstFollowViz() {
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const current = STEPS[stepIndex];

  const play = async () => {
    setPlaying(true);
    for (let i = stepIndex; i < STEPS.length - 1; i++) {
      await new Promise((r) => setTimeout(r, 1200));
      setStepIndex((s) => s + 1);
    }
    setPlaying(false);
  };

  const reset = () => {
    setStepIndex(0);
    setPlaying(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-bold text-white">FIRST & FOLLOW Computation Visualization</h3>
        <div className="flex gap-2">
          <NeonButton variant="secondary" size="sm" onClick={reset}>
            <RotateCcw size={14} /> Reset
          </NeonButton>
          <NeonButton
            variant="secondary"
            size="sm"
            onClick={() => setStepIndex((s) => Math.max(0, s - 1))}
            disabled={stepIndex === 0}
          >
            ← Prev
          </NeonButton>
          <NeonButton
            variant="secondary"
            size="sm"
            onClick={() => setStepIndex((s) => Math.min(STEPS.length - 1, s + 1))}
            disabled={stepIndex === STEPS.length - 1}
          >
            <StepForward size={14} /> Next
          </NeonButton>
          <NeonButton size="sm" onClick={play} disabled={playing || stepIndex === STEPS.length - 1}>
            <Play size={14} fill="currentColor" /> {playing ? "Playing..." : "Auto Play"}
          </NeonButton>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/5 rounded-full">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
          animate={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Grammar */}
        <GlassCard className="p-5">
          <h4 className="text-sm font-semibold text-slate-300 mb-4">Grammar</h4>
          <div className="space-y-1.5 font-mono text-sm">
            {EXAMPLE_GRAMMAR.map((prod, i) => (
              <div
                key={i}
                className={`flex gap-2 ${
                  current.highlight.includes(prod.lhs) ? "text-indigo-300" : "text-slate-400"
                }`}
              >
                <span className={ntColors[prod.lhs] ?? "text-cyan-400"}>{prod.lhs}</span>
                <span className="text-slate-500">→</span>
                <span>{prod.rhs.join(" ")}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Step description */}
        <GlassCard className="p-5 lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 text-sm font-bold flex items-center justify-center">
              {current.step}
            </span>
            <div>
              <div className="font-semibold text-white">{current.title}</div>
              <div className="text-xs text-slate-400">{`Step ${current.step} of ${STEPS.length}`}</div>
            </div>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">{current.description}</p>

          {/* Active NT highlight */}
          <div className="flex items-center gap-2 text-sm">
            <ChevronRight size={14} className="text-indigo-400" />
            <span className="text-slate-400">Processing:</span>
            <span
              className={`font-mono font-bold text-base ${ntColors[current.activeNT] ?? "text-white"}`}
            >
              {current.activeNT}
            </span>
          </div>
        </GlassCard>
      </div>

      {/* FIRST & FOLLOW Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* FIRST */}
        <GlassCard className="p-5">
          <h4 className="text-sm font-semibold text-cyan-400 mb-4">FIRST Sets</h4>
          <div className="space-y-2">
            {nonTerminals.map((nt) => (
              <motion.div
                key={nt}
                className={`flex items-start gap-3 px-3 py-2 rounded-lg transition-all ${
                  current.activeNT === nt && stepIndex <= 5
                    ? "bg-indigo-500/15 border border-indigo-500/30"
                    : "bg-white/3"
                }`}
              >
                <span className={`font-mono font-bold text-sm w-8 ${ntColors[nt]}`}>{nt}</span>
                <span className="text-slate-500 text-sm">=</span>
                <div className="flex flex-wrap gap-1.5">
                  <AnimatePresence>
                    {((current.firstSets as Record<string, string[]>)[nt] ?? []).map((sym) => (
                      <motion.span
                        key={sym}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`px-2 py-0.5 rounded text-xs font-mono border ${
                          sym === "ε"
                            ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                            : "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                        }`}
                      >
                        {sym}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                  {((current.firstSets as Record<string, string[]>)[nt] ?? []).length === 0 && (
                    <span className="text-slate-600 text-xs">{ "{}" }</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* FOLLOW */}
        <GlassCard className="p-5">
          <h4 className="text-sm font-semibold text-violet-400 mb-4">FOLLOW Sets</h4>
          <div className="space-y-2">
            {nonTerminals.map((nt) => (
              <motion.div
                key={nt}
                className={`flex items-start gap-3 px-3 py-2 rounded-lg transition-all ${
                  current.activeNT === nt && stepIndex > 5
                    ? "bg-violet-500/15 border border-violet-500/30"
                    : "bg-white/3"
                }`}
              >
                <span className={`font-mono font-bold text-sm w-8 ${ntColors[nt]}`}>{nt}</span>
                <span className="text-slate-500 text-sm">=</span>
                <div className="flex flex-wrap gap-1.5">
                  <AnimatePresence>
                    {((current.followSets as Record<string, string[]>)[nt] ?? []).map((sym) => (
                      <motion.span
                        key={sym}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`px-2 py-0.5 rounded text-xs font-mono border ${
                          sym === "$"
                            ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                            : "bg-violet-500/15 text-violet-300 border-violet-500/30"
                        }`}
                      >
                        {sym}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                  {((current.followSets as Record<string, string[]>)[nt] ?? []).length === 0 && (
                    <span className="text-slate-600 text-xs">{ "{}" }</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      {stepIndex === STEPS.length - 1 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center"
        >
          <div className="text-2xl mb-2">🎉</div>
          <div className="text-emerald-400 font-bold">Computation Complete!</div>
          <div className="text-slate-400 text-sm mt-1">
            FIRST and FOLLOW sets have been computed for all non-terminals.
          </div>
        </motion.div>
      )}
    </div>
  );
}
