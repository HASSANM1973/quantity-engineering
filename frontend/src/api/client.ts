import axios from 'axios'
import type { Project, Site, Floor, Element, CalcResult, Activity, CPMResult, MaterialPrice, CostEstimate } from '../types'

const API_BASE = import.meta.env.VITE_API_URL || '/api'
const api = axios.create({ baseURL: API_BASE })

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const authApi = {
  login: (email: string, password: string) => api.post<{ token: string; user: { id: number; email: string; name: string } }>('/auth/login/', { email, password }),
  register: (email: string, password: string, name?: string) => api.post<{ token: string; user: { id: number; email: string; name: string } }>('/auth/register/', { email, password, name }),
  me: () => api.get<{ id: number; email: string; name: string }>('/auth/me/'),
  logout: (token?: string) => api.post('/auth/logout/', { token }),
}

export const projectApi = {
  list: () => api.get<Project[]>('/projects/'),
  get: (id: number) => api.get<Project>(`/projects/${id}/`),
  create: (data: Partial<Project>) => api.post<Project>('/projects/', data),
  update: (id: number, data: Partial<Project>) => api.put<Project>(`/projects/${id}/`, data),
  delete: (id: number) => api.delete(`/projects/${id}/`),
}

export const siteApi = {
  list: () => api.get<Site[]>('/sites/'),
  create: (data: Partial<Site>) => api.post<Site>('/sites/', data),
  update: (id: number, data: Partial<Site>) => api.put<Site>(`/sites/${id}/`, data),
  delete: (id: number) => api.delete(`/sites/${id}/`),
}

export const floorApi = {
  list: () => api.get<Floor[]>('/floors/'),
  create: (data: Partial<Floor>) => api.post<Floor>('/floors/', data),
  update: (id: number, data: Partial<Floor>) => api.put<Floor>(`/floors/${id}/`, data),
  delete: (id: number) => api.delete(`/floors/${id}/`),
}

export const elementApi = {
  list: () => api.get<Element[]>('/elements/'),
  byProject: (projectId: number) => api.get<Element[]>('/elements/', { params: { project_id: projectId } }),
  create: (data: Partial<Element>) => api.post<Element>('/elements/', data),
  get: (id: number) => api.get<Element>(`/elements/${id}/`),
  update: (id: number, data: Partial<Element>) => api.put<Element>(`/elements/${id}/`, data),
  delete: (id: number) => api.delete(`/elements/${id}/`),
  calculate: (data: { element_type: string; dimensions: Record<string, number>; count: number }) =>
    api.post<CalcResult>('/elements/calculate/', data),
  saveQuantities: (id: number) => api.post<Element>(`/elements/${id}/save_quantities/`),
}

export const costingApi = {
  prices: () => api.get<MaterialPrice[]>('/material-prices/'),
  createPrice: (data: Partial<MaterialPrice>) => api.post<MaterialPrice>('/material-prices/', data),
  updatePrice: (id: number, data: Partial<MaterialPrice>) => api.put<MaterialPrice>(`/material-prices/${id}/`, data),
  generateEstimate: (projectId: number, markupPercent = 15) =>
    api.post<CostEstimate>('/estimates/generate/', { project_id: projectId, markup_percent: markupPercent }),
  getEstimate: (id: number) => api.get<CostEstimate>(`/estimates/${id}/`),
  updatePrices: (estimateId: number, items: { id: number; unit_price: number }[]) =>
    api.post<CostEstimate>(`/estimates/${estimateId}/update_prices/`, { items }),
}

export const schedulingApi = {
  byProject: (projectId: number) =>
    api.get<Activity[]>('/activities/by_project/', { params: { project_id: projectId } }),
  compute: (projectId: number) =>
    api.post<{ cpm: CPMResult; activities: Activity[] }>('/cpm/compute/', { project_id: projectId }),
  autoGenerate: (projectId: number) =>
    api.post<{ cpm: CPMResult; activities: Activity[]; generated_count: number }>('/cpm/auto_generate/', { project_id: projectId }),
}
