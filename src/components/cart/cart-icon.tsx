'use client'

import { useCart } from '@/components/cart/cart-context'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export function CartIcon() {
  const { state } = useCart()
  const { data: session } = useSession()

  if (!session) {
    return null
  }

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center p-2 text-gray-600 hover:text-gray-900 transition-colors"
    >
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4m.6 8l-2 8h16M7 13v-2a5 5 0 1110 0v2M7 13l-2-8H3m18 8a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {state.summary.totalItems > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full min-w-[1.25rem] h-5">
          {state.summary.totalItems > 99 ? '99+' : state.summary.totalItems}
        </span>
      )}
    </Link>
  )
}