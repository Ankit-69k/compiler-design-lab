"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { topics } from "@/data/topics";
import { DifficultyBadge } from "@/components/ui/Badge";

export function TopicsGrid() {
  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          All <span className="gradient-text">Topics</span>
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto">
          From FIRST/FOLLOW sets to LALR parsing — everything you need to master compiler design.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {topics.map((topic, i) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
          >
            <Link href={`/topics/${topic.id}`}>
              <div className="group relative rounded-xl border border-white/8 bg-white/3 p-6 hover:border-indigo-500/30 hover:bg-white/5 transition-all duration-200 cursor-pointer overflow-hidden">
                {/* Glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5" />
                </div>

                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center text-2xl mb-4 font-mono shadow-lg`}
                >
                  {topic.icon}
                </div>

                {/* Title */}
                <h3 className="font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                  {topic.title}
                </h3>

                {/* Description */}
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  {topic.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DifficultyBadge difficulty={topic.difficulty} />
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock size={11} />
                      {topic.estimatedTime}
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all"
                  />
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {topic.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-slate-500 border border-white/6"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
