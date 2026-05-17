import axios from 'axios'
import { getApiUrl } from '../lib/utils'
import type { User, Product, Sale, SaleItem, DashboardMetrics, LoginResponse, Gender, Store } from './types'

const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const { data } = await axios.post(getApiUrl('/auth/refresh'), { refreshToken })
          localStorage.setItem('accessToken', data.accessToken)
          localStorage.setItem('refreshToken', data.refreshToken)
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
          return api(originalRequest)
        } catch {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/api/auth/login', { email, password }),
  register: (data: { 
    email: string; 
    password: string; 
    name: string; 
    role?: string;
    documentNumber?: string;
    phone?: string;
    birthDate?: string;
    gender?: Gender;
  }) => api.post('/api/auth/register', data),
  logout: () => api.post('/api/auth/logout', { refreshToken: localStorage.getItem('refreshToken') }),
}

export const productsApi = {
  list: (q?: string, category?: string) =>
    api.get<Product[]>('/api/products', { params: { q, category } }),
  get: (id: string) => api.get<Product>(`/api/products/${id}`),
  create: (data: Partial<Product>) => api.post('/api/products', data),
  update: (id: string, data: Partial<Product>) => api.put(`/api/products/${id}`, data),
  delete: (id: string) => api.delete(`/api/products/${id}`),
}

export const salesApi = {
  list: () => api.get<Sale[]>('/api/sales'),
  get: (id: string) => api.get<Sale>(`/api/sales/${id}`),
  create: (productId: string, quantity: number) =>
    api.post('/api/sales', { productId, quantity }),
}

export const dashboardApi = {
  getMetrics: () => api.get<DashboardMetrics>('/api/dashboard'),
}

export const storesApi = {
  list: () => api.get<Store[]>('/api/stores'),
  get: (id: string) => api.get<Store>(`/api/stores/${id}`),
  create: (data: { name: string; address: string }) => api.post('/api/stores', data),
  update: (id: string, data: { name: string; address: string }) => api.put(`/api/stores/${id}`, data),
  delete: (id: string) => api.delete(`/api/stores/${id}`),
  getUsers: (storeId: string) => api.get<User[]>(`/api/stores/${storeId}/users`),
  assignUser: (storeId: string, userId: string) => api.post(`/api/stores/${storeId}/users`, { userId }),
  unassignUser: (storeId: string, userId: string) => api.delete(`/api/stores/${storeId}/users/${userId}`),
}

export const usersApi = {
  list: () => api.get<User[]>('/api/users'),
  create: (data: { 
    email: string; 
    password: string; 
    name: string; 
    role?: string;
    documentNumber?: string;
    phone?: string;
    birthDate?: string;
    gender?: Gender;
    storeId?: string;
  }) => api.post('/api/users', data),
  update: (id: string, data: Partial<User> & { storeId?: string }) => api.put(`/api/users/${id}`, data),
  delete: (id: string) => api.delete(`/api/users/${id}`),
  getMe: () => api.get<User>('/api/users/me'),
  updateMe: (data: { phone: string }) => api.put('/api/users/me', data),
}

export default api