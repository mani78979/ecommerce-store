'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircleIcon, TruckIcon, CreditCardIcon, MapPinIcon } from '@heroicons/react/24/outline'

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    description: string
    images: Array<{ url: string }>
    slug: string
  }
}

interface Address {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  paymentMethod: string
  subtotal: number
  taxAmount: number
  shippingAmount: number
  total: number
  notes?: string
  trackingNumber?: string
  createdAt: string
  orderItems: OrderItem[]
  shippingAddress: Address
  billingAddress: Address
}

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${params.id}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch order')
        }

        const data = await response.json()
        setOrder(data.order)
      } catch (error: any) {
        console.error('Error fetching order:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchOrder()
    }
  }, [params.id, session])

  if (status === 'loading' || loading) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link href="/orders">
            <Button>View All Orders</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <Link href="/orders">
            <Button>View All Orders</Button>
          </Link>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Header */}
      <div className="bg-green-50 border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center">
            <CheckCircleIcon className="h-12 w-12 text-green-500 mr-4" />
            <div className="text-center">
              <h1 className="text-3xl font-bold text-green-900">Order Confirmed!</h1>
              <p className="text-green-700 mt-2">
                Thank you for your order. We'll send you updates via email.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Order Number</div>
                  <div className="font-mono text-lg font-semibold">{order.orderNumber}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-500">Order Date</div>
                  <div className="font-medium">{formatDate(order.createdAt)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Payment Status</div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Payment Method</div>
                  <div className="font-medium capitalize">
                    {order.paymentMethod.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {order.trackingNumber && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <TruckIcon className="h-5 w-5 text-blue-500 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-blue-900">Tracking Number</div>
                      <div className="text-blue-800 font-mono">{order.trackingNumber}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {item.product.images[0] ? (
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          className="h-16 w-16 object-cover rounded"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-gray-200 rounded"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="text-lg font-medium text-gray-900 hover:text-indigo-600"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {item.product.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-500">Quantity: {item.quantity}</span>
                        <span className="text-sm text-gray-500">
                          {formatPrice(item.price)} each
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Billing Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
                </div>
                <div className="text-gray-600">
                  <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  <p className="mt-2">
                    <span className="font-medium">Phone:</span> {order.shippingAddress.phone}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {order.shippingAddress.email}
                  </p>
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <CreditCardIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Billing Address</h3>
                </div>
                <div className="text-gray-600">
                  <p>{order.billingAddress.firstName} {order.billingAddress.lastName}</p>
                  <p>{order.billingAddress.address}</p>
                  <p>
                    {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode}
                  </p>
                  <p>{order.billingAddress.country}</p>
                  <p className="mt-2">
                    <span className="font-medium">Phone:</span> {order.billingAddress.phone}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {order.billingAddress.email}
                  </p>
                </div>
              </div>
            </div>

            {order.notes && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Notes</h3>
                <p className="text-gray-600">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Order Total */}
          <div>
            <div className="bg-white rounded-lg shadow sticky top-4">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">
                      {order.shippingAmount === 0 ? 'Free' : formatPrice(order.shippingAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">{formatPrice(order.taxAmount)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-medium text-gray-900">Total</span>
                      <span className="text-lg font-medium text-gray-900">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 space-y-3">
                <Link href="/orders">
                  <Button className="w-full" variant="outline">
                    View All Orders
                  </Button>
                </Link>
                <Link href="/products">
                  <Button className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}