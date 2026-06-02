"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { healthApi } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

const METRIC_TYPES = ["steps", "sleep_hours", "resting_hr", "weight", "calories", "water_ml"];

export default function HealthPage() {
  const qc = useQueryClient();
  const [metricType, setMetricType] = useState("steps");
  const [value, setValue] = useState("");
  const [chartMetric, setChartMetric] = useState("steps");

  const { data: todaySummary } = useQuery({
    queryKey: ["health-today"],
    queryFn: () => healthApi.todaySummary().then((r) => r.data),
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ["health-metrics", chartMetric],
    queryFn: () => healthApi.metrics({ metric_type: chartMetric, days: 30 }).then((r) => r.data),
  });

  const addMetric = useMutation({
    mutationFn: (data: { metric_type: string; value: number }) => healthApi.addMetric(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["health-metrics"] });
      qc.invalidateQueries({ queryKey: ["health-today"] });
      setValue("");
    },
  });

  const chartData = [...(metrics as any[])].reverse().map((m) => ({
    date: format(new Date(m.date), "MM/dd"),
    value: m.value,
  }));

  const summaryCards = [
    { key: "steps", label: "Steps", unit: "" },
    { key: "sleep_hours", label: "Sleep", unit: "hrs" },
    { key: "weight", label: "Weight", unit: "kg" },
    { key: "resting_hr", label: "Resting HR", unit: "bpm" },
    { key: "calories", label: "Calories", unit: "kcal" },
    { key: "water_ml", label: "Water", unit: "ml" },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-bold text-foreground">Health</h2>

      {/* Today's Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {summaryCards.map(({ key, label, unit }) => (
          <Card key={key}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-bold text-foreground mt-1">
                {(todaySummary as any)?.[key] ?? "—"}
                {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Manual Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Log Metric</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-end flex-wrap">
            <div className="space-y-1.5 flex-1 min-w-32">
              <Label>Metric Type</Label>
              <Select value={metricType} onValueChange={setMetricType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METRIC_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 flex-1 min-w-24">
              <Label>Value</Label>
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0"
              />
            </div>
            <Button
              onClick={() => addMetric.mutate({ metric_type: metricType, value: parseFloat(value) })}
              disabled={!value || addMetric.isPending}
            >
              {addMetric.isPending ? "Saving..." : "Log"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">30-Day Trend</CardTitle>
          <Select value={chartMetric} onValueChange={setChartMetric}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {METRIC_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data for this metric yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                <XAxis dataKey="date" tick={{ fill: "#888", fontSize: 11 }} />
                <YAxis tick={{ fill: "#888", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111", border: "1px solid #1f1f1f", color: "#eee" }}
                />
                <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
