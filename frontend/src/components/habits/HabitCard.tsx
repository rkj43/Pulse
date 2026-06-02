"use client";

import { Habit, Streak } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Flame } from "lucide-react";

interface HabitCardProps {
  habit: Habit;
  streak?: Streak;
  completionPct?: number;
  doneToday?: boolean;
  onLog: () => void;
}

export function HabitCard({ habit, streak, completionPct, doneToday, onLog }: HabitCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-foreground truncate">{habit.name}</h3>
              <Badge variant="secondary" className="text-xs">
                {habit.target_frequency}x/{habit.frequency_unit}
              </Badge>
              {streak && streak.current_streak > 0 && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Flame className="h-3 w-3 text-orange-500" />
                  {streak.current_streak}
                </Badge>
              )}
            </div>
            {habit.description && (
              <p className="text-sm text-muted-foreground mt-1 truncate">{habit.description}</p>
            )}
            {completionPct !== undefined && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>30-day completion</span>
                  <span>{completionPct}%</span>
                </div>
                <Progress value={completionPct} />
              </div>
            )}
          </div>
          <Button
            size="sm"
            variant={doneToday ? "secondary" : "default"}
            disabled={doneToday}
            onClick={onLog}
          >
            {doneToday ? "Done ✓" : "Mark Done"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
