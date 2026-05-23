export interface PracticeProblem {
  id: string;
  topic: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  statement: string;
  input: string;
  output: string;
  hint: string;
  solution: string;
  xp: number;
}

export const practiceProblems: PracticeProblem[] = [
  {
    id: "p1",
    topic: "first-follow",
    title: "Compute FIRST Sets",
    difficulty: "Beginner",
    statement:
      "Given the grammar:\nE → TE'\nE' → +TE' | ε\nT → FT'\nT' → *FT' | ε\nF → (E) | id\n\nCompute FIRST(E), FIRST(E'), FIRST(T), FIRST(T'), FIRST(F).",
    input: "Grammar as shown above",
    output:
      "FIRST(E) = {(, id}\nFIRST(E') = {+, ε}\nFIRST(T) = {(, id}\nFIRST(T') = {*, ε}\nFIRST(F) = {(, id}",
    hint: "Start with terminal productions first, then propagate upward.",
    solution: `/* FIRST Set Computation for Expression Grammar */
FIRST(F) = { (, id }          // F → (E) gives (, F → id gives id

FIRST(T') = { *, ε }         // T' → *FT' gives *, T' → ε gives ε

FIRST(T) = FIRST(F) = { (, id }  // T → FT', dot at F, F can't derive ε

FIRST(E') = { +, ε }         // E' → +TE' gives +, E' → ε gives ε

FIRST(E) = FIRST(T) = { (, id }  // E → TE', T can't derive ε`,
    xp: 50,
  },
  {
    id: "p2",
    topic: "first-follow",
    title: "Compute FOLLOW Sets",
    difficulty: "Beginner",
    statement:
      "Using the grammar from Problem 1:\nE → TE'\nE' → +TE' | ε\nT → FT'\nT' → *FT' | ε\nF → (E) | id\n\nCompute FOLLOW(E), FOLLOW(E'), FOLLOW(T), FOLLOW(T'), FOLLOW(F).",
    input: "Grammar as shown above",
    output:
      "FOLLOW(E) = {$, )}\nFOLLOW(E') = {$, )}\nFOLLOW(T) = {+, $, )}\nFOLLOW(T') = {+, $, )}\nFOLLOW(F) = {*, +, $, )}",
    hint: "Start with FOLLOW(E) = {$} since E is start symbol. Use rule: if A→αBβ, add FIRST(β)-{ε} to FOLLOW(B).",
    solution: `FOLLOW(E) = { $, ) }
  // E is start symbol → add $
  // F → (E) → ) follows E → add )

FOLLOW(E') = { $, ) }
  // E → TE' → E' is at end → add FOLLOW(E)

FOLLOW(T) = { +, $, ) }
  // E → TE' → add FIRST(E')-{ε} = {+}
  // Since ε ∈ FIRST(E'), also add FOLLOW(E) = {$,)}

FOLLOW(T') = { +, $, ) }
  // T → FT' → T' at end → add FOLLOW(T)

FOLLOW(F) = { *, +, $, ) }
  // T → FT' → add FIRST(T')-{ε} = {*}
  // Since ε ∈ FIRST(T'), also add FOLLOW(T)`,
    xp: 75,
  },
  {
    id: "p3",
    topic: "left-recursion",
    title: "Remove Direct Left Recursion",
    difficulty: "Beginner",
    statement:
      "Remove left recursion from:\nE → E + T | E - T | T\nT → T * F | T / F | F\nF → id | ( E )",
    input: "Grammar with left recursion",
    output: "Grammar without left recursion (using E', T' primes)",
    hint: "For A → Aα₁ | Aα₂ | β₁ | β₂, convert to A → β₁A' | β₂A', A' → α₁A' | α₂A' | ε",
    solution: `E  → TE'
E' → +TE' | -TE' | ε

T  → FT'
T' → *FT' | /FT' | ε

F  → id | (E)

Explanation:
- E had: E + T | E - T | T
  α₁=+T, α₂=-T, β=T
  → E → TE', E' → +TE' | -TE' | ε

- T had: T * F | T / F | F
  α₁=*F, α₂=/F, β=F
  → T → FT', T' → *FT' | /FT' | ε`,
    xp: 60,
  },
  {
    id: "p4",
    topic: "predictive-parsing",
    title: "Predictive Parsing Trace",
    difficulty: "Intermediate",
    statement:
      "Using the grammar:\nE → TE'\nE' → +TE' | ε\nT → FT'\nT' → *FT' | ε\nF → id\n\nTrace the predictive parsing of input: id + id * id $",
    input: "id + id * id $",
    output: "Complete parsing trace showing stack, input, and action at each step",
    hint: "Initialize with: Stack = [E, $], Input = id+id*id$. Match terminals, expand non-terminals using M[A,a].",
    solution: `Stack          Input           Action
[$E]           id+id*id$       M[E,id]→E→TE'
[$E'T]         id+id*id$       M[T,id]→T→FT'
[$E'T'F]       id+id*id$       M[F,id]→F→id
[$E'T'id]      id+id*id$       Match id, pop
[$E'T']        +id*id$         M[T',+]→T'→ε
[$E']          +id*id$         M[E',+]→E'→+TE'
[$E'T+]        +id*id$         Match +, pop
[$E'T]         id*id$          M[T,id]→T→FT'
[$E'T'F]       id*id$          M[F,id]→F→id
[$E'T'id]      id*id$          Match id, pop
[$E'T']        *id$            M[T',*]→T'→*FT'
[$E'T'F*]      *id$            Match *, pop
[$E'T'F]       id$             M[F,id]→F→id
[$E'T'id]      id$             Match id, pop
[$E'T']        $               M[T',$]→T'→ε
[$E']          $               M[E',$]→E'→ε
[$]            $               ACCEPT`,
    xp: 150,
  },
  {
    id: "p5",
    topic: "slr-parsing",
    title: "Construct LR(0) Items",
    difficulty: "Advanced",
    statement:
      "For the augmented grammar:\nS' → S\nS → AA\nA → aA | b\n\nConstruct the canonical collection of LR(0) item sets.",
    input: "Augmented grammar as shown",
    output: "All item sets I₀ through Iₙ with transitions",
    hint: "Start with CLOSURE({S'→•S}). Then apply GOTO for each grammar symbol.",
    solution: `I₀ = CLOSURE({S'→•S})
= { S'→•S, S→•AA, A→•aA, A→•b }

GOTO(I₀, S) → I₁ = { S'→S• }  [ACCEPT state]
GOTO(I₀, A) → I₂ = CLOSURE({S→A•A})
= { S→A•A, A→•aA, A→•b }
GOTO(I₀, a) → I₃ = CLOSURE({A→a•A})
= { A→a•A, A→•aA, A→•b }
GOTO(I₀, b) → I₄ = { A→b• }

GOTO(I₂, A) → I₅ = { S→AA• }  [REDUCE]
GOTO(I₂, a) → I₃ (same as above)
GOTO(I₂, b) → I₄ (same as above)

GOTO(I₃, A) → I₆ = { A→aA• }  [REDUCE]
GOTO(I₃, a) → I₃ (same, recursive)
GOTO(I₃, b) → I₄ (same)`,
    xp: 200,
  },
  {
    id: "p6",
    topic: "ll1-table",
    title: "Construct LL(1) Parsing Table",
    difficulty: "Intermediate",
    statement:
      "Construct the LL(1) parsing table for:\nS → iEtSS' | a\nS' → eS | ε\nE → b\n\nUsing the FIRST and FOLLOW sets you compute.",
    input: "Grammar as shown",
    output: "Complete M[A, a] parsing table",
    hint: "First compute FIRST and FOLLOW for all non-terminals, then fill M[A,a] for each production.",
    solution: `FIRST(S)  = {i, a}
FIRST(S') = {e, ε}
FIRST(E)  = {b}
FOLLOW(S) = {$, e}
FOLLOW(S') = {$, e}
FOLLOW(E) = {t}

Parsing Table M[A, a]:
      | a           | b    | e       | i              | t  | $
------+-------------+------+---------+----------------+----+-------
S     | S→a         |      |         | S→iEtSS'       |    |
S'    |             |      | S'→eS   |                |    | S'→ε
      |             |      | S'→ε    |                |    |
E     |             | E→b  |         |                |    |

Note: M[S',e] has two entries (dangling else ambiguity)
This grammar is NOT LL(1) due to this conflict.`,
    xp: 175,
  },
];
