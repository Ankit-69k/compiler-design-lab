import { MainLayout } from "@/components/layout/MainLayout";
import { TopicLayout } from "@/components/topics/TopicLayout";
import { TheorySection } from "@/components/topics/TheorySection";
import { VivaQuestions } from "@/components/topics/VivaQuestions";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { GlassCard } from "@/components/ui/GlassCard";

const CODE = `#include <stdio.h>
#include <string.h>
#include <ctype.h>

#define MAX_PRODS   30
#define MAX_RHS     10
#define MAX_LEN     50

/* ---- Data Structures ---- */
typedef struct {
    char lhs;
    char rhs[MAX_RHS][MAX_LEN];
    int  count;
} NTProds;

NTProds prods[MAX_PRODS];
int prodCount = 0;

int findNT(char c) {
    for (int i = 0; i < prodCount; i++)
        if (prods[i].lhs == c) return i;
    return -1;
}

void addRule(char lhs, const char *rhs) {
    int idx = findNT(lhs);
    if (idx == -1) {
        prods[prodCount].lhs = lhs;
        prods[prodCount].count = 0;
        idx = prodCount++;
    }
    strcpy(prods[idx].rhs[prods[idx].count++], rhs);
}

/* ---- Direct Left Recursion Removal ---- */
/* A -> Aalpha | beta  becomes  A -> betaA' and A' -> alphaA' | eps */
NTProds newProds[MAX_PRODS];
int newProdCount = 0;

void removeDirectLR(int idx) {
    char A = prods[idx].lhs;
    char recursive[MAX_RHS][MAX_LEN];
    char nonRec[MAX_RHS][MAX_LEN];
    int recCnt = 0, nonRecCnt = 0;

    for (int i = 0; i < prods[idx].count; i++) {
        const char *rhs = prods[idx].rhs[i];
        if (rhs[0] == A)   /* A -> A alpha */
            strcpy(recursive[recCnt++], rhs + 1);
        else               /* A -> beta    */
            strcpy(nonRec[nonRecCnt++], rhs);
    }

    if (recCnt == 0) {
        /* No left recursion in A — copy as is */
        newProds[newProdCount] = prods[idx];
        newProdCount++;
        return;
    }

    /* New non-terminal A' (represented as lowercase) */
    char Ap = tolower(A);
    char ApStr[3] = {Ap, '\0'};

    /* A -> beta A' */
    int ni = newProdCount++;
    newProds[ni].lhs   = A;
    newProds[ni].count = 0;
    if (nonRecCnt == 0) {
        /* A has NO non-recursive alternative — rare edge case */
        char tmp[MAX_LEN];
        sprintf(tmp, "%s", ApStr);
        strcpy(newProds[ni].rhs[newProds[ni].count++], tmp);
    }
    for (int i = 0; i < nonRecCnt; i++) {
        char tmp[MAX_LEN];
        sprintf(tmp, "%s%s", nonRec[i], ApStr);
        strcpy(newProds[ni].rhs[newProds[ni].count++], tmp);
    }

    /* A' -> alpha A' | eps */
    int nj = newProdCount++;
    newProds[nj].lhs   = Ap;
    newProds[nj].count = 0;
    for (int i = 0; i < recCnt; i++) {
        char tmp[MAX_LEN];
        sprintf(tmp, "%s%s", recursive[i], ApStr);
        strcpy(newProds[nj].rhs[newProds[nj].count++], tmp);
    }
    strcpy(newProds[nj].rhs[newProds[nj].count++], "#"); /* epsilon */
}

void printGrammar(NTProds *g, int cnt) {
    const char *epsStr = "epsilon";
    for (int i = 0; i < cnt; i++) {
        char lhs = g[i].lhs;
        if (lhs >= 'a' && lhs <= 'z' && lhs != 'i') {
            /* prime notation: e -> E' */
            printf("%c' -> ", toupper(lhs));
        } else {
            printf("%c  -> ", lhs);
        }
        for (int j = 0; j < g[i].count; j++) {
            const char *r = g[i].rhs[j];
            if (r[0] == '#') printf("%s", epsStr);
            else              printf("%s", r);
            if (j < g[i].count - 1) printf(" | ");
        }
        printf("\\n");
    }
}

int main() {
    printf("=== Left Recursion Removal ===\\n\\n");

    /* Grammar with left recursion:
       E -> E + T | E - T | T
       T -> T * F | T / F | F
       F -> ( E ) | id              */
    addRule('E', "E+T");
    addRule('E', "E-T");
    addRule('E', "T");
    addRule('T', "T*F");
    addRule('T', "T/F");
    addRule('T', "F");
    addRule('F', "(E)");
    addRule('F', "id");

    printf("--- Original Grammar ---\\n");
    printGrammar(prods, prodCount);

    for (int i = 0; i < prodCount; i++)
        removeDirectLR(i);

    printf("\\n--- After Removing Left Recursion ---\\n");
    printGrammar(newProds, newProdCount);

    printf("\\n--- Explanation ---\\n");
    printf("E  -> E+T | E-T | T  became:\\n");
    printf("   E  -> TE'  (non-recursive alternatives + A')\\n");
    printf("   E' -> +TE' | -TE' | epsilon\\n\\n");
    printf("T  -> T*F | T/F | F  became:\\n");
    printf("   T  -> FT'\\n");
    printf("   T' -> *FT' | /FT' | epsilon\\n");
    printf("\\nF has no left recursion, copied as is.\\n");

    return 0;
}`;

const VIVA_QS = [
  {
    question: "What is direct left recursion?",
    answer: "A grammar has direct left recursion if there exists a production A → Aα for some string α. It means A appears as the leftmost symbol of its own production.",
  },
  {
    question: "What is indirect left recursion?",
    answer: "Indirect left recursion occurs when A derives a sentential form starting with A through two or more steps: A ⇒ Bα ⇒ Aβα. The algorithm for removing it first orders non-terminals, then eliminates direct recursion iteratively.",
  },
  {
    question: "Why is left recursion problematic for top-down parsers?",
    answer: "A recursive descent parser implementing A → Aα will call itself recursively without consuming any input, causing an infinite loop. Table-driven LL(k) parsers also fail because they cannot handle left-recursive grammars.",
  },
  {
    question: "What is the general formula for removing left recursion?",
    answer: "For A → Aα₁ | Aα₂ | ... | β₁ | β₂ | ..., replace with:\nA → β₁A' | β₂A' | ...\nA' → α₁A' | α₂A' | ... | ε\nWhere A' is a fresh non-terminal.",
  },
  {
    question: "Does removing left recursion change the language of the grammar?",
    answer: "No. The transformed grammar generates exactly the same language as the original. Only the structural form of derivation trees changes (right recursion instead of left).",
  },
];

const LR_VIZ = (
  <div className="space-y-5 max-w-4xl">
    <h3 className="text-lg font-bold text-white">Left Recursion Removal — Step by Step</h3>
    {[
      {
        step: 1,
        original: "E → E+T | E-T | T",
        alpha: ["α₁ = +T", "α₂ = -T"],
        beta: ["β₁ = T"],
        result: ["E  → T E'", "E' → +T E' | -T E' | ε"],
        color: "indigo",
      },
      {
        step: 2,
        original: "T → T*F | T/F | F",
        alpha: ["α₁ = *F", "α₂ = /F"],
        beta: ["β₁ = F"],
        result: ["T  → F T'", "T' → *F T' | /F T' | ε"],
        color: "violet",
      },
      {
        step: 3,
        original: "F → (E) | id",
        alpha: [],
        beta: ["β₁ = (E)", "β₂ = id"],
        result: ["F → (E) | id  [No left recursion]"],
        color: "emerald",
      },
    ].map((item) => (
      <GlassCard key={item.step} className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-sm flex items-center justify-center">
            {item.step}
          </span>
          <span className="font-mono text-white font-semibold">{item.original}</span>
        </div>
        {item.alpha.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-slate-500 uppercase mb-1.5">Recursive parts (α)</div>
            <div className="flex gap-2 flex-wrap">
              {item.alpha.map((a) => (
                <span key={a} className="px-2 py-1 bg-rose-500/15 text-rose-300 rounded font-mono text-sm border border-rose-500/20">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="mb-4">
          <div className="text-xs text-slate-500 uppercase mb-1.5">Non-recursive parts (β)</div>
          <div className="flex gap-2 flex-wrap">
            {item.beta.map((b) => (
              <span key={b} className="px-2 py-1 bg-cyan-500/15 text-cyan-300 rounded font-mono text-sm border border-cyan-500/20">
                {b}
              </span>
            ))}
          </div>
        </div>
        <div className="border-t border-white/8 pt-3">
          <div className="text-xs text-slate-500 uppercase mb-1.5">Result</div>
          <div className="space-y-1">
            {item.result.map((r) => (
              <div key={r} className="font-mono text-emerald-300 text-sm">{r}</div>
            ))}
          </div>
        </div>
      </GlassCard>
    ))}
  </div>
);

export default function LeftRecursionPage() {
  return (
    <MainLayout title="Left Recursion Removal">
      <TopicLayout
        title="Left Recursion Removal"
        difficulty="Beginner"
        estimatedTime="30 min"
        description="Learn how to identify and eliminate left recursion from CFGs to enable top-down parsing."
        theory={
          <TheorySection
            blocks={[
              { type: "heading", content: "What is Left Recursion?" },
              {
                type: "text",
                content:
                  "A grammar is left-recursive if a non-terminal A can derive a sentential form with A as the leftmost symbol. This causes infinite loops in top-down parsers.",
              },
              {
                type: "definition",
                title: "Direct Left Recursion",
                content: "A grammar has direct left recursion if it contains production A → Aα for some non-empty string α. The non-terminal appears at the leftmost position of the right-hand side.",
              },
              {
                type: "definition",
                title: "Indirect Left Recursion",
                content: "Indirect left recursion occurs when: A ⇒ B...⇒ A... in two or more steps. For example: A → Bα, B → Aβ creates a cycle.",
              },
              {
                type: "algorithm",
                title: "Direct Left Recursion Removal",
                content: [
                  "Group all productions for A: A → Aα₁ | Aα₂ | ... | β₁ | β₂ | ...",
                  "Identify recursive productions (start with A) and non-recursive ones",
                  "Create a new non-terminal A'",
                  "Replace: A → β₁A' | β₂A' | ...",
                  "And: A' → α₁A' | α₂A' | ... | ε",
                  "The new grammar generates the same language without left recursion",
                ],
              },
              {
                type: "example",
                title: "Example",
                content: `Original:  E → E + T | T
           (Direct left recursion: E → E + T)

Result:    E  → T E'
           E' → + T E' | ε

Derivation of T + T + T:
   E ⇒ T E' ⇒ T + T E' ⇒ T + T + T E' ⇒ T + T + T`,
              },
              {
                type: "note",
                content: "Left recursion removal only helps with top-down parsing. Bottom-up parsers (like LR parsers) can handle left-recursive grammars just fine.",
              },
            ]}
            complexity={{ time: "O(n³) for indirect, O(n) for direct", space: "O(n)" }}
            commonErrors={[
              "Forgetting to add ε production for the new A' non-terminal",
              "Mixing up α (recursive suffix) and β (non-recursive alternatives)",
              "Missing indirect recursion when only checking direct recursion",
            ]}
          />
        }
        code={<CodeBlock code={CODE} language="c" filename="left_recursion.c" />}
        algorithm={
          <TheorySection
            blocks={[
              {
                type: "algorithm",
                title: "Algorithm 1: Remove Direct Left Recursion from A",
                content: [
                  "Group all productions for A: A → Aα₁ | Aα₂ | ... | β₁ | β₂ | ...",
                  "Separate recursive alternatives (start with A) and non-recursive alternatives (βᵢ)",
                  "Create a new non-terminal A'",
                  "Replace A's productions with: A → β₁A' | β₂A' | ... (non-recursive, followed by A')",
                  "Add: A' → α₁A' | α₂A' | ... | ε (recursive alternatives shifted to A')",
                  "Delete the original left-recursive productions",
                ],
              },
              {
                type: "algorithm",
                title: "Algorithm 2: Remove All Left Recursion (Including Indirect)",
                content: [
                  "Arrange non-terminals in some order: A₁, A₂, ..., Aₙ",
                  "For i = 1 to n:",
                  "  For j = 1 to i − 1:",
                  "    For each production Aᵢ → Aⱼγ:",
                  "      Replace it with Aᵢ → δ₁γ | δ₂γ | ... (where Aⱼ → δ₁ | δ₂ | ...)",
                  "  Apply Algorithm 1 to remove any direct left recursion from Aᵢ",
                  "Remove any useless non-terminals introduced by the transformation",
                ],
              },
              {
                type: "note",
                content: "The ordering of non-terminals in Algorithm 2 matters for intermediate steps but the final result (absence of left recursion) is order-independent.",
              },
            ]}
            complexity={{ time: "O(n² × |Grammar|)", space: "O(|Grammar|)" }}
          />
        }
        visualization={LR_VIZ}
        practice={
          <GlassCard className="p-5 max-w-2xl">
            <h3 className="font-bold text-white mb-4">Practice: Remove Left Recursion</h3>
            <p className="text-slate-300 text-sm mb-4">
              Given the grammar:<br />
              S → Sab | ba | Sba | ε<br /><br />
              Remove all left recursion.
            </p>
            <details className="text-sm">
              <summary className="text-indigo-400 cursor-pointer">Show Answer</summary>
              <pre className="mt-3 text-slate-300 font-mono text-sm">
{`S  → baS' | S'
S' → abS' | baS' | ε`}
              </pre>
            </details>
          </GlassCard>
        }
        viva={<VivaQuestions questions={VIVA_QS} />}
      />
    </MainLayout>
  );
}
