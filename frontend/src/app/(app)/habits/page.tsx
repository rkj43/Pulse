"use client";

import { useState } from "react";
import { useHabits, useStreaks, useLogHabit, useCreateHabit } from "@/hooks/useHabits";
import { habitsApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { HabitCard } from "@/components/habits/HabitCard";
import { HabitForm } from "@/components/habits/HabitForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Streak } from "@/types";

export default function HabitsPage() {
  const { data: habits = [], isLoading } = useHabits();
  const { data: streaks = [] } = useStreaks();
  const logHabit = useLogHabit();
  const createHabit = useCreateHabit();
  const [open, setOpen] = useState(false);
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());

  const streakMap: Record<string, Streak> = {};
  (streaks as Streak[]).forEach((s) => { streakMap[s.entity_id] = s; });

  const handleLog = (habitId: string) => {
    logHabit.mutate({ id: habitId });
    setCompletedToday((prev) => new Set([...prev, habitId]));
  };

  const handleCreate = async (data: { name: string; description?: string; target_frequency: number; frequency_unit: string }) => {
    createHabit.mutate(data, {
      onSuccess: () => setOpen(false),
    });
  };

  const active = habits.filter((h) => h.active);
  const archived = habits.filter((h) => !h.active);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Habits</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Habit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Habit</DialogTitle>
            </DialogHeader>
            <HabitForm onSubmit={handleCreate} isLoading={createHabit.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="all">All ({habits.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({archived.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-4">
          {isLoading ? (
            <p className="text-muted-foreground">Loading habits...</p>
          ) : habits.length === 0 ? (
            <p className="text-muted-foreground">No habits yet. Create your first habit!</p>
          ) : (
            habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                streak={streakMap[habit.id]}
                doneToday={completedToday.has(habit.id)}
                onLog={() => handleLog(habit.id)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-3 mt-4">
          {active.length === 0 ? (
            <p className="text-muted-foreground">No active habits.</p>
          ) : (
            active.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                streak={streakMap[habit.id]}
                doneToday={completedToday.has(habit.id)}
                onLog={() => handleLog(habit.id)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="archived" className="space-y-3 mt-4">
          {archived.length === 0 ? (
            <p className="text-muted-foreground">No archived habits.</p>
          ) : (
            archived.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                streak={streakMap[habit.id]}
                doneToday={completedToday.has(habit.id)}
                onLog={() => handleLog(habit.id)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
