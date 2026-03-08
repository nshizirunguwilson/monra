"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Target,
  PieChart,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar";
import { useThemeStore } from "@/stores/theme";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/budgets", label: "Budgets", icon: PieChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggle } = useSidebarStore();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <motion.aside
      className="fixed left-0 top-0 h-full bg-bg-secondary border-r border-border z-40 flex flex-col"
      animate={{ width: isCollapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)" }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      {/* Logo */}
      <div className="h-[var(--topnav-height)] flex items-center px-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-[var(--radius-md)] bg-primary flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          {!isCollapsed && (
            <motion.span
              className="font-bold text-lg text-text-primary whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Monra
            </motion.span>
          )}
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-all duration-200 relative group",
                isActive
                  ? "bg-primary-light text-primary"
                  : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
              )}
            >
              <item.icon size={20} className="shrink-0" />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 }}
                >
                  {item.label}
                </motion.span>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-bg-tertiary text-text-primary text-xs rounded-[var(--radius-sm)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-md">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-border space-y-1">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors w-full cursor-pointer"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          {!isCollapsed && <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>}
        </button>
        <button
          onClick={toggle}
          className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors w-full cursor-pointer"
        >
          {isCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
          {!isCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}
