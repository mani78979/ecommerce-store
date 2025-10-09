'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CartIcon } from '@/components/cart/cart-icon'
import { useCart } from '@/components/cart/cart-context'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { state } = useCart()

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-32 h-32 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/login')
    return null
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <CartIcon />
              <span className="text-sm text-gray-700">
                Welcome, {session.user.name || session.user.email}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {session.user.role}
              </span>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Profile Card */}
            <div className="overflow-hidden bg-white rounded-lg shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-10 h-10 bg-indigo-500 rounded-full">
                      <span className="font-medium text-white">
                        {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 w-0 ml-5">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Profile
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {session.user.name || 'User'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 bg-gray-50">
                <div className="text-sm">
                  <Button variant="ghost" size="sm" className="justify-start w-full">
                    View Profile
                  </Button>
                </div>
              </div>
            </div>

            {/* Shopping Cart Card */}
            <div className="overflow-hidden bg-white rounded-lg shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-10 h-10 bg-orange-500 rounded-full">
                      <span className="font-bold text-white">🛒</span>
                    </div>
                  </div>
                  <div className="flex-1 w-0 ml-5">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Shopping Cart
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {state.summary.totalItems} Items
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 bg-gray-50">
                <div className="text-sm">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start w-full"
                    onClick={() => router.push('/cart')}
                  >
                    View Cart
                  </Button>
                </div>
              </div>
            </div>

            {/* Orders Card */}
            <div className="overflow-hidden bg-white rounded-lg shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-500 rounded-full">
                      <span className="font-bold text-white">📦</span>
                    </div>
                  </div>
                  <div className="flex-1 w-0 ml-5">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        My Orders
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        0 Orders
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 bg-gray-50">
                <div className="text-sm">
                  <Button variant="ghost" size="sm" className="justify-start w-full">
                    View Orders
                  </Button>
                </div>
              </div>
            </div>

            {/* Browse Products Card */}
            <div className="overflow-hidden bg-white rounded-lg shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full">
                      <span className="font-bold text-white">🛍️</span>
                    </div>
                  </div>
                  <div className="flex-1 w-0 ml-5">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Browse Products
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Shop Now
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 bg-gray-50">
                <div className="text-sm">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start w-full"
                    onClick={() => router.push('/products')}
                  >
                    View Products
                  </Button>
                </div>
              </div>
            </div>

            {/* Wishlist Card */}
            <div className="overflow-hidden bg-white rounded-lg shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-10 h-10 bg-red-500 rounded-full">
                      <span className="font-bold text-white">❤️</span>
                    </div>
                  </div>
                  <div className="flex-1 w-0 ml-5">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Wishlist
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        0 Items
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 bg-gray-50">
                <div className="text-sm">
                  <Button variant="ghost" size="sm" className="justify-start w-full">
                    View Wishlist
                  </Button>
                </div>
              </div>
            </div>

            {/* Admin Panel Access (only for admins) */}
            {(session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') && (
              <div className="overflow-hidden bg-white border-2 border-indigo-200 rounded-lg shadow">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-10 h-10 bg-purple-500 rounded-full">
                        <span className="font-bold text-white">⚙️</span>
                      </div>
                    </div>
                    <div className="flex-1 w-0 ml-5">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Admin Panel
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          Manage Store
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-3 bg-gray-50">
                  <div className="text-sm">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start w-full"
                      onClick={() => router.push('/admin')}
                    >
                      Go to Admin Panel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Recent Activity
                </h3>
                <div className="mt-5">
                  <div className="py-8 text-center">
                    <p className="text-gray-500">No recent activity</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}