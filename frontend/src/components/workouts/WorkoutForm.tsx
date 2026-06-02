"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface WorkoutFormProps {
  onSubmit: (data: { name: string; description?: string; day_of_week?: number }) => void;
  isLoading?: boolean;
}

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function WorkoutForm({ onSubmit, isLoading }: WorkoutFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description: description || undefined,
      day_of_week: dayOfWeek !== "" ? parseInt(dayOfWeek) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="wname">Template Name</Label>
        <Input id="wname" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Push Day" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="wdesc">Description</Label>
        <Textarea id="wdesc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="wday">Scheduled Day (optional)</Label>
        <select
          id="wday"
          value={dayOfWeek}
          onChange={(e) => setDayOfWeek(e.target.value)}
          className="flex h-9 w-full rounded-md border border-border bg-muted px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        >
          <option value="">— No schedule —</option>
          {DAY_NAMES.map((d, i) => (
            <option key={i} value={i}>{d}</option>
          ))}
        </select>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Template"}
      </Button>
    </form>
  );
}
