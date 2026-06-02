"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/services/api";
import { DashboardData } from "@/types";

export function useDashboardToday() {
  return useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => dashboardApi.today().then((r) => r.data),
  });
}
