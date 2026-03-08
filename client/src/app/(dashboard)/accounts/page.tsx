"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api";
import { Plus, Wallet, CreditCard, Landmark, Coins, TrendingUp, PiggyBank, Archive } from "lucide-react";
import { toast } from "sonner";

const accountIcons: Record<string, typeof Wallet> = {
  BANK: Landmark,
  CASH: Wallet,
  CRYPTO: Coins,
  SAVINGS: PiggyBank,
  CREDIT_CARD: CreditCard,
  INVESTMENT: TrendingUp,
};

interface Account {
  id: string;
  name: string;
  type: string;
  currency: string;
  currentBalance: string;
  color: string;
  isArchived: boolean;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", type: "BANK", initialBalance: "", color: "#0077B6", currency: "USD" });
  const [saving, setSaving] = useState(false);

  const loadAccounts = async () => {
    try {
      const res = await api.get<{ data: Account[] }>("/accounts");
      setAccounts(res.data);
    } catch { /* empty state will show */ }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAccounts(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/accounts", {
        name: formData.name,
        type: formData.type,
        initialBalance: Number(formData.initialBalance) || 0,
        color: formData.color,
        currency: formData.currency,
      });
      setShowModal(false);
      setFormData({ name: "", type: "BANK", initialBalance: "", color: "#0077B6", currency: "USD" });
      loadAccounts();
      toast.success("Account created successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to create account");
    }
    finally { setSaving(false); }
  };

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.currentBalance), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-bg-tertiary rounded-md animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}><CardContent className="p-5"><div className="h-24 bg-bg-tertiary rounded-md animate-pulse" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Accounts</h1>
          {accounts.length > 0 && (
            <p className="text-sm text-text-secondary mt-1">
              Net worth: <span className="font-semibold text-text-primary">{formatCurrency(totalBalance)}</span>
            </p>
          )}
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No accounts yet"
          description="Add your first bank account, wallet, or credit card to start tracking your finances."
          action={{ label: "Add account", onClick: () => setShowModal(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => {
            const Icon = accountIcons[account.type] || Wallet;
            const balance = Number(account.currentBalance);
            return (
              <Card key={account.id} className="hover:shadow-[0_8px_24px_var(--shadow)] transition-shadow cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: `${account.color}20`, color: account.color }}
                      >
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{account.name}</p>
                        <p className="text-xs text-text-muted capitalize">{account.type.replace("_", " ").toLowerCase()}</p>
                      </div>
                    </div>
                    {account.isArchived && <Archive size={14} className="text-text-muted" />}
                  </div>
                  <p className={`text-xl font-bold ${balance < 0 ? "text-expense" : "text-text-primary"}`}>
                    {formatCurrency(balance, account.currency)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Account">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            label="Account name"
            placeholder="e.g., Main Checking"
            value={formData.name}
            onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
            required
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">Type</label>
            <select
              className="w-full h-10 px-3 rounded-md bg-bg-tertiary border border-border text-text-primary text-sm"
              value={formData.type}
              onChange={(e) => setFormData(f => ({ ...f, type: e.target.value }))}
            >
              <option value="BANK">Bank</option>
              <option value="CASH">Cash</option>
              <option value="CRYPTO">Crypto</option>
              <option value="SAVINGS">Savings</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="INVESTMENT">Investment</option>
            </select>
          </div>
          <Input
            id="balance"
            label="Initial balance"
            type="number"
            placeholder="0.00"
            value={formData.initialBalance}
            onChange={(e) => setFormData(f => ({ ...f, initialBalance: e.target.value }))}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button className="flex-1" type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create account"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
