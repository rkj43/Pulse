"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";
import { Insight } from "@/types";

export default function AnalyticsPage() {
  const { data: insights = [] } = useQuery({
    queryKey: ["insights"],
    queryFn: () => analyticsApi.insights().then((r) => r.data),
  });

  const { data: habitSummary = [] } = useQuery({
    queryKey: ["habit-analytics"],
    queryFn: () => analyticsApi.habitsSummary(30).then((r) => r.data),
  });

  const { data: workoutSummary } = useQuery({
    queryKey: ["workout-analytics"],
    queryFn: () => analyticsApi.workoutsSummary(30).then((r) => r.data),
  });

  const { data: healthSummary } = useQuery({
    queryKey: ["health-analytics"],
    queryFn: () => analyticsApi.healthSummary(30).then((r) => r.data),
  });

  const sleepData = (healthSummary as any)?.sleep_hours || [];
  const sleepChartData = [...sleepData].reverse().map((m: any) => ({
    date: new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: m.value,
  }));

  const workoutWeekData = Object.entries((workoutSummary as any)?.by_week || {}).map(([week, count]) => ({
    week: `W${week}`,
    sessions: count,
  }));

  const categoryColors: Record<string, string> = {
    habits: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    workouts: "bg-green-500/10 border-green-500/30 text-green-400",
    health: "bg-purple-500/10 border-purple-500/30 text-purple-400",
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-bold text-foreground">Analytics</h2>

      {/* Insights */}
      {(insights as Insight[]).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Insights</h3>
          <div className="space-y-3">
            {(insights as Insight[]).map((insight) => (
              <Card key={insight.id} className={insight.category ? categoryColors[insight.category] : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{insight.title}</p>
                      {insight.description && (
                        <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                      )}
                    </div>
                    {insight.category && (
                      <Badge variant="outline" className="text-xs capitalize flex-shrink-0">
                        {insight.category}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Habit Completion Chart */}
      {(habitSummary as any[]).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Habit Completion (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={habitSummary as any[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                <XAxis dataKey="habit_name" tick={{ fill: "#888", fontSize: 11 }} />
                <YAxis tick={{ fill: "#888", fontSize: 11 }} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111", border: "1px solid #1f1f1f", color: "#eee" }}
                  formatter={(v) => [`${v}%`, "Completion"]}
                />
                <Bar dataKey="completion_rate" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Workout Consistency */}
      {workoutWeekData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Workout Sessions by Week</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={workoutWeekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                <XAxis dataKey="week" tick={{ fill: "#888", fontSize: 11 }} />
                <YAxis tick={{ fill: "#888", fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #1f1f1f", color: "#eee" }} />
                <Bar dataKey="sessions" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Sleep Trend */}
      {sleepChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sleep Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={sleepChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                <XAxis dataKey="date" tick={{ fill: "#888", fontSize: 10 }} />
                <YAxis tick={{ fill: "#888", fontSize: 11 }} domain={[0, 12]} unit="h" />
                <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #1f1f1f", color: "#eee" }} />
                <Line type="monotone" dataKey="value" stroke="#818cf8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {(insights as any[]).length === 0 && (habitSummary as any[]).length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No analytics data yet. Start tracking habits, workouts, and health metrics to see insights here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
