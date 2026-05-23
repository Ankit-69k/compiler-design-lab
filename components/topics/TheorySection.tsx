"use client";
import { motion } from "framer-motion";
import { AlertCircle, Lightbulb, CheckCircle2, AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface TheoryBlock {
  type: "heading" | "text" | "definition" | "algorithm" | "note" | "warning" | "example" | "list";
  content: string | string[];
  title?: string;
}

interface TheorySectionProps {
  blocks: TheoryBlock[];
  complexity?: { time?: string; space?: string };
  commonErrors?: string[];
}

export function TheorySection({ blocks, complexity, commonErrors }: TheorySectionProps) {
  return (
    <div className="space-y-6 max-w-4xl">
      {blocks.map((block, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          {block.type === "heading" && (
            <h2 className="text-xl font-bold text-white border-b border-white/8 pb-2">
              {block.content as string}
            </h2>
          )}
          {block.type === "text" && (
            <p className="text-slate-300 leading-relaxed">{block.content as string}</p>
          )}
          {block.type === "definition" && (
            <GlassCard className="p-5 border-l-4 border-indigo-500">
              {block.title && (
                <div className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-2">
                  {block.title}
                </div>
              )}
              <p className="text-slate-200 leading-relaxed">{block.content as string}</p>
            </GlassCard>
          )}
          {block.type === "algorithm" && (
            <GlassCard className="p-5">
              {block.title && (
                <div className="font-semibold text-violet-400 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center text-xs">A</span>
                  {block.title}
                </div>
              )}
              <ol className="space-y-2">
                {(block.content as string[]).map((step, j) => (
                  <li key={j} className="flex gap-3 text-slate-300 text-sm">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                      {j + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </GlassCard>
          )}
          {block.type === "note" && (
            <div className="flex gap-3 p-4 rounded-xl bg-cyan-500/8 border border-cyan-500/20">
              <Lightbulb size={18} className="text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-cyan-200 text-sm leading-relaxed">{block.content as string}</p>
            </div>
          )}
          {block.type === "warning" && (
            <div className="flex gap-3 p-4 rounded-xl bg-amber-500/8 border border-amber-500/20">
              <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-amber-200 text-sm leading-relaxed">{block.content as string}</p>
            </div>
          )}
          {block.type === "example" && (
            <GlassCard className="p-5 border border-emerald-500/20 bg-emerald-500/5">
              {block.title && (
                <div className="font-semibold text-emerald-400 mb-3">📝 {block.title}</div>
              )}
              <pre className="text-slate-200 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                {block.content as string}
              </pre>
            </GlassCard>
          )}
          {block.type === "list" && (
            <ul className="space-y-2">
              {(block.content as string[]).map((item, j) => (
                <li key={j} className="flex gap-2 text-slate-300 text-sm">
                  <CheckCircle2 size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      ))}

      {/* Complexity */}
      {complexity && (
        <GlassCard className="p-5 mt-6">
          <h3 className="font-semibold text-white mb-3">⚡ Complexity Analysis</h3>
          <div className="flex gap-6">
            {complexity.time && (
              <div>
                <div className="text-xs text-slate-500 mb-1">Time Complexity</div>
                <div className="font-mono text-cyan-400 font-semibold">{complexity.time}</div>
              </div>
            )}
            {complexity.space && (
              <div>
                <div className="text-xs text-slate-500 mb-1">Space Complexity</div>
                <div className="font-mono text-violet-400 font-semibold">{complexity.space}</div>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Common Errors */}
      {commonErrors && commonErrors.length > 0 && (
        <GlassCard className="p-5">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-400" />
            Common Errors
          </h3>
          <ul className="space-y-2">
            {commonErrors.map((err, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300">
                <span className="text-rose-400 shrink-0">✗</span>
                {err}
              </li>
            ))}
          </ul>
        </GlassCard>
      )}
    </div>
  );
}
