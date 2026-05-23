"use client";
import { motion } from "framer-motion";
import { Eye, Code2, BookOpen, Zap, BarChart2, Trophy } from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "Interactive Visualizations",
    desc: "Watch parsing algorithms execute step-by-step with animated stack operations, state transitions, and grammar traversals.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    icon: Code2,
    title: "C Program Walkthroughs",
    desc: "Every algorithm comes with a complete C implementation, syntax-highlighted and explained line by line.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
  },
  {
    icon: BookOpen,
    title: "Theory + Dry Runs",
    desc: "Comprehensive theory sections with algorithm flowcharts, worked examples, and dry runs of complex grammars.",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    icon: Zap,
    title: "Code Playground",
    desc: "Write and simulate C programs in-browser using Monaco Editor with step-by-step execution highlighting.",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: BarChart2,
    title: "Practice Problems",
    desc: "Graded problems from Beginner to Advanced with hints, reveal solutions, and XP tracking.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: Trophy,
    title: "Quiz Mode",
    desc: "MCQ quizzes with timers, instant feedback, animated score screens, and difficulty levels.",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Everything You Need to <span className="gradient-text">Master Compilers</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          A complete learning ecosystem — from theory to code, from visualization to practice.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-xl border p-6 ${f.bg} transition-all duration-200 hover:scale-[1.02]`}
          >
            <div className={`w-10 h-10 rounded-lg ${f.bg} border flex items-center justify-center mb-4`}>
              <f.icon size={20} className={f.color} />
            </div>
            <h3 className="font-bold text-white mb-2">{f.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
