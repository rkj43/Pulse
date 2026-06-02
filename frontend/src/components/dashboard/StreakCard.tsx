"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { Streak } from "@/types";

interface StreakCardProps {
  streaks: Streak[];
  habitNames: Record<string, string>;
}

export function StreakCard({ streaks, habitNames }: StreakCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" />
          Active Streaks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {streaks.length === 0 ? (
          <p className="text-muted-foreground text-sm">No streaks yet. Complete habits to build streaks!</p>
        ) : (
          <div className="space-y-2">
            {streaks.map((streak) => (
              <div key={streak.id} className="flex items-center justify-between">
                <span className="text-sm text-foreground">
                  {habitNames[streak.entity_id] || "Unknown habit"}
                </span>
                <div className="flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-sm font-semibold text-orange-500">{streak.current_streak}</span>
                  <span className="text-xs text-muted-foreground">days</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
