"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, StepForward, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";

interface ItemSet {
  id: string;
  items: string[];
  transitions: { symbol: string; to: string }[];
  isAccept?: boolean;
  isReduce?: boolean;
}

const ITEM_SETS: ItemSet[] = [
  {
    id: "I₀",
    items: ["S' → •S", "S → •AA", "A → •aA", "A → •b"],
    transitions: [
      { symbol: "S", to: "I₁" },
      { symbol: "A", to: "I₂" },
      { symbol: "a", to: "I₃" },
      { symbol: "b", to: "I₄" },
    ],
  },
  {
    id: "I₁",
    items: ["S' → S•"],
    transitions: [],
    isAccept: true,
  },
  {
    id: "I₂",
    items: ["S → A•A", "A → •aA", "A → •b"],
    transitions: [
      { symbol: "A", to: "I₅" },
      { symbol: "a", to: "I₃" },
      { symbol: "b", to: "I₄" },
    ],
  },
  {
    id: "I₃",
    items: ["A → a•A", "A → •aA", "A → •b"],
    transitions: [
      { symbol: "A", to: "I₆" },
      { symbol: "a", to: "I₃" },
      { symbol: "b", to: "I₄" },
    ],
  },
  {
    id: "I₄",
    items: ["A → b•"],
    transitions: [],
    isReduce: true,
  },
  {
    id: "I₅",
    items: ["S → AA•"],
    transitions: [],
    isReduce: true,
  },
  {
    id: "I₆",
    items: ["A → aA•"],
    transitions: [],
    isReduce: true,
  },
];

const EXPLANATION_STEPS = [
  "Start with augmented production S' → •S and compute CLOSURE",
  "CLOSURE adds all productions whose LHS appears after the dot",
  "From I₀, GOTO(I₀, S) = {S' → S•} = I₁ — ACCEPT state",
  "GOTO(I₀, A) = CLOSURE({S→A•A}) = I₂",
  "GOTO(I₀, a) = CLOSURE({A→a•A}) = I₃ — recursive: a,b transitions back",
  "GOTO(I₀, b) = {A→b•} = I₄ — REDUCE state",
  "From I₂: GOTO(I₂,A)=I₅, GOTO(I₂,a)=I₃, GOTO(I₂,b)=I₄",
  "I₅ = {S→AA•} — REDUCE: S→AA",
  "I₆ = {A→aA•} — REDUCE: A→aA",
  "All states computed! DFA has 7 states (I₀ to I₆)",
];

export function LR0ItemsViz() {
  const [selected, setSelected] = useState("I₀");
  const [stepIndex, setStepIndex] = useState(0);

  const selectedSet = ITEM_SETS.find((s) => s.id === selected)!;

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-white">LR(0) Item Sets — DFA Visualization</h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* State List */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">States (click to inspect)</h4>
          {ITEM_SETS.map((set) => (
            <button
              key={set.id}
              onClick={() => setSelected(set.id)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                selected === set.id
                  ? "bg-indigo-500/20 border-indigo-500/50 text-white"
                  : "bg-white/3 border-white/8 text-slate-400 hover:bg-white/6"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold">{set.id}</span>
                <div className="flex gap-1">
                  {set.isAccept && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                      ACCEPT
                    </span>
                  )}
                  {set.isReduce && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                      REDUCE
                    </span>
                  )}
                  {!set.isAccept && !set.isReduce && set.transitions.length > 0 && (
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded">
                      SHIFT
                    </span>
                  )}
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{set.items.length} items</div>
            </button>
          ))}
        </div>

        {/* Selected State Detail */}
        <GlassCard className="p-5 lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-mono font-bold text-2xl text-white">{selected}</h4>
                <div className="flex gap-2">
                  {selectedSet.isAccept && (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30">
                      ✓ ACCEPT
                    </span>
                  )}
                  {selectedSet.isReduce && (
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium border border-amber-500/30">
                      ↓ REDUCE
                    </span>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="mb-5">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">LR(0) Items</div>
                <div className="space-y-1.5">
                  {selectedSet.items.map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-2 font-mono text-sm bg-black/30 px-3 py-2 rounded-lg border border-white/6"
                    >
                      <span className="text-slate-500 text-xs">[{i}]</span>
                      <span className="text-cyan-300">{item.split("→")[0].trim()}</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-slate-200">
                        {item.split("→")[1]?.trim().split("•")[0]}
                      </span>
                      <span className="text-rose-400 font-bold">•</span>
                      <span className="text-emerald-300">
                        {item.split("•")[1]}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Transitions */}
              {selectedSet.transitions.length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                    GOTO Transitions
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedSet.transitions.map((t) => (
                      <button
                        key={t.symbol}
                        onClick={() => setSelected(t.to)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-sm hover:bg-indigo-500/20 transition-colors"
                      >
                        <span className="font-mono text-indigo-300 font-bold">{t.symbol}</span>
                        <ArrowRight size={12} className="text-slate-500" />
                        <span className="font-mono text-violet-300">{t.to}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </GlassCard>
      </div>

      {/* Build Steps */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-slate-300">Construction Steps</h4>
          <div className="flex gap-2">
            <NeonButton variant="secondary" size="sm" onClick={() => setStepIndex(0)}>
              <RotateCcw size={12} />
            </NeonButton>
            <NeonButton
              variant="secondary"
              size="sm"
              onClick={() => setStepIndex((s) => Math.min(EXPLANATION_STEPS.length - 1, s + 1))}
              disabled={stepIndex >= EXPLANATION_STEPS.length - 1}
            >
              <StepForward size={12} /> Next Step
            </NeonButton>
          </div>
        </div>
        <div className="space-y-1.5">
          {EXPLANATION_STEPS.slice(0, stepIndex + 1).map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex gap-2 text-sm py-1.5 px-3 rounded-lg ${
                i === stepIndex ? "bg-indigo-500/10 text-slate-200" : "text-slate-500"
              }`}
            >
              <span className="text-indigo-400 shrink-0">{i + 1}.</span>
              {s}
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
