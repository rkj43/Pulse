"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { remindersApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Bell } from "lucide-react";
import { Reminder } from "@/types";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const { data: reminders = [] } = useQuery({
    queryKey: ["reminders"],
    queryFn: () => remindersApi.list().then((r) => r.data),
  });

  const createReminder = useMutation({
    mutationFn: (data: { title: string; schedule_type: string }) => remindersApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders"] });
      setOpen(false);
      setTitle("");
    },
  });

  const deleteReminder = useMutation({
    mutationFn: (id: string) => remindersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminders"] }),
  });

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [scheduleType, setScheduleType] = useState("daily");

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-foreground">Settings</h2>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Username</Label>
              <Input value={user?.username ?? ""} readOnly className="opacity-70" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={user?.email ?? ""} readOnly className="opacity-70" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Profile editing will be available in a future update.
          </p>
        </CardContent>
      </Card>

      <Separator />

      {/* Reminders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Reminders
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Reminder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Drink water"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Schedule</Label>
                  <Select value={scheduleType} onValueChange={setScheduleType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full"
                  onClick={() => createReminder.mutate({ title, schedule_type: scheduleType })}
                  disabled={!title || createReminder.isPending}
                >
                  {createReminder.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {(reminders as Reminder[]).length === 0 ? (
            <p className="text-sm text-muted-foreground">No reminders set up yet.</p>
          ) : (
            <div className="space-y-2">
              {(reminders as Reminder[]).map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-md border border-border bg-muted">
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.title}</p>
                    <Badge variant="secondary" className="text-xs mt-1 capitalize">{r.schedule_type}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteReminder.mutate(r.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Notification Preferences Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Push notification support coming soon. Manage your reminders above to stay on track.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
