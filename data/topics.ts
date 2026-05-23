export interface Topic {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  icon: string;
  color: string;
  tags: string[];
  estimatedTime: string;
}

export const topics: Topic[] = [
  {
    id: "first-follow",
    title: "FIRST and FOLLOW Sets",
    shortTitle: "FIRST & FOLLOW",
    description:
      "Compute FIRST and FOLLOW sets for Context-Free Grammars — the foundation of top-down parsing.",
    difficulty: "Beginner",
    icon: "⊢",
    color: "from-blue-500 to-cyan-500",
    tags: ["CFG", "Top-Down", "Sets"],
    estimatedTime: "45 min",
  },
  {
    id: "left-recursion",
    title: "Left Recursion Removal",
    shortTitle: "Left Recursion",
    description:
      "Eliminate left recursion from grammars to enable top-down parsing without infinite loops.",
    difficulty: "Beginner",
    icon: "↩",
    color: "from-emerald-500 to-teal-500",
    tags: ["Grammar", "Transformation"],
    estimatedTime: "30 min",
  },
  {
    id: "predictive-parsing",
    title: "Predictive Parsing (Non-Recursive)",
    shortTitle: "Predictive Parsing",
    description:
      "Table-driven LL(1) parsing using an explicit stack — understand shift/reduce decisions.",
    difficulty: "Intermediate",
    icon: "⊕",
    color: "from-violet-500 to-purple-500",
    tags: ["LL(1)", "Stack", "Table-Driven"],
    estimatedTime: "60 min",
  },
  {
    id: "ll1-table",
    title: "LL(1) Parsing Table Construction",
    shortTitle: "LL(1) Table",
    description:
      "Build the predictive parsing table from FIRST and FOLLOW sets step by step.",
    difficulty: "Intermediate",
    icon: "⊞",
    color: "from-orange-500 to-yellow-500",
    tags: ["LL(1)", "Table Construction"],
    estimatedTime: "45 min",
  },
  {
    id: "slr-parsing",
    title: "SLR Parsing Algorithm",
    shortTitle: "SLR Parsing",
    description:
      "Simple LR parsing — understand the canonical LR(0) automaton and SLR parse actions.",
    difficulty: "Advanced",
    icon: "⊛",
    color: "from-rose-500 to-pink-500",
    tags: ["SLR", "Bottom-Up", "LR"],
    estimatedTime: "75 min",
  },
  {
    id: "lr0-items",
    title: "LR(0) Items and Closure",
    shortTitle: "LR(0) Items",
    description:
      "Generate LR(0) items, compute closure, and build the canonical collection of sets.",
    difficulty: "Advanced",
    icon: "◉",
    color: "from-cyan-500 to-sky-500",
    tags: ["LR(0)", "Closure", "DFA"],
    estimatedTime: "60 min",
  },
  {
    id: "lr1-items",
    title: "LR(1) Items",
    shortTitle: "LR(1) Items",
    description:
      "Extend LR(0) items with lookahead symbols to get canonical LR(1) items.",
    difficulty: "Advanced",
    icon: "◎",
    color: "from-indigo-500 to-blue-500",
    tags: ["LR(1)", "Lookahead", "Canonical"],
    estimatedTime: "75 min",
  },
  {
    id: "slr-table",
    title: "SLR Parsing Table Construction",
    shortTitle: "SLR Table",
    description:
      "Build the SLR ACTION and GOTO tables from the canonical LR(0) collection.",
    difficulty: "Advanced",
    icon: "⊟",
    color: "from-fuchsia-500 to-violet-500",
    tags: ["SLR", "ACTION", "GOTO"],
    estimatedTime: "60 min",
  },
  {
    id: "lalr-table",
    title: "LALR Parsing Table",
    shortTitle: "LALR Table",
    description:
      "Construct LALR parsing tables by merging compatible LR(1) states.",
    difficulty: "Advanced",
    icon: "⊠",
    color: "from-amber-500 to-orange-500",
    tags: ["LALR", "State Merging", "LR(1)"],
    estimatedTime: "90 min",
  },
];

export const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard", path: "/" },
  { id: "first-follow", label: "FIRST & FOLLOW", icon: "GitBranch", path: "/topics/first-follow" },
  { id: "left-recursion", label: "Left Recursion", icon: "RotateCcw", path: "/topics/left-recursion" },
  { id: "predictive-parsing", label: "Predictive Parsing", icon: "Table", path: "/topics/predictive-parsing" },
  { id: "ll1-table", label: "LL(1) Parsing Table", icon: "Grid", path: "/topics/ll1-table" },
  { id: "slr-parsing", label: "SLR Parsing", icon: "Cpu", path: "/topics/slr-parsing" },
  { id: "lr0-items", label: "LR(0) Items", icon: "Circle", path: "/topics/lr0-items" },
  { id: "lr1-items", label: "LR(1) Items", icon: "Target", path: "/topics/lr1-items" },
  { id: "slr-table", label: "SLR Table", icon: "TableProperties", path: "/topics/slr-table" },
  { id: "lalr-table", label: "LALR Table", icon: "Layers", path: "/topics/lalr-table" },
  { id: "practice", label: "Practice Arena", icon: "Code2", path: "/practice" },
  { id: "quiz", label: "Quiz Mode", icon: "HelpCircle", path: "/quiz" },
  { id: "playground", label: "Code Playground", icon: "Terminal", path: "/playground" },
];
