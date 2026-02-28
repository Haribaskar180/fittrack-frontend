import api from './axiosInstance';

export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string; role?: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  refresh: () => api.post('/auth/refresh'),

  logout: () => api.post('/auth/logout'),

  me: () => api.get('/auth/me'),
};

export const usersApi = {
  list: (params?: Record<string, string>) => api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: object) => api.put(`/users/${id}`, data),
  updateRole: (id: string, role: string) => api.put(`/users/${id}/role`, { role }),
  assignCoach: (id: string, coachId: string | null) => api.put(`/users/${id}/assign-coach`, { coachId }),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const exercisesApi = {
  list: (params?: Record<string, string>) => api.get('/exercises', { params }),
  getById: (id: string) => api.get(`/exercises/${id}`),
  create: (data: object) => api.post('/exercises', data),
  update: (id: string, data: object) => api.put(`/exercises/${id}`, data),
  delete: (id: string) => api.delete(`/exercises/${id}`),
};

export const workoutPlansApi = {
  list: (params?: Record<string, string>) => api.get('/workout-plans', { params }),
  getById: (id: string) => api.get(`/workout-plans/${id}`),
  create: (data: object) => api.post('/workout-plans', data),
  update: (id: string, data: object) => api.put(`/workout-plans/${id}`, data),
  delete: (id: string) => api.delete(`/workout-plans/${id}`),
  assign: (id: string, data: { athleteIds: string[]; startDate: string }) =>
    api.post(`/workout-plans/${id}/assign`, data),
};

export const workoutsApi = {
  list: (params?: Record<string, string>) => api.get('/workouts', { params }),
  getById: (id: string) => api.get(`/workouts/${id}`),
  create: (data: object) => api.post('/workouts', data),
  update: (id: string, data: object) => api.put(`/workouts/${id}`, data),
  delete: (id: string) => api.delete(`/workouts/${id}`),
};

export const nutritionApi = {
  list: (params?: Record<string, string>) => api.get('/nutrition', { params }),
  getById: (id: string) => api.get(`/nutrition/${id}`),
  create: (data: object) => api.post('/nutrition', data),
  update: (id: string, data: object) => api.put(`/nutrition/${id}`, data),
  delete: (id: string) => api.delete(`/nutrition/${id}`),
};

export const goalsApi = {
  list: (params?: Record<string, string>) => api.get('/goals', { params }),
  getById: (id: string) => api.get(`/goals/${id}`),
  create: (data: object) => api.post('/goals', data),
  update: (id: string, data: object) => api.put(`/goals/${id}`, data),
  delete: (id: string) => api.delete(`/goals/${id}`),
};

export const progressApi = {
  list: (params?: Record<string, string>) => api.get('/progress', { params }),
  getById: (id: string) => api.get(`/progress/${id}`),
  create: (data: object) => api.post('/progress', data),
  update: (id: string, data: object) => api.put(`/progress/${id}`, data),
  delete: (id: string) => api.delete(`/progress/${id}`),
};

export const analyticsApi = {
  myDashboard: (period?: string) => api.get('/analytics/me/dashboard', { params: { period } }),
  athleteDashboard: (id: string, period?: string) =>
    api.get(`/analytics/athlete/${id}`, { params: { period } }),
  coachOverview: () => api.get('/analytics/coach/overview'),
  platformAnalytics: (params?: Record<string, string>) => api.get('/analytics/admin/platform', { params }),
  progressChart: (params: Record<string, string>) => api.get('/analytics/progress/chart', { params }),
};
