'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CartIcon } from '@/components/cart/cart-icon'
import { 
  UserIcon, 
  ShoppingBagIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline'

export function Navigation() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              E-Store
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-gray-600 hover:text-gray-900">
              Products
            </Link>
            {session && (
              <>
                <Link href="/orders" className="text-gray-600 hover:text-gray-900">
                  My Orders
                </Link>
                <Link href="/cart" className="text-gray-600 hover:text-gray-900">
                  <CartIcon />
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <UserIcon className="h-6 w-6" />
                  <span className="hidden md:block">{session.user.name || session.user.email}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b">
                        {session.user.name || session.user.email}
                        {session.user.role && (
                          <div className="text-xs text-indigo-600 capitalize">
                            {session.user.role.toLowerCase()}
                          </div>
                        )}
                      </div>
                      
                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <UserIcon className="h-4 w-4 mr-3" />
                        Dashboard
                      </Link>
                      
                      <Link
                        href="/orders"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <ShoppingBagIcon className="h-4 w-4 mr-3" />
                        My Orders
                      </Link>

                      {(session.user.role === 'admin' || session.user.role === 'ADMIN') && (
                        <Link
                          href="/admin"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Cog6ToothIcon className="h-4 w-4 mr-3" />
                          Admin Panel
                        </Link>
                      )}
                      
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false)
                          handleSignOut()
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-4 py-3 space-y-1">
          <Link href="/products" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
            Products
          </Link>
          {session && (
            <>
              <Link href="/orders" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                My Orders
              </Link>
              <Link href="/cart" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                Shopping Cart
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}