"use client";
import { useState } from "react";
import { Menu, Search, Bell, Star } from "lucide-react";
import { motion } from "framer-motion";

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 h-14 bg-[#09091a]/80 backdrop-blur-md border-b border-white/6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-white/8 text-slate-400 hover:text-white transition-colors"
        >
          <Menu size={20} />
        </button>
        {title && (
          <h1 className="text-sm font-semibold text-slate-200 hidden md:block">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <motion.div
          animate={{ width: searchOpen ? 220 : 36 }}
          className="relative overflow-hidden"
        >
          {searchOpen ? (
            <input
              autoFocus
              onBlur={() => setSearchOpen(false)}
              placeholder="Search topics..."
              className="w-full h-9 bg-white/5 border border-white/10 rounded-lg px-3 pr-9 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-indigo-500/50"
            />
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/8 text-slate-400 hover:text-white transition-colors"
            >
              <Search size={18} />
            </button>
          )}
          {searchOpen && (
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
          )}
        </motion.div>

        {/* Streak */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
          <Star size={13} fill="currentColor" />
          <span>7 day streak</span>
        </div>

        {/* Notification */}
        <button className="relative p-2 rounded-lg hover:bg-white/8 text-slate-400 hover:text-white transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer">
          CD
        </div>
      </div>
    </header>
  );
}
