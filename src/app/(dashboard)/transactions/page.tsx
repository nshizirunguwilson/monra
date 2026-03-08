"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { api } from "@/lib/api";
import {
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  LayoutGrid,
  LayoutList,
  ArrowLeftRight,
} from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  description: string;
  amount: string;
  type: string;
  date: string;
  category?: { name: string };
  account?: { name: string; color: string };
}

interface Account {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  subCategories?: Category[];
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    accountId: "", type: "EXPENSE", amount: "", description: "", categoryId: "", date: new Date().toISOString().split("T")[0], notes: "",
  });

  const loadTransactions = async () => {
    try {
      const [txRes, accRes, catRes] = await Promise.all([
        api.get<{ data: Transaction[] }>(`/transactions?limit=50${search ? `&search=${search}` : ""}`),
        api.get<{ data: Account[] }>("/accounts"),
        api.get<{ data: Category[] }>("/categories"),
      ]);
      setTransactions(txRes.data);
      setAccounts(accRes.data);
      setCategories(catRes.data);
      if (!formData.accountId && accRes.data.length > 0) {
        setFormData(f => ({ ...f, accountId: accRes.data[0].id }));
      }
    } catch { /* empty state */ }
    finally { setLoading(false); }
  };

  useEffect(() => { loadTransactions(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/transactions", {
        accountId: formData.accountId,
        type: formData.type,
        amount: Number(formData.amount),
        description: formData.description,
        categoryId: formData.categoryId || undefined,
        date: formData.date,
        notes: formData.notes || undefined,
      });
      setShowModal(false);
      setFormData(f => ({ ...f, amount: "", description: "", notes: "" }));
      loadTransactions();
      toast.success("Transaction added successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to add transaction");
    }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-bg-tertiary rounded-md animate-pulse" />
        <Card><CardContent className="p-5"><div className="h-40 bg-bg-tertiary rounded-md animate-pulse" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Transactions</h1>
          <p className="text-sm text-text-secondary mt-1">{transactions.length} transactions</p>
        </div>
        <Button onClick={() => setShowModal(true)} disabled={accounts.length === 0}>
          <Plus size={16} /> Add transaction
        </Button>
      </div>

      {transactions.length === 0 && accounts.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="No transactions yet"
          description="Add an account first, then start recording your income and expenses."
          action={{ label: "Go to accounts", onClick: () => window.location.href = "/accounts" }}
        />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="No transactions yet"
          description="Record your first transaction to start tracking your spending."
          action={{ label: "Add transaction", onClick: () => setShowModal(true) }}
        />
      ) : (
        <>
          {/* Filters bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-md bg-bg-secondary border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center border border-border rounded-md overflow-hidden ml-auto">
              <button onClick={() => setViewMode("table")} className={cn("p-2 transition-colors cursor-pointer", viewMode === "table" ? "bg-primary text-white" : "text-text-muted hover:bg-bg-tertiary")}>
                <LayoutList size={16} />
              </button>
              <button onClick={() => setViewMode("card")} className={cn("p-2 transition-colors cursor-pointer", viewMode === "card" ? "bg-primary text-white" : "text-text-muted hover:bg-bg-tertiary")}>
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>

          {viewMode === "table" ? (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Description</th>
                      <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Category</th>
                      <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Account</th>
                      <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Date</th>
                      <th className="text-right text-xs font-medium text-text-muted px-5 py-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => {
                      const isIncome = tx.type === "INCOME";
                      return (
                        <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-bg-tertiary/50 cursor-pointer transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className={cn("w-8 h-8 rounded-sm flex items-center justify-center", isIncome ? "bg-tertiary-light text-tertiary" : "bg-expense-light text-expense")}>
                                {isIncome ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                              </div>
                              <span className="text-sm font-medium text-text-primary">{tx.description || "Untitled"}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-sm text-text-secondary">{tx.category?.name || "-"}</td>
                          <td className="px-5 py-3 text-sm text-text-secondary">{tx.account?.name || "-"}</td>
                          <td className="px-5 py-3 text-sm text-text-muted">{formatDate(tx.date)}</td>
                          <td className={cn("px-5 py-3 text-sm font-semibold text-right", isIncome ? "text-tertiary" : "text-text-primary")}>
                            {isIncome ? "+" : "-"}{formatCurrency(Number(tx.amount))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {transactions.map((tx) => {
                const isIncome = tx.type === "INCOME";
                return (
                  <Card key={tx.id} className="hover:shadow-[0_8px_24px_var(--shadow)] transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-text-muted">{formatDate(tx.date)}</span>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", isIncome ? "bg-tertiary-light text-tertiary" : "bg-expense-light text-expense")}>
                          {tx.type.toLowerCase()}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-text-primary">{tx.description || "Untitled"}</p>
                      <p className="text-xs text-text-muted mt-0.5">{tx.category?.name || "Uncategorized"}</p>
                      <p className={cn("text-lg font-bold mt-2", isIncome ? "text-tertiary" : "text-text-primary")}>
                        {isIncome ? "+" : "-"}{formatCurrency(Number(tx.amount))}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Transaction" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input id="amount" label="Amount" type="number" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData(f => ({ ...f, amount: e.target.value }))} required />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">Type</label>
              <select className="w-full h-10 px-3 rounded-md bg-bg-tertiary border border-border text-text-primary text-sm" value={formData.type} onChange={(e) => setFormData(f => ({ ...f, type: e.target.value }))}>
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>
          </div>
          <Input id="description" label="Description" placeholder="What was this for?" value={formData.description} onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">Account</label>
              <select className="w-full h-10 px-3 rounded-md bg-bg-tertiary border border-border text-text-primary text-sm" value={formData.accountId} onChange={(e) => setFormData(f => ({ ...f, accountId: e.target.value }))}>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">Category</label>
              <select className="w-full h-10 px-3 rounded-md bg-bg-tertiary border border-border text-text-primary text-sm" value={formData.categoryId} onChange={(e) => setFormData(f => ({ ...f, categoryId: e.target.value }))}>
                <option value="">None</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <Input id="date" label="Date" type="date" value={formData.date} onChange={(e) => setFormData(f => ({ ...f, date: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button className="flex-1" type="submit" disabled={saving}>{saving ? "Adding..." : "Add transaction"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
