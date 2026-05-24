export interface TopicCode {
  title: string;
  filename: string;
  code: string;
}

export interface AlgorithmTopic {
  title: string;
  algorithms: Array<{ title: string; steps: string[] }>;
}

// ─── C Code Topics ────────────────────────────────────────────────────────────

export const C_CODE_TOPICS: TopicCode[] = [
  {
    title: "FIRST and FOLLOW Sets",
    filename: "first_follow.c",
    code: `#include <stdio.h>
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

int ntIndex(char c) {
    for (int i = 0; i < ntCount; i++)
        if (nonTerminals[i] == c) return i;
    return -1;
}

void addFirst(int i, char c) {
    for (int j = 0; j < firstCount[i]; j++)
        if (firstSets[i][j] == c) return;
    firstSets[i][firstCount[i]++] = c;
}

void addFollow(int i, char c) {
    for (int j = 0; j < followCount[i]; j++)
        if (followSets[i][j] == c) return;
    followSets[i][followCount[i]++] = c;
}

int hasEps(int i) {
    for (int j = 0; j < firstCount[i]; j++)
        if (firstSets[i][j] == '#') return 1;
    return 0;
}

void computeFirst() {
    int changed;
    do {
        changed = 0;
        for (int p = 0; p < prodCount; p++) {
            char A = prods[p].lhs;
            int  ai = ntIndex(A);
            char *B = prods[p].rhs;
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

void computeFollow(char startSym) {
    addFollow(ntIndex(startSym), '$');
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
                int allEps = 1;
                for (int k = j + 1; B[k]; k++) {
                    if (isupper(B[k])) {
                        int ci = ntIndex(B[k]);
                        int prev = followCount[bi];
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

int main() {
    char *grammar[] = {
        "E-Ter", "e-#", "e-+Te",
        "T-Ftr", "t-#", "t-*Ft",
        "F-i",   "F-(E)"
    };
    prodCount = 8;
    for (int i = 0; i < prodCount; i++) {
        prods[i].lhs = grammar[i][0];
        strcpy(prods[i].rhs, grammar[i] + 2);
    }
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
}`,
  },
  {
    title: "Left Recursion Removal",
    filename: "left_recursion.c",
    code: `#include <stdio.h>
#include <string.h>
#include <ctype.h>

#define MAX_PRODS   30
#define MAX_RHS     10
#define MAX_LEN     50

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

NTProds newProds[MAX_PRODS];
int newProdCount = 0;

void removeDirectLR(int idx) {
    char A = prods[idx].lhs;
    char recursive[MAX_RHS][MAX_LEN];
    char nonRec[MAX_RHS][MAX_LEN];
    int recCnt = 0, nonRecCnt = 0;

    for (int i = 0; i < prods[idx].count; i++) {
        const char *rhs = prods[idx].rhs[i];
        if (rhs[0] == A)
            strcpy(recursive[recCnt++], rhs + 1);
        else
            strcpy(nonRec[nonRecCnt++], rhs);
    }

    if (recCnt == 0) {
        newProds[newProdCount] = prods[idx];
        newProdCount++;
        return;
    }

    char Ap = tolower(A);
    char ApStr[3] = {Ap, '\\0'};

    int ni = newProdCount++;
    newProds[ni].lhs   = A;
    newProds[ni].count = 0;
    if (nonRecCnt == 0) {
        char tmp[MAX_LEN];
        sprintf(tmp, "%s", ApStr);
        strcpy(newProds[ni].rhs[newProds[ni].count++], tmp);
    }
    for (int i = 0; i < nonRecCnt; i++) {
        char tmp[MAX_LEN];
        sprintf(tmp, "%s%s", nonRec[i], ApStr);
        strcpy(newProds[ni].rhs[newProds[ni].count++], tmp);
    }

    int nj = newProdCount++;
    newProds[nj].lhs   = Ap;
    newProds[nj].count = 0;
    for (int i = 0; i < recCnt; i++) {
        char tmp[MAX_LEN];
        sprintf(tmp, "%s%s", recursive[i], ApStr);
        strcpy(newProds[nj].rhs[newProds[nj].count++], tmp);
    }
    strcpy(newProds[nj].rhs[newProds[nj].count++], "#");
}

void printGrammar(NTProds *g, int cnt) {
    for (int i = 0; i < cnt; i++) {
        char lhs = g[i].lhs;
        if (lhs >= 'a' && lhs <= 'z' && lhs != 'i')
            printf("%c' -> ", toupper(lhs));
        else
            printf("%c  -> ", lhs);
        for (int j = 0; j < g[i].count; j++) {
            const char *r = g[i].rhs[j];
            if (r[0] == '#') printf("epsilon");
            else              printf("%s", r);
            if (j < g[i].count - 1) printf(" | ");
        }
        printf("\\n");
    }
}

int main() {
    printf("=== Left Recursion Removal ===\\n\\n");
    addRule('E', "E+T"); addRule('E', "E-T"); addRule('E', "T");
    addRule('T', "T*F"); addRule('T', "T/F"); addRule('T', "F");
    addRule('F', "(E)"); addRule('F', "id");

    printf("--- Original Grammar ---\\n");
    printGrammar(prods, prodCount);

    for (int i = 0; i < prodCount; i++)
        removeDirectLR(i);

    printf("\\n--- After Removing Left Recursion ---\\n");
    printGrammar(newProds, newProdCount);

    printf("\\n--- Explanation ---\\n");
    printf("E -> E+T | E-T | T  became:\\n");
    printf("   E  -> TE'\\n");
    printf("   E' -> +TE' | -TE' | epsilon\\n\\n");
    printf("T -> T*F | T/F | F  became:\\n");
    printf("   T  -> FT'\\n");
    printf("   T' -> *FT' | /FT' | epsilon\\n");
    return 0;
}`,
  },
  {
    title: "LL(1) Parsing Table Construction",
    filename: "ll1_table.c",
    code: `#include <stdio.h>
#include <string.h>
#include <ctype.h>

/* LL(1) Parsing Table for expression grammar.
   Non-terminals: E(0) E'(1) T(2) T'(3) F(4)
   Terminals:     id(0) +(1) *(2) ((3) )(4) $(5)
   Productions:
     0: E  -> T E'     1: E' -> + T E'   2: E' -> eps
     3: T  -> F T'     4: T' -> * F T'   5: T' -> eps
     6: F  -> id       7: F  -> ( E )
*/
#define NUM_NT  5
#define NUM_T   6
#define NONE   -1

const char *ntNames[] = {"E", "E'", "T", "T'", "F"};
const char *tNames[]  = {"id", "+", "*", "(", ")", "$"};
const char *prodStr[] = {
  "E->TE'",  "E'->+TE'", "E'->eps",
  "T->FT'",  "T'->*FT'", "T'->eps",
  "F->id",   "F->(E)"
};

int firstSets[NUM_NT][NUM_T + 1];
int firstCount[NUM_NT];
int followSets[NUM_NT][NUM_T];
int followCount[NUM_NT];
int M[NUM_NT][NUM_T];

void initTable() {
    for (int i = 0; i < NUM_NT; i++)
        for (int j = 0; j < NUM_T; j++)
            M[i][j] = NONE;
}

void computeSets() {
    firstSets[0][0]=0; firstSets[0][1]=3; firstCount[0]=2;
    firstSets[1][0]=1; firstSets[1][1]=255; firstCount[1]=2;
    firstSets[2][0]=0; firstSets[2][1]=3; firstCount[2]=2;
    firstSets[3][0]=2; firstSets[3][1]=255; firstCount[3]=2;
    firstSets[4][0]=0; firstSets[4][1]=3; firstCount[4]=2;
    followSets[0][0]=4; followSets[0][1]=5; followCount[0]=2;
    followSets[1][0]=4; followSets[1][1]=5; followCount[1]=2;
    followSets[2][0]=1; followSets[2][1]=4; followSets[2][2]=5; followCount[2]=3;
    followSets[3][0]=1; followSets[3][1]=4; followSets[3][2]=5; followCount[3]=3;
    followSets[4][0]=2; followSets[4][1]=1; followSets[4][2]=4; followSets[4][3]=5;
    followCount[4]=4;
}

void fillTable() {
    M[0][0]=0; M[0][3]=0;
    M[1][1]=1; M[1][4]=2; M[1][5]=2;
    M[2][0]=3; M[2][3]=3;
    M[3][2]=4; M[3][1]=5; M[3][4]=5; M[3][5]=5;
    M[4][0]=6; M[4][3]=7;
}

void printTable() {
    printf("\\n=== LL(1) Parsing Table ===\\n\\n");
    printf("%-5s", "NT");
    for (int j = 0; j < NUM_T; j++) printf("%-14s", tNames[j]);
    printf("\\n");
    for (int i = 0; i < NUM_NT; i++) {
        printf("%-5s", ntNames[i]);
        for (int j = 0; j < NUM_T; j++) {
            if (M[i][j] == NONE) printf("%-14s", "error");
            else                 printf("%-14s", prodStr[M[i][j]]);
        }
        printf("\\n");
    }
}

int main() {
    computeSets(); initTable(); fillTable();
    printf("FIRST/FOLLOW Sets:\\n");
    for (int i = 0; i < NUM_NT; i++) {
        printf("FIRST(%-3s) = { ", ntNames[i]);
        for (int j = 0; j < firstCount[i]; j++)
            printf("%s ", firstSets[i][j]==255 ? "eps" : tNames[firstSets[i][j]]);
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
}`,
  },
  {
    title: "LR(0) Items and Closure",
    filename: "lr0_items.c",
    code: `#include <stdio.h>
#include <string.h>
#include <ctype.h>

#define MAX_ITEMS  100
#define MAX_SETS   50
#define MAX_SYMS   30

typedef struct { int prod; int dot; } Item;
typedef struct { Item items[MAX_ITEMS]; int count; } ItemSet;

/* Grammar:  0: S'->S  1: S->AA  2: A->aA  3: A->b */
const char *prods[] = {"S", "S", "A", "A"};
const char *rhs[]   = {"S", "AA", "aA", "b"};
int prodCount = 4;

ItemSet states[MAX_SETS];
int stateCount = 0;

int hasItem(ItemSet *s, int prod, int dot) {
    for (int i = 0; i < s->count; i++)
        if (s->items[i].prod == prod && s->items[i].dot == dot) return 1;
    return 0;
}

void closure(ItemSet *s) {
    int changed;
    do {
        changed = 0;
        for (int i = 0; i < s->count; i++) {
            int p = s->items[i].prod, d = s->items[i].dot;
            const char *r = rhs[p];
            if (d >= (int)strlen(r)) continue;
            char sym = r[d];
            if (!isupper(sym)) continue;
            for (int j = 0; j < prodCount; j++) {
                if (prods[j][0] == sym && !hasItem(s, j, 0)) {
                    s->items[s->count].prod = j;
                    s->items[s->count].dot  = 0;
                    s->count++; changed = 1;
                }
            }
        }
    } while (changed);
}

ItemSet gotoSet(ItemSet *s, char X) {
    ItemSet result = { .count = 0 };
    for (int i = 0; i < s->count; i++) {
        int p = s->items[i].prod, d = s->items[i].dot;
        const char *r = rhs[p];
        if (d < (int)strlen(r) && r[d] == X && !hasItem(&result, p, d+1)) {
            result.items[result.count].prod = p;
            result.items[result.count].dot  = d + 1;
            result.count++;
        }
    }
    closure(&result);
    return result;
}

int setsEqual(ItemSet *a, ItemSet *b) {
    if (a->count != b->count) return 0;
    for (int i = 0; i < a->count; i++)
        if (!hasItem(b, a->items[i].prod, a->items[i].dot)) return 0;
    return 1;
}

int findOrAdd(ItemSet *s) {
    for (int i = 0; i < stateCount; i++)
        if (setsEqual(&states[i], s)) return i;
    states[stateCount++] = *s;
    return stateCount - 1;
}

void printItem(int prod, int dot) {
    const char *r = rhs[prod];
    printf("  %s -> ", prods[prod]);
    for (int i = 0; i < (int)strlen(r); i++) {
        if (i == dot) printf(". ");
        printf("%c ", r[i]);
    }
    if (dot == (int)strlen(r)) printf(".");
    printf("\\n");
}

int main() {
    printf("=== LR(0) Item Sets ===\\n\\n");
    ItemSet I0 = { .count = 1 };
    I0.items[0].prod = 0; I0.items[0].dot = 0;
    closure(&I0);
    stateCount = 1; states[0] = I0;

    char symbols[MAX_SYMS]; int symCount = 0;
    for (int i = 0; i < prodCount; i++) {
        for (int j = 0; rhs[i][j]; j++) {
            char c = rhs[i][j]; int found = 0;
            for (int k = 0; k < symCount; k++) if (symbols[k]==c){found=1;break;}
            if (!found) symbols[symCount++] = c;
        }
        char c = prods[i][0]; int found = 0;
        for (int k = 0; k < symCount; k++) if (symbols[k]==c){found=1;break;}
        if (!found) symbols[symCount++] = c;
    }

    for (int i = 0; i < stateCount; i++)
        for (int s = 0; s < symCount; s++) {
            ItemSet g = gotoSet(&states[i], symbols[s]);
            if (g.count > 0) findOrAdd(&g);
        }

    for (int i = 0; i < stateCount; i++) {
        printf("I%d:\\n", i);
        for (int j = 0; j < states[i].count; j++)
            printItem(states[i].items[j].prod, states[i].items[j].dot);
        printf("  Transitions:\\n");
        for (int s = 0; s < symCount; s++) {
            ItemSet g = gotoSet(&states[i], symbols[s]);
            if (g.count == 0) continue;
            int to = -1;
            for (int k = 0; k < stateCount; k++)
                if (setsEqual(&states[k], &g)) { to = k; break; }
            if (to >= 0) printf("    GOTO(%d,%c) = I%d\\n", i, symbols[s], to);
        }
        printf("\\n");
    }
    printf("Total states: %d\\n", stateCount);
    return 0;
}`,
  },
  {
    title: "LR(1) Items",
    filename: "lr1_items.c",
    code: `#include <stdio.h>
#include <string.h>

/* LR(1) item: [A -> alpha . beta, a]
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
        if(s->items[i].prod==prod&&s->items[i].dot==dot&&s->items[i].lookahead==la)
            return 1;
    return 0;
}

char firstOfString(const char *str, char la) {
    if(!str[0]) return la;
    if(str[0]>='a'&&str[0]<='z') return str[0];
    return la;
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
    LR1Set I0; I0.count=1;
    I0.items[0].prod=0; I0.items[0].dot=0; I0.items[0].lookahead='$';
    closure(&I0);
    printSet(&I0,0);
    printf("  (Use GOTO to expand further states...)\\n");
    return 0;
}`,
  },
  {
    title: "SLR Parsing Algorithm",
    filename: "slr_parser.c",
    code: `#include <stdio.h>
#include <string.h>
#include <stdlib.h>

/* SLR Parser: S' -> S, S -> AA, A -> aA | b
   FOLLOW(S)={$}, FOLLOW(A)={a,b,$}
*/
#define SHIFT    1
#define REDUCE   2
#define ACCEPT   3
#define ERROR    0
#define NUM_STATES 7
#define NUM_TERMS  3
#define NUM_NT     2

/* ACTION[state][terminal: a=0, b=1, $=2] */
int action[NUM_STATES][NUM_TERMS] = {
    {SHIFT*10+3, SHIFT*10+4, ERROR      },
    {ERROR,      ERROR,      ACCEPT     },
    {SHIFT*10+3, SHIFT*10+4, ERROR      },
    {SHIFT*10+3, SHIFT*10+4, ERROR      },
    {REDUCE*100+3, REDUCE*100+3, REDUCE*100+3},
    {ERROR,        ERROR,        REDUCE*100+1},
    {REDUCE*100+2, REDUCE*100+2, REDUCE*100+2},
};

/* GOTO[state][NT: S=0, A=1] */
int goTo[NUM_STATES][NUM_NT] = {
    {1,2},{-1,-1},{-1,5},{-1,6},{-1,-1},{-1,-1},{-1,-1}
};

const char *prodStr[] = {"","S->AA","A->aA","A->b"};
int prodLen[] = {0,2,2,1};
int prodNT[]  = {-1,0,1,1};
char termSym[] = {'a','b','$'};

int termIdx(char c) {
    for(int i=0;i<NUM_TERMS;i++) if(termSym[i]==c) return i;
    return -1;
}

int stateStack[200]; int sp=0;
void pushState(int s){stateStack[sp++]=s;}
int  topState()      {return stateStack[sp-1];}
void popStates(int n){sp-=n;}

int main(){
    char input[]="aabb$"; int ip=0;
    printf("SLR Parsing of: aabb\\n\\n");
    printf("%-12s %-15s %-10s\\n","Stack","Input","Action");
    printf("%.42s\\n","------------------------------------------");
    pushState(0);
    while(1){
        int state=topState(), ti=termIdx(input[ip]);
        printf("[");
        for(int i=0;i<sp;i++) printf("%d ",stateStack[i]);
        printf("] %-14s", input+ip);
        if(ti<0){printf("ERROR\\n");return 1;}
        int act=action[state][ti];
        if(act==ACCEPT){printf("ACCEPT\\n");break;}
        else if(act==ERROR){printf("ERROR\\n");return 1;}
        else if(act/100==REDUCE){
            int prod=act%100;
            printf("Reduce: %s\\n",prodStr[prod]);
            popStates(prodLen[prod]);
            int ns=goTo[topState()][prodNT[prod]];
            if(ns<0){printf("GOTO ERROR\\n");return 1;}
            pushState(ns);
        } else if(act/10==SHIFT){
            printf("Shift to state %d\\n",act%10);
            pushState(act%10); ip++;
        }
    }
    return 0;
}`,
  },
  {
    title: "Non-Recursive Predictive Parsing",
    filename: "predictive_parser.c",
    code: `#include <stdio.h>
#include <string.h>

/* Non-recursive predictive parser for expression grammar
   E->TE' | E'->+TE'|eps | T->FT' | T'->*FT'|eps | F->id|(E)
   Terminals:    id(0) +(1) *(2) ((3) )(4) $(5)
   Productions:  0:E->TE' 1:E'->eps 2:E'->+TE'
                 3:T->FT' 4:T'->eps 5:T'->*FT'
                 6:F->id  7:F->(E)
*/
#define STACK_MAX 200
#define NUM_NT    5
#define NUM_T     6
#define ERROR    -1

int M[NUM_NT][NUM_T] = {
    { 0,-1,-1, 0,-1,-1},
    {-1, 2,-1,-1, 1, 1},
    { 3,-1,-1, 3,-1,-1},
    {-1, 4, 5,-1, 4, 4},
    { 6,-1,-1, 7,-1,-1}
};

const char *prodRHS[] = {
    "T e","","+ T e","F t","","* F t","i","( E )"
};
const char *prodStr[] = {
    "E->TE'","E'->eps","E'->+TE'",
    "T->FT'","T'->eps","T'->*FT'",
    "F->id","F->(E)"
};

char terminals[]   = {'i','+','*','(',')',  '$'};
char nonTerminals[] = {'E','e','T','t','F'};

char stack[STACK_MAX]; int top=-1;
void push(char c){stack[++top]=c;}
char pop(){return stack[top--];}
char peek(){return stack[top];}

int termIdx(char c){for(int i=0;i<NUM_T;i++) if(terminals[i]==c) return i; return -1;}
int ntIdx(char c)  {for(int i=0;i<NUM_NT;i++) if(nonTerminals[i]==c) return i; return -1;}

void printStack(){
    for(int i=0;i<=top;i++){
        char c=stack[i];
        if(c=='i') printf("id ");
        else if(c=='e') printf("E' ");
        else if(c=='t') printf("T' ");
        else printf("%c ",c);
    }
}

int main(){
    char input[]="i+i*i$"; int ip=0;
    printf("Parsing: id + id * id\\n\\n");
    printf("%-28s %-20s %s\\n","Stack","Input","Action");
    printf("%.60s\\n","------------------------------------------------------------");
    push('$'); push('E');
    while(1){
        printStack();
        printf("  ");
        for(int i=ip;input[i];i++) printf("%c",input[i]);
        printf("  ");
        char X=peek(), a=input[ip];
        if(X=='$'&&a=='$'){printf("ACCEPT\\n"); break;}
        if(X==a||(X=='i'&&a=='i')){
            printf("Match %s\\n",a=='i'?"id":(char[]){a,0});
            pop(); ip++;
        } else {
            int ni=ntIdx(X), ti=termIdx(a);
            if(ni==-1||ti==-1){printf("ERROR\\n");return 1;}
            int prod=M[ni][ti];
            if(prod==ERROR){printf("ERROR\\n");return 1;}
            printf("Expand: %s\\n",prodStr[prod]);
            pop();
            const char *rhs=prodRHS[prod];
            if(rhs[0]){
                char tokens[20][10]; int tCount=0;
                char tmp[50]; strcpy(tmp,rhs);
                char *tok=strtok(tmp," ");
                while(tok){strcpy(tokens[tCount++],tok);tok=strtok(NULL," ");}
                for(int i=tCount-1;i>=0;i--) push(tokens[i][0]);
            }
        }
    }
    return 0;
}`,
  },
];

// ─── Algorithm Topics ─────────────────────────────────────────────────────────

export const ALGORITHM_TOPICS: AlgorithmTopic[] = [
  {
    title: "FIRST and FOLLOW Sets",
    algorithms: [
      {
        title: "Algorithm: Compute FIRST Sets",
        steps: [
          "Initialize FIRST(X) = {} for every grammar symbol X",
          "For each terminal a: FIRST(a) = {a}",
          "For each production X -> eps: add eps to FIRST(X)",
          "For each production X -> Y1 Y2 ... Yk: add FIRST(Y1) - {eps} to FIRST(X)",
          "If eps in FIRST(Y1): also add FIRST(Y2) - {eps} to FIRST(X), and so on",
          "If eps in FIRST(Yi) for all i = 1..k: add eps to FIRST(X)",
          "Repeat steps 3-6 until no FIRST set changes (fixed-point iteration)",
        ],
      },
      {
        title: "Algorithm: Compute FOLLOW Sets",
        steps: [
          "Initialize FOLLOW(S) = {$} (S is the start symbol); all others = {}",
          "For each production A -> aBb: add FIRST(b) - {eps} to FOLLOW(B)",
          "For each production A -> aBb where eps in FIRST(b): add FOLLOW(A) to FOLLOW(B)",
          "For each production A -> aB (B at the end): add FOLLOW(A) to FOLLOW(B)",
          "Repeat steps 2-4 until no FOLLOW set changes",
        ],
      },
    ],
  },
  {
    title: "Left Recursion Removal",
    algorithms: [
      {
        title: "Algorithm: Remove Direct Left Recursion from A",
        steps: [
          "Group all productions for A: A -> Aa1 | Aa2 | ... | b1 | b2 | ...",
          "Separate recursive alternatives (start with A) and non-recursive (bi)",
          "Create a new non-terminal A'",
          "Replace A's productions: A -> b1 A' | b2 A' | ...",
          "Add: A' -> a1 A' | a2 A' | ... | eps",
          "Delete the original left-recursive productions",
        ],
      },
      {
        title: "Algorithm: Remove All Left Recursion (Including Indirect)",
        steps: [
          "Arrange non-terminals in order: A1, A2, ..., An",
          "For i = 1 to n:",
          "  For j = 1 to i-1:",
          "    For each production Ai -> Aj g: replace with Ai -> d1 g | d2 g | ... (where Aj -> d1 | d2 | ...)",
          "  Apply direct left recursion removal algorithm to Ai",
          "Remove any useless non-terminals introduced",
        ],
      },
    ],
  },
  {
    title: "LL(1) Parsing Table Construction",
    algorithms: [
      {
        title: "Algorithm: LL(1) Parsing Table Construction",
        steps: [
          "Prerequisite: compute FIRST and FOLLOW sets for all non-terminals",
          "Initialize: set M[A, a] = error for all non-terminals A and terminals a",
          "For each production A -> a in the grammar:",
          "  For each terminal a in FIRST(a): add A -> a to M[A, a]",
          "  If eps in FIRST(a): for each terminal b in FOLLOW(A): add A -> a to M[A, b]",
          "  If eps in FIRST(a) and $ in FOLLOW(A): add A -> a to M[A, $]",
          "If any cell M[A, a] has more than one production: grammar is NOT LL(1)",
        ],
      },
    ],
  },
  {
    title: "LR(0) Items and Closure",
    algorithms: [
      {
        title: "Algorithm 1: CLOSURE(I)",
        steps: [
          "Add all items in I to the result set",
          "For each item [A -> a.Bb] in the result where B is a non-terminal:",
          "  For each production B -> g in the grammar:",
          "    If [B -> .g] is not already in the result: add it",
          "Repeat steps 2-3 until no new items are added (fixed point)",
        ],
      },
      {
        title: "Algorithm 2: GOTO(I, X)",
        steps: [
          "Collect all items [A -> aX.b] where [A -> a.Xb] is in I",
          "Return CLOSURE of that collected set",
        ],
      },
      {
        title: "Algorithm 3: Canonical LR(0) Collection",
        steps: [
          "Augment grammar: add S' -> S",
          "Initialize: C = { CLOSURE({[S' -> .S]}) }",
          "For each item set I in C and each grammar symbol X:",
          "  Compute J = GOTO(I, X)",
          "  If J != {} and J not in C: add J to C",
          "Repeat until no new item sets are added to C",
        ],
      },
    ],
  },
  {
    title: "LR(1) Items",
    algorithms: [
      {
        title: "Algorithm 1: LR(1) CLOSURE(I)",
        steps: [
          "Add all items in I to the result set",
          "For each item [A -> a.Bb, a] where B is a non-terminal:",
          "  For each production B -> g:",
          "    For each terminal b in FIRST(ba):",
          "      If [B -> .g, b] is not already in result: add it",
          "Repeat until no new items are added",
        ],
      },
      {
        title: "Algorithm 2: LR(1) GOTO(I, X)",
        steps: [
          "Collect all items [A -> aX.b, a] where [A -> a.Xb, a] is in I",
          "Return LR(1) CLOSURE of that collected set",
        ],
      },
      {
        title: "Algorithm 3: Canonical LR(1) Collection",
        steps: [
          "Augment grammar: add S' -> S",
          "Initialize: C = { CLOSURE({[S' -> .S, $]}) }",
          "For each item set I in C and each grammar symbol X:",
          "  Compute J = GOTO(I, X)",
          "  If J != {} and J not in C: add J to C",
          "Repeat until no new item sets are added",
        ],
      },
    ],
  },
  {
    title: "SLR Parsing Table Construction",
    algorithms: [
      {
        title: "Algorithm: SLR Parsing Table Construction",
        steps: [
          "Step 1 — Augment grammar: add production S' -> S",
          "Step 2 — Build canonical LR(0) collection C = {I0, I1, ..., In}",
          "Step 3 — Compute FOLLOW sets for all non-terminals",
          "Step 4 — For each state Ii, fill ACTION table:",
          "  If [A -> a.ab] in Ii and GOTO(Ii, a) = Ij (terminal): ACTION[i, a] = shift j",
          "  If [A -> a.] in Ii and A != S': for each a in FOLLOW(A): ACTION[i, a] = reduce A->a",
          "  If [S' -> S.] in Ii: ACTION[i, $] = accept",
          "Step 5 — Fill GOTO table: if GOTO(Ii, A) = Ij (non-terminal): GOTO[i, A] = j",
          "Step 6 — Undefined entries are errors; multiple entries = not SLR(1)",
        ],
      },
    ],
  },
  {
    title: "LALR Parsing Table Construction",
    algorithms: [
      {
        title: "Algorithm: LALR Table Construction (via LR(1))",
        steps: [
          "Step 1 — Build the complete canonical LR(1) collection of item sets",
          "Step 2 — Find all pairs of LR(1) states with the same LR(0) core (same items, ignoring lookaheads)",
          "Step 3 — Merge each group of same-core states: union their lookahead sets",
          "Step 4 — Check merged states for reduce-reduce conflicts (if found: grammar is not LALR(1))",
          "Step 5 — Build ACTION table from merged states:",
          "  If [A -> a.ab, _] and GOTO on terminal a -> state j: ACTION[state, a] = shift j",
          "  If [A -> a., a] (A != S'): ACTION[state, a] = reduce A -> a",
          "  If [S' -> S., $]: ACTION[state, $] = accept",
          "Step 6 — Build GOTO table: GOTO[state, A] = merged state for non-terminal A transitions",
        ],
      },
    ],
  },
  {
    title: "SLR Parsing Algorithm",
    algorithms: [
      {
        title: "Algorithm: SLR Parsing",
        steps: [
          "Prerequisite: build the SLR ACTION and GOTO tables from the LR(0) automaton",
          "Initialize: push state 0 onto the state stack; set ip to first input symbol",
          "Let s = top of state stack; a = current input symbol",
          "If ACTION[s, a] = shift t: push state t; advance ip to next symbol",
          "If ACTION[s, a] = reduce A -> b: pop |b| states; let s' = new top; push GOTO[s', A]; output A -> b",
          "If ACTION[s, a] = accept: parsing complete — success",
          "If ACTION[s, a] = error: call error recovery",
          "Repeat from step 3",
        ],
      },
    ],
  },
  {
    title: "Non-Recursive Predictive Parsing",
    algorithms: [
      {
        title: "Algorithm: Non-Recursive Predictive Parsing",
        steps: [
          "Prerequisite: construct the LL(1) parsing table M for the grammar",
          "Initialize: push $ then start symbol S onto the stack; set ip to first input token",
          "Let X = top of stack, a = current input symbol",
          "If X = a = $: ACCEPT — parsing is complete",
          "If X = a (both same terminal): pop X from stack, advance ip",
          "If X is a non-terminal: look up M[X, a]",
          "If M[X, a] = X -> Y1 Y2 ... Yk: pop X, push Yk, ..., Y2, Y1 (reverse order)",
          "If M[X, a] = error: invoke error recovery routine",
          "Repeat from step 3",
        ],
      },
    ],
  },
];
