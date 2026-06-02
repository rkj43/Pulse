export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
  is_active: boolean;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  target_frequency: number;
  frequency_unit: string;
  active: boolean;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  notes?: string;
}

export interface Streak {
  id: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  current_streak: number;
  best_streak: number;
  last_completed?: string;
}

export interface HabitStats {
  habit: Habit;
  streak?: Streak;
  completion_percentage_30d: number;
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  schedule_type: string;
  cron_expression?: string;
  active: boolean;
  next_run?: string;
  created_at: string;
}

export interface WorkoutTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  day_of_week?: number;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  template_id?: string;
  date: string;
  duration_minutes?: number;
  notes?: string;
  completed: boolean;
}

export interface WeeklySchedule {
  id: string;
  user_id: string;
  day_of_week: number;
  template_id?: string;
}

export interface MealTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  meal_type: string;
}

export interface MealPlanEntry {
  id: string;
  plan_id: string;
  day_of_week: number;
  meal_type: string;
  meal_template_id?: string;
  custom_meal_name?: string;
  notes?: string;
}

export interface MealPlan {
  id: string;
  user_id: string;
  week_start_date: string;
  created_at: string;
  entries: MealPlanEntry[];
}

export interface HealthMetric {
  id: string;
  user_id: string;
  date: string;
  metric_type: string;
  value: number;
  source?: string;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  goal_type?: string;
  target_value?: number;
  current_value: number;
  unit?: string;
  target_date?: string;
  status: string;
  created_at: string;
}

export interface Insight {
  id: string;
  user_id: string;
  created_at: string;
  title: string;
  description?: string;
  category?: string;
  data_json?: string;
}

export interface DashboardData {
  date: string;
  habits: Habit[];
  streaks: Streak[];
  health_summary: Record<string, number>;
  goals: Goal[];
  today_schedule?: { template_id?: string; day_of_week?: number };
  today_sessions: { id: string; completed: boolean; duration_minutes?: number }[];
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}
