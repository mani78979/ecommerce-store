'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart/cart-context'
import { useState } from 'react'

export default function CartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { state, updateCartItem, removeFromCart } = useCart()
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/login')
    return null
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    try {
      setUpdatingItems(prev => new Set(prev).add(itemId))
      await updateCartItem(itemId, newQuantity)
    } catch (error) {
      console.error('Failed to update quantity:', error)
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    try {
      setUpdatingItems(prev => new Set(prev).add(itemId))
      await removeFromCart(itemId)
    } catch (error) {
      console.error('Failed to remove item:', error)
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="flex space-x-4">
                    <div className="h-24 w-24 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <Link href="/products">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {state.error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">{state.error}</p>
          </div>
        )}

        {state.items.length === 0 ? (
          // Empty Cart
          <div className="text-center py-12">
            <div className="mb-4">
              <span className="text-6xl">🛒</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link href="/products">
              <Button size="lg">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          // Cart with Items
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Cart Items ({state.summary.totalItems})
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {state.items.map((item) => (
                    <div key={item.id} className="px-6 py-6">
                      <div className="flex items-start space-x-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <Link href={`/products/${item.product.slug}`}>
                            {item.product.images[0] ? (
                              <img
                                src={item.product.images[0].url}
                                alt={item.product.images[0].altText || item.product.name}
                                className="h-24 w-24 object-cover rounded-lg hover:opacity-75 transition-opacity"
                              />
                            ) : (
                              <div className="h-24 w-24 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No Image</span>
                              </div>
                            )}
                          </Link>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <Link 
                                href={`/products/${item.product.slug}`}
                                className="text-lg font-medium text-gray-900 hover:text-indigo-600"
                              >
                                {item.product.name}
                              </Link>
                              <p className="text-sm text-gray-500 mt-1">
                                {item.product.category.name}
                              </p>
                              <p className="text-lg font-semibold text-gray-900 mt-2">
                                {formatPrice(item.product.price)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-gray-900">
                                {formatPrice(item.product.price * item.quantity)}
                              </p>
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-2">
                              <label htmlFor={`quantity-${item.id}`} className="text-sm text-gray-700">
                                Quantity:
                              </label>
                              <select
                                id={`quantity-${item.id}`}
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                                disabled={updatingItems.has(item.id)}
                                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                              >
                                {Array.from({ length: Math.min(item.product.stock, 10) }, (_, i) => i + 1).map((num) => (
                                  <option key={num} value={num}>
                                    {num}
                                  </option>
                                ))}
                              </select>
                              {updatingItems.has(item.id) && (
                                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={updatingItems.has(item.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </div>

                          {/* Stock Warning */}
                          {item.product.stock < 5 && (
                            <p className="text-orange-600 text-sm mt-2">
                              Only {item.product.stock} left in stock
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mt-8 lg:mt-0">
              <div className="bg-white rounded-lg shadow sticky top-4">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items ({state.summary.totalItems})</span>
                    <span className="text-gray-900">{formatPrice(state.summary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-medium text-gray-900">Total</span>
                      <span className="text-lg font-medium text-gray-900">
                        {formatPrice(state.summary.subtotal)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-200">
                  <Link href="/checkout">
                    <Button className="w-full" size="lg">
                      Proceed to Checkout
                    </Button>
                  </Link>
                  <Link href="/products" className="block mt-3">
                    <Button variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}