"use client";

import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/topnav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AuthGuard } from "@/components/shared/auth-guard";
import { useSidebarStore } from "@/stores/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebarStore();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-bg-primary">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <TopNav />

        {/* Main content */}
        <motion.main
          className="pt-[var(--topnav-height)] pb-20 md:pb-8 min-h-screen"
          animate={{
            marginLeft: isCollapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)",
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </motion.main>

        {/* Mobile bottom nav */}
        <MobileNav />
      </div>
    </AuthGuard>
  );
}
