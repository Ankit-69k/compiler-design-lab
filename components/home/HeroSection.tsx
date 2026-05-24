"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play, ChevronDown, FileDown, Loader2 } from "lucide-react";

const typingWords = [
  "FIRST & FOLLOW",
  "LL(1) Parsing",
  "SLR Parsing",
  "LR(0) Items",
  "LALR Tables",
  "Parsing Algorithms",
];

const floatingItems = [
  { label: "AST", x: "8%", y: "20%", delay: 0, size: "text-2xl" },
  { label: "{}", x: "88%", y: "15%", delay: 0.5, size: "text-3xl" },
  { label: "⊢", x: "5%", y: "65%", delay: 1, size: "text-2xl" },
  { label: "λ", x: "90%", y: "60%", delay: 1.5, size: "text-3xl" },
  { label: "S→", x: "80%", y: "35%", delay: 0.3, size: "text-xl" },
  { label: "ε", x: "15%", y: "40%", delay: 0.8, size: "text-3xl" },
  { label: "⊕", x: "72%", y: "75%", delay: 1.2, size: "text-2xl" },
  { label: "#", x: "25%", y: "80%", delay: 0.6, size: "text-xl" },
];

function TypingEffect() {
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    const word = typingWords[wordIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIndex < word.length) {
      timeout = setTimeout(() => {
        setDisplayed(word.slice(0, charIndex + 1));
        setCharIndex((c) => c + 1);
      }, 80);
    } else if (!deleting && charIndex === word.length) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => {
        setDisplayed(word.slice(0, charIndex - 1));
        setCharIndex((c) => c - 1);
      }, 40);
    } else if (deleting && charIndex === 0) {
      setDeleting(false);
      setWordIndex((i) => (i + 1) % typingWords.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, wordIndex]);

  return (
    <span className="gradient-text">
      {displayed}
      <span className="typing-cursor text-indigo-400 ml-0.5">|</span>
    </span>
  );
}

function FloatingIcon({ label, x, y, delay, size }: typeof floatingItems[0]) {
  return (
    <motion.div
      className={`absolute ${size} text-indigo-500/20 font-mono font-bold select-none pointer-events-none`}
      style={{ left: x, top: y }}
      animate={{ y: [0, -15, 0] }}
      transition={{
        duration: 4 + Math.random() * 2,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {label}
    </motion.div>
  );
}

function ParticleField() {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 10 + 8,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-indigo-500"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: 0.15,
          }}
          animate={{
            opacity: [0.05, 0.3, 0.05],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export function HeroSection() {
  const [generating, setGenerating] = useState<"codes" | "algos" | null>(null);

  async function handleDownloadCodes() {
    setGenerating("codes");
    try {
      const { downloadCCodesPdf } = await import("@/lib/generate-pdf");
      await downloadCCodesPdf();
    } finally {
      setGenerating(null);
    }
  }

  async function handleDownloadAlgos() {
    setGenerating("algos");
    try {
      const { downloadAlgorithmsPdf } = await import("@/lib/generate-pdf");
      await downloadAlgorithmsPdf();
    } finally {
      setGenerating(null);
    }
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden grid-bg">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-cyan-600/6 rounded-full blur-3xl" />
      </div>

      <ParticleField />

      {/* Floating icons */}
      {floatingItems.map((item, i) => (
        <FloatingIcon key={i} {...item} />
      ))}

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          Interactive Compiler Design Learning Platform
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight"
        >
          <span className="text-white">Compiler</span>{" "}
          <span className="shimmer-text">Design Lab</span>
        </motion.h1>

        {/* Subtitle with typing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-xl md:text-3xl font-semibold mb-4 text-slate-300"
        >
          Learn <TypingEffect />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-slate-400 text-base md:text-lg mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Master parsing algorithms through interactive visualizations, C code walkthroughs,
          step-by-step animations, and practice problems — all in one place.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-5"
        >
          <Link
            href="/topics/first-follow"
            className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-lg shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] transition-all duration-300 hover:scale-105"
          >
            <Play size={20} fill="currentColor" />
            Start Learning
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/practice"
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white/5 border border-white/15 text-slate-200 font-semibold text-lg hover:bg-white/10 hover:border-indigo-500/40 transition-all duration-300 hover:scale-105"
          >
            Practice Problems
          </Link>
        </motion.div>

        {/* Download PDF Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
        >
          <button
            onClick={handleDownloadCodes}
            disabled={generating !== null}
            className="group flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600/15 border border-indigo-500/35 text-indigo-300 font-semibold text-sm hover:bg-indigo-600/28 hover:border-indigo-400/60 hover:text-indigo-200 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {generating === "codes" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileDown size={16} className="group-hover:-translate-y-0.5 transition-transform" />
            )}
            {generating === "codes" ? "Generating PDF…" : "Download All C Codes"}
          </button>
          <button
            onClick={handleDownloadAlgos}
            disabled={generating !== null}
            className="group flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600/15 border border-emerald-500/35 text-emerald-300 font-semibold text-sm hover:bg-emerald-600/28 hover:border-emerald-400/60 hover:text-emerald-200 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {generating === "algos" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileDown size={16} className="group-hover:-translate-y-0.5 transition-transform" />
            )}
            {generating === "algos" ? "Generating PDF…" : "Download All Algorithms"}
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex items-center justify-center gap-8 md:gap-16 mb-16"
        >
          {[
            { value: "9", label: "Parsing Topics" },
            { value: "50+", label: "Practice Problems" },
            { value: "Interactive", label: "Visualizations" },
            { value: "C Code", label: "Implementations" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold gradient-text-blue">{stat.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500"
      >
        <ChevronDown size={24} />
      </motion.div>
    </section>
  );
}
