'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    slug: string
    price: number
    stock: number
    images: Array<{
      id: string
      url: string
      altText: string | null
    }>
    category: {
      name: string
      slug: string
    }
  }
}

interface CartSummary {
  subtotal: number
  totalItems: number
  itemCount: number
}

interface CartState {
  items: CartItem[]
  summary: CartSummary
  loading: boolean
  error: string | null
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART'; payload: { items: CartItem[]; summary: CartSummary } }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }

const initialState: CartState = {
  items: [],
  summary: {
    subtotal: 0,
    totalItems: 0,
    itemCount: 0,
  },
  loading: false,
  error: null,
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items,
        summary: action.payload.summary,
        loading: false,
        error: null,
      }
    
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.product.id === action.payload.product.id
      )
      
      let newItems: CartItem[]
      
      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      } else {
        // Add new item
        newItems = [...state.items, action.payload]
      }
      
      const newSummary = calculateSummary(newItems)
      
      return {
        ...state,
        items: newItems,
        summary: newSummary,
        error: null,
      }
    }
    
    case 'UPDATE_ITEM': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      )
      
      const newSummary = calculateSummary(newItems)
      
      return {
        ...state,
        items: newItems,
        summary: newSummary,
      }
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload)
      const newSummary = calculateSummary(newItems)
      
      return {
        ...state,
        items: newItems,
        summary: newSummary,
      }
    }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        summary: {
          subtotal: 0,
          totalItems: 0,
          itemCount: 0,
        },
      }
    
    default:
      return state
  }
}

function calculateSummary(items: CartItem[]): CartSummary {
  const subtotal = items.reduce((total, item) => {
    return total + (item.product.price * item.quantity)
  }, 0)
  
  const totalItems = items.reduce((total, item) => total + item.quantity, 0)
  
  return {
    subtotal,
    totalItems,
    itemCount: items.length,
  }
}

interface CartContextType {
  state: CartState
  addToCart: (productId: string, quantity: number) => Promise<void>
  updateCartItem: (itemId: string, quantity: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  clearCart: () => void
  fetchCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const { data: session, status } = useSession()

  // Fetch cart when user logs in
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchCart()
    } else if (status === 'unauthenticated') {
      dispatch({ type: 'CLEAR_CART' })
    }
  }, [session, status])

  const fetchCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await fetch('/api/cart')
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart')
      }
      
      const data = await response.json()
      dispatch({ type: 'SET_CART', payload: data })
    } catch (error) {
      console.error('Failed to fetch cart:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' })
    }
  }

  const addToCart = async (productId: string, quantity: number) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null })
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add to cart')
      }
      
      const data = await response.json()
      dispatch({ type: 'ADD_ITEM', payload: data.item })
    } catch (error: any) {
      console.error('Failed to add to cart:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null })
      
      if (quantity === 0) {
        await removeFromCart(itemId)
        return
      }
      
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update cart')
      }
      
      dispatch({ type: 'UPDATE_ITEM', payload: { id: itemId, quantity } })
    } catch (error: any) {
      console.error('Failed to update cart item:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  const removeFromCart = async (itemId: string) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null })
      
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove from cart')
      }
      
      dispatch({ type: 'REMOVE_ITEM', payload: itemId })
    } catch (error: any) {
      console.error('Failed to remove from cart:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const value: CartContextType = {
    state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}