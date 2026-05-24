import { MainLayout } from "@/components/layout/MainLayout";
import { TopicLayout } from "@/components/topics/TopicLayout";
import { TheorySection } from "@/components/topics/TheorySection";
import { VivaQuestions } from "@/components/topics/VivaQuestions";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { GlassCard } from "@/components/ui/GlassCard";

const LL1_TABLE_CODE = `#include <stdio.h>
#include <string.h>
#include <ctype.h>

/* Constructs LL(1) Parsing Table for expression grammar.
   Non-terminals: E(0), E'(1), T(2), T'(3), F(4)
   Terminals:     id(0), +(1), *(2), ((3), )(4), $(5)
   Productions:
     0: E  -> T E'
     1: E' -> + T E'
     2: E' -> eps
     3: T  -> F T'
     4: T' -> * F T'
     5: T' -> eps
     6: F  -> id
     7: F  -> ( E )
*/
#define NUM_NT    5
#define NUM_T     6
#define NONE     -1

const char *ntNames[] = {"E", "E'", "T", "T'", "F"};
const char *tNames[]  = {"id", "+", "*", "(", ")", "$"};
const char *prodStr[] = {
  "E->TE'", "E'->+TE'", "E'->eps",
  "T->FT'", "T'->*FT'", "T'->eps",
  "F->id",  "F->(E)"
};

/* FIRST sets: FIRST[i] = list of terminal indices (255=eps) */
int firstSets[NUM_NT][NUM_T + 1];
int firstCount[NUM_NT];

/* FOLLOW sets */
int followSets[NUM_NT][NUM_T];
int followCount[NUM_NT];

/* Parsing table M[NT][T] = production index or NONE */
int M[NUM_NT][NUM_T];

void initTable() {
    for (int i = 0; i < NUM_NT; i++)
        for (int j = 0; j < NUM_T; j++)
            M[i][j] = NONE;
}

/* Hardcoded FIRST/FOLLOW for the expression grammar */
void computeSets() {
    /* FIRST(E) = FIRST(T) = FIRST(F) = {id, (} = {0, 3} */
    firstSets[0][0] = 0; firstSets[0][1] = 3; firstCount[0] = 2;
    /* FIRST(E') = {+, eps} = {1, 255} */
    firstSets[1][0] = 1; firstSets[1][1] = 255; firstCount[1] = 2;
    /* FIRST(T) = {id,(} */
    firstSets[2][0] = 0; firstSets[2][1] = 3; firstCount[2] = 2;
    /* FIRST(T') = {*, eps} = {2, 255} */
    firstSets[3][0] = 2; firstSets[3][1] = 255; firstCount[3] = 2;
    /* FIRST(F) = {id, (} */
    firstSets[4][0] = 0; firstSets[4][1] = 3; firstCount[4] = 2;

    /* FOLLOW(E) = {), $} = {4, 5} */
    followSets[0][0] = 4; followSets[0][1] = 5; followCount[0] = 2;
    /* FOLLOW(E') = {), $} */
    followSets[1][0] = 4; followSets[1][1] = 5; followCount[1] = 2;
    /* FOLLOW(T) = {+, ), $} = {1, 4, 5} */
    followSets[2][0] = 1; followSets[2][1] = 4; followSets[2][2] = 5; followCount[2] = 3;
    /* FOLLOW(T') = {+, ), $} */
    followSets[3][0] = 1; followSets[3][1] = 4; followSets[3][2] = 5; followCount[3] = 3;
    /* FOLLOW(F) = {*, +, ), $} = {2, 1, 4, 5} */
    followSets[4][0] = 2; followSets[4][1] = 1; followSets[4][2] = 4; followSets[4][3] = 5;
    followCount[4] = 4;
}

void fillTable() {
    /* Rules:
       Production 0: E->TE'   FIRST(TE')={id,(}  -> M[E,id]=0, M[E,(]=0
       Production 1: E'->+TE' FIRST=+             -> M[E',+]=1
       Production 2: E'->eps  FIRST={eps}          -> M[E',a]=2 for a in FOLLOW(E')
       Production 3: T->FT'   FIRST={id,(}         -> M[T,id]=3, M[T,(]=3
       Production 4: T'->*FT' FIRST=*              -> M[T',*]=4
       Production 5: T'->eps  FIRST={eps}          -> M[T',a]=5 for a in FOLLOW(T')
       Production 6: F->id    FIRST=id             -> M[F,id]=6
       Production 7: F->(E)   FIRST=(              -> M[F,(]=7
    */
    /* E -> TE' */
    M[0][0] = 0; M[0][3] = 0;
    /* E' -> +TE' */
    M[1][1] = 1;
    /* E' -> eps: for each a in FOLLOW(E') = {), $} */
    M[1][4] = 2; M[1][5] = 2;
    /* T -> FT' */
    M[2][0] = 3; M[2][3] = 3;
    /* T' -> *FT' */
    M[3][2] = 4;
    /* T' -> eps: for each a in FOLLOW(T') = {+, ), $} */
    M[3][1] = 5; M[3][4] = 5; M[3][5] = 5;
    /* F -> id */
    M[4][0] = 6;
    /* F -> (E) */
    M[4][3] = 7;
}

void printTable() {
    printf("\\n=== LL(1) Parsing Table M[NT][Terminal] ===\\n\\n");
    printf("%-5s", "NT");
    for (int j = 0; j < NUM_T; j++)
        printf("%-14s", tNames[j]);
    printf("\\n");
    printf("%.85s\\n", "-------------------------------------------------------------------------------------");

    for (int i = 0; i < NUM_NT; i++) {
        printf("%-5s", ntNames[i]);
        for (int j = 0; j < NUM_T; j++) {
            if (M[i][j] == NONE)
                printf("%-14s", "error");
            else
                printf("%-14s", prodStr[M[i][j]]);
        }
        printf("\\n");
    }
}

int main() {
    computeSets();
    initTable();
    fillTable();

    printf("Expression Grammar FIRST/FOLLOW:\\n");
    for (int i = 0; i < NUM_NT; i++) {
        printf("FIRST(%-3s)  = { ", ntNames[i]);
        for (int j = 0; j < firstCount[i]; j++)
            printf("%s ", firstSets[i][j] == 255 ? "eps" : tNames[firstSets[i][j]]);
        printf("}\\n");
    }
    printf("\\n");
    for (int i = 0; i < NUM_NT; i++) {
        printf("FOLLOW(%-3s) = { ", ntNames[i]);
        for (int j = 0; j < followCount[i]; j++)
            printf("%s ", tNames[followSets[i][j]]);
        printf("}\\n");
    }

    printTable();
    return 0;
}`;

const VIVA_QS = [
  {
    question: "How is M[A, a] filled in the LL(1) table?",
    answer: "For production A→α: add it to M[A,a] for each terminal a in FIRST(α). If ε ∈ FIRST(α), also add it to M[A,b] for each terminal b in FOLLOW(A) (including $ if applicable).",
  },
  {
    question: "What indicates that a grammar is not LL(1)?",
    answer: "If any cell M[A,a] contains more than one production, the grammar has an LL(1) conflict. This can be due to left recursion, left factoring issues, or genuine ambiguity.",
  },
  {
    question: "What is left factoring and when is it needed?",
    answer: "Left factoring is required when two productions for the same non-terminal start with the same symbol: A → αβ | αγ. Factor out α: A → αA', A' → β | γ. Without this, M[A, FIRST(α)] would have two entries.",
  },
];

export default function LL1TablePage() {
  return (
    <MainLayout title="LL(1) Parsing Table">
      <TopicLayout
        title="LL(1) Parsing Table Construction"
        difficulty="Intermediate"
        estimatedTime="45 min"
        description="Build the predictive parsing table from FIRST and FOLLOW sets — the lookup structure that drives the LL(1) parser."
        theory={
          <TheorySection
            blocks={[
              { type: "heading", content: "LL(1) Parsing Table" },
              {
                type: "text",
                content: "The LL(1) parsing table M[A,a] maps each non-terminal A and lookahead token a to the production that should be applied. It is the core data structure of the non-recursive predictive parser.",
              },
              {
                type: "algorithm",
                title: "Table Construction Algorithm",
                content: [
                  "For each production A → α in the grammar:",
                  "  For each terminal a in FIRST(α): add A→α to M[A, a]",
                  "  If ε ∈ FIRST(α):",
                  "    For each terminal b in FOLLOW(A): add A→α to M[A, b]",
                  "    If $ ∈ FOLLOW(A): add A→α to M[A, $]",
                  "All remaining entries are error entries",
                ],
              },
              {
                type: "example",
                title: "LL(1) Table for Expression Grammar",
                content: `         id        +         *         (         )         $
  E      E→TE'                   E→TE'
  E'               E'→+TE'                  E'→ε      E'→ε
  T      T→FT'                   T→FT'
  T'               T'→ε     T'→*FT'          T'→ε     T'→ε
  F      F→id                    F→(E)`,
              },
              {
                type: "note",
                content: "Empty entries in the table are error entries. When the parser encounters one during parsing, it calls the error recovery routine.",
              },
            ]}
            complexity={{ time: "O(|Grammar| × |FIRST+FOLLOW|)", space: "O(|NT| × |T|)" }}
            commonErrors={[
              "Not computing complete FIRST/FOLLOW sets before filling table",
              "Forgetting epsilon productions in FOLLOW propagation",
            ]}
          />
        }
        code={<CodeBlock code={LL1_TABLE_CODE} language="c" filename="ll1_table.c" />}
        algorithm={
          <TheorySection
            blocks={[
              {
                type: "algorithm",
                title: "Algorithm: LL(1) Parsing Table Construction",
                content: [
                  "Prerequisite: compute FIRST and FOLLOW sets for all non-terminals",
                  "Initialize: set M[A, a] = error for all non-terminals A and terminals a",
                  "For each production A → α in the grammar:",
                  "  For each terminal a ∈ FIRST(α): add A → α to M[A, a]",
                  "  If ε ∈ FIRST(α):",
                  "    For each terminal b ∈ FOLLOW(A): add A → α to M[A, b]",
                  "    If $ ∈ FOLLOW(A): add A → α to M[A, $]",
                  "If any cell M[A, a] contains more than one production: grammar is NOT LL(1)",
                ],
              },
              {
                type: "note",
                content: "A conflict in the table (two productions in one cell) means the grammar is ambiguous, left-recursive, or requires left factoring.",
              },
            ]}
            complexity={{ time: "O(|G| × (|T| + |NT|))", space: "O(|NT| × |T|)" }}
          />
        }
        visualization={
          <GlassCard className="p-5">
            <h3 className="font-bold text-white mb-4">LL(1) Parsing Table</h3>
            <div className="overflow-x-auto">
              <table className="text-xs font-mono border-collapse">
                <thead>
                  <tr>
                    <th className="border border-white/10 px-3 py-2 bg-white/3 text-slate-400"></th>
                    {["id","+","*","(",")","\$"].map(t=>(
                      <th key={t} className="border border-white/10 px-3 py-2 bg-cyan-500/8 text-cyan-400">{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["E","E→TE'","","","E→TE'","",""],
                    ["E'","","E'→+TE'","","","E'→ε","E'→ε"],
                    ["T","T→FT'","","","T→FT'","",""],
                    ["T'","","T'→ε","T'→*FT'","","T'→ε","T'→ε"],
                    ["F","F→id","","","F→(E)","",""],
                  ].map((row,i)=>(
                    <tr key={i}>
                      <td className="border border-white/10 px-3 py-2 text-violet-400 font-bold bg-white/3">{row[0]}</td>
                      {row.slice(1).map((cell,j)=>(
                        <td key={j} className={`border border-white/10 px-3 py-2 text-center ${cell?"text-slate-200":"text-slate-700"}`}>
                          {cell||"err"}
                        </td>
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
              Construct the LL(1) parsing table for the grammar:<br/>
              <code className="text-indigo-300">S → aAB | b</code><br/>
              <code className="text-indigo-300">A → cA | ε</code><br/>
              <code className="text-indigo-300">B → dB | ε</code>
            </p>
          </GlassCard>
        }
        viva={<VivaQuestions questions={VIVA_QS} />}
      />
    </MainLayout>
  );
}
