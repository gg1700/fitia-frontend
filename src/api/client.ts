import type {
  Food,
  Alias,
  Meal,
  AnalyzeResponse,
  DailyStats,
  WeeklyStats
} from "../types/api";

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error desconocido' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  ping: () => request<{ status: string; app: string }>('/api/ping'),

  // Foods
  getFoods: (q?: string) =>
    request<{ foods: Food[] }>(`/api/foods${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getFood: (id: number) =>
    request<Food>(`/api/foods/${id}`),
  createFood: (data: Omit<Food, 'id'>) =>
    request<Food>('/api/foods', { method: 'POST', body: JSON.stringify(data) }),
  updateFood: (id: number, data: Partial<Food>) =>
    request<Food>(`/api/foods/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFood: (id: number) =>
    request<{ ok: boolean }>(`/api/foods/${id}`, { method: 'DELETE' }),

  // Aliases
  getAliases: (food_id?: number) =>
    request<{ aliases: Alias[] }>(`/api/aliases${food_id ? `?food_id=${food_id}` : ''}`),
  createAlias: (data: { alias: string; food_id: number; aprendido?: boolean }) =>
    request<{ ok: boolean }>('/api/aliases', { method: 'POST', body: JSON.stringify(data) }),
  deleteAlias: (id: number) =>
    request<{ ok: boolean }>(`/api/aliases/${id}`, { method: 'DELETE' }),

  // Meals
  getMeals: (params?: { desde?: string; hasta?: string; limite?: number; offset?: number }) => {
    const q = new URLSearchParams()
    if (params?.desde) q.set('desde', params.desde)
    if (params?.hasta) q.set('hasta', params.hasta)
    if (params?.limite) q.set('limite', String(params.limite))
    if (params?.offset) q.set('offset', String(params.offset))
    const qs = q.toString()
    return request<{ meals: Meal[] }>(`/api/meals${qs ? `?${qs}` : ''}`)
  },
  getMeal: (id: number) =>
    request<Meal>(`/api/meals/${id}`),
  createMeal: (data: { text: string; datetime?: string; notes?: string }) =>
    request<Meal>('/api/meals', { method: 'POST', body: JSON.stringify(data) }),
  updateMeal: (id: number, data: { datetime?: string; notes?: string }) =>
    request<Meal>(`/api/meals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMeal: (id: number) =>
    request<{ ok: boolean }>(`/api/meals/${id}`, { method: 'DELETE' }),

  // Analyze
  analyze: (text: string) =>
    request<AnalyzeResponse>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  // Stats
  getDaily: (fecha?: string) => {
    const q = fecha ? `?fecha=${fecha}` : ''
    return request<DailyStats>(`/api/stats/daily${q}`)
  },
  getWeekly: (fin?: string) => {
    const q = fin ? `?fin=${fin}` : ''
    return request<WeeklyStats>(`/api/stats/weekly${q}`)
  },
}