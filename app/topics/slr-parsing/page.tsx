import { MainLayout } from "@/components/layout/MainLayout";
import { TopicLayout } from "@/components/topics/TopicLayout";
import { TheorySection } from "@/components/topics/TheorySection";
import { VivaQuestions } from "@/components/topics/VivaQuestions";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { GlassCard } from "@/components/ui/GlassCard";

const SLR_CODE = `#include <stdio.h>
#include <string.h>
#include <stdlib.h>

/* SLR Parser for: S' -> S, S -> AA, A -> aA | b
   States: 0-6 (from LR(0) construction)
   Actions: s=shift, r=reduce, acc=accept, err=error
   FOLLOW: FOLLOW(S)={$}, FOLLOW(A)={a,b,$}
*/

#define SHIFT    1
#define REDUCE   2
#define ACCEPT   3
#define ERROR    0

#define NUM_STATES   7
#define NUM_TERMS    3   /* a, b, $ */
#define NUM_NT       2   /* S, A */

/* ACTION table  [state][terminal: a=0, b=1, $=2] */
int action[NUM_STATES][NUM_TERMS] = {
/*         a          b          $     */
/* 0 */ {SHIFT*10+3, SHIFT*10+4, ERROR       },
/* 1 */ {ERROR,      ERROR,      ACCEPT      },
/* 2 */ {SHIFT*10+3, SHIFT*10+4, ERROR       },
/* 3 */ {SHIFT*10+3, SHIFT*10+4, ERROR       },
/* 4 */ {REDUCE*100+3, REDUCE*100+3, REDUCE*100+3}, /* r: A->b */
/* 5 */ {ERROR,      ERROR,      REDUCE*100+1},     /* r: S->AA */
/* 6 */ {REDUCE*100+2, REDUCE*100+2, REDUCE*100+2}, /* r: A->aA */
};
/* Encoding: SHIFT*10+state, REDUCE*100+prod, ACCEPT */

/* GOTO table [state][NT: S=0, A=1] */
int goTo[NUM_STATES][NUM_NT] = {
/* 0 */ {1, 2},
/* 1 */ {-1,-1},
/* 2 */ {-1, 5},
/* 3 */ {-1, 6},
/* 4 */ {-1,-1},
/* 5 */ {-1,-1},
/* 6 */ {-1,-1},
};

const char *prodStr[] = {
    "",
    "S -> AA",      /* prod 1 */
    "A -> aA",      /* prod 2 */
    "A -> b",       /* prod 3 */
};
int prodLen[] = {0, 2, 2, 1};  /* lengths of RHS */
int prodNT[]  = {-1, 0, 1, 1}; /* LHS NT index: S=0, A=1 */

char termSym[] = {'a', 'b', '$'};
char ntSym[]   = {'S', 'A'};

int termIdx(char c) {
    for (int i = 0; i < NUM_TERMS; i++) if (termSym[i] == c) return i;
    return -1;
}

/* Stack */
int stateStack[200];
char symStack[200];
int  sp = 0;

void pushState(int s) { stateStack[sp++] = s; }
int  topState()       { return stateStack[sp - 1]; }
void popStates(int n) { sp -= n; }

int main() {
    char input[] = "aabb$";
    int ip = 0;

    printf("SLR Parsing of: aabb\\n\\n");
    printf("%-10s %-15s %-10s\\n", "Stack", "Input", "Action");
    printf("%.40s\\n", "------------------------------------");

    pushState(0);

    while (1) {
        int state = topState();
        int ti    = termIdx(input[ip]);

        /* Print state stack */
        printf("[ ");
        for (int i = 0; i < sp; i++) printf("%d ", stateStack[i]);
        printf("]%-5s", "");

        /* Print input */
        printf("%-15s", input + ip);

        if (ti < 0) { printf("ERROR: bad input\\n"); return 1; }

        int act = action[state][ti];

        if (act == ACCEPT) {
            printf("ACCEPT\\n");
            break;
        } else if (act == ERROR) {
            printf("ERROR\\n");
            return 1;
        } else if (act / 100 == REDUCE) {
            int prod = act % 100;
            printf("Reduce: %s\\n", prodStr[prod]);
            popStates(prodLen[prod]);
            int nt = prodNT[prod];
            int ns = goTo[topState()][nt];
            if (ns < 0) { printf("GOTO ERROR\\n"); return 1; }
            pushState(ns);
        } else if (act / 10 == SHIFT) {
            int ns = act % 10;
            printf("Shift to state %d\\n", ns);
            pushState(ns);
            ip++;
        }
    }

    return 0;
}`;

const VIVA_QS = [
  {
    question: "What distinguishes SLR from canonical LR(1)?",
    answer: "SLR uses FOLLOW sets to decide when to reduce, while canonical LR(1) uses lookahead symbols embedded in each item. SLR has fewer states (same as LR(0)) but more conflicts than LR(1).",
  },
  {
    question: "When does a shift-reduce conflict occur?",
    answer: "A shift-reduce conflict occurs when a state has both a shift action and a reduce action for the same input symbol. In SLR, this happens when the input symbol is in both the terminal after a dot and in FOLLOW of a complete item's LHS.",
  },
  {
    question: "What is the SLR(1) parsing table?",
    answer: "The SLR table has two parts: ACTION[s,a] (what to do when in state s with input a: shift, reduce, or accept) and GOTO[s,A] (next state after reducing to non-terminal A from state s).",
  },
  {
    question: "How do you fill the ACTION table in SLR?",
    answer: "For each state s:\n• If [A→α•aβ] ∈ s and GOTO(s,a)=t: set ACTION[s,a]=shift(t)\n• If [A→α•] ∈ s: for each a ∈ FOLLOW(A), set ACTION[s,a]=reduce(A→α)\n• If [S'→S•] ∈ s: set ACTION[s,$]=accept",
  },
];

export default function SLRParsingPage() {
  return (
    <MainLayout title="SLR Parsing">
      <TopicLayout
        title="SLR Parsing Algorithm"
        difficulty="Advanced"
        estimatedTime="75 min"
        description="Learn the Simple LR parsing algorithm — the first practical bottom-up parser that combines LR(0) automata with FOLLOW sets."
        theory={
          <TheorySection
            blocks={[
              { type: "heading", content: "SLR Parsing" },
              {
                type: "text",
                content: "SLR (Simple LR) parsing is a bottom-up parsing technique that uses the LR(0) automaton and FOLLOW sets to resolve reduce conflicts. It's simpler than full LR(1) but handles more grammars than operator precedence parsers.",
              },
              {
                type: "definition",
                title: "SLR(1) Grammar",
                content: "A grammar is SLR(1) if the constructed SLR parsing table has no conflicts. This requires that for any state s: if both [A→α•aβ] and [B→γ•] are in s, then a ∉ FOLLOW(B), and no two complete items have overlapping FOLLOW sets.",
              },
              {
                type: "algorithm",
                title: "SLR Table Construction",
                content: [
                  "Augment grammar with S' → S",
                  "Build canonical LR(0) collection (item sets I₀..Iₙ)",
                  "For each state Iᵢ and terminal a: if [A→α•aβ]∈Iᵢ and GOTO(Iᵢ,a)=Iⱼ, set ACTION[i,a]=shift(j)",
                  "For each state Iᵢ: if [A→α•]∈Iᵢ (A≠S'), for each a∈FOLLOW(A), set ACTION[i,a]=reduce(A→α)",
                  "For each state Iᵢ: if [S'→S•]∈Iᵢ, set ACTION[i,$]=accept",
                  "For each state Iᵢ and non-terminal A: if GOTO(Iᵢ,A)=Iⱼ, set GOTO[i,A]=j",
                  "Unmarked entries are errors",
                ],
              },
              {
                type: "example",
                title: "SLR Parsing of 'aabb'",
                content: `Stack    Input    Action
[0]      aabb$    Shift → [0,3]
[0,3]    abb$     Shift → [0,3,3]
[0,3,3]  bb$      Shift → [0,3,3,4]
[0,3,3,4] b$      Reduce A→b → [0,3,3], GOTO[3,A]=6
[0,3,3,6] b$      Reduce A→aA → [0,3], GOTO[3,A]=6
[0,3,6]   b$      Shift → [0,3,6,4]   Wait—
... etc. until ACCEPT`,
              },
              {
                type: "note",
                content: "SLR works for many practical programming language grammars but fails for some common constructs like the classic 'if-then-else' ambiguity and some type definitions in C.",
              },
            ]}
            complexity={{ time: "O(n)", space: "O(|states| × |grammar symbols|)" }}
            commonErrors={[
              "Using wrong FOLLOW sets (not fully computed)",
              "Forgetting to handle the augmented start rule for ACCEPT",
              "Missing GOTO entries for non-terminals",
            ]}
          />
        }
        code={<CodeBlock code={SLR_CODE} language="c" filename="slr_parser.c" />}
        visualization={
          <GlassCard className="p-6">
            <h3 className="font-bold text-white mb-4">SLR ACTION & GOTO Table</h3>
            <div className="overflow-x-auto">
              <table className="text-sm font-mono border-collapse">
                <thead>
                  <tr className="text-slate-400">
                    <th className="border border-white/10 px-4 py-2 bg-white/3">State</th>
                    <th className="border border-white/10 px-4 py-2 bg-cyan-500/10 text-cyan-400" colSpan={3}>ACTION</th>
                    <th className="border border-white/10 px-4 py-2 bg-violet-500/10 text-violet-400" colSpan={2}>GOTO</th>
                  </tr>
                  <tr className="text-slate-400 text-xs">
                    <th className="border border-white/10 px-3 py-1 bg-white/3"></th>
                    {["a","b","$"].map(t=><th key={t} className="border border-white/10 px-3 py-1 bg-cyan-500/5">{t}</th>)}
                    {["S","A"].map(n=><th key={n} className="border border-white/10 px-3 py-1 bg-violet-500/5">{n}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["0","s3","s4","","1","2"],
                    ["1","","","acc","",""],
                    ["2","s3","s4","","","5"],
                    ["3","s3","s4","","","6"],
                    ["4","r(A→b)","r(A→b)","r(A→b)","",""],
                    ["5","","","r(S→AA)","",""],
                    ["6","r(A→aA)","r(A→aA)","r(A→aA)","",""],
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-white/6">
                      <td className="border border-white/10 px-3 py-2 text-center text-slate-300 bg-white/3">{row[0]}</td>
                      {row.slice(1,4).map((cell,j) => (
                        <td key={j} className={`border border-white/10 px-3 py-2 text-center text-xs ${
                          cell.startsWith("s") ? "text-cyan-400" :
                          cell.startsWith("r") ? "text-amber-400" :
                          cell === "acc" ? "text-emerald-400 font-bold" : "text-slate-600"
                        }`}>{cell||"-"}</td>
                      ))}
                      {row.slice(4).map((cell,j) => (
                        <td key={j} className="border border-white/10 px-3 py-2 text-center text-violet-300 text-xs">{cell||"-"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        }
        practice={
          <GlassCard className="p-5 max-w-2xl">
            <h3 className="font-bold text-white mb-3">Practice</h3>
            <p className="text-slate-300 text-sm">
              Trace the SLR parse of input <code className="text-indigo-300">baab$</code> using the table above.
            </p>
          </GlassCard>
        }
        viva={<VivaQuestions questions={VIVA_QS} />}
      />
    </MainLayout>
  );
}
