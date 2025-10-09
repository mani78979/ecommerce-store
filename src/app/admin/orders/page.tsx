'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TruckIcon
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
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface User {
  id: string
  name: string
  email: string
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
  trackingNumber?: string
  createdAt: string
  user: User
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

export default function AdminOrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingOrder, setEditingOrder] = useState<string | null>(null)
  const [editData, setEditData] = useState<{
    status: string
    paymentStatus: string
    trackingNumber: string
  }>({ status: '', paymentStatus: '', trackingNumber: '' })

  useEffect(() => {
    if (session?.user?.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    fetchOrders()
  }, [session, currentPage, statusFilter, paymentStatusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      })
      
      if (statusFilter) {
        params.append('status', statusFilter)
      }

      if (paymentStatusFilter) {
        params.append('paymentStatus', paymentStatusFilter)
      }

      const response = await fetch(`/api/admin/orders?${params}`)
      
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'admin') {
    router.push('/dashboard')
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handlePaymentStatusFilter = (paymentStatus: string) => {
    setPaymentStatusFilter(paymentStatus)
    setCurrentPage(1)
  }

  const startEditing = (order: Order) => {
    setEditingOrder(order.id)
    setEditData({
      status: order.status,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber || '',
    })
  }

  const cancelEditing = () => {
    setEditingOrder(null)
    setEditData({ status: '', paymentStatus: '', trackingNumber: '' })
  }

  const handleUpdateOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      })

      if (!response.ok) {
        throw new Error('Failed to update order')
      }

      // Refresh orders list
      await fetchOrders()
      setEditingOrder(null)
      alert('Order updated successfully!')
    } catch (error: any) {
      console.error('Error updating order:', error)
      alert(error.message || 'Failed to update order')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Total Orders: {pagination?.total || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Order Status:</span>
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

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Payment Status:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handlePaymentStatusFilter('')}
                  className={`px-3 py-1 text-sm rounded-full border ${
                    paymentStatusFilter === '' 
                      ? 'bg-indigo-100 text-indigo-800 border-indigo-200' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  All
                </button>
                {['pending', 'paid', 'failed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handlePaymentStatusFilter(status)}
                    className={`px-3 py-1 text-sm rounded-full border capitalize ${
                      paymentStatusFilter === status 
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
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">
              {statusFilter || paymentStatusFilter 
                ? "No orders match the current filters." 
                : "No orders have been placed yet."}
            </p>
          </div>
        ) : (
          <>
            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              #{order.orderNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                            </div>
                            {order.trackingNumber && (
                              <div className="flex items-center text-xs text-blue-600 mt-1">
                                <TruckIcon className="h-3 w-3 mr-1" />
                                {order.trackingNumber}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.user.email}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {order.shippingAddress.city}, {order.shippingAddress.state}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingOrder === order.id ? (
                            <select
                              value={editData.status}
                              onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          ) : (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            {editingOrder === order.id ? (
                              <select
                                value={editData.paymentStatus}
                                onChange={(e) => setEditData({ ...editData, paymentStatus: e.target.value })}
                                className="text-sm border border-gray-300 rounded px-2 py-1 mb-1"
                              >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="failed">Failed</option>
                              </select>
                            ) : (
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                              </span>
                            )}
                            <div className="text-xs text-gray-500 capitalize mt-1">
                              {order.paymentMethod.replace('_', ' ')}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatPrice(order.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editingOrder === order.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Tracking number"
                                value={editData.trackingNumber}
                                onChange={(e) => setEditData({ ...editData, trackingNumber: e.target.value })}
                                className="text-sm border border-gray-300 rounded px-2 py-1 w-full"
                              />
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateOrder(order.id)}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEditing}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => startEditing(order)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <a
                                href={`/orders/${order.id}/confirmation`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </a>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                        {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                          let page;
                          if (pagination.totalPages <= 7) {
                            page = i + 1;
                          } else if (pagination.page <= 4) {
                            page = i + 1;
                          } else if (pagination.page >= pagination.totalPages - 3) {
                            page = pagination.totalPages - 6 + i;
                          } else {
                            page = pagination.page - 3 + i;
                          }
                          
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-1 text-sm rounded ${
                                page === pagination.page
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
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