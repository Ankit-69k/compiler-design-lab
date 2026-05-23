"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

interface VivaQuestion {
  question: string;
  answer: string;
}

interface VivaQuestionsProps {
  questions: VivaQuestion[];
}

export function VivaQuestions({ questions }: VivaQuestionsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-3xl space-y-3">
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle size={20} className="text-violet-400" />
        <h2 className="text-xl font-bold text-white">Viva Questions & Answers</h2>
      </div>

      {questions.map((q, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-xl border border-white/8 overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left bg-white/3 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center font-bold shrink-0">
                Q{i + 1}
              </span>
              <span className="text-slate-200 font-medium">{q.question}</span>
            </div>
            <ChevronDown
              size={18}
              className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                openIndex === i ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {openIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="px-5 py-4 bg-violet-500/5 border-t border-white/6">
                  <div className="flex gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-bold shrink-0">
                      A
                    </span>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {q.answer}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
