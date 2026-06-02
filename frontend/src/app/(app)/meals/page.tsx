"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mealsApi } from "@/services/api";
import { MealPlanGrid } from "@/components/meals/MealPlanGrid";
import { MealForm } from "@/components/meals/MealForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MealPlanEntry } from "@/types";
import { format, startOfWeek } from "date-fns";

export default function MealsPage() {
  const qc = useQueryClient();
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

  const { data: plan } = useQuery({
    queryKey: ["meal-plan-current"],
    queryFn: () => mealsApi.plan.current().then((r) => r.data),
  });

  const upsertPlan = useMutation({
    mutationFn: (data: { week_start_date: string; entries: any[] }) =>
      mealsApi.plan.upsert(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meal-plan-current"] }),
  });

  const duplicatePlan = useMutation({
    mutationFn: () => mealsApi.plan.duplicate(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meal-plan-current"] }),
  });

  const [cellDialog, setCellDialog] = useState<{ day: number; mealType: string; entry?: MealPlanEntry } | null>(null);

  const entries: MealPlanEntry[] = plan?.entries || [];

  const handleCellClick = (dayOfWeek: number, mealType: string, entry?: MealPlanEntry) => {
    setCellDialog({ day: dayOfWeek, mealType, entry });
  };

  const handleMealSubmit = (data: { custom_meal_name: string; notes?: string }) => {
    const currentEntries = entries.filter(
      (e) => !(e.day_of_week === cellDialog!.day && e.meal_type === cellDialog!.mealType)
    );
    const newEntry = {
      day_of_week: cellDialog!.day,
      meal_type: cellDialog!.mealType,
      custom_meal_name: data.custom_meal_name,
      notes: data.notes,
    };
    upsertPlan.mutate({
      week_start_date: weekStart,
      entries: [
        ...currentEntries.map((e) => ({
          day_of_week: e.day_of_week,
          meal_type: e.meal_type,
          custom_meal_name: e.custom_meal_name,
          notes: e.notes,
        })),
        newEntry,
      ],
    });
    setCellDialog(null);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Meal Plan</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => duplicatePlan.mutate()}
            disabled={duplicatePlan.isPending}
          >
            Duplicate Last Week
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Week of {format(new Date(weekStart + "T00:00:00"), "MMMM d, yyyy")}
      </p>

      <MealPlanGrid entries={entries} onCellClick={handleCellClick} />

      {cellDialog && (
        <Dialog open={!!cellDialog} onOpenChange={() => setCellDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Meal</DialogTitle>
            </DialogHeader>
            <MealForm
              dayOfWeek={cellDialog.day}
              mealType={cellDialog.mealType}
              defaultValue={cellDialog.entry?.custom_meal_name}
              onSubmit={handleMealSubmit}
              isLoading={upsertPlan.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
