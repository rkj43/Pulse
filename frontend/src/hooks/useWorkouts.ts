"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workoutsApi } from "@/services/api";

export function useWorkoutTemplates() {
  return useQuery({
    queryKey: ["workout-templates"],
    queryFn: () => workoutsApi.templates.list().then((r) => r.data),
  });
}

export function useWeeklySchedule() {
  return useQuery({
    queryKey: ["weekly-schedule"],
    queryFn: () => workoutsApi.schedule.get().then((r) => r.data),
  });
}

export function useWorkoutSessions() {
  return useQuery({
    queryKey: ["workout-sessions"],
    queryFn: () => workoutsApi.sessions.list().then((r) => r.data),
  });
}

export function useLogSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { template_id?: string; duration_minutes?: number; notes?: string; completed?: boolean }) =>
      workoutsApi.sessions.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workout-sessions"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useWorkoutProgress(exerciseName: string) {
  return useQuery({
    queryKey: ["workout-progress", exerciseName],
    queryFn: () => workoutsApi.progress(exerciseName).then((r) => r.data),
    enabled: !!exerciseName,
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; day_of_week?: number }) =>
      workoutsApi.templates.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workout-templates"] });
    },
  });
}
