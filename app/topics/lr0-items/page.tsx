import { MainLayout } from "@/components/layout/MainLayout";
import { TopicLayout } from "@/components/topics/TopicLayout";
import { TheorySection } from "@/components/topics/TheorySection";
import { VivaQuestions } from "@/components/topics/VivaQuestions";
import { LR0ItemsViz } from "@/components/visualizations/LR0ItemsViz";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { GlassCard } from "@/components/ui/GlassCard";

const CODE = `#include <stdio.h>
#include <string.h>
#include <ctype.h>

#define MAX_ITEMS  100
#define MAX_SETS   50
#define MAX_SYMS   30

typedef struct {
    int prod;      /* production index */
    int dot;       /* dot position in RHS */
} Item;

typedef struct {
    Item items[MAX_ITEMS];
    int  count;
} ItemSet;

/* Grammar:
   0: S' -> S
   1: S  -> AA
   2: A  -> aA
   3: A  -> b
*/
const char *prods[] = {"S", "S", "A", "A"};
const char *rhs[]   = {"S", "AA", "aA", "b"};
int prodCount = 4;

ItemSet states[MAX_SETS];
int stateCount = 0;

/* Check if item is in an ItemSet */
int hasItem(ItemSet *s, int prod, int dot) {
    for (int i = 0; i < s->count; i++)
        if (s->items[i].prod == prod && s->items[i].dot == dot)
            return 1;
    return 0;
}

/* Compute CLOSURE of an item set */
void closure(ItemSet *s) {
    int changed;
    do {
        changed = 0;
        for (int i = 0; i < s->count; i++) {
            int p = s->items[i].prod;
            int d = s->items[i].dot;
            const char *r = rhs[p];

            if (d >= (int)strlen(r)) continue; /* dot at end */

            char sym = r[d]; /* symbol after dot */
            if (!isupper(sym)) continue; /* terminal */

            /* Add all productions for 'sym' */
            for (int j = 0; j < prodCount; j++) {
                if (prods[j][0] == sym && !hasItem(s, j, 0)) {
                    s->items[s->count].prod = j;
                    s->items[s->count].dot  = 0;
                    s->count++;
                    changed = 1;
                }
            }
        }
    } while (changed);
}

/* Compute GOTO(s, X) */
ItemSet gotoSet(ItemSet *s, char X) {
    ItemSet result = { .count = 0 };
    for (int i = 0; i < s->count; i++) {
        int p = s->items[i].prod;
        int d = s->items[i].dot;
        const char *r = rhs[p];
        if (d < (int)strlen(r) && r[d] == X) {
            if (!hasItem(&result, p, d + 1)) {
                result.items[result.count].prod = p;
                result.items[result.count].dot  = d + 1;
                result.count++;
            }
        }
    }
    closure(&result);
    return result;
}

/* Check if two ItemSets are identical */
int setsEqual(ItemSet *a, ItemSet *b) {
    if (a->count != b->count) return 0;
    for (int i = 0; i < a->count; i++)
        if (!hasItem(b, a->items[i].prod, a->items[i].dot))
            return 0;
    return 1;
}

/* Find or add a state */
int findOrAdd(ItemSet *s) {
    for (int i = 0; i < stateCount; i++)
        if (setsEqual(&states[i], s)) return i;
    states[stateCount++] = *s;
    return stateCount - 1;
}

void printItem(int prod, int dot) {
    const char *lhs = prods[prod];
    const char *r   = rhs[prod];
    printf("  %s -> ", lhs);
    for (int i = 0; i < (int)strlen(r); i++) {
        if (i == dot) printf("• ");
        printf("%c ", r[i]);
    }
    if (dot == (int)strlen(r)) printf("•");
    printf("\\n");
}

int main() {
    printf("=== LR(0) Item Sets Construction ===\\n\\n");

    /* Initial state: closure of {S' -> •S} */
    ItemSet I0 = { .count = 1 };
    I0.items[0].prod = 0;
    I0.items[0].dot  = 0;
    closure(&I0);
    stateCount = 1;
    states[0] = I0;

    /* Collect all grammar symbols */
    char symbols[MAX_SYMS];
    int symCount = 0;
    for (int i = 0; i < prodCount; i++) {
        for (int j = 0; rhs[i][j]; j++) {
            char c = rhs[i][j];
            int found = 0;
            for (int k = 0; k < symCount; k++)
                if (symbols[k] == c) { found = 1; break; }
            if (!found) symbols[symCount++] = c;
        }
    }
    /* Also add non-terminals from LHS */
    for (int i = 0; i < prodCount; i++) {
        char c = prods[i][0];
        int found = 0;
        for (int k = 0; k < symCount; k++)
            if (symbols[k] == c) { found = 1; break; }
        if (!found) symbols[symCount++] = c;
    }

    /* Build all states */
    for (int i = 0; i < stateCount; i++) {
        for (int s = 0; s < symCount; s++) {
            ItemSet g = gotoSet(&states[i], symbols[s]);
            if (g.count > 0) findOrAdd(&g);
        }
    }

    /* Print all states */
    for (int i = 0; i < stateCount; i++) {
        printf("I%d:\\n", i);
        for (int j = 0; j < states[i].count; j++)
            printItem(states[i].items[j].prod, states[i].items[j].dot);

        /* Print transitions */
        printf("  Transitions:\\n");
        for (int s = 0; s < symCount; s++) {
            ItemSet g = gotoSet(&states[i], symbols[s]);
            if (g.count == 0) continue;
            int to = -1;
            for (int k = 0; k < stateCount; k++)
                if (setsEqual(&states[k], &g)) { to = k; break; }
            if (to >= 0)
                printf("    GOTO(%d, %c) = I%d\\n", i, symbols[s], to);
        }
        printf("\\n");
    }

    printf("Total states: %d\\n", stateCount);
    return 0;
}`;

const VIVA_QS = [
  {
    question: "What is an LR(0) item?",
    answer: "An LR(0) item is a production rule with a dot (•) marking how much of the right-hand side has been recognized. For example, A → α•β means α has been parsed and we expect β next.",
  },
  {
    question: "What is the CLOSURE operation?",
    answer: "CLOSURE({A→α•Bβ}) adds items B→•γ for every production B→γ. We keep adding until no new items can be added. This represents all possible parser states when we've just seen α.",
  },
  {
    question: "What is the GOTO function?",
    answer: "GOTO(I, X) = CLOSURE of all items [A→αX•β] where [A→α•Xβ] is in I. It computes the state reached after recognizing symbol X from state I.",
  },
  {
    question: "What is the augmented grammar and why do we use it?",
    answer: "We add a new start production S'→S to the original grammar. This gives us a unique initial item S'→•S that clearly identifies the start of parsing and makes the accept state unambiguous.",
  },
  {
    question: "What are shift, reduce, and accept items?",
    answer: "Shift item: A→α•aβ (dot before a terminal, shift is possible). Reduce item: A→α• (dot at end, we can reduce). Accept item: S'→S• (parsing complete when we see this with $ on input).",
  },
];

export default function LR0ItemsPage() {
  return (
    <MainLayout title="LR(0) Items">
      <TopicLayout
        title="LR(0) Items and Closure"
        difficulty="Advanced"
        estimatedTime="60 min"
        description="Build the canonical collection of LR(0) item sets — the foundation for constructing SLR and LR parsing tables."
        theory={
          <TheorySection
            blocks={[
              { type: "heading", content: "LR(0) Items" },
              {
                type: "text",
                content: "An LR(0) item is a production with a special marker (•) inserted somewhere in the right-hand side. The dot represents how much of a production has been recognized at a given point.",
              },
              {
                type: "definition",
                title: "LR(0) Item",
                content: "For production A → XYZ, the LR(0) items are:\n• A → •XYZ  (nothing parsed)\n• A → X•YZ  (X parsed)\n• A → XY•Z  (XY parsed)\n• A → XYZ•  (complete — can reduce)",
              },
              {
                type: "algorithm",
                title: "CLOSURE Algorithm",
                content: [
                  "Start with the initial set of items",
                  "For each item [A → α•Bβ] in the set:",
                  "  For each production B → γ:",
                  "    If [B → •γ] is not already in the set, add it",
                  "Repeat until no new items are added (fixed point)",
                ],
              },
              {
                type: "algorithm",
                title: "GOTO Algorithm",
                content: [
                  "GOTO(I, X) — transitions from state I on symbol X",
                  "J = {A → αX•β | A → α•Xβ ∈ I}",
                  "Return CLOSURE(J)",
                  "This represents the state we move to after recognizing X",
                ],
              },
              {
                type: "algorithm",
                title: "Canonical LR(0) Collection",
                content: [
                  "Augment grammar with S' → S",
                  "C = { CLOSURE({S' → •S}) }",
                  "For each set I in C, for each symbol X:",
                  "  Compute GOTO(I, X)",
                  "  If non-empty and not already in C, add to C",
                  "Repeat until no new sets are added",
                ],
              },
              {
                type: "example",
                title: "Example: Augmented grammar S'→S, S→AA, A→aA|b",
                content: `I₀ = CLOSURE({S'→•S})
     = { S'→•S, S→•AA, A→•aA, A→•b }

GOTO(I₀, S) = I₁ = { S'→S• }  ← ACCEPT state
GOTO(I₀, A) = I₂ = CLOSURE({S→A•A})
            = { S→A•A, A→•aA, A→•b }
GOTO(I₀, a) = I₃ = CLOSURE({A→a•A})
            = { A→a•A, A→•aA, A→•b }
GOTO(I₀, b) = I₄ = { A→b• }    ← REDUCE state

GOTO(I₂, A) = I₅ = { S→AA• }   ← REDUCE state
GOTO(I₂, a) = I₃  (already exists)
GOTO(I₂, b) = I₄  (already exists)
GOTO(I₃, A) = I₆ = { A→aA• }   ← REDUCE state
GOTO(I₃, a) = I₃  (self-loop)
GOTO(I₃, b) = I₄`,
              },
              {
                type: "note",
                content: "States with items having the dot at the end (reduce items) are where we perform a reduction. The SLR method uses FOLLOW sets to decide which input tokens trigger the reduction.",
              },
            ]}
            complexity={{ time: "O(n × |G|²)", space: "O(n × |G|)" }}
            commonErrors={[
              "Forgetting to take CLOSURE after computing GOTO",
              "Not checking if a GOTO result already exists in the collection",
              "Confusing dot position with production index",
              "Missing the augmented start production S' → S",
            ]}
          />
        }
        code={<CodeBlock code={CODE} language="c" filename="lr0_items.c" />}
        algorithm={
          <TheorySection
            blocks={[
              {
                type: "algorithm",
                title: "Algorithm 1: CLOSURE(I)",
                content: [
                  "Add all items in I to the result set",
                  "For each item [A → α•Bβ] in the result where B is a non-terminal:",
                  "  For each production B → γ in the grammar:",
                  "    If [B → •γ] is not already in the result: add it",
                  "Repeat steps 2–3 until no new items are added",
                ],
              },
              {
                type: "algorithm",
                title: "Algorithm 2: GOTO(I, X)",
                content: [
                  "Collect all items [A → αX•β] where [A → α•Xβ] ∈ I",
                  "Return CLOSURE of that collected set",
                ],
              },
              {
                type: "algorithm",
                title: "Algorithm 3: Canonical LR(0) Collection",
                content: [
                  "Augment grammar: add S' → S",
                  "Initialize: C = { CLOSURE({[S' → •S]}) }",
                  "For each item set I in C and each grammar symbol X:",
                  "  Compute J = GOTO(I, X)",
                  "  If J ≠ {} and J ∉ C: add J to C",
                  "Repeat until no new item sets are added to C",
                ],
              },
              {
                type: "note",
                content: "An item with the dot at the end (A → α•) is a complete item — it signals a possible reduction.",
              },
            ]}
            complexity={{ time: "O(|G|² × |Σ|)", space: "O(|G|² × |Σ|)" }}
          />
        }
        visualization={<LR0ItemsViz />}
        practice={
          <GlassCard className="p-5 max-w-2xl">
            <h3 className="font-bold text-white mb-3">Practice Problem</h3>
            <p className="text-slate-300 text-sm mb-3">
              Construct the LR(0) item sets for:<br />
              <code className="text-indigo-300">S → L = R | R</code><br />
              <code className="text-indigo-300">L → * R | id</code><br />
              <code className="text-indigo-300">R → L</code>
            </p>
            <p className="text-slate-400 text-xs">
              Hint: Augment with S' → S. Start with CLOSURE(&#123;S' → •S&#125;). There are 10 states.
            </p>
          </GlassCard>
        }
        viva={<VivaQuestions questions={VIVA_QS} />}
      />
    </MainLayout>
  );
}
