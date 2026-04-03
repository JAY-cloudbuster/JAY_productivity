const API_BASE = '/api';

async function request(url, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  const response = await fetch(`${API_BASE}${url}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const api = {
  // Habits
  getHabits: () => request('/habits'),
  createHabit: (name, frequency = 'daily') =>
    request('/habits', { method: 'POST', body: JSON.stringify({ name, frequency }) }),
  deleteHabit: (id) => request(`/habits/${id}`, { method: 'DELETE' }),
  logHabit: (id, date) =>
    request(`/habits/${id}/log`, { method: 'POST', body: JSON.stringify({ date }) }),
  getHabitLogs: (id) => request(`/habits/${id}/logs`),
  getAllHabitLogs: () => request('/habit-logs'),

  // Tasks
  getTasks: () => request('/tasks'),
  createTask: (title, priority = 'medium', due_date = null) =>
    request('/tasks', { method: 'POST', body: JSON.stringify({ title, priority, due_date }) }),
  updateTask: (id, updates) =>
    request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),

  // Analytics
  getAnalytics: () => request('/analytics'),

  // AI
  executeAIAction: (action, data) =>
    request('/ai/execute', { method: 'POST', body: JSON.stringify({ action, data }) }),
};
