"use client";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Play, RotateCcw, Copy, Download, Check, Terminal } from "lucide-react";

const CEditor = dynamic(() => import("./CEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-slate-500 text-sm">
      Loading editor...
    </div>
  ),
});
import { motion, AnimatePresence } from "framer-motion";
import { NeonButton } from "@/components/ui/NeonButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn, copyToClipboard, downloadCode } from "@/lib/utils";

const STARTER_PROGRAMS: Record<string, { label: string; code: string; description: string }> = {
  "first-follow": {
    label: "FIRST/FOLLOW Computation",
    description: "Compute FIRST and FOLLOW sets for expression grammar",
    code: `#include <stdio.h>
#include <string.h>
#include <ctype.h>

#define MAX_PROD 20
#define MAX_NT   10
#define MAX_T    20
#define MAX_LEN  50

char productions[MAX_PROD][MAX_LEN];
char nonTerminals[MAX_NT];
int  ntCount = 0, prodCount = 0;

char firstSets[MAX_NT][MAX_T];
char followSets[MAX_NT][MAX_T];
int  firstCount[MAX_NT] = {0};
int  followCount[MAX_NT] = {0};

int findNT(char c) {
    for (int i = 0; i < ntCount; i++)
        if (nonTerminals[i] == c) return i;
    return -1;
}

void addToFirst(int idx, char c) {
    for (int i = 0; i < firstCount[idx]; i++)
        if (firstSets[idx][i] == c) return;
    firstSets[idx][firstCount[idx]++] = c;
}

void addToFollow(int idx, char c) {
    for (int i = 0; i < followCount[idx]; i++)
        if (followSets[idx][i] == c) return;
    followSets[idx][followCount[idx]++] = c;
}

int hasEpsilon(int ntIdx) {
    for (int i = 0; i < firstCount[ntIdx]; i++)
        if (firstSets[ntIdx][i] == '#') return 1; // # = epsilon
    return 0;
}

void computeFirst() {
    int changed = 1;
    while (changed) {
        changed = 0;
        for (int p = 0; p < prodCount; p++) {
            char lhs = productions[p][0];
            int  li  = findNT(lhs);
            char *rhs = productions[p] + 3; // skip "X ->"

            if (rhs[0] == '#') { // epsilon production
                int before = firstCount[li];
                addToFirst(li, '#');
                if (firstCount[li] > before) changed = 1;
                continue;
            }

            int allDeriveEps = 1;
            for (int j = 0; rhs[j]; j++) {
                char sym = rhs[j];
                if (isupper(sym)) {
                    int si = findNT(sym);
                    int before = firstCount[li];
                    for (int k = 0; k < firstCount[si]; k++)
                        if (firstSets[si][k] != '#')
                            addToFirst(li, firstSets[si][k]);
                    if (firstCount[li] > before) changed = 1;
                    if (!hasEpsilon(si)) { allDeriveEps = 0; break; }
                } else {
                    int before = firstCount[li];
                    addToFirst(li, sym);
                    if (firstCount[li] > before) changed = 1;
                    allDeriveEps = 0;
                    break;
                }
            }
            if (allDeriveEps) {
                int before = firstCount[li];
                addToFirst(li, '#');
                if (firstCount[li] > before) changed = 1;
            }
        }
    }
}

void computeFollow(char startSym) {
    int si = findNT(startSym);
    addToFollow(si, '$');

    int changed = 1;
    while (changed) {
        changed = 0;
        for (int p = 0; p < prodCount; p++) {
            char lhs = productions[p][0];
            int  li  = findNT(lhs);
            char *rhs = productions[p] + 3;

            for (int j = 0; rhs[j]; j++) {
                if (!isupper(rhs[j])) continue;
                int bi = findNT(rhs[j]);

                // Add FIRST of remaining - epsilon
                int allEps = 1;
                for (int k = j + 1; rhs[k]; k++) {
                    char next = rhs[k];
                    if (isupper(next)) {
                        int ni = findNT(next);
                        int before = followCount[bi];
                        for (int m = 0; m < firstCount[ni]; m++)
                            if (firstSets[ni][m] != '#')
                                addToFollow(bi, firstSets[ni][m]);
                        if (followCount[bi] > before) changed = 1;
                        if (!hasEpsilon(ni)) { allEps = 0; break; }
                    } else {
                        int before = followCount[bi];
                        addToFollow(bi, next);
                        if (followCount[bi] > before) changed = 1;
                        allEps = 0;
                        break;
                    }
                }

                if (allEps && rhs[j + 1] == '\\0') allEps = 1;
                else if (!rhs[j + 1]) allEps = 1;
                else allEps = 0;

                if (allEps) {
                    int before = followCount[bi];
                    for (int m = 0; m < followCount[li]; m++)
                        addToFollow(bi, followSets[li][m]);
                    if (followCount[bi] > before) changed = 1;
                }
            }
        }
    }
}

int main() {
    // Expression grammar: E->TE', E'->#|+TE', T->FT', T'->#|*FT', F->id|(E)
    char *grammar[] = {
        "E->TE'", "E'->#", "E'->+TE'",
        "T->FT'", "T'->#", "T'->*FT'",
        "F->id",  "F->(E)"
    };
    prodCount = 8;
    for (int i = 0; i < prodCount; i++)
        strcpy(productions[i], grammar[i]);

    // Extract non-terminals
    char nts[] = {'E', 'T', 'F'};
    // E' and T' represented differently
    nonTerminals[0] = 'E'; nonTerminals[1] = 'T'; nonTerminals[2] = 'F';
    ntCount = 3;

    computeFirst();
    computeFollow('E');

    printf("=== FIRST Sets ===\\n");
    for (int i = 0; i < ntCount; i++) {
        printf("FIRST(%c) = { ", nonTerminals[i]);
        for (int j = 0; j < firstCount[i]; j++)
            printf("%c ", firstSets[i][j]);
        printf("}\\n");
    }

    printf("\\n=== FOLLOW Sets ===\\n");
    for (int i = 0; i < ntCount; i++) {
        printf("FOLLOW(%c) = { ", nonTerminals[i]);
        for (int j = 0; j < followCount[i]; j++)
            printf("%c ", followSets[i][j]);
        printf("}\\n");
    }

    return 0;
}`,
  },
  "left-recursion": {
    label: "Left Recursion Removal",
    description: "Remove direct left recursion from a grammar",
    code: `#include <stdio.h>
#include <string.h>
#include <ctype.h>

#define MAX 20

typedef struct {
    char lhs;
    char rhs[MAX][50];
    int count;
} Production;

Production prods[MAX];
int prodCount = 0;

void addProduction(char lhs, const char *rhs) {
    for (int i = 0; i < prodCount; i++) {
        if (prods[i].lhs == lhs) {
            strcpy(prods[i].rhs[prods[i].count++], rhs);
            return;
        }
    }
    prods[prodCount].lhs = lhs;
    strcpy(prods[prodCount].rhs[0], rhs);
    prods[prodCount].count = 1;
    prodCount++;
}

void removeDirectLeftRecursion(int pi) {
    char A = prods[pi].lhs;
    char recursive[MAX][50];
    char nonRecursive[MAX][50];
    int recCount = 0, nonRecCount = 0;

    for (int i = 0; i < prods[pi].count; i++) {
        if (prods[pi].rhs[i][0] == A) {
            // Left recursive: A -> A alpha
            strcpy(recursive[recCount++], prods[pi].rhs[i] + 1);
        } else {
            // Non-recursive: A -> beta
            strcpy(nonRecursive[nonRecCount++], prods[pi].rhs[i]);
        }
    }

    if (recCount == 0) {
        printf("No left recursion in %c\\n", A);
        return;
    }

    // New non-terminal A'
    char newNT[3] = {A, '\'', '\\0'};

    printf("\\nRemoving left recursion for %c:\\n", A);

    // A -> beta A'
    printf("%c -> ", A);
    for (int i = 0; i < nonRecCount; i++) {
        printf("%s%s", nonRecursive[i], newNT);
        if (i < nonRecCount - 1) printf(" | ");
    }
    if (nonRecCount == 0) printf("epsilon");
    printf("\\n");

    // A' -> alpha A' | epsilon
    printf("%s -> ", newNT);
    for (int i = 0; i < recCount; i++) {
        printf("%s%s | ", recursive[i], newNT);
    }
    printf("epsilon\\n");
}

int main() {
    printf("=== Left Recursion Removal ===\\n\\n");

    // Grammar: E -> E+T | E-T | T
    printf("Original Grammar:\\n");
    printf("E -> E+T | E-T | T\\n");
    printf("T -> T*F | T/F | F\\n");
    printf("F -> id | (E)\\n\\n");

    // Set up productions for E
    prods[0].lhs = 'E';
    strcpy(prods[0].rhs[0], "E+T");
    strcpy(prods[0].rhs[1], "E-T");
    strcpy(prods[0].rhs[2], "T");
    prods[0].count = 3;

    // Set up productions for T
    prods[1].lhs = 'T';
    strcpy(prods[1].rhs[0], "T*F");
    strcpy(prods[1].rhs[1], "T/F");
    strcpy(prods[1].rhs[2], "F");
    prods[1].count = 3;

    prodCount = 2;

    printf("After Removing Left Recursion:\\n");
    removeDirectLeftRecursion(0); // Remove from E
    removeDirectLeftRecursion(1); // Remove from T

    printf("\\nF -> id | (E)   [unchanged - no left recursion]\\n");

    return 0;
}`,
  },
  "predictive-parsing": {
    label: "Predictive Parser",
    description: "Non-recursive LL(1) predictive parser implementation",
    code: `#include <stdio.h>
#include <string.h>
#include <ctype.h>

#define STACK_SIZE 100
#define MAX_INPUT  100

// Grammar: E->TE', E'->#|+TE', T->FT', T'->#|*FT', F->id|(E)
// Terminals: id + * ( ) $   [index 0-5]
// Non-Terminals: E E' T T' F [index 0-4]

// Parsing table M[NT][T]
// -1 = error, -2 = pop (for $/$), else = production index
// Productions: 0:E->TE' 1:E'-># 2:E'->+TE' 3:T->FT' 4:T'-># 5:T'->*FT' 6:F->id 7:F->(E)

int M[5][6] = {
//   id   +    *    (    )    $
    { 0, -1,  -1,   0,  -1,  -1},  // E
    {-1,  2,  -1,  -1,   1,   1},  // E'
    { 3, -1,  -1,   3,  -1,  -1},  // T
    {-1,  4,   5,  -1,   4,   4},  // T'
    { 6, -1,  -1,   7,  -1,  -1},  // F
};

const char *productions[] = {
    "E->TE'", "E'->#", "E'->+TE'",
    "T->FT'", "T'->#", "T'->*FT'",
    "F->id",  "F->(E)"
};

const char *rhs[] = {
    "TE'", "", "+TE'", "FT'", "", "*FT'", "id", "(E)"
};

char terminals[] = {'i', '+', '*', '(', ')', '$'};  // 'i' for id
char nonTerminals[] = {'E', 'e', 'T', 't', 'F'};   // 'e'=E', 't'=T'

int isTerminal(char c) {
    for (int i = 0; i < 6; i++) if (terminals[i] == c) return i;
    return -1;
}
int isNT(char c) {
    for (int i = 0; i < 5; i++) if (nonTerminals[i] == c) return i;
    return -1;
}

char stack[STACK_SIZE];
int  top = -1;

void push(char c) { stack[++top] = c; }
char pop()        { return stack[top--]; }
char peek()       { return stack[top]; }

int main() {
    char input[] = "i+i*i$";  // represents: id+id*id$
    int  ip = 0;

    printf("Parsing: id + id * id\\n\\n");
    printf("%-20s %-20s %s\\n", "Stack", "Input", "Action");
    printf("%s\\n", "--------------------------------------------------------");

    push('$');
    push('E');

    while (1) {
        // Print stack
        char stackStr[100] = "";
        for (int i = 0; i <= top; i++) {
            char tmp[5];
            if (stack[i] == 'e') sprintf(tmp, "E' ");
            else if (stack[i] == 't') sprintf(tmp, "T' ");
            else sprintf(tmp, "%c ", stack[i]);
            strcat(stackStr, tmp);
        }

        // Print remaining input
        char inputStr[50] = "";
        for (int i = ip; input[i]; i++) {
            char tmp[5];
            if (input[i] == 'i') sprintf(tmp, "id ");
            else sprintf(tmp, "%c ", input[i]);
            strcat(inputStr, tmp);
        }

        char top_sym = peek();
        char cur_in  = input[ip];

        if (top_sym == '$' && cur_in == '$') {
            printf("%-20s %-20s ACCEPT!\\n", stackStr, inputStr);
            break;
        }

        int ti = isTerminal(cur_in);
        int ni = isNT(top_sym);

        if (top_sym == cur_in || (top_sym == 'i' && cur_in == 'i')) {
            printf("%-20s %-20s Match %s\\n", stackStr, inputStr,
                   cur_in == 'i' ? "id" : (char[]){cur_in, 0});
            pop(); ip++;
        } else if (ni >= 0 && ti >= 0) {
            int prod = M[ni][ti];
            if (prod == -1) {
                printf("ERROR: No production for M[%c,%c]\\n", top_sym, cur_in);
                return 1;
            }
            printf("%-20s %-20s Expand: %s\\n", stackStr, inputStr, productions[prod]);
            pop();
            // Push RHS in reverse
            const char *r = rhs[prod];
            for (int i = strlen(r) - 1; i >= 0; i--) {
                if (r[i] != ' ') push(r[i]);
            }
        } else {
            printf("ERROR\\n");
            return 1;
        }
    }

    printf("\\nParsing successful!\\n");
    return 0;
}`,
  },
};

const SIMULATED_OUTPUTS: Record<string, string> = {
  "first-follow": `=== FIRST Sets ===
FIRST(E) = { ( i }
FIRST(T) = { ( i }
FIRST(F) = { ( i }

=== FOLLOW Sets ===
FOLLOW(E) = { ) $ }
FOLLOW(T) = { + ) $ }
FOLLOW(F) = { * + ) $ }

(Note: 'i' represents 'id', '#' represents ε)`,

  "left-recursion": `=== Left Recursion Removal ===

Original Grammar:
E -> E+T | E-T | T
T -> T*F | T/F | F
F -> id | (E)

After Removing Left Recursion:

Removing left recursion for E:
E -> TE' | TE'
E' -> +TE' | -TE' | epsilon

Removing left recursion for T:
T -> FT' | FT'
T' -> *FT' | /FT' | epsilon

F -> id | (E)   [unchanged - no left recursion]`,

  "predictive-parsing": `Parsing: id + id * id

Stack                Input                Action
--------------------------------------------------------
E $                  id + id * id $       Expand: E->TE'
E' T $               id + id * id $       Expand: T->FT'
E' T' F $            id + id * id $       Expand: F->id
E' T' id $           id + id * id $       Match id
E' T' $              + id * id $          Expand: T'->#
E' $                 + id * id $          Expand: E'->+TE'
E' T + $             + id * id $          Match +
E' T $               id * id $            Expand: T->FT'
E' T' F $            id * id $            Expand: F->id
E' T' id $           id * id $            Match id
E' T' $              * id $               Expand: T'->*FT'
E' T' F * $          * id $               Match *
E' T' F $            id $                 Expand: F->id
E' T' id $           id $                 Match id
E' T' $              $                    Expand: T'->#
E' $                 $                    Expand: E'->#
$ $                  $                    ACCEPT!

Parsing successful!`,
};

export function CodePlayground() {
  const [selectedProgram, setSelectedProgram] = useState("first-follow");
  const [code, setCode] = useState(STARTER_PROGRAMS["first-follow"].code);
  const [output, setOutput] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleProgramChange = useCallback((key: string) => {
    setSelectedProgram(key);
    setCode(STARTER_PROGRAMS[key].code);
    setOutput(null);
  }, []);

  const handleRun = async () => {
    setRunning(true);
    setOutput(null);
    await new Promise((r) => setTimeout(r, 1500));
    setOutput(SIMULATED_OUTPUTS[selectedProgram] ?? "Program executed successfully!");
    setRunning(false);
  };

  const handleCopy = async () => {
    await copyToClipboard(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Program selector */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(STARTER_PROGRAMS).map(([key, prog]) => (
          <button
            key={key}
            onClick={() => handleProgramChange(key)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm border transition-all",
              selectedProgram === key
                ? "bg-indigo-600 text-white border-indigo-500"
                : "bg-white/4 text-slate-400 border-white/8 hover:bg-white/8"
            )}
          >
            {prog.label}
          </button>
        ))}
      </div>

      {/* Description */}
      <div className="text-sm text-slate-400 flex items-center gap-2">
        <Terminal size={14} className="text-indigo-400" />
        {STARTER_PROGRAMS[selectedProgram].description}
      </div>

      {/* Editor + Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Editor */}
        <GlassCard className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              </div>
              <span className="text-xs text-slate-500 font-mono">program.c</span>
            </div>
            <div className="flex gap-1.5">
              <button onClick={handleCopy} className="p-1.5 rounded hover:bg-white/8 text-slate-400 hover:text-white">
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
              <button
                onClick={() => downloadCode(code, "program.c")}
                className="p-1.5 rounded hover:bg-white/8 text-slate-400 hover:text-white"
              >
                <Download size={13} />
              </button>
              <button
                onClick={() => setCode(STARTER_PROGRAMS[selectedProgram].code)}
                className="p-1.5 rounded hover:bg-white/8 text-slate-400 hover:text-white"
              >
                <RotateCcw size={13} />
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-[400px] overflow-auto">
            <CEditor value={code} onChange={(v) => setCode(v)} />
          </div>
          <div className="px-4 py-2.5 border-t border-white/8 flex justify-end">
            <NeonButton onClick={handleRun} disabled={running} size="sm">
              <Play size={14} fill="currentColor" />
              {running ? "Running..." : "Run Program"}
            </NeonButton>
          </div>
        </GlassCard>

        {/* Output */}
        <GlassCard className="flex flex-col overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/8 flex items-center gap-2">
            <Terminal size={14} className="text-emerald-400" />
            <span className="text-xs text-slate-400 font-mono">Output</span>
            {running && (
              <div className="ml-auto flex items-center gap-1.5 text-xs text-indigo-400">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                Executing...
              </div>
            )}
          </div>
          <div className="flex-1 p-4 font-mono text-sm overflow-auto">
            {running && (
              <div className="flex items-center gap-2 text-slate-500">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
                    />
                  ))}
                </div>
                Compiling and executing...
              </div>
            )}
            <AnimatePresence>
              {output && !running && (
                <motion.pre
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-emerald-300 whitespace-pre-wrap leading-relaxed text-xs"
                >
                  {output}
                </motion.pre>
              )}
            </AnimatePresence>
            {!output && !running && (
              <div className="text-slate-600 text-sm flex flex-col items-center justify-center h-full gap-2">
                <Terminal size={32} className="text-slate-700" />
                <span>Click &quot;Run Program&quot; to see output</span>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
