'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  MagnifyingGlassIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    images: Array<{ url: string }>
  }
}

interface Address {
  id: string
  firstName: string
  lastName: string
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
  total: number
  createdAt: string
  orderItems: OrderItem[]
  shippingAddress: Address
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '10',
        })
        
        if (statusFilter) {
          params.append('status', statusFilter)
        }

        const response = await fetch(`/api/orders?${params}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders')
        }

        const data = await response.json()
        setOrders(data.orders)
        setPagination(data.pagination)
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchOrders()
    }
  }, [session, currentPage, statusFilter])

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1) // Reset to first page when filtering
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <Link href="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusFilter('')}
                className={`px-3 py-1 text-sm rounded-full border ${
                  statusFilter === '' 
                    ? 'bg-indigo-100 text-indigo-800 border-indigo-200' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusFilter(status)}
                  className={`px-3 py-1 text-sm rounded-full border capitalize ${
                    statusFilter === status 
                      ? 'bg-indigo-100 text-indigo-800 border-indigo-200' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">
              {statusFilter ? `No orders with status "${statusFilter}".` : "You haven't placed any orders yet."}
            </p>
            <Link href="/products">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Orders List */}
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow">
                  {/* Order Header */}
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.orderNumber}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            {formatPrice(order.total)}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            {order.paymentMethod.replace('_', ' ')}
                          </div>
                        </div>
                        <Link href={`/orders/${order.id}/confirmation`}>
                          <Button variant="outline" size="sm">
                            <EyeIcon className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex -space-x-2">
                        {order.orderItems.slice(0, 3).map((item, index) => (
                          <div key={item.id} className="relative">
                            {item.product.images[0] ? (
                              <img
                                src={item.product.images[0].url}
                                alt={item.product.name}
                                className="h-12 w-12 object-cover rounded border-2 border-white"
                              />
                            ) : (
                              <div className="h-12 w-12 bg-gray-200 rounded border-2 border-white"></div>
                            )}
                          </div>
                        ))}
                        {order.orderItems.length > 3 && (
                          <div className="h-12 w-12 bg-gray-100 rounded border-2 border-white flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              +{order.orderItems.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">
                          {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-gray-500">
                          Ship to: {order.shippingAddress.city}, {order.shippingAddress.state}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="bg-white rounded-lg shadow mt-6">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-700">
                      <span>
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                        {pagination.total} orders
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPrev}
                      >
                        <ChevronLeftIcon className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      <div className="flex space-x-1">
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            // Show first page, last page, current page, and pages around current
                            return page === 1 || 
                                   page === pagination.totalPages || 
                                   Math.abs(page - pagination.page) <= 1
                          })
                          .map((page, index, array) => {
                            // Add ellipsis if there's a gap
                            const showEllipsis = index > 0 && page - array[index - 1] > 1
                            return (
                              <div key={page} className="flex items-center">
                                {showEllipsis && (
                                  <span className="px-2 text-gray-500">...</span>
                                )}
                                <button
                                  onClick={() => handlePageChange(page)}
                                  className={`px-3 py-1 text-sm rounded ${
                                    page === pagination.page
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  {page}
                                </button>
                              </div>
                            )
                          })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNext}
                      >
                        Next
                        <ChevronRightIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}