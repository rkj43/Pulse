"use client";

import { useState } from "react";
import { useDashboardToday } from "@/hooks/useDashboard";
import { useLogHabit } from "@/hooks/useHabits";
import { TodayCard } from "@/components/dashboard/TodayCard";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/stores/authStore";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useDashboardToday();
  const logHabit = useLogHabit();
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());

  const handleLog = (habitId: string) => {
    logHabit.mutate({ id: habitId });
    setCompletedToday((prev) => new Set([...prev, habitId]));
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const habitNames: Record<string, string> = {};
  data?.habits.forEach((h) => { habitNames[h.id] = h.name; });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {greeting()}, {user?.username} 👋
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Quick Stats */}
      {data && (
        <QuickStats
          steps={data.health_summary.steps}
          sleep={data.health_summary.sleep_hours}
          water={data.health_summary.water_ml}
        />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Habits */}
        {data && (
          <TodayCard
            habits={data.habits}
            completedHabitIds={completedToday}
            onLog={handleLog}
          />
        )}

        {/* Streaks */}
        {data && (
          <StreakCard streaks={data.streaks} habitNames={habitNames} />
        )}
      </div>

      {/* Goals Progress */}
      {data && data.goals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Goals</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {data.goals.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-sm text-foreground">{goal.title}</p>
                    <span className="text-xs text-muted-foreground capitalize">{goal.status}</span>
                  </div>
                  {goal.target_value && (
                    <>
                      <Progress value={(goal.current_value / goal.target_value) * 100} />
                      <p className="text-xs text-muted-foreground mt-1">
                        {goal.current_value} / {goal.target_value} {goal.unit}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Today's Workout */}
      {data?.today_schedule?.template_id && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s Workout</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You have a workout scheduled today.
              {data.today_sessions.length > 0
                ? ` Completed ${data.today_sessions.filter((s) => s.completed).length} session(s).`
                : " No sessions logged yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
