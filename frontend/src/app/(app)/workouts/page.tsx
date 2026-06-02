"use client";

import { useState } from "react";
import { useWorkoutTemplates, useWorkoutSessions, useWeeklySchedule, useLogSession, useCreateTemplate } from "@/hooks/useWorkouts";
import { WorkoutCard, SessionCard } from "@/components/workouts/WorkoutCard";
import { WorkoutForm } from "@/components/workouts/WorkoutForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Dumbbell } from "lucide-react";
import { WorkoutTemplate } from "@/types";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function WorkoutsPage() {
  const { data: templates = [] } = useWorkoutTemplates();
  const { data: sessions = [] } = useWorkoutSessions();
  const { data: schedule = [] } = useWeeklySchedule();
  const logSession = useLogSession();
  const createTemplate = useCreateTemplate();
  const [open, setOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>();

  const templateMap: Record<string, WorkoutTemplate> = {};
  (templates as WorkoutTemplate[]).forEach((t) => { templateMap[t.id] = t; });

  const scheduleMap: Record<number, string | undefined> = {};
  (schedule as { day_of_week: number; template_id?: string }[]).forEach((s) => {
    scheduleMap[s.day_of_week] = s.template_id;
  });

  const handleLogSession = (templateId?: string) => {
    setSelectedTemplate(templateId);
    setLogOpen(true);
  };

  const confirmLog = () => {
    logSession.mutate({ template_id: selectedTemplate, completed: true });
    setLogOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Workouts</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Workout Template</DialogTitle>
            </DialogHeader>
            <WorkoutForm
              onSubmit={(data) => createTemplate.mutate(data, { onSuccess: () => setOpen(false) })}
              isLoading={createTemplate.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {DAY_NAMES.map((day, idx) => {
              const templateId = scheduleMap[idx];
              const template = templateId ? templateMap[templateId] : undefined;
              return (
                <div key={day} className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">{day}</p>
                  <div className={`rounded-md p-2 text-xs min-h-[48px] flex items-center justify-center ${template ? "bg-primary/10 border border-primary/30 text-primary" : "bg-muted border border-border text-muted-foreground"}`}>
                    {template ? template.name : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Templates */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Templates</h3>
        {(templates as WorkoutTemplate[]).length === 0 ? (
          <p className="text-muted-foreground text-sm">No workout templates yet.</p>
        ) : (
          <div className="space-y-2">
            {(templates as WorkoutTemplate[]).map((t) => (
              <WorkoutCard key={t.id} template={t} onLogSession={() => handleLogSession(t.id)} />
            ))}
          </div>
        )}
      </div>

      {/* Log Session Dialog */}
      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Workout Session</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {selectedTemplate ? `Template: ${templateMap[selectedTemplate]?.name}` : "Free workout session"}
          </p>
          <div className="flex gap-2 mt-4">
            <Button onClick={confirmLog} className="flex-1" disabled={logSession.isPending}>
              {logSession.isPending ? "Logging..." : "Log Session"}
            </Button>
            <Button variant="outline" onClick={() => setLogOpen(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recent Sessions */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Recent Sessions</h3>
        {(sessions as any[]).length === 0 ? (
          <p className="text-muted-foreground text-sm">No sessions logged yet.</p>
        ) : (
          <div className="space-y-2">
            {(sessions as any[]).slice(0, 10).map((s) => (
              <SessionCard key={s.id} session={s} templateName={s.template_id ? templateMap[s.template_id]?.name : undefined} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
