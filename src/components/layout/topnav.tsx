"use client";

import { Search, Bell, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useSidebarStore } from "@/stores/sidebar";
import { useAuthStore } from "@/stores/auth";

export function TopNav() {
  const { isCollapsed } = useSidebarStore();
  const { user } = useAuthStore();

  return (
    <motion.header
      className="fixed top-0 right-0 h-[var(--topnav-height)] bg-bg-secondary/80 backdrop-blur-md border-b border-border z-30 flex items-center justify-between px-6"
      animate={{
        left: isCollapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)",
      }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search transactions, accounts..."
          className="w-full h-9 pl-9 pr-4 rounded-[var(--radius-full)] bg-bg-tertiary border border-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-muted bg-bg-secondary px-1.5 py-0.5 rounded border border-border">
          Ctrl+K
        </kbd>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-4">
        <button className="relative p-2 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-tertiary transition-colors cursor-pointer">
          <Bell size={18} />
        </button>

        <button className="h-9 px-3 rounded-[var(--radius-md)] bg-primary text-white text-sm font-medium flex items-center gap-1.5 hover:bg-primary-hover transition-colors cursor-pointer">
          <Plus size={16} />
          <span className="hidden sm:inline">Add expense</span>
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-[var(--radius-full)] bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold cursor-pointer">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
      </div>
    </motion.header>
  );
}
