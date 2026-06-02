"use client";

import { WorkoutTemplate, WorkoutSession } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell, CheckCircle2 } from "lucide-react";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface WorkoutCardProps {
  template: WorkoutTemplate;
  onLogSession?: () => void;
}

export function WorkoutCard({ template, onLogSession }: WorkoutCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-foreground">{template.name}</h3>
              {template.day_of_week !== undefined && template.day_of_week !== null && (
                <Badge variant="secondary">{DAY_NAMES[template.day_of_week]}</Badge>
              )}
            </div>
            {template.description && (
              <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
            )}
          </div>
          {onLogSession && (
            <Button size="sm" onClick={onLogSession}>
              Log
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface SessionCardProps {
  session: WorkoutSession;
  templateName?: string;
}

export function SessionCard({ session, templateName }: SessionCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground text-sm">{templateName || "Free workout"}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(session.date).toLocaleDateString()}
              {session.duration_minutes && ` · ${session.duration_minutes} min`}
            </p>
          </div>
          {session.completed && <CheckCircle2 className="h-4 w-4 text-green-500" />}
        </div>
      </CardContent>
    </Card>
  );
}
