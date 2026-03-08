"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { Plus, PieChart, AlertTriangle } from "lucide-react";

interface Budget {
  id: string;
  categoryId: string;
  amount: string;
  month: number;
  year: number;
  spent: number;
  remaining: number;
  category: { name: string; color: string };
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<{ data: Budget[] }>("/budgets");
        setBudgets(res.data);
      } catch { /* empty state */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-bg-tertiary rounded-md animate-pulse" />
        <Card><CardContent className="p-5"><div className="h-24 bg-bg-tertiary rounded-md animate-pulse" /></CardContent></Card>
      </div>
    );
  }

  const now = new Date();
  const monthName = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  if (budgets.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Budgets</h1>
            <p className="text-sm text-text-secondary mt-1">{monthName}</p>
          </div>
          <Button><Plus size={16} /> Set budget</Button>
        </div>
        <EmptyState
          icon={PieChart}
          title="No budgets set"
          description="Set monthly budgets for your spending categories to stay on track with your financial goals."
          action={{ label: "Set your first budget", onClick: () => {} }}
        />
      </div>
    );
  }

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Budgets</h1>
          <p className="text-sm text-text-secondary mt-1">{monthName}</p>
        </div>
        <Button><Plus size={16} /> Set budget</Button>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-text-secondary">Total spent</p>
              <p className="text-2xl font-bold text-text-primary">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-secondary">Total budget</p>
              <p className="text-2xl font-bold text-text-muted">{formatCurrency(totalBudget)}</p>
            </div>
          </div>
          <div className="h-3 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700", totalSpent / totalBudget > 0.9 ? "bg-expense" : "bg-primary")}
              style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
            />
          </div>
          <p className="text-sm text-text-muted mt-2">{formatCurrency(totalBudget - totalSpent)} remaining</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((b) => {
          const budget = Number(b.amount);
          const progress = (b.spent / budget) * 100;
          const isOver = b.spent > budget;
          return (
            <Card key={b.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: b.category.color }} />
                    <span className="text-sm font-medium text-text-primary">{b.category.name}</span>
                  </div>
                  {isOver && <AlertTriangle size={14} className="text-expense" />}
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={cn("text-lg font-bold", isOver ? "text-expense" : "text-text-primary")}>{formatCurrency(b.spent)}</span>
                  <span className="text-sm text-text-muted">/ {formatCurrency(budget)}</span>
                </div>
                <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", isOver ? "bg-expense" : progress > 75 ? "bg-secondary" : "bg-primary")}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className={cn("text-xs mt-1.5", isOver ? "text-expense" : "text-text-muted")}>
                  {isOver ? `${formatCurrency(b.spent - budget)} over budget` : `${formatCurrency(budget - b.spent)} remaining`}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
