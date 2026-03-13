"use client";

import { create } from "zustand";
import type { User } from "@/types/auth";

const STORAGE_KEY = "canvas-genie-user";

function loadUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as User;
    return data?.username ? data : null;
  } catch {
    return null;
  }
}

function saveUser(user: User | null): void {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

interface AuthState {
  user: User | null;
  /** 是否已从 localStorage 恢复过，用于避免未恢复前误判未登录 */
  hasHydrated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  hasHydrated: false,

  login(username: string, password: string) {
    if (username === "admin" && password === "admin666666") {
      const user: User = { username };
      saveUser(user);
      set({ user });
      return true;
    }
    return false;
  },

  logout() {
    saveUser(null);
    set({ user: null });
  },

  hydrate() {
    set({ user: loadUser(), hasHydrated: true });
  },
}));
