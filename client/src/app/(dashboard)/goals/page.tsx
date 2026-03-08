"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api";
import { Plus, Target, Plane, Laptop, Shield, GraduationCap } from "lucide-react";
import { toast } from "sonner";

const goalIcons: Record<string, typeof Target> = {
  Travel: Plane,
  Tech: Laptop,
  "Emergency Fund": Shield,
  Education: GraduationCap,
};

interface Goal {
  id: string;
  name: string;
  category: string;
  targetAmount: string;
  currentAmount: string;
  deadline: string | null;
  priority: number;
  isCompleted: boolean;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: "", category: "Travel", targetAmount: "", deadline: "", description: "" });

  const loadGoals = async () => {
    try {
      const res = await api.get<{ data: Goal[] }>("/goals");
      setGoals(res.data);
    } catch { /* empty state */ }
    finally { setLoading(false); }
  };

  useEffect(() => { loadGoals(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/goals", {
        name: formData.name,
        category: formData.category,
        targetAmount: Number(formData.targetAmount),
        deadline: formData.deadline || undefined,
        description: formData.description || undefined,
      });
      setShowModal(false);
      setFormData({ name: "", category: "Travel", targetAmount: "", deadline: "", description: "" });
      loadGoals();
      toast.success("Goal created successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to create goal");
    }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-bg-tertiary rounded-md animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i}><CardContent className="p-5"><div className="h-28 bg-bg-tertiary rounded-md animate-pulse" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Savings Goals</h1>
          {goals.length > 0 && <p className="text-sm text-text-secondary mt-1">{goals.length} active goals</p>}
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} /> New goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No savings goals yet"
          description="Set a goal to save for something special. Track your progress and stay motivated."
          action={{ label: "Create a goal", onClick: () => setShowModal(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const progress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
            const Icon = goalIcons[goal.category] || Target;
            return (
              <Card key={goal.id} className="hover:shadow-[0_8px_24px_var(--shadow)] transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-secondary-light flex items-center justify-center text-secondary">
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{goal.name}</p>
                        <p className="text-xs text-text-muted">{goal.category}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-primary bg-primary-light px-2 py-1 rounded-full">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-bg-tertiary rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-linear-to-r from-primary to-secondary rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-text-primary">{formatCurrency(Number(goal.currentAmount))}</span>
                      <span className="text-sm text-text-muted"> / {formatCurrency(Number(goal.targetAmount))}</span>
                    </div>
                    {goal.deadline && (
                      <span className="text-xs text-text-muted">
                        Due {new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Savings Goal">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="name" label="Goal name" placeholder="e.g., Japan Trip" value={formData.name} onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))} required />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">Category</label>
            <select className="w-full h-10 px-3 rounded-md bg-bg-tertiary border border-border text-text-primary text-sm" value={formData.category} onChange={(e) => setFormData(f => ({ ...f, category: e.target.value }))}>
              <option>Travel</option>
              <option>Tech</option>
              <option>Emergency Fund</option>
              <option>Education</option>
              <option>Custom</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input id="target" label="Target amount" type="number" placeholder="0.00" value={formData.targetAmount} onChange={(e) => setFormData(f => ({ ...f, targetAmount: e.target.value }))} required />
            <Input id="deadline" label="Deadline (optional)" type="date" value={formData.deadline} onChange={(e) => setFormData(f => ({ ...f, deadline: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button className="flex-1" type="submit" disabled={saving}>{saving ? "Creating..." : "Create goal"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
