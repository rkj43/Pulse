"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MealFormProps {
  dayOfWeek: number;
  mealType: string;
  defaultValue?: string;
  onSubmit: (data: { custom_meal_name: string; notes?: string }) => void;
  isLoading?: boolean;
}

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function MealForm({ dayOfWeek, mealType, defaultValue, onSubmit, isLoading }: MealFormProps) {
  const [mealName, setMealName] = useState(defaultValue || "");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ custom_meal_name: mealName, notes: notes || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {DAY_NAMES[dayOfWeek]} — <span className="capitalize">{mealType}</span>
      </p>
      <div className="space-y-1.5">
        <Label>Meal Name</Label>
        <Input value={mealName} onChange={(e) => setMealName(e.target.value)} placeholder="e.g. Oatmeal with berries" required />
      </div>
      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Any notes..." />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
