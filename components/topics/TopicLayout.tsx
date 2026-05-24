"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Code2, Eye, Dumbbell, HelpCircle, ChevronRight, Workflow, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DifficultyBadge } from "@/components/ui/Badge";

const tabs = [
  { id: "theory", label: "Theory", icon: BookOpen },
  { id: "code", label: "C Program", icon: Code2 },
  { id: "algorithm", label: "Algorithm", icon: Workflow },
  { id: "visualization", label: "Visualization", icon: Eye },
  { id: "practice", label: "Practice", icon: Dumbbell },
  { id: "viva", label: "Viva Q&A", icon: HelpCircle },
];

interface TopicLayoutProps {
  title: string;
  difficulty: string;
  estimatedTime: string;
  description: string;
  theory: React.ReactNode;
  code: React.ReactNode;
  algorithm: React.ReactNode;
  visualization: React.ReactNode;
  practice: React.ReactNode;
  viva: React.ReactNode;
  breadcrumb?: string;
  cCodesPdfUrl?: string;
  algoPdfUrl?: string;
}

export function TopicLayout({
  title,
  difficulty,
  estimatedTime,
  description,
  theory,
  code,
  algorithm,
  visualization,
  practice,
  viva,
  breadcrumb = "Topics",
  cCodesPdfUrl,
  algoPdfUrl,
}: TopicLayoutProps) {
  const [activeTab, setActiveTab] = useState("theory");

  const content: Record<string, React.ReactNode> = {
    theory,
    code,
    algorithm,
    visualization,
    practice,
    viva,
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 min-w-0">
        <span className="shrink-0">Dashboard</span>
        <ChevronRight size={14} className="shrink-0" />
        <span className="shrink-0">{breadcrumb}</span>
        <ChevronRight size={14} className="shrink-0" />
        <span className="text-slate-300 truncate">{title}</span>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-3">{title}</h1>
            <p className="text-slate-400 max-w-2xl leading-relaxed">{description}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-3">
              <DifficultyBadge difficulty={difficulty} />
              <span className="text-xs text-slate-500 bg-white/5 border border-white/8 px-2.5 py-1 rounded-lg">
                ⏱ {estimatedTime}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={cCodesPdfUrl ?? "/downloads/c-codes.pdf"}
                download="c-codes.pdf"
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all duration-200"
              >
                <FileDown size={13} />
                All C Codes
              </a>
              <a
                href={algoPdfUrl ?? "/downloads/algorithms.pdf"}
                download="algorithms.pdf"
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-200"
              >
                <FileDown size={13} />
                All Algorithms
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-white/3 border border-white/8 rounded-xl p-1 w-full md:w-fit overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-1 md:flex-initial items-center justify-center md:justify-start gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            <tab.icon size={15} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {content[activeTab]}
      </motion.div>
    </div>
  );
}
