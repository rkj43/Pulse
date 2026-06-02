"use client";

import { MealPlanEntry } from "@/types";
import { cn } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MEAL_TYPES = ["breakfast", "lunch", "dinner"];

interface MealPlanGridProps {
  entries: MealPlanEntry[];
  onCellClick?: (dayOfWeek: number, mealType: string, existing?: MealPlanEntry) => void;
}

export function MealPlanGrid({ entries, onCellClick }: MealPlanGridProps) {
  const getEntry = (day: number, mealType: string) =>
    entries.find((e) => e.day_of_week === day && e.meal_type === mealType);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="p-2 text-left text-muted-foreground font-medium w-24"></th>
            {DAYS.map((d) => (
              <th key={d} className="p-2 text-center text-muted-foreground font-medium">{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MEAL_TYPES.map((mealType) => (
            <tr key={mealType} className="border-t border-border">
              <td className="p-2 text-muted-foreground capitalize font-medium">{mealType}</td>
              {DAYS.map((_, dayIdx) => {
                const entry = getEntry(dayIdx, mealType);
                return (
                  <td key={dayIdx} className="p-1">
                    <button
                      onClick={() => onCellClick?.(dayIdx, mealType, entry)}
                      className={cn(
                        "w-full min-h-[52px] rounded-md border border-border p-1.5 text-xs text-left transition-colors hover:bg-accent",
                        entry ? "bg-primary/10 border-primary/30" : "bg-muted"
                      )}
                    >
                      {entry?.custom_meal_name || entry?.notes || (entry ? "✓" : "+")}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
