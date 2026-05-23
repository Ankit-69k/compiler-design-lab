"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Timer,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  ChevronRight,
  Star,
  Zap,
} from "lucide-react";
import { quizQuestions, QuizQuestion } from "@/data/quiz-questions";
import { DifficultyBadge } from "@/components/ui/Badge";
import { NeonButton } from "@/components/ui/NeonButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

type QuizState = "select" | "quiz" | "result";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function ScoreScreen({
  score,
  total,
  onRetry,
}: {
  score: number;
  total: number;
  onRetry: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const grade = pct >= 80 ? "Excellent!" : pct >= 60 ? "Good Job!" : "Keep Practicing!";
  const color = pct >= 80 ? "text-emerald-400" : pct >= 60 ? "text-amber-400" : "text-rose-400";

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[500px] text-center"
    >
      <motion.div
        animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-6xl mb-6"
      >
        {pct >= 80 ? "🏆" : pct >= 60 ? "⭐" : "💪"}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`text-4xl font-black mb-2 ${color}`}
      >
        {grade}
      </motion.div>

      <div className="text-xl text-white font-bold mb-2">
        {score} / {total} correct
      </div>
      <div className={`text-3xl font-black mb-8 ${color}`}>{pct}%</div>

      {/* Progress circle */}
      <div className="relative w-32 h-32 mb-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#f43f5e"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 40}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
            animate={{
              strokeDashoffset: 2 * Math.PI * 40 * (1 - pct / 100),
            }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xl font-black ${color}`}>{pct}%</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <Zap size={16} className="text-amber-400" fill="currentColor" />
          <span className="text-amber-400 font-bold">+{score * 20} XP</span>
        </div>
        <NeonButton onClick={onRetry}>
          <RotateCcw size={14} /> Try Again
        </NeonButton>
      </div>
    </motion.div>
  );
}

export function QuizMode() {
  const [state, setState] = useState<QuizState>("select");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [filterTopic, setFilterTopic] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("All");

  const topics = ["all", ...Array.from(new Set(quizQuestions.map((q) => q.topic)))];

  const startQuiz = useCallback(() => {
    let qs = quizQuestions;
    if (filterTopic !== "all") qs = qs.filter((q) => q.topic === filterTopic);
    if (filterDifficulty !== "All") qs = qs.filter((q) => q.difficulty === filterDifficulty);
    const shuffled = shuffle(qs).slice(0, Math.min(10, qs.length));
    setQuestions(shuffled);
    setAnswers(new Array(shuffled.length).fill(null));
    setQIndex(0);
    setSelected(null);
    setTimeLeft(30);
    setState("quiz");
  }, [filterTopic, filterDifficulty]);

  useEffect(() => {
    if (state !== "quiz") return;
    if (selected !== null) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleAnswer(-1);
          return 30;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  });

  const handleAnswer = useCallback(
    (optIndex: number) => {
      if (selected !== null) return;
      setSelected(optIndex);
      setAnswers((prev) => {
        const next = [...prev];
        next[qIndex] = optIndex;
        return next;
      });
    },
    [selected, qIndex]
  );

  const handleNext = () => {
    if (qIndex < questions.length - 1) {
      setQIndex((i) => i + 1);
      setSelected(null);
      setTimeLeft(30);
    } else {
      setState("result");
    }
  };

  const score = answers.filter((a, i) => a === questions[i]?.correct).length;
  const current = questions[qIndex];

  if (state === "select") {
    return (
      <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Quiz Mode</h1>
          <p className="text-slate-400">Test your knowledge of compiler design concepts</p>
        </div>

        <GlassCard className="p-6 space-y-6">
          {/* Topic filter */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 block">Select Topic</label>
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterTopic(t)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm border transition-all capitalize",
                    filterTopic === t
                      ? "bg-indigo-600 text-white border-indigo-500"
                      : "bg-white/4 text-slate-400 border-white/8 hover:bg-white/8"
                  )}
                >
                  {t === "all" ? "All Topics" : t.replace(/-/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty filter */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 block">Difficulty</label>
            <div className="flex gap-2">
              {["All", "Easy", "Medium", "Hard"].map((d) => (
                <button
                  key={d}
                  onClick={() => setFilterDifficulty(d)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm border transition-all",
                    filterDifficulty === d
                      ? "bg-indigo-600 text-white border-indigo-500"
                      : "bg-white/4 text-slate-400 border-white/8 hover:bg-white/8"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex gap-4">
            {[
              { icon: <Timer size={16} />, label: "30s per question" },
              { icon: <Star size={16} />, label: "20 XP per correct" },
              { icon: <Trophy size={16} />, label: "Up to 10 questions" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 text-sm text-slate-400"
              >
                <span className="text-indigo-400">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>

          <NeonButton size="lg" onClick={startQuiz} className="w-full justify-center">
            Start Quiz <ChevronRight size={18} />
          </NeonButton>
        </GlassCard>
      </div>
    );
  }

  if (state === "result") {
    return (
      <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto">
        <ScoreScreen
          score={score}
          total={questions.length}
          onRetry={() => setState("select")}
        />
      </div>
    );
  }

  if (!current) return null;

  const timerPct = (timeLeft / 30) * 100;
  const timerColor = timeLeft > 15 ? "#6366f1" : timeLeft > 8 ? "#f59e0b" : "#f43f5e";

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-slate-400">
          Question {qIndex + 1} of {questions.length}
        </span>
        <div className="flex items-center gap-2">
          <DifficultyBadge difficulty={current.difficulty} />
        </div>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full mb-6">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
          animate={{ width: `${((qIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Timer */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Timer size={16} style={{ color: timerColor }} />
          <span className="font-mono font-bold" style={{ color: timerColor }}>
            {timeLeft}s
          </span>
        </div>
        <div className="flex-1 mx-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={qIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="space-y-4"
        >
          <GlassCard className="p-6">
            <p className="text-lg font-semibold text-white leading-relaxed">
              {current.question}
            </p>
          </GlassCard>

          {/* Options */}
          <div className="space-y-3">
            {current.options.map((opt, i) => {
              const isCorrect = i === current.correct;
              const isSelected = selected === i;
              const revealed = selected !== null;

              return (
                <motion.button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={selected !== null}
                  whileHover={!revealed ? { scale: 1.01 } : undefined}
                  whileTap={!revealed ? { scale: 0.99 } : undefined}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border text-sm transition-all font-medium",
                    !revealed && "bg-white/4 border-white/8 text-slate-200 hover:bg-indigo-500/10 hover:border-indigo-500/40",
                    revealed && isCorrect && "bg-emerald-500/15 border-emerald-500/50 text-emerald-200",
                    revealed && isSelected && !isCorrect && "bg-rose-500/15 border-rose-500/50 text-rose-200",
                    revealed && !isSelected && !isCorrect && "bg-white/3 border-white/6 text-slate-500"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "w-6 h-6 rounded-full border text-xs flex items-center justify-center font-bold shrink-0",
                        !revealed && "border-slate-600 text-slate-400",
                        revealed && isCorrect && "border-emerald-500 text-emerald-400 bg-emerald-500/20",
                        revealed && isSelected && !isCorrect && "border-rose-500 text-rose-400 bg-rose-500/20"
                      )}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                    <span className="ml-auto shrink-0">
                      {revealed && isCorrect && <CheckCircle2 size={16} className="text-emerald-400" />}
                      {revealed && isSelected && !isCorrect && <XCircle size={16} className="text-rose-400" />}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {selected !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 rounded-xl border text-sm",
                  selected === current.correct
                    ? "bg-emerald-500/8 border-emerald-500/20 text-emerald-200"
                    : "bg-rose-500/8 border-rose-500/20 text-rose-200"
                )}
              >
                <div className="flex items-center gap-2 font-semibold mb-1">
                  {selected === current.correct ? (
                    <><CheckCircle2 size={14} /> Correct!</>
                  ) : (
                    <><XCircle size={14} /> Incorrect</>
                  )}
                </div>
                {current.explanation}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next */}
          {selected !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-end"
            >
              <NeonButton onClick={handleNext}>
                {qIndex < questions.length - 1 ? (
                  <>Next <ChevronRight size={16} /></>
                ) : (
                  <>See Results <Trophy size={16} /></>
                )}
              </NeonButton>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
