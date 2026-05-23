# Compiler Design Lab

A modern, interactive educational platform for learning Compiler Design and Parsing Algorithms — built with Next.js, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- **9 Topic Modules**: FIRST/FOLLOW, Left Recursion, Predictive Parsing, LL(1) Table, SLR, LR(0), LR(1), SLR Table, LALR
- **Interactive Visualizations**: Step-by-step animated parsing with Framer Motion
- **C Code Walkthroughs**: Syntax-highlighted implementations with copy/download
- **Theory + Viva Q&A**: Comprehensive explanations + accordion viva questions
- **Practice Arena**: Graded problems with hints, solutions, and XP system
- **Quiz Mode**: Timed MCQ with instant feedback, difficulty levels, animated score screen
- **Code Playground**: Monaco Editor with simulated C program execution
- **Dark Glassmorphism UI**: Neon gradients, blur effects, smooth animations
- **Mobile Responsive**: Collapsible sidebar, responsive layouts

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Editor | Monaco Editor |
| Icons | Lucide React |

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# Open http://localhost:3000

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
app/
├── page.tsx                        # Home: hero, features, topics grid
├── layout.tsx                      # Root layout
├── globals.css                     # Global styles + animations
├── practice/page.tsx               # Practice Arena
├── quiz/page.tsx                   # Quiz Mode
├── playground/page.tsx             # Code Playground (Monaco)
└── topics/{first-follow,left-recursion,...}/page.tsx

components/
├── layout/   Sidebar, Header, MainLayout
├── home/     HeroSection, FeaturesSection, TopicsGrid
├── topics/   TopicLayout, TheorySection, VivaQuestions
├── visualizations/  FirstFollowViz, PredictiveParsingViz, LR0ItemsViz
├── playground/  CodePlayground
├── practice/    PracticeArena
├── quiz/        QuizMode
└── ui/          GlassCard, NeonButton, Badge, CodeBlock

data/
├── topics.ts              Topic metadata + nav items
├── quiz-questions.ts      MCQ questions for all topics
└── practice-problems.ts   Graded practice problems

lib/
└── utils.ts               cn(), copyToClipboard(), downloadCode()
```

## Deployment (Vercel)

```bash
# Option 1: CLI
npm i -g vercel
vercel --prod

# Option 2: Connect GitHub repo at vercel.com for auto-deploy
```

## Topics Covered

| Topic | Difficulty | Time |
|-------|-----------|------|
| FIRST & FOLLOW Sets | Beginner | 45 min |
| Left Recursion Removal | Beginner | 30 min |
| Predictive Parsing (Non-Recursive) | Intermediate | 60 min |
| LL(1) Parsing Table | Intermediate | 45 min |
| SLR Parsing Algorithm | Advanced | 75 min |
| LR(0) Items and Closure | Advanced | 60 min |
| LR(1) Items | Advanced | 75 min |
| SLR Parsing Table Construction | Advanced | 60 min |
| LALR Parsing Table | Advanced | 90 min |

## License

MIT
