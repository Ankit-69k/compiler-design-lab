"use client";
import { useState } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { TopicsGrid } from "@/components/home/TopicsGrid";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Code2, Zap } from "lucide-react";

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main>
          <HeroSection />
          <FeaturesSection />
          <TopicsGrid />

          {/* Quick Start Banner */}
          <section className="py-16 px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/30 p-8 md:p-12 text-center"
            >
              <h2 className="text-3xl font-black text-white mb-4">
                Ready to Master Compiler Design?
              </h2>
              <p className="text-slate-300 mb-8 max-w-xl mx-auto">
                Start with FIRST/FOLLOW sets, progress through LL(1), and master SLR and LALR
                parsing with hands-on visualizations and code.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/topics/first-follow"
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-500 transition-colors shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                >
                  <BookOpen size={18} /> Start with FIRST/FOLLOW
                </Link>
                <Link
                  href="/playground"
                  className="flex items-center gap-2 px-6 py-3 bg-white/8 text-slate-200 border border-white/15 rounded-xl font-semibold hover:bg-white/12 transition-colors"
                >
                  <Code2 size={18} /> Code Playground
                </Link>
                <Link
                  href="/quiz"
                  className="flex items-center gap-2 px-6 py-3 bg-violet-600/30 text-violet-300 border border-violet-500/30 rounded-xl font-semibold hover:bg-violet-600/40 transition-colors"
                >
                  <Zap size={18} /> Take a Quiz
                </Link>
              </div>
            </motion.div>
          </section>

          <footer className="border-t border-white/6 py-8 px-4 text-center text-slate-500 text-sm">
            <p>Compiler Design Lab — Built for CS students learning parsing algorithms</p>
            <p className="mt-1 text-xs">
              Covers FIRST/FOLLOW · Left Recursion · LL(1) · SLR · LR(0) · LR(1) · LALR
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
