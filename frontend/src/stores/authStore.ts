import { create } from "zustand";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

const getStoredToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("pulse_token");
  }
  return null;
};

const getStoredUser = (): User | null => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("pulse_user");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
  }
  return null;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  token: getStoredToken(),
  isAuthenticated: !!getStoredToken(),

  login: (user: User, token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pulse_token", token);
      localStorage.setItem("pulse_user", JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("pulse_token");
      localStorage.removeItem("pulse_user");
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user: User) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pulse_user", JSON.stringify(user));
    }
    set({ user });
  },
}));
