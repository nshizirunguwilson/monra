"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard,
} from "lucide-react";

interface Account {
  id: string;
  name: string;
  currentBalance: string;
  currency: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: string;
  type: string;
  date: string;
  category?: { name: string };
}

interface Goal {
  id: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
}

const colorMap: Record<string, string> = {
  primary: "text-primary bg-primary-light",
  tertiary: "text-tertiary bg-tertiary-light",
  expense: "text-expense bg-expense-light",
  secondary: "text-secondary bg-secondary-light",
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [accRes, txRes, goalRes] = await Promise.all([
          api.get<{ data: Account[] }>("/accounts"),
          api.get<{ data: Transaction[] }>("/transactions?limit=5"),
          api.get<{ data: Goal[] }>("/goals"),
        ]);
        setAccounts(accRes.data);
        setTransactions(txRes.data);
        setGoals(goalRes.data);
      } catch {
        // Silently fail - empty state will show
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-40 bg-bg-tertiary rounded-md animate-pulse" />
          <div className="h-4 w-64 bg-bg-tertiary rounded-md animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="p-5"><div className="h-20 bg-bg-tertiary rounded-md animate-pulse" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  const netWorth = accounts.reduce((sum, a) => sum + Number(a.currentBalance), 0);
  const hasData = accounts.length > 0 || transactions.length > 0;

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Welcome, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Let&apos;s set up your finances
          </p>
        </div>
        <EmptyState
          icon={LayoutDashboard}
          title="Your dashboard is empty"
          description="Start by adding an account, then record your first transaction to see your financial overview here."
          action={{ label: "Add your first account", onClick: () => window.location.href = "/accounts" }}
        />
      </div>
    );
  }

  const stats = [
    { title: "Net Worth", value: formatCurrency(netWorth), icon: Wallet, color: "primary" },
    { title: "Accounts", value: String(accounts.length), icon: TrendingUp, color: "tertiary" },
    { title: "Transactions", value: String(transactions.length), icon: TrendingDown, color: "expense" },
    { title: "Goals", value: String(goals.length), icon: Target, color: "secondary" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Here&apos;s your financial overview
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-[0_8px_24px_var(--shadow)] transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-text-secondary">{stat.title}</p>
                  <p className="text-2xl font-bold text-text-primary mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center ${colorMap[stat.color]}`}>
                  <stat.icon size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Link href="/transactions" className="text-sm text-primary hover:underline">View all</Link>
            </div>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-sm text-text-muted py-8 text-center">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => {
                  const amount = Number(tx.amount);
                  const isIncome = tx.type === "INCOME";
                  return (
                    <div key={tx.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center ${isIncome ? "bg-tertiary-light text-tertiary" : "bg-expense-light text-expense"}`}>
                          {isIncome ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{tx.description || "Untitled"}</p>
                          <p className="text-xs text-text-muted">{tx.category?.name || "Uncategorized"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${isIncome ? "text-tertiary" : "text-text-primary"}`}>
                          {isIncome ? "+" : "-"}{formatCurrency(amount)}
                        </p>
                        <p className="text-xs text-text-muted">{formatRelativeDate(tx.date)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Savings Goals</CardTitle>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? (
              <p className="text-sm text-text-muted py-8 text-center">No goals yet</p>
            ) : (
              <div className="space-y-4">
                {goals.slice(0, 4).map((goal) => {
                  const progress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
                  return (
                    <div key={goal.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">{goal.name}</span>
                        <span className="text-text-primary font-medium">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
