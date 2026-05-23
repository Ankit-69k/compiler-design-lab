"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  GitBranch,
  RotateCcw,
  Table,
  Grid3X3,
  Cpu,
  Circle,
  Target,
  Layers,
  Code2,
  HelpCircle,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Zap,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={18} />,
  GitBranch: <GitBranch size={18} />,
  RotateCcw: <RotateCcw size={18} />,
  Table: <Table size={18} />,
  Grid: <Grid3X3 size={18} />,
  Cpu: <Cpu size={18} />,
  Circle: <Circle size={18} />,
  Target: <Target size={18} />,
  TableProperties: <Grid3X3 size={18} />,
  Layers: <Layers size={18} />,
  Code2: <Code2 size={18} />,
  HelpCircle: <HelpCircle size={18} />,
  Terminal: <Terminal size={18} />,
};

const navGroups = [
  {
    label: "Core",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard", path: "/" },
    ],
  },
  {
    label: "Topics",
    items: [
      { id: "first-follow", label: "FIRST & FOLLOW", icon: "GitBranch", path: "/topics/first-follow" },
      { id: "left-recursion", label: "Left Recursion", icon: "RotateCcw", path: "/topics/left-recursion" },
      { id: "predictive-parsing", label: "Predictive Parsing", icon: "Table", path: "/topics/predictive-parsing" },
      { id: "ll1-table", label: "LL(1) Parsing Table", icon: "Grid", path: "/topics/ll1-table" },
      { id: "slr-parsing", label: "SLR Parsing", icon: "Cpu", path: "/topics/slr-parsing" },
      { id: "lr0-items", label: "LR(0) Items", icon: "Circle", path: "/topics/lr0-items" },
      { id: "lr1-items", label: "LR(1) Items", icon: "Target", path: "/topics/lr1-items" },
      { id: "slr-table", label: "SLR Parsing Table", icon: "TableProperties", path: "/topics/slr-table" },
      { id: "lalr-table", label: "LALR Parsing Table", icon: "Layers", path: "/topics/lalr-table" },
    ],
  },
  {
    label: "Practice",
    items: [
      { id: "practice", label: "Practice Arena", icon: "Code2", path: "/practice" },
      { id: "quiz", label: "Quiz Mode", icon: "HelpCircle", path: "/quiz" },
      { id: "playground", label: "Code Playground", icon: "Terminal", path: "/playground" },
    ],
  },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const SidebarContent = (
    <div
      className={cn(
        "flex flex-col h-full bg-[#0a0a1e] border-r border-white/6 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-white/6">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.5)]">
                <Zap size={16} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-tight">Compiler</div>
                <div className="text-xs text-indigo-400 leading-tight">Design Lab</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto shadow-[0_0_12px_rgba(99,102,241,0.5)]">
            <Zap size={16} className="text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1 rounded hover:bg-white/8 text-slate-400 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1 rounded hover:bg-white/8 text-slate-400 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    onClick={onMobileClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150",
                      active
                        ? "bg-indigo-500/20 text-indigo-300 shadow-[inset_0_0_10px_rgba(99,102,241,0.1)]"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5",
                      collapsed && "justify-center px-2"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className={cn(active && "text-indigo-400")}>
                      {iconMap[item.icon]}
                    </span>
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="truncate"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {active && !collapsed && (
                      <motion.div
                        layoutId="active-indicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-white/6">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            v1.0.0 — All topics available
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-screen sticky top-0">{SidebarContent}</div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
            >
              {SidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
