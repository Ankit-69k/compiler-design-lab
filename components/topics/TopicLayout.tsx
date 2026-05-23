"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Code2, Eye, Dumbbell, HelpCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DifficultyBadge } from "@/components/ui/Badge";

const tabs = [
  { id: "theory", label: "Theory", icon: BookOpen },
  { id: "code", label: "C Program", icon: Code2 },
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
  visualization: React.ReactNode;
  practice: React.ReactNode;
  viva: React.ReactNode;
  breadcrumb?: string;
}

export function TopicLayout({
  title,
  difficulty,
  estimatedTime,
  description,
  theory,
  code,
  visualization,
  practice,
  viva,
  breadcrumb = "Topics",
}: TopicLayoutProps) {
  const [activeTab, setActiveTab] = useState("theory");

  const content: Record<string, React.ReactNode> = {
    theory,
    code,
    visualization,
    practice,
    viva,
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <span>Dashboard</span>
        <ChevronRight size={14} />
        <span>{breadcrumb}</span>
        <ChevronRight size={14} />
        <span className="text-slate-300">{title}</span>
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
          <div className="flex items-center gap-3">
            <DifficultyBadge difficulty={difficulty} />
            <span className="text-xs text-slate-500 bg-white/5 border border-white/8 px-2.5 py-1 rounded-lg">
              ⏱ {estimatedTime}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-white/3 border border-white/8 rounded-xl p-1 w-fit overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            <tab.icon size={15} />
            {tab.label}
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
