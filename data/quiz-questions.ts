export interface QuizQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export const quizQuestions: QuizQuestion[] = [
  // FIRST & FOLLOW
  {
    id: "ff1",
    topic: "first-follow",
    question: "FIRST(A) for the production A → ε contains?",
    options: ["ε (epsilon)", "$ (end marker)", "All terminals", "Nothing"],
    correct: 0,
    explanation: "If A can derive ε, then ε is added to FIRST(A).",
    difficulty: "Easy",
  },
  {
    id: "ff2",
    topic: "first-follow",
    question: "FOLLOW(S) where S is start symbol always contains?",
    options: ["ε", "$ (end-of-input marker)", "All terminals", "FIRST(S)"],
    correct: 1,
    explanation: "The end-of-input marker $ is always in FOLLOW of the start symbol.",
    difficulty: "Easy",
  },
  {
    id: "ff3",
    topic: "first-follow",
    question: "For A → αBβ, what is added to FOLLOW(B)?",
    options: [
      "FIRST(β) - {ε}",
      "FIRST(β) - {ε}, and FOLLOW(A) if ε ∈ FIRST(β)",
      "FOLLOW(A)",
      "FIRST(α)",
    ],
    correct: 1,
    explanation:
      "Add FIRST(β) - {ε} to FOLLOW(B). If β can derive ε, also add FOLLOW(A).",
    difficulty: "Medium",
  },
  {
    id: "ff4",
    topic: "first-follow",
    question: "For grammar: S → AB, A → a | ε, B → b. What is FIRST(S)?",
    options: ["{a, b}", "{a}", "{b}", "{a, b, ε}"],
    correct: 0,
    explanation:
      "FIRST(A) = {a, ε}. Since A can derive ε, we also include FIRST(B) = {b}. So FIRST(S) = {a, b}.",
    difficulty: "Medium",
  },
  {
    id: "ff5",
    topic: "first-follow",
    question:
      "If A → B C D and B, C can derive ε but D cannot, what is FIRST(A)?",
    options: [
      "FIRST(B) ∪ FIRST(C) ∪ FIRST(D)",
      "FIRST(B)",
      "FIRST(D)",
      "FIRST(B) ∪ FIRST(C)",
    ],
    correct: 0,
    explanation:
      "Since B and C can derive ε, we keep going. D cannot derive ε, so FIRST(A) = FIRST(B)∪FIRST(C)∪FIRST(D) minus ε.",
    difficulty: "Hard",
  },

  // Left Recursion
  {
    id: "lr1",
    topic: "left-recursion",
    question: "A grammar is left-recursive if?",
    options: [
      "A → Aα for some α",
      "A → αA for some α",
      "A → α | β",
      "A derives ε",
    ],
    correct: 0,
    explanation:
      "Direct left recursion occurs when a non-terminal A has a production A → Aα.",
    difficulty: "Easy",
  },
  {
    id: "lr2",
    topic: "left-recursion",
    question:
      "After removing left recursion from A → Aα | β, what is the result?",
    options: [
      "A → βA', A' → αA' | ε",
      "A → αβ | ε",
      "A → βα | ε",
      "A → αA | β",
    ],
    correct: 0,
    explanation:
      "Left recursion removal: A → βA', A' → αA' | ε where A' is a new non-terminal.",
    difficulty: "Medium",
  },
  {
    id: "lr3",
    topic: "left-recursion",
    question: "Left recursion causes problems in which type of parser?",
    options: [
      "Top-down parsers",
      "Bottom-up parsers",
      "Both",
      "Neither",
    ],
    correct: 0,
    explanation:
      "Top-down parsers (like recursive descent) loop infinitely with left-recursive grammars.",
    difficulty: "Easy",
  },

  // Predictive Parsing
  {
    id: "pp1",
    topic: "predictive-parsing",
    question: "Predictive parsing requires the grammar to be?",
    options: ["LL(1)", "LR(1)", "LALR(1)", "SLR(1)"],
    correct: 0,
    explanation:
      "Predictive parsing (table-driven) works for LL(1) grammars where the parse table has no conflicts.",
    difficulty: "Easy",
  },
  {
    id: "pp2",
    topic: "predictive-parsing",
    question: "In predictive parsing, what action is taken when top of stack = current input?",
    options: [
      "Pop the stack and advance input",
      "Push production body",
      "Reduce",
      "Report error",
    ],
    correct: 0,
    explanation:
      "When TOS matches the current input terminal, pop the stack and advance the input pointer.",
    difficulty: "Easy",
  },
  {
    id: "pp3",
    topic: "predictive-parsing",
    question: "LL(1) parsing table entry M[A, a] is filled using?",
    options: [
      "a ∈ FIRST(α) or (ε ∈ FIRST(α) and a ∈ FOLLOW(A))",
      "Only FIRST sets",
      "Only FOLLOW sets",
      "State transitions",
    ],
    correct: 0,
    explanation:
      "For production A → α: add it to M[A,a] for each a in FIRST(α), and if ε∈FIRST(α), for each a in FOLLOW(A).",
    difficulty: "Medium",
  },

  // SLR Parsing
  {
    id: "slr1",
    topic: "slr-parsing",
    question: "SLR parsing uses which sets to resolve reduce conflicts?",
    options: ["FOLLOW sets", "FIRST sets", "FIRST and FOLLOW", "Lookahead sets"],
    correct: 0,
    explanation:
      "SLR uses FOLLOW(A) to determine when to apply a reduction for production A → α.",
    difficulty: "Medium",
  },
  {
    id: "slr2",
    topic: "slr-parsing",
    question: "What is the accept action in SLR parsing?",
    options: [
      "When S' → S• is in item set and input is $",
      "When stack is empty",
      "When input is empty",
      "When a GOTO is defined",
    ],
    correct: 0,
    explanation:
      "Accept when the augmented production S' → S• is in the current state and input is end marker $.",
    difficulty: "Medium",
  },

  // LR(0) Items
  {
    id: "lr0_1",
    topic: "lr0-items",
    question: "An LR(0) item is?",
    options: [
      "A production with a dot at some position",
      "A production with a lookahead",
      "A state in the DFA",
      "A grammar rule",
    ],
    correct: 0,
    explanation:
      "An LR(0) item is a grammar production with a dot (•) indicating how much has been parsed.",
    difficulty: "Easy",
  },
  {
    id: "lr0_2",
    topic: "lr0-items",
    question: "CLOSURE({A → α•Bβ}) includes?",
    options: [
      "All items B → •γ for each production B → γ",
      "Only the original item",
      "Items with lookahead $",
      "GOTO transitions",
    ],
    correct: 0,
    explanation:
      "For each item [A → α•Bβ], add all items [B → •γ] for every production B → γ.",
    difficulty: "Medium",
  },

  // LALR
  {
    id: "lalr1",
    topic: "lalr-table",
    question: "LALR parsing tables are constructed by?",
    options: [
      "Merging LR(1) states with same LR(0) core",
      "Merging LR(0) states with same lookahead",
      "Using only FOLLOW sets",
      "Extending SLR with 2-token lookahead",
    ],
    correct: 0,
    explanation:
      "LALR merges LR(1) states that have the same LR(0) core (items ignoring lookaheads).",
    difficulty: "Hard",
  },
  {
    id: "lalr2",
    topic: "lalr-table",
    question: "How many states does LALR have compared to canonical LR(1)?",
    options: [
      "Same or fewer (merged states)",
      "More states",
      "Exactly the same",
      "Half the states",
    ],
    correct: 0,
    explanation:
      "LALR has the same or fewer states than LR(1) because compatible states are merged.",
    difficulty: "Medium",
  },
];
