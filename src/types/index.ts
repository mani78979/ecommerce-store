import { DefaultSession } from 'next-auth'

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
  }

  interface User {
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
  }
}

export interface User {
  id: string
  email: string
  name?: string
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN'
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  comparePrice?: number
  sku?: string
  stock: number
  lowStock: number
  isActive: boolean
  isFeatured: boolean
  categoryId: string
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  status: OrderStatus
  subtotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  total: number
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  id: string
  userId: string
  productId: string
  quantity: number
  createdAt: Date
  updatedAt: Date
}

export type OrderStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export type PaymentStatus = 
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'