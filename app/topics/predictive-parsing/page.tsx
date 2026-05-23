import { MainLayout } from "@/components/layout/MainLayout";
import { TopicLayout } from "@/components/topics/TopicLayout";
import { TheorySection } from "@/components/topics/TheorySection";
import { VivaQuestions } from "@/components/topics/VivaQuestions";
import { PredictiveParsingViz } from "@/components/visualizations/PredictiveParsingViz";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { GlassCard } from "@/components/ui/GlassCard";

const CODE = `#include <stdio.h>
#include <string.h>

/* Non-recursive predictive parser for expression grammar
   Grammar (LL(1) form):
     E  -> T E'
     E' -> + T E' | eps
     T  -> F T'
     T' -> * F T' | eps
     F  -> id | ( E )

   Terminals:   id + * ( ) $   [indices 0-5]
   Non-Terminals: E E' T T' F  [indices 0-4]

   Productions:
     0: E  -> T E'
     1: E' -> eps
     2: E' -> + T E'
     3: T  -> F T'
     4: T' -> eps
     5: T' -> * F T'
     6: F  -> id
     7: F  -> ( E )
*/

#define STACK_MAX  200
#define INPUT_MAX  100
#define NUM_NT     5
#define NUM_T      6
#define NUM_PROD   8
#define ERROR     -1
#define EPS       -2  /* epsilon production */

/* Parsing table M[NT][T]: production index or ERROR */
int M[NUM_NT][NUM_T] = {
/*         id   +    *    (    )    $  */
/* E  */ {  0, -1,  -1,   0,  -1,  -1 },
/* E' */ { -1,  2,  -1,  -1,   1,   1 },
/* T  */ {  3, -1,  -1,   3,  -1,  -1 },
/* T' */ { -1,  4,   5,  -1,   4,   4 },
/* F  */ {  6, -1,  -1,   7,  -1,  -1 }
};

/* RHS of each production (as string, space-separated symbols) */
/* '#' = epsilon, lowercase nts: e=E', t=T' */
const char *prodRHS[] = {
    "T e",    /* 0: E  -> T E'       */
    "",       /* 1: E' -> eps        */
    "+ T e",  /* 2: E' -> + T E'     */
    "F t",    /* 3: T  -> F T'       */
    "",       /* 4: T' -> eps        */
    "* F t",  /* 5: T' -> * F T'     */
    "i",      /* 6: F  -> id (i=id)  */
    "( E )"   /* 7: F  -> ( E )      */
};

const char *prodStr[] = {
    "E -> T E'", "E' -> eps", "E' -> + T E'",
    "T -> F T'", "T' -> eps", "T' -> * F T'",
    "F -> id",   "F -> ( E )"
};

/* Terminal and non-terminal symbols */
char terminals[]    = {'i', '+', '*', '(', ')', '$'};
char nonTerminals[] = {'E', 'e', 'T', 't', 'F'};

/* Stack */
char stack[STACK_MAX];
int  top = -1;

void push(char c) { stack[++top] = c; }
char pop()        { return stack[top--]; }
char peek()       { return stack[top]; }

/* Find index of terminal in terminals[] */
int termIdx(char c) {
    for (int i = 0; i < NUM_T; i++) if (terminals[i] == c) return i;
    return -1;
}

/* Find index of non-terminal in nonTerminals[] */
int ntIdx(char c) {
    for (int i = 0; i < NUM_NT; i++) if (nonTerminals[i] == c) return i;
    return -1;
}

/* Print symbol (handle multi-char symbols) */
void printSym(char c) {
    if      (c == 'i') printf("id ");
    else if (c == 'e') printf("E' ");
    else if (c == 't') printf("T' ");
    else               printf("%c ", c);
}

/* Print stack from bottom to top */
void printStack() {
    char buf[300] = "";
    for (int i = 0; i <= top; i++) {
        char tmp[10];
        if      (stack[i] == 'i') sprintf(tmp, "id ");
        else if (stack[i] == 'e') sprintf(tmp, "E' ");
        else if (stack[i] == 't') sprintf(tmp, "T' ");
        else                      sprintf(tmp, "%c ", stack[i]);
        strcat(buf, tmp);
    }
    printf("%-28s", buf);
}

/* Print remaining input */
void printInput(char *input, int ip) {
    char buf[100] = "";
    for (int i = ip; input[i]; i++) {
        char tmp[10];
        if (input[i] == 'i') sprintf(tmp, "id ");
        else                  sprintf(tmp, "%c ", input[i]);
        strcat(buf, tmp);
    }
    printf("%-28s", buf);
}

int main() {
    /* Input: id + id * id $ (encoded as 'i' for id) */
    char input[] = "i+i*i$";
    int ip = 0;

    printf("Parsing: id + id * id\\n\\n");
    printf("%-28s %-28s %s\\n", "Stack", "Input", "Action");
    printf("%.80s\\n", "---------------------------------------------------------------------");

    /* Initialize: push $ and start symbol E */
    push('$');
    push('E');

    while (1) {
        printStack();
        printInput(input, ip);

        char X = peek();     /* top of stack */
        char a = input[ip];  /* current input */

        if (X == '$' && a == '$') {
            printf("ACCEPT\\n");
            printf("\\nParsing successful!\\n");
            break;
        }

        if (X == a || (X == 'i' && a == 'i')) {
            /* Match terminal */
            if (a == 'i') printf("Match id\\n");
            else          printf("Match %c\\n", a);
            pop();
            ip++;
        } else {
            int ni = ntIdx(X);
            int ti = termIdx(a);

            if (ni == -1 || ti == -1) {
                printf("ERROR: unexpected symbol\\n");
                return 1;
            }

            int prod = M[ni][ti];
            if (prod == ERROR) {
                printf("ERROR: no production M[%c][%c]\\n", X, a);
                return 1;
            }

            printf("Expand: %s\\n", prodStr[prod]);
            pop();

            /* Push RHS in reverse order */
            const char *rhs = prodRHS[prod];
            if (rhs[0] != '\\0') {
                /* Parse tokens from RHS */
                char tokens[20][10];
                int  tCount = 0;
                char tmp[50];
                strcpy(tmp, rhs);
                char *tok = strtok(tmp, " ");
                while (tok) {
                    strcpy(tokens[tCount++], tok);
                    tok = strtok(NULL, " ");
                }
                /* Push in reverse */
                for (int i = tCount - 1; i >= 0; i--)
                    push(tokens[i][0]);
            }
        }
    }

    return 0;
}`;

const VIVA_QS = [
  {
    question: "What is predictive parsing?",
    answer: "Predictive parsing is a form of recursive-descent parsing that uses a lookahead token to determine which production to apply, without backtracking. The non-recursive version uses an explicit stack and a parsing table.",
  },
  {
    question: "What does M[A, a] represent in the parsing table?",
    answer: "M[A, a] is the production to apply when the top of stack is non-terminal A and the current input symbol is terminal a. If M[A,a] is empty, it signals a syntax error.",
  },
  {
    question: "What is the algorithm for the predictive parser main loop?",
    answer: "1) If TOS = $ and input = $: ACCEPT\n2) If TOS = terminal a = current input: pop and advance\n3) If TOS = non-terminal A: look up M[A, current_input] and push RHS in reverse\n4) Otherwise: ERROR",
  },
  {
    question: "What does it mean when M[A,a] has two or more entries?",
    answer: "It means the grammar is not LL(1) — there is a conflict. Either two productions have overlapping FIRST sets, or there's an ambiguity that can't be resolved with one token of lookahead.",
  },
  {
    question: "What is the time complexity of predictive parsing?",
    answer: "O(n) where n is the length of the input string, since each input token is processed exactly once and each grammar symbol is pushed and popped from the stack at most once.",
  },
];

export default function PredictiveParsingPage() {
  return (
    <MainLayout title="Predictive Parsing">
      <TopicLayout
        title="Non-Recursive Predictive Parsing"
        difficulty="Intermediate"
        estimatedTime="60 min"
        description="Implement a table-driven LL(1) predictive parser using an explicit stack — the industrial-strength approach to top-down parsing."
        theory={
          <TheorySection
            blocks={[
              { type: "heading", content: "Predictive Parsing Overview" },
              {
                type: "text",
                content:
                  "Predictive parsing is an efficient top-down parsing method that uses a single lookahead token to choose among alternatives. The non-recursive form replaces the call stack of recursive descent with an explicit stack, making it more flexible.",
              },
              {
                type: "definition",
                title: "LL(1) Parser",
                content: "An LL(1) parser scans the input Left-to-right, produces a Leftmost derivation, and uses 1 token of lookahead. It works for LL(1) grammars — those with no ambiguity, no left recursion, and no conflicts in the parsing table.",
              },
              {
                type: "algorithm",
                title: "Predictive Parsing Algorithm",
                content: [
                  "Initialize: push $ and start symbol S onto the stack; set ip to first token",
                  "Let X = top of stack, a = current input token",
                  "If X = a = $: ACCEPT",
                  "If X = a (terminal): pop X, advance ip",
                  "If X is a non-terminal: look up M[X, a]",
                  "If M[X, a] = X → Y₁Y₂..Yₖ: pop X, push Yₖ..Y₂Y₁ (reverse order)",
                  "If M[X, a] = error: call error recovery routine",
                  "Repeat from step 2",
                ],
              },
              {
                type: "example",
                title: "Parsing Table for Expression Grammar",
                content: `         id     +      *      (      )      $
  E      E→TE'         E→TE'
  E'           E'→+TE'              E'→ε   E'→ε
  T      T→FT'         T→FT'
  T'           T'→ε    T'→*FT'      T'→ε   T'→ε
  F      F→id          F→(E)

Reading: M[E, id] = E → TE' means: when TOS=E and input=id, expand using E→TE'`,
              },
              {
                type: "note",
                content: "The RHS of a production is pushed onto the stack in REVERSE order so that the leftmost symbol ends up at the top.",
              },
              {
                type: "warning",
                content: "If M[A, a] has multiple entries, the grammar is NOT LL(1). You must resolve ambiguity, left factoring, or left recursion before building the table.",
              },
            ]}
            complexity={{ time: "O(n)", space: "O(n)" }}
            commonErrors={[
              "Pushing RHS in wrong order (should be reverse to maintain left-to-right parsing)",
              "Not handling epsilon productions — they expand to nothing, so just pop",
              "Confusing 'match' (terminal on TOS) with 'expand' (non-terminal on TOS)",
            ]}
          />
        }
        code={<CodeBlock code={CODE} language="c" filename="predictive_parser.c" />}
        visualization={<PredictiveParsingViz />}
        practice={
          <GlassCard className="p-5 max-w-2xl">
            <h3 className="font-bold text-white mb-4">Practice Trace</h3>
            <p className="text-slate-300 text-sm mb-4">
              Trace the predictive parsing for input: <code className="text-indigo-300">( id ) $</code>
              <br />using the expression grammar and the table above.
            </p>
            <details>
              <summary className="text-indigo-400 cursor-pointer text-sm">Show Answer</summary>
              <pre className="mt-3 text-slate-300 font-mono text-xs whitespace-pre">
{`Stack: [$ E]        Input: ( id ) $    Expand: E→TE'
Stack: [$ E' T]     Input: ( id ) $    Expand: T→FT'
Stack: [$ E' T' F]  Input: ( id ) $    Expand: F→(E)
Stack: [$ E' T' ) E (]  Input: ( id ) $ Match (
Stack: [$ E' T' ) E]    Input: id ) $   Expand: E→TE'
Stack: [$ E' T' ) E' T] Input: id ) $   Expand: T→FT'
Stack: [$ E' T' ) E' T' F] Input: id ) $ Expand: F→id
Stack: [$ E' T' ) E' T' id] Match id
Stack: [$ E' T' ) E' T'] Input: ) $     Expand: T'→ε
Stack: [$ E' T' ) E']    Input: ) $     Expand: E'→ε
Stack: [$ E' T' )]       Input: ) $     Match )
Stack: [$ E' T']         Input: $       Expand: T'→ε
Stack: [$ E']            Input: $       Expand: E'→ε
Stack: [$]               Input: $       ACCEPT`}
              </pre>
            </details>
          </GlassCard>
        }
        viva={<VivaQuestions questions={VIVA_QS} />}
      />
    </MainLayout>
  );
}
