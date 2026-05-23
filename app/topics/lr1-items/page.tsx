import { MainLayout } from "@/components/layout/MainLayout";
import { TopicLayout } from "@/components/topics/TopicLayout";
import { TheorySection } from "@/components/topics/TheorySection";
import { VivaQuestions } from "@/components/topics/VivaQuestions";
import { GlassCard } from "@/components/ui/GlassCard";
import { CodeBlock } from "@/components/ui/CodeBlock";

const CODE = `#include <stdio.h>
#include <string.h>

/* LR(1) item: [A -> alpha . beta, a]
   'a' is the lookahead terminal
   Grammar: S' -> S, S -> CC, C -> cC | d
*/
#define MAX_ITEMS 200
#define MAX_SETS  50

typedef struct { int prod, dot; char lookahead; } LR1Item;
typedef struct { LR1Item items[MAX_ITEMS]; int count; } LR1Set;

const char *prods[] = {"S","S","C","C"};
const char *rhs[]   = {"S","CC","cC","d"};
int prodCount = 4;

int hasItem(LR1Set *s, int prod, int dot, char la) {
    for(int i=0;i<s->count;i++)
        if(s->items[i].prod==prod&&s->items[i].dot==dot&&s->items[i].lookahead==la)return 1;
    return 0;
}

char firstOfString(const char *str, char la) {
    if(!str[0]) return la;
    if(str[0]>='a'&&str[0]<='z') return str[0];
    return la; /* simplified: full impl needs recursive FIRST */
}

void closure(LR1Set *s) {
    int changed;
    do {
        changed=0;
        for(int i=0;i<s->count;i++){
            int p=s->items[i].prod, d=s->items[i].dot;
            char la=s->items[i].lookahead;
            const char *r=rhs[p];
            if(d>=(int)strlen(r)) continue;
            char B=r[d];
            if(B>='A'&&B<='Z') {
                char beta[50]; strcpy(beta,r+d+1);
                char newLa=firstOfString(beta,la);
                for(int j=0;j<prodCount;j++){
                    if(prods[j][0]==B&&!hasItem(s,j,0,newLa)){
                        s->items[s->count].prod=j;
                        s->items[s->count].dot=0;
                        s->items[s->count].lookahead=newLa;
                        s->count++; changed=1;
                    }
                }
            }
        }
    } while(changed);
}

void printSet(LR1Set *s, int id) {
    printf("I%d:\\n", id);
    for(int i=0;i<s->count;i++){
        int p=s->items[i].prod, d=s->items[i].dot;
        const char *r=rhs[p];
        printf("  [%s -> ",prods[p]);
        for(int j=0;j<(int)strlen(r);j++){if(j==d)printf(".");printf("%c",r[j]);}
        if(d==(int)strlen(r))printf(".");
        printf(", %c]\\n", s->items[i].lookahead);
    }
}

int main(){
    printf("=== LR(1) Item Sets (Grammar: S->CC, C->cC|d) ===\\n\\n");
    LR1Set I0={.count=1};
    I0.items[0]={0,0,'$'};
    closure(&I0);
    printSet(&I0,0);
    printf("  (Use GOTO to expand further states...)\\n");
    return 0;
}`;

const VIVA_QS = [
  {
    question: "How does LR(1) differ from LR(0)?",
    answer: "LR(1) items include a lookahead symbol: [A→α•β, a]. The lookahead 'a' indicates that A→αβ should be reduced only when the next input is 'a'. This extra precision resolves many conflicts that LR(0)/SLR cannot.",
  },
  {
    question: "How is the CLOSURE for LR(1) items computed?",
    answer: "For item [A→α•Bβ, a]: add [B→•γ, b] for every production B→γ and every b in FIRST(βa). The lookahead b is derived from FIRST of the string following B plus the original lookahead if β can derive ε.",
  },
  {
    question: "Why does LR(1) have more states than SLR?",
    answer: "Because different lookahead sets create different states even when the core items (ignoring lookahead) are the same. LALR resolves this by merging states with identical cores.",
  },
];

export default function LR1ItemsPage() {
  return (
    <MainLayout title="LR(1) Items">
      <TopicLayout
        title="LR(1) Items"
        difficulty="Advanced"
        estimatedTime="75 min"
        description="Extend LR(0) items with lookahead symbols for more precise parsing decisions."
        theory={
          <TheorySection
            blocks={[
              { type: "heading", content: "LR(1) Items" },
              {
                type: "definition",
                title: "LR(1) Item",
                content: "An LR(1) item is a pair [A→α•β, a] where A→αβ is a production, α•β is an LR(0) item, and 'a' is a lookahead terminal. The lookahead restricts when reductions can be made.",
              },
              {
                type: "algorithm",
                title: "LR(1) CLOSURE",
                content: [
                  "Start with initial set of LR(1) items",
                  "For each [A→α•Bβ, a] in the set:",
                  "  For each production B→γ:",
                  "    For each terminal b in FIRST(βa):",
                  "      If [B→•γ, b] not in set, add it",
                  "Repeat until stable",
                ],
              },
              {
                type: "example",
                title: "Example: Grammar S'→S, S→CC, C→cC|d",
                content: `I₀ = CLOSURE({[S'→•S, $]})
   = { [S'→•S,$], [S→•CC,$], [C→•cC,c], [C→•cC,d], [C→•d,c], [C→•d,d] }

   Note: C appears in position 1 of S→CC. 
   FIRST of remaining "C$" = {c,d}.
   So lookaheads for C-productions are {c, d}.`,
              },
            ]}
            complexity={{ time: "O(|items| × |grammar|)", space: "O(|states| × |items|)" }}
            commonErrors={[
              "Computing wrong FIRST(βa) — β might be empty string",
              "Forgetting that each lookahead creates a separate item",
            ]}
          />
        }
        code={<CodeBlock code={CODE} language="c" filename="lr1_items.c" />}
        visualization={
          <GlassCard className="p-5">
            <h3 className="font-bold text-white mb-4">LR(1) vs LR(0) Item Comparison</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-500/8 border border-blue-500/20 rounded-xl">
                <div className="text-blue-400 font-semibold text-sm mb-2">LR(0) Item</div>
                <code className="text-slate-300 text-sm font-mono">A → α • β</code>
                <p className="text-slate-400 text-xs mt-2">No lookahead. Reduce on all terminals in FOLLOW(A).</p>
              </div>
              <div className="p-4 bg-violet-500/8 border border-violet-500/20 rounded-xl">
                <div className="text-violet-400 font-semibold text-sm mb-2">LR(1) Item</div>
                <code className="text-slate-300 text-sm font-mono">[A → α • β, a]</code>
                <p className="text-slate-400 text-xs mt-2">Lookahead a. Reduce only when next input = a.</p>
              </div>
            </div>
          </GlassCard>
        }
        practice={<GlassCard className="p-5"><p className="text-slate-300 text-sm">Construct LR(1) items for S→CC, C→cC|d and compare with LR(0).</p></GlassCard>}
        viva={<VivaQuestions questions={VIVA_QS} />}
      />
    </MainLayout>
  );
}
