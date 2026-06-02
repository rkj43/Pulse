import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("pulse_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("pulse_token");
      localStorage.removeItem("pulse_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  register: (data: { email: string; username: string; password: string }) =>
    api.post("/api/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/api/auth/login", data),
  me: () => api.get("/api/auth/me"),
};

// Habits endpoints
export const habitsApi = {
  list: () => api.get("/api/habits"),
  create: (data: { name: string; description?: string; target_frequency?: number; frequency_unit?: string }) =>
    api.post("/api/habits", data),
  update: (id: string, data: Partial<{ name: string; description: string; active: boolean; target_frequency: number; frequency_unit: string }>) =>
    api.put(`/api/habits/${id}`, data),
  delete: (id: string) => api.delete(`/api/habits/${id}`),
  log: (id: string, notes?: string) => api.post(`/api/habits/${id}/log`, { notes }),
  stats: (id: string) => api.get(`/api/habits/${id}/stats`),
  streaks: () => api.get("/api/habits/streaks"),
};

// Workouts endpoints
export const workoutsApi = {
  templates: {
    list: () => api.get("/api/workouts/templates"),
    create: (data: { name: string; description?: string; day_of_week?: number }) =>
      api.post("/api/workouts/templates", data),
    update: (id: string, data: { name?: string; description?: string; day_of_week?: number }) =>
      api.put(`/api/workouts/templates/${id}`, data),
    delete: (id: string) => api.delete(`/api/workouts/templates/${id}`),
  },
  schedule: {
    get: () => api.get("/api/workouts/schedule"),
    update: (entries: { day_of_week: number; template_id?: string }[]) =>
      api.put("/api/workouts/schedule", entries),
  },
  sessions: {
    list: () => api.get("/api/workouts/sessions"),
    create: (data: { template_id?: string; date?: string; duration_minutes?: number; notes?: string; completed?: boolean }) =>
      api.post("/api/workouts/sessions", data),
    get: (id: string) => api.get(`/api/workouts/sessions/${id}`),
    update: (id: string, data: { duration_minutes?: number; notes?: string; completed?: boolean }) =>
      api.put(`/api/workouts/sessions/${id}`, data),
  },
  progress: (exerciseName: string) => api.get(`/api/workouts/progress/${exerciseName}`),
};

// Meals endpoints
export const mealsApi = {
  templates: {
    list: () => api.get("/api/meals/templates"),
    create: (data: { name: string; description?: string; meal_type?: string }) =>
      api.post("/api/meals/templates", data),
  },
  plan: {
    current: () => api.get("/api/meals/plan/current"),
    byWeek: (weekStart: string) => api.get(`/api/meals/plan/${weekStart}`),
    upsert: (data: { week_start_date: string; entries: { day_of_week: number; meal_type: string; custom_meal_name?: string; notes?: string }[] }) =>
      api.put("/api/meals/plan", data),
    duplicate: () => api.post("/api/meals/plan/duplicate"),
  },
};

// Health endpoints
export const healthApi = {
  metrics: (params?: { metric_type?: string; days?: number }) =>
    api.get("/api/health/metrics", { params }),
  addMetric: (data: { metric_type: string; value: number; date?: string; source?: string }) =>
    api.post("/api/health/metrics", data),
  todaySummary: () => api.get("/api/health/summary/today"),
};

// Goals endpoints
export const goalsApi = {
  list: () => api.get("/api/goals"),
  create: (data: { title: string; description?: string; goal_type?: string; target_value?: number; unit?: string; target_date?: string }) =>
    api.post("/api/goals", data),
  update: (id: string, data: { title?: string; current_value?: number; status?: string }) =>
    api.put(`/api/goals/${id}`, data),
  delete: (id: string) => api.delete(`/api/goals/${id}`),
  updateProgress: (id: string, value: number) =>
    api.post(`/api/goals/${id}/update-progress?value=${value}`),
};

// Analytics endpoints
export const analyticsApi = {
  insights: () => api.get("/api/analytics/insights"),
  habitsSummary: (days?: number) => api.get("/api/analytics/habits/summary", { params: { days } }),
  workoutsSummary: (days?: number) => api.get("/api/analytics/workouts/summary", { params: { days } }),
  healthSummary: (days?: number) => api.get("/api/analytics/health/summary", { params: { days } }),
};

// Dashboard endpoint
export const dashboardApi = {
  today: () => api.get("/api/dashboard/today"),
};

// Reminders endpoints
export const remindersApi = {
  list: () => api.get("/api/reminders"),
  create: (data: { title: string; description?: string; schedule_type?: string; cron_expression?: string }) =>
    api.post("/api/reminders", data),
  update: (id: string, data: { title?: string; active?: boolean }) =>
    api.put(`/api/reminders/${id}`, data),
  delete: (id: string) => api.delete(`/api/reminders/${id}`),
  pending: () => api.get("/api/reminders/pending"),
  complete: (id: string) => api.post(`/api/reminders/${id}/complete`),
};

export default api;
