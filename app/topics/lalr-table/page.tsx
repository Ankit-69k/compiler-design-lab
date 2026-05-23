import { MainLayout } from "@/components/layout/MainLayout";
import { TopicLayout } from "@/components/topics/TopicLayout";
import { TheorySection } from "@/components/topics/TheorySection";
import { VivaQuestions } from "@/components/topics/VivaQuestions";
import { GlassCard } from "@/components/ui/GlassCard";

const VIVA_QS = [
  {
    question: "What is the LALR parsing table?",
    answer: "LALR (Look-Ahead LR) tables are built by merging LR(1) states that have identical LR(0) cores (same items ignoring lookaheads). This gives tables the size of SLR but with the precision of LR(1).",
  },
  {
    question: "How do LALR and SLR differ?",
    answer: "Both have the same number of states (same as LR(0)). SLR uses FOLLOW sets for reductions; LALR uses the merged lookaheads from canonical LR(1) states. LALR is strictly more powerful than SLR.",
  },
  {
    question: "Can LALR merge introduce conflicts?",
    answer: "Merging can introduce reduce-reduce conflicts (if the merged lookaheads overlap for different reductions). However, it can NEVER introduce shift-reduce conflicts because shifts depend only on the LR(0) core.",
  },
  {
    question: "Why is LALR preferred over canonical LR(1) in practice?",
    answer: "Canonical LR(1) tables can be enormous (exponentially larger than SLR for some grammars). LALR achieves near-LR(1) power with SLR-sized tables, making it practical for real language compilers (yacc/bison use LALR).",
  },
];

export default function LALRTablePage() {
  return (
    <MainLayout title="LALR Parsing Table">
      <TopicLayout
        title="LALR Parsing Table Construction"
        difficulty="Advanced"
        estimatedTime="90 min"
        description="Build LALR parsing tables by merging compatible LR(1) states — the industry standard for parser generators like yacc and bison."
        theory={
          <TheorySection
            blocks={[
              { type: "heading", content: "LALR Parsing" },
              {
                type: "text",
                content: "LALR (Look-Ahead LR) parsing combines the efficiency of SLR with the precision of canonical LR(1). It merges LR(1) states with the same core to reduce table size while retaining much of LR(1)'s conflict-resolution power.",
              },
              {
                type: "definition",
                title: "LR(1) Core",
                content: "The core of an LR(1) item [A→α•β, a] is the LR(0) item A→α•β (ignoring the lookahead). Two LR(1) states can be merged if they have the same set of LR(0) cores.",
              },
              {
                type: "algorithm",
                title: "LALR Table Construction (via LR(1))",
                content: [
                  "Build the canonical LR(1) collection of item sets",
                  "Find all pairs of states with identical LR(0) cores",
                  "Merge such pairs: union their lookahead sets",
                  "Check for reduce-reduce conflicts in merged states",
                  "Build ACTION and GOTO tables from merged states",
                ],
              },
              {
                type: "algorithm",
                title: "LALR Construction (Direct, Efficient)",
                content: [
                  "Build canonical LR(0) collection",
                  "For each LR(0) state and each reduce item [A→α•]:",
                  "  Propagate lookaheads through the automaton",
                  "  Spontaneously generate lookaheads where they come from FIRST",
                  "Fill lookaheads for all items via fixed-point iteration",
                  "Build table using merged lookaheads",
                ],
              },
              {
                type: "example",
                title: "Merging Example",
                content: `LR(1) states with same core:
  I₃ = { [C→c•C, c], [C→c•C, d] }
  I₆ = { [C→c•C, $] }

  Core of both: { C→c•C }
  Can merge → LALR state I₃₆:
  { [C→c•C, c], [C→c•C, d], [C→c•C, $] }
  Lookaheads = {c, d, $} = union of both sets

Result: fewer states, same parsing power for this grammar`,
              },
              {
                type: "note",
                content: "yacc, bison, and most parser generators use LALR(1). Some grammars that are LR(1) but not LALR(1) do exist but are rare in practice.",
              },
            ]}
            complexity={{ time: "O(|states|²) for merging", space: "O(|LR(1) states|)" }}
            commonErrors={[
              "Merging states that have reduce-reduce conflicts in their merged lookahead sets",
              "Confusing LALR state count with LR(1) state count",
              "Thinking shift-reduce conflicts can be introduced by merging (they cannot)",
            ]}
          />
        }
        code={
          <GlassCard className="p-5 space-y-4">
            <h3 className="font-bold text-white">LALR vs Other Parsers</h3>
            <div className="overflow-x-auto">
              <table className="text-sm w-full border-collapse font-mono">
                <thead>
                  <tr className="text-slate-400 border-b border-white/10">
                    <th className="text-left py-2 pr-6">Parser</th>
                    <th className="text-left py-2 pr-6">States</th>
                    <th className="text-left py-2 pr-6">Lookahead</th>
                    <th className="text-left py-2">Power</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {[
                    ["SLR(1)","LR(0) count","FOLLOW sets","Weakest LR"],
                    ["LALR(1)","LR(0) count","Merged LR(1)","Middle"],
                    ["LR(1)","Much larger","Per-state","Strongest"],
                  ].map(row => (
                    <tr key={row[0]} className="border-b border-white/6">
                      {row.map((cell,i) => <td key={i} className={`py-2 pr-6 ${i===0?"text-indigo-300 font-bold":""}`}>{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        }
        visualization={
          <GlassCard className="p-5">
            <h3 className="font-bold text-white mb-4">LALR State Merging Visualization</h3>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex flex-col gap-3">
                {[
                  { id: "I₃", items: ["[C→c•C, c]", "[C→c•C, d]"] },
                  { id: "I₆", items: ["[C→c•C, $]"] },
                ].map(s => (
                  <div key={s.id} className="p-4 rounded-xl bg-blue-500/8 border border-blue-500/20">
                    <div className="text-blue-400 font-mono font-bold mb-2">{s.id}</div>
                    {s.items.map(item => <div key={item} className="text-slate-300 text-sm font-mono">{item}</div>)}
                  </div>
                ))}
              </div>
              <div className="text-3xl text-indigo-400 font-bold">→</div>
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="text-emerald-400 font-mono font-bold mb-2">I₃₆ (merged)</div>
                {["[C→c•C, c]","[C→c•C, d]","[C→c•C, $]"].map(item => (
                  <div key={item} className="text-slate-200 text-sm font-mono">{item}</div>
                ))}
                <div className="text-xs text-emerald-400/70 mt-2">Lookaheads: c, d, $ (union)</div>
              </div>
            </div>
          </GlassCard>
        }
        practice={
          <GlassCard className="p-5 max-w-2xl">
            <h3 className="font-bold text-white mb-3">Practice</h3>
            <p className="text-slate-300 text-sm">
              For grammar S→CC, C→cC|d: build the LALR table by merging LR(1) states.
              Compare the number of states with canonical LR(1).
            </p>
          </GlassCard>
        }
        viva={<VivaQuestions questions={VIVA_QS} />}
      />
    </MainLayout>
  );
}
