"use client";

import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { MobileSidebar } from "./Sidebar";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/habits": "Habits",
  "/workouts": "Workouts",
  "/meals": "Meals",
  "/health": "Health",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

export function Header() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const title = pageTitles[pathname] || "Pulse";

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background px-4 md:px-6">
      <MobileSidebar />
      <h1 className="text-lg font-semibold text-foreground flex-1">{title}</h1>
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-semibold">
          {user?.username?.[0]?.toUpperCase() ?? "U"}
        </div>
        <span className="hidden md:block text-sm text-muted-foreground">{user?.username}</span>
      </div>
    </header>
  );
}
