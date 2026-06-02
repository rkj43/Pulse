"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/services/api";
import { User } from "@/types";

export function useAuth() {
  const router = useRouter();
  const { user, token, isAuthenticated, login, logout } = useAuthStore();

  const handleLogin = async (email: string, password: string) => {
    const tokenRes = await authApi.login({ email, password });
    const { access_token } = tokenRes.data;

    // Temporarily store token to fetch user
    if (typeof window !== "undefined") {
      localStorage.setItem("pulse_token", access_token);
    }

    const userRes = await authApi.me();
    login(userRes.data as User, access_token);
    router.push("/dashboard");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const requireAuth = () => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    login: handleLogin,
    logout: handleLogout,
    requireAuth,
  };
}
