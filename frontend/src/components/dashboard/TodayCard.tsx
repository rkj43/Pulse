"use client";

import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle } from "lucide-react";
import { Habit } from "@/types";

interface TodayCardProps {
  habits: Habit[];
  completedHabitIds: Set<string>;
  onLog: (habitId: string) => void;
}

export function TodayCard({ habits, completedHabitIds, onLog }: TodayCardProps) {
  const today = format(new Date(), "EEEE, MMMM d");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Today — {today}</CardTitle>
      </CardHeader>
      <CardContent>
        {habits.length === 0 ? (
          <p className="text-muted-foreground text-sm">No habits yet. Create some habits to get started.</p>
        ) : (
          <ul className="space-y-2">
            {habits.map((habit) => {
              const done = completedHabitIds.has(habit.id);
              return (
                <li key={habit.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={`text-sm ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {habit.name}
                    </span>
                  </div>
                  {!done && (
                    <Button size="sm" variant="outline" onClick={() => onLog(habit.id)}>
                      Done
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
