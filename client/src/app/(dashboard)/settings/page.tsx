"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useThemeStore } from "@/stores/theme";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { Sun, Moon } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { theme, toggleTheme } = useThemeStore();
  const { user, fetchUser } = useAuthStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("UTC");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setCurrency(user.preferredCurrency || "USD");
      setTimezone(user.timezone || "UTC");
    }
  }, [user]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/users/me", { name, phone, preferredCurrency: currency, timezone });
      await fetchUser();
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your account preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                <p className="text-xs text-text-muted">{user?.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input id="name" label="Full name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input id="email" label="Email" type="email" placeholder="you@example.com" value={user?.email || ""} disabled />
            </div>
            <Input id="phone" label="Phone (optional)" placeholder="+1 234 567 890" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Button size="sm" type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
          </form>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">Theme</p>
              <p className="text-xs text-text-muted">Switch between light and dark mode</p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-bg-tertiary border border-border text-sm text-text-primary hover:bg-bg-primary transition-colors cursor-pointer"
            >
              {theme === "light" ? <Sun size={16} /> : <Moon size={16} />}
              {theme === "light" ? "Light" : "Dark"}
            </button>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">Currency</label>
            <select
              className="w-full h-10 px-3 rounded-md bg-bg-tertiary border border-border text-text-primary text-sm"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">Timezone</label>
            <select
              className="w-full h-10 px-3 rounded-md bg-bg-tertiary border border-border text-text-primary text-sm"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
          <CardDescription>Export or manage your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" size="sm">Export all data (JSON)</Button>
          <Button variant="danger" size="sm">Delete account</Button>
        </CardContent>
      </Card>
    </div>
  );
}
