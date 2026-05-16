export type Gender = 'masculino' | 'femenino' | 'otros'

export interface User {
  id: string
  email: string
  name: string
  role: string
  documentNumber?: string | null
  phone?: string | null
  birthDate?: string | null
  gender?: Gender | null
  createdAt: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  category: string | null
  createdAt: string
  updatedAt: string
}

export interface Sale {
  id: string
  userId: string
  total: number
  createdAt: string
  items?: SaleItem[]
}

export interface SaleItem {
  id: string
  saleId: string
  productId: string
  quantity: number
  price: number
}

export interface DashboardMetrics {
  totalSales: number
  topProducts: { productId: string; _sum: { quantity: number } }[]
  period: { start: string; end: string }
}