"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { habitsApi } from "@/services/api";

export function useHabits() {
  return useQuery({
    queryKey: ["habits"],
    queryFn: () => habitsApi.list().then((r) => r.data),
  });
}

export function useHabitStats(id: string) {
  return useQuery({
    queryKey: ["habit-stats", id],
    queryFn: () => habitsApi.stats(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useStreaks() {
  return useQuery({
    queryKey: ["streaks"],
    queryFn: () => habitsApi.streaks().then((r) => r.data),
  });
}

export function useLogHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      habitsApi.log(id, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habits"] });
      qc.invalidateQueries({ queryKey: ["streaks"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCreateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; target_frequency?: number; frequency_unit?: string }) =>
      habitsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

export function useUpdateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ name: string; description: string; active: boolean }> }) =>
      habitsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}
