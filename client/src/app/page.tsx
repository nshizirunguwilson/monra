"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  TrendingUp,
  Target,
  PieChart,
  ArrowRight,
  Shield,
  Smartphone,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Multi-Account Tracking",
    description: "Manage bank accounts, cash, crypto, savings, credit cards, and investments all in one place.",
  },
  {
    icon: BarChart3,
    title: "Visual Insights",
    description: "Beautiful charts and breakdowns to understand where your money goes each month.",
  },
  {
    icon: Target,
    title: "Savings Goals",
    description: "Set goals, track contributions, and celebrate milestones as you reach your targets.",
  },
  {
    icon: PieChart,
    title: "Smart Budgets",
    description: "Set monthly budgets per category and get alerts when you're approaching your limits.",
  },
  {
    icon: TrendingUp,
    title: "Net Worth Tracking",
    description: "See your overall financial health at a glance with real-time net worth calculations.",
  },
  {
    icon: Shield,
    title: "Private & Secure",
    description: "Your data stays yours. Self-hosted, encrypted, and never shared with third parties.",
  },
];

const stats = [
  { value: "100%", label: "Privacy focused" },
  { value: "6+", label: "Account types" },
  { value: "Real-time", label: "Insights" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-lg text-text-primary">Monra</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-light text-primary text-sm font-medium mb-6">
              <Smartphone size={14} />
              Personal finance, simplified
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-tight tracking-tight">
              Take control of your{" "}
              <span className="text-primary">financial future</span>
            </h1>
            <p className="mt-5 text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Track expenses, manage accounts, set savings goals, and build better money habits. All in one clean, modern app.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="px-8">
                  Start for free <ArrowRight size={18} className="ml-1" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Sign in
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Dashboard preview */}
          <motion.div
            className="mt-16 rounded-[var(--radius-xl)] border border-border bg-bg-secondary shadow-[0_8px_24px_var(--shadow)] overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="p-1">
              <div className="bg-bg-tertiary rounded-[var(--radius-lg)] p-6 sm:p-10">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Net Worth", value: "$24,650", color: "text-primary" },
                    { label: "Income", value: "$5,200", color: "text-tertiary" },
                    { label: "Expenses", value: "$3,180", color: "text-expense" },
                    { label: "Saved", value: "39%", color: "text-secondary" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-bg-secondary rounded-[var(--radius-md)] p-4 border border-border">
                      <p className="text-xs text-text-muted">{stat.label}</p>
                      <p className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {["Food — $450", "Transport — $180", "Entertainment — $120"].map((item) => (
                    <div key={item} className="bg-bg-secondary rounded-[var(--radius-md)] p-3 border border-border">
                      <p className="text-sm text-text-secondary">{item}</p>
                      <div className="h-2 bg-bg-tertiary rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${60 + Math.random() * 30}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border bg-bg-secondary">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-center gap-12 sm:gap-20">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary">Everything you need to manage your money</h2>
            <p className="text-text-secondary mt-3 max-w-xl mx-auto">
              A complete toolkit for personal finance management, designed to be simple and effective.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="p-6 rounded-[var(--radius-lg)] border border-border bg-bg-secondary hover:shadow-[0_8px_24px_var(--shadow)] transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-primary-light flex items-center justify-center text-primary mb-4">
                  <feature.icon size={20} />
                </div>
                <h3 className="text-base font-semibold text-text-primary">{feature.title}</h3>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center bg-bg-secondary rounded-[var(--radius-xl)] border border-border p-10">
          <h2 className="text-2xl font-bold text-text-primary">Ready to take control?</h2>
          <p className="text-text-secondary mt-3">
            Start tracking your finances today. Free, private, and fully under your control.
          </p>
          <Link href="/register">
            <Button size="lg" className="mt-6 px-8">
              Create your account <ArrowRight size={18} className="ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[6px] bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-xs">M</span>
            </div>
            <span className="text-sm text-text-muted">Monra</span>
          </div>
          <p className="text-xs text-text-muted">Personal finance tracker</p>
        </div>
      </footer>
    </div>
  );
}
