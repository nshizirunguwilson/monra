"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, Plus, Target, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/add", label: "Add", icon: Plus, isAction: true },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/more", label: "More", icon: Menu },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-bg-secondary border-t border-border flex items-center justify-around px-2 z-50 md:hidden">
      {tabs.map((tab) => {
        const isActive = tab.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(tab.href);
        if (tab.isAction) {
          return (
            <button
              key={tab.href}
              className="w-12 h-12 rounded-[var(--radius-full)] bg-primary text-white flex items-center justify-center -mt-4 shadow-lg cursor-pointer"
            >
              <tab.icon size={22} />
            </button>
          );
        }
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-col items-center gap-0.5 text-[10px] font-medium py-1 px-2",
              isActive ? "text-primary" : "text-text-muted"
            )}
          >
            <tab.icon size={20} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
