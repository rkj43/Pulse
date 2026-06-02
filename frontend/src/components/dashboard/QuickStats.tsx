"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Footprints, Moon, Droplets } from "lucide-react";

interface QuickStatsProps {
  steps?: number;
  sleep?: number;
  water?: number;
}

export function QuickStats({ steps, sleep, water }: QuickStatsProps) {
  const stats = [
    { label: "Steps", value: steps ? steps.toLocaleString() : "—", unit: "", icon: Footprints, color: "text-blue-400" },
    { label: "Sleep", value: sleep ?? "—", unit: "hrs", icon: Moon, color: "text-indigo-400" },
    { label: "Water", value: water ? (water / 1000).toFixed(1) : "—", unit: "L", icon: Droplets, color: "text-cyan-400" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(({ label, value, unit, icon: Icon, color }) => (
        <Card key={label}>
          <CardContent className="p-4 flex flex-col items-center gap-1">
            <Icon className={`h-5 w-5 ${color}`} />
            <p className="text-xl font-bold text-foreground">
              {value}
              {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
            </p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
