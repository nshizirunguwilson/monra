import { create } from "zustand";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  preferredCurrency: string;
  avatarUrl?: string;
  phone?: string;
  timezone?: string;
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const res = await api.post<{ data: { user: User; accessToken: string } }>("/auth/login", { email, password });
    localStorage.setItem("accessToken", res.data.accessToken);
    set({ user: res.data.user, isAuthenticated: true });
  },

  register: async (email, password, name) => {
    const res = await api.post<{ data: { user: User; accessToken: string } }>("/auth/register", { email, password, name });
    localStorage.setItem("accessToken", res.data.accessToken);
    set({ user: res.data.user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("accessToken");
      set({ user: null, isAuthenticated: false });
    }
  },

  fetchUser: async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const res = await api.get<{ data: User }>("/users/me");
      set({ user: res.data, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
