import { MainLayout } from "@/components/layout/MainLayout";
import { TopicLayout } from "@/components/topics/TopicLayout";
import { TheorySection } from "@/components/topics/TheorySection";
import { VivaQuestions } from "@/components/topics/VivaQuestions";
import { FirstFollowViz } from "@/components/visualizations/FirstFollowViz";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { GlassCard } from "@/components/ui/GlassCard";

const FIRST_FOLLOW_CODE = `#include <stdio.h>
#include <string.h>
#include <ctype.h>

#define MAX_NT     10
#define MAX_T      20
#define MAX_PROD   30

char nonTerminals[MAX_NT];
int  ntCount = 0;

char firstSets[MAX_NT][MAX_T];
int  firstCount[MAX_NT];

char followSets[MAX_NT][MAX_T];
int  followCount[MAX_NT];

struct Production {
    char lhs;
    char rhs[50];
} prods[MAX_PROD];
int prodCount = 0;

/* ---- Utility functions ---- */
int ntIndex(char c) {
    for (int i = 0; i < ntCount; i++)
        if (nonTerminals[i] == c) return i;
    return -1;
}

void addFirst(int i, char c) {
    for (int j = 0; j < firstCount[i]; j++)
        if (firstSets[i][j] == c) return;   /* already present */
    firstSets[i][firstCount[i]++] = c;
}

void addFollow(int i, char c) {
    for (int j = 0; j < followCount[i]; j++)
        if (followSets[i][j] == c) return;
    followSets[i][followCount[i]++] = c;
}

int hasEps(int i) {   /* Check if epsilon in FIRST(i) */
    for (int j = 0; j < firstCount[i]; j++)
        if (firstSets[i][j] == '#') return 1;
    return 0;
}

/* ---- FIRST computation (iterative until no change) ---- */
void computeFirst() {
    int changed;
    do {
        changed = 0;
        for (int p = 0; p < prodCount; p++) {
            char A = prods[p].lhs;
            int  ai = ntIndex(A);
            char *B = prods[p].rhs;

            /* epsilon production */
            if (B[0] == '#') {
                int prev = firstCount[ai];
                addFirst(ai, '#');
                if (firstCount[ai] > prev) changed = 1;
                continue;
            }

            int allEps = 1;
            for (int j = 0; B[j]; j++) {
                if (isupper(B[j])) {
                    int bi = ntIndex(B[j]);
                    int prev = firstCount[ai];
                    /* Add FIRST(B[j]) - {eps} to FIRST(A) */
                    for (int k = 0; k < firstCount[bi]; k++)
                        if (firstSets[bi][k] != '#')
                            addFirst(ai, firstSets[bi][k]);
                    if (firstCount[ai] > prev) changed = 1;
                    if (!hasEps(bi)) { allEps = 0; break; }
                } else {
                    int prev = firstCount[ai];
                    addFirst(ai, B[j]);
                    if (firstCount[ai] > prev) changed = 1;
                    allEps = 0;
                    break;
                }
            }
            if (allEps) {
                int prev = firstCount[ai];
                addFirst(ai, '#');
                if (firstCount[ai] > prev) changed = 1;
            }
        }
    } while (changed);
}

/* ---- FOLLOW computation ---- */
void computeFollow(char startSym) {
    addFollow(ntIndex(startSym), '$');   /* Rule 1: $ in FOLLOW(start) */

    int changed;
    do {
        changed = 0;
        for (int p = 0; p < prodCount; p++) {
            char A = prods[p].lhs;
            int  ai = ntIndex(A);
            char *B = prods[p].rhs;

            for (int j = 0; B[j]; j++) {
                if (!isupper(B[j])) continue;
                int bi = ntIndex(B[j]);

                /* Look at suffix B[j+1..] */
                int allEps = 1;
                for (int k = j + 1; B[k]; k++) {
                    if (isupper(B[k])) {
                        int ci = ntIndex(B[k]);
                        int prev = followCount[bi];
                        /* Add FIRST(B[k]) - {eps} to FOLLOW(B[j]) */
                        for (int m = 0; m < firstCount[ci]; m++)
                            if (firstSets[ci][m] != '#')
                                addFollow(bi, firstSets[ci][m]);
                        if (followCount[bi] > prev) changed = 1;
                        if (!hasEps(ci)) { allEps = 0; break; }
                    } else {
                        int prev = followCount[bi];
                        addFollow(bi, B[k]);
                        if (followCount[bi] > prev) changed = 1;
                        allEps = 0;
                        break;
                    }
                }
                /* If suffix derives eps (or B[j] is last), add FOLLOW(A) */
                if (allEps) {
                    int prev = followCount[bi];
                    for (int m = 0; m < followCount[ai]; m++)
                        addFollow(bi, followSets[ai][m]);
                    if (followCount[bi] > prev) changed = 1;
                }
            }
        }
    } while (changed);
}

/* ---- Main ---- */
int main() {
    /* Grammar:  E->TE' | E'->#|+TE' | T->FT' | T'->#|*FT' | F->id|(E) */
    /* Using: E'=e, T'=t, # = epsilon, i = id                           */
    char *grammar[] = {
        "E-Ter",   /* E  -> T E'  (e = E') */
        "e-#",     /* E' -> eps   */
        "e-+Te",   /* E' -> +TE'  */
        "T-Ftr",   /* T  -> F T'  (t = T') */
        "t-#",     /* T' -> eps   */
        "t-*Ft",   /* T' -> *FT'  */
        "F-i",     /* F  -> id    */
        "F-(E)"    /* F  -> (E)   */
    };
    /* Build production list */
    prodCount = 8;
    for (int i = 0; i < prodCount; i++) {
        prods[i].lhs = grammar[i][0];
        strcpy(prods[i].rhs, grammar[i] + 2);
    }
    /* Non-terminals */
    char nts[] = {'E', 'e', 'T', 't', 'F'};
    ntCount = 5;
    for (int i = 0; i < ntCount; i++) nonTerminals[i] = nts[i];

    computeFirst();
    computeFollow('E');

    const char *names[] = {"E", "E'", "T", "T'", "F"};
    printf("\\n=== FIRST Sets ===\\n");
    for (int i = 0; i < ntCount; i++) {
        printf("FIRST(%-2s) = { ", names[i]);
        for (int j = 0; j < firstCount[i]; j++) {
            char c = firstSets[i][j];
            printf("%s ", c == 'i' ? "id" : c == '#' ? "eps" : (char[]){c,0});
        }
        printf("}\\n");
    }

    printf("\\n=== FOLLOW Sets ===\\n");
    for (int i = 0; i < ntCount; i++) {
        printf("FOLLOW(%-2s) = { ", names[i]);
        for (int j = 0; j < followCount[i]; j++)
            printf("%c ", followSets[i][j]);
        printf("}\\n");
    }
    return 0;
}`;

const VIVA_QS = [
  {
    question: "What is the FIRST set of a non-terminal?",
    answer: "FIRST(A) is the set of terminals that can appear as the first symbol of any string derived from A. If A can derive ε (empty string), then ε is also in FIRST(A).",
  },
  {
    question: "What is the FOLLOW set of a non-terminal?",
    answer: "FOLLOW(A) is the set of terminals that can appear immediately to the right of A in any sentential form. The end-marker $ is in FOLLOW of the start symbol.",
  },
  {
    question: "When is ε included in FIRST(A)?",
    answer: "ε is included in FIRST(A) when A can derive the empty string — either directly (A → ε production) or through a chain of non-terminals that all derive ε.",
  },
  {
    question: "How are FIRST and FOLLOW sets used in LL(1) parsing?",
    answer: "They are used to fill the LL(1) parsing table M[A,a]. Production A→α is entered in M[A,a] for each a ∈ FIRST(α). If ε ∈ FIRST(α), also add it for each a ∈ FOLLOW(A).",
  },
  {
    question: "What is the rule for computing FOLLOW(B) from A → αBβ?",
    answer: "Add FIRST(β) − {ε} to FOLLOW(B). If ε ∈ FIRST(β), also add FOLLOW(A) to FOLLOW(B). If B is at the end (β is empty), add FOLLOW(A).",
  },
  {
    question: "Why do we need iterative computation for FIRST/FOLLOW?",
    answer: "Because the sets can depend on each other in a circular way (mutual recursion in the grammar). We repeat until no more changes occur — a fixed-point iteration.",
  },
];

const PRACTICE_CONTENT = (
  <div className="space-y-4 max-w-3xl">
    <h3 className="text-lg font-bold text-white">Practice Problems</h3>
    {[
      {
        q: "Compute FIRST and FOLLOW for: S → AB, A → a | ε, B → bC | ε, C → c",
        hint: "FIRST(A)={a,ε}, so include FIRST(B) in FIRST(S). FOLLOW uses chain rules.",
      },
      {
        q: "For grammar: E → E+T | T, T → T*F | F, F → (E) | id — is this suitable for LL(1) parsing?",
        hint: "Check for left recursion first. LL(1) requires no left recursion and no left factoring issues.",
      },
      {
        q: "Compute FIRST({+TE'}) given FIRST(T)={(,id} and + is a terminal",
        hint: "FIRST of a string starts with the terminal or FIRST of the first non-terminal if terminal is absent.",
      },
    ].map((p, i) => (
      <GlassCard key={i} className="p-5">
        <div className="text-sm font-medium text-slate-200 mb-2">Q{i + 1}. {p.q}</div>
        <div className="text-xs text-amber-300/70 flex items-center gap-1">
          💡 Hint: {p.hint}
        </div>
      </GlassCard>
    ))}
  </div>
);

export default function FirstFollowPage() {
  return (
    <MainLayout title="FIRST & FOLLOW Sets">
      <TopicLayout
        title="FIRST and FOLLOW Sets"
        difficulty="Beginner"
        estimatedTime="45 min"
        description="Compute FIRST and FOLLOW sets for Context-Free Grammars — the foundational step for constructing LL(1) and predictive parsing tables."
        theory={
          <TheorySection
            blocks={[
              {
                type: "heading",
                content: "What are FIRST and FOLLOW Sets?",
              },
              {
                type: "text",
                content:
                  "FIRST and FOLLOW sets are computed from a Context-Free Grammar (CFG) and are essential for building top-down parsers. They help determine which production to apply when the parser sees a lookahead token.",
              },
              {
                type: "definition",
                title: "FIRST Set",
                content:
                  "FIRST(α) = the set of terminals that can begin strings derived from α. If α can derive ε (empty string), then ε ∈ FIRST(α). For a terminal a: FIRST(a) = {a}.",
              },
              {
                type: "definition",
                title: "FOLLOW Set",
                content:
                  "FOLLOW(A) = the set of terminals that can appear immediately to the right of A in any sentential form of the grammar. For the start symbol S: $ ∈ FOLLOW(S).",
              },
              {
                type: "heading",
                content: "Algorithm to Compute FIRST",
              },
              {
                type: "algorithm",
                title: "FIRST Set Computation",
                content: [
                  "If X is a terminal: FIRST(X) = {X}",
                  "If X → ε: add ε to FIRST(X)",
                  "If X → Y₁Y₂...Yₖ: add FIRST(Y₁)-{ε} to FIRST(X)",
                  "If ε ∈ FIRST(Y₁): also add FIRST(Y₂)-{ε}, and so on",
                  "If all Y₁..Yₖ can derive ε: add ε to FIRST(X)",
                  "Repeat until no set changes (fixed-point iteration)",
                ],
              },
              {
                type: "heading",
                content: "Algorithm to Compute FOLLOW",
              },
              {
                type: "algorithm",
                title: "FOLLOW Set Computation",
                content: [
                  "Place $ in FOLLOW(S) where S is the start symbol",
                  "For each production A → αBβ: add FIRST(β)-{ε} to FOLLOW(B)",
                  "For each production A → αBβ where ε ∈ FIRST(β): add FOLLOW(A) to FOLLOW(B)",
                  "For each production A → αB: add FOLLOW(A) to FOLLOW(B)",
                  "Repeat until no FOLLOW set changes",
                ],
              },
              {
                type: "example",
                title: "Worked Example: Expression Grammar",
                content: `Grammar:
  E  → T E'
  E' → + T E' | ε
  T  → F T'
  T' → * F T' | ε
  F  → ( E ) | id

FIRST Sets:
  FIRST(F)  = { (, id }
  FIRST(T') = { *, ε }
  FIRST(T)  = { (, id }           (from FIRST(F), T'≠ε so stop)
  FIRST(E') = { +, ε }
  FIRST(E)  = { (, id }           (from FIRST(T), E'≠ε so stop)

FOLLOW Sets:
  FOLLOW(E)  = { $, ) }           ($ from start; ) from F→(E))
  FOLLOW(E') = { $, ) }           (E→TE', E' at end → FOLLOW(E))
  FOLLOW(T)  = { +, $, ) }        (FIRST(E')-{ε}={+}; ε∈FIRST(E')→FOLLOW(E))
  FOLLOW(T') = { +, $, ) }        (T→FT', T' at end → FOLLOW(T))
  FOLLOW(F)  = { *, +, $, ) }     (FIRST(T')-{ε}={*}; ε∈FIRST(T')→FOLLOW(T))`,
              },
              {
                type: "note",
                content:
                  "A grammar is LL(1) if and only if the parsing table has no conflicts — i.e., for each non-terminal A and each terminal a, there is at most one production in M[A, a].",
              },
            ]}
            complexity={{ time: "O(n × |Grammar|)", space: "O(n × |T|)" }}
            commonErrors={[
              "Forgetting to add $ to FOLLOW of the start symbol",
              "Not propagating FOLLOW through epsilon-producing non-terminals",
              "Stopping iteration too early before the sets stabilize",
              "Confusing FIRST of a string vs FIRST of a single symbol",
              "Including ε in FOLLOW sets (ε is never in a FOLLOW set)",
            ]}
          />
        }
        code={<CodeBlock code={FIRST_FOLLOW_CODE} language="c" filename="first_follow.c" />}
        algorithm={
          <TheorySection
            blocks={[
              {
                type: "algorithm",
                title: "Algorithm 1: Compute FIRST Sets",
                content: [
                  "Initialize FIRST(X) = {} for every grammar symbol X",
                  "For each terminal a: FIRST(a) = {a}",
                  "For each production X → ε: add ε to FIRST(X)",
                  "For each production X → Y₁Y₂...Yₖ: add FIRST(Y₁) − {ε} to FIRST(X)",
                  "If ε ∈ FIRST(Y₁): also add FIRST(Y₂) − {ε} to FIRST(X), and so on",
                  "If ε ∈ FIRST(Yᵢ) for all i = 1..k: add ε to FIRST(X)",
                  "Repeat steps 3–6 until no FIRST set changes (fixed-point iteration)",
                ],
              },
              {
                type: "algorithm",
                title: "Algorithm 2: Compute FOLLOW Sets",
                content: [
                  "Initialize FOLLOW(S) = {$} (S is the start symbol); all others = {}",
                  "For each production A → αBβ: add FIRST(β) − {ε} to FOLLOW(B)",
                  "For each production A → αBβ where ε ∈ FIRST(β): add FOLLOW(A) to FOLLOW(B)",
                  "For each production A → αB (B at the end): add FOLLOW(A) to FOLLOW(B)",
                  "Repeat steps 2–4 until no FOLLOW set changes",
                ],
              },
              {
                type: "note",
                content: "ε (epsilon) is never a member of any FOLLOW set. FOLLOW sets only contain terminals and $.",
              },
            ]}
            complexity={{ time: "O(|G|² × |T|)", space: "O(|NT| × |T|)" }}
          />
        }
        visualization={<FirstFollowViz />}
        practice={PRACTICE_CONTENT}
        viva={<VivaQuestions questions={VIVA_QS} />}
      />
    </MainLayout>
  );
}
