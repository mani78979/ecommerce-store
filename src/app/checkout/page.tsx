'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart/cart-context'

const checkoutSchema = z.object({
  // Shipping Address
  shippingFirstName: z.string().min(1, 'First name is required'),
  shippingLastName: z.string().min(1, 'Last name is required'),
  shippingEmail: z.string().email('Invalid email address'),
  shippingPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  shippingAddress: z.string().min(1, 'Address is required'),
  shippingCity: z.string().min(1, 'City is required'),
  shippingState: z.string().min(1, 'State is required'),
  shippingZipCode: z.string().min(5, 'ZIP code must be at least 5 digits'),
  shippingCountry: z.string().min(1, 'Country is required'),
  
  // Billing Address
  sameAsBilling: z.boolean().default(true),
  billingFirstName: z.string().optional(),
  billingLastName: z.string().optional(),
  billingEmail: z.string().optional(),
  billingPhone: z.string().optional(),
  billingAddress: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingZipCode: z.string().optional(),
  billingCountry: z.string().optional(),
  
  // Payment
  paymentMethod: z.enum(['card', 'paypal', 'cash_on_delivery']),
  
  // Order Notes
  orderNotes: z.string().optional(),
}).refine((data) => {
  if (!data.sameAsBilling) {
    // If billing is different, validate billing fields
    return data.billingFirstName && 
           data.billingLastName && 
           data.billingEmail && 
           data.billingAddress && 
           data.billingCity && 
           data.billingState && 
           data.billingZipCode && 
           data.billingCountry
  }
  return true
}, {
  message: "Billing address fields are required when different from shipping",
  path: ["billingFirstName"]
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { state, clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sameAsBilling, setSameAsBilling] = useState(true)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      sameAsBilling: true,
      paymentMethod: 'card' as const,
      shippingCountry: 'United States',
      billingCountry: 'United States',
    },
  })

  const watchSameAsBilling = watch('sameAsBilling')

  useEffect(() => {
    setSameAsBilling(watchSameAsBilling)
  }, [watchSameAsBilling])

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

  if (state.items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Your cart is empty</h1>
          <p className="mb-8 text-gray-600">Add some items to your cart before checking out.</p>
          <Link href="/products">
            <Button>Continue Shopping</Button>
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

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.08 // 8% tax rate
  }

  const calculateShipping = () => {
    return state.summary.subtotal > 50 ? 0 : 9.99 // Free shipping over $50
  }

  const tax = calculateTax(state.summary.subtotal)
  const shipping = calculateShipping()
  const total = state.summary.subtotal + tax + shipping

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      setIsSubmitting(true)

      const orderData = {
        items: state.items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        shippingAddress: {
          firstName: data.shippingFirstName,
          lastName: data.shippingLastName,
          email: data.shippingEmail,
          phone: data.shippingPhone,
          address: data.shippingAddress,
          city: data.shippingCity,
          state: data.shippingState,
          zipCode: data.shippingZipCode,
          country: data.shippingCountry,
        },
        billingAddress: data.sameAsBilling ? {
          firstName: data.shippingFirstName,
          lastName: data.shippingLastName,
          email: data.shippingEmail,
          phone: data.shippingPhone,
          address: data.shippingAddress,
          city: data.shippingCity,
          state: data.shippingState,
          zipCode: data.shippingZipCode,
          country: data.shippingCountry,
        } : {
          firstName: data.billingFirstName!,
          lastName: data.billingLastName!,
          email: data.billingEmail!,
          phone: data.billingPhone!,
          address: data.billingAddress!,
          city: data.billingCity!,
          state: data.billingState!,
          zipCode: data.billingZipCode!,
          country: data.billingCountry!,
        },
        paymentMethod: data.paymentMethod,
        subtotal: state.summary.subtotal,
        taxAmount: tax,
        shippingAmount: shipping,
        total,
        notes: data.orderNotes,
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create order')
      }

      const result = await response.json()
      
      // Clear cart after successful order
      clearCart()
      
      // Redirect to order confirmation
      router.push(`/orders/${result.order.id}/confirmation`)

    } catch (error: any) {
      console.error('Checkout error:', error)
      alert(error.message || 'Failed to process order')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <Link href="/cart">
              <Button variant="outline">Back to Cart</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Checkout Form */}
            <div className="space-y-8 lg:col-span-2">
              {/* Shipping Address */}
              <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="mb-6 text-xl font-semibold text-gray-900">Shipping Address</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      First Name *
                    </label>
                    <input
                      {...register('shippingFirstName')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.shippingFirstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.shippingFirstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Last Name *
                    </label>
                    <input
                      {...register('shippingLastName')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.shippingLastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.shippingLastName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Email *
                    </label>
                    <input
                      {...register('shippingEmail')}
                      type="email"
                      defaultValue={session.user.email || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.shippingEmail && (
                      <p className="mt-1 text-sm text-red-600">{errors.shippingEmail.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Phone *
                    </label>
                    <input
                      {...register('shippingPhone')}
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.shippingPhone && (
                      <p className="mt-1 text-sm text-red-600">{errors.shippingPhone.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Address *
                    </label>
                    <input
                      {...register('shippingAddress')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.shippingAddress && (
                      <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      City *
                    </label>
                    <input
                      {...register('shippingCity')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.shippingCity && (
                      <p className="mt-1 text-sm text-red-600">{errors.shippingCity.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      State *
                    </label>
                    <input
                      {...register('shippingState')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.shippingState && (
                      <p className="mt-1 text-sm text-red-600">{errors.shippingState.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      ZIP Code *
                    </label>
                    <input
                      {...register('shippingZipCode')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.shippingZipCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.shippingZipCode.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Country *
                    </label>
                    <select
                      {...register('shippingCountry')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                    </select>
                    {errors.shippingCountry && (
                      <p className="mt-1 text-sm text-red-600">{errors.shippingCountry.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="p-6 bg-white rounded-lg shadow">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Billing Address</h2>
                  <label className="flex items-center">
                    <input
                      {...register('sameAsBilling')}
                      type="checkbox"
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Same as shipping address</span>
                  </label>
                </div>

                {!sameAsBilling && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Billing form fields - similar to shipping */}
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        First Name *
                      </label>
                      <input
                        {...register('billingFirstName')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Last Name *
                      </label>
                      <input
                        {...register('billingLastName')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    {/* Add other billing fields as needed */}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="mb-6 text-xl font-semibold text-gray-900">Payment Method</h2>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      {...register('paymentMethod')}
                      type="radio"
                      value="card"
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">Credit/Debit Card</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      {...register('paymentMethod')}
                      type="radio"
                      value="paypal"
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">PayPal</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      {...register('paymentMethod')}
                      type="radio"
                      value="cash_on_delivery"
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">Cash on Delivery</span>
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="mb-6 text-xl font-semibold text-gray-900">Order Notes (Optional)</h2>
                <textarea
                  {...register('orderNotes')}
                  rows={4}
                  placeholder="Any special instructions for your order..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="mt-8 lg:mt-0">
              <div className="sticky bg-white rounded-lg shadow top-4">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
                </div>
                <div className="px-6 py-4">
                  {/* Cart Items */}
                  <div className="mb-6 space-y-4">
                    {state.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {item.product.images[0] ? (
                            <img
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              className="object-cover w-12 h-12 rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(item.product.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="pt-4 space-y-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">{formatPrice(state.summary.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-900">
                        {shipping === 0 ? 'Free' : formatPrice(shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-900">{formatPrice(tax)}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-lg font-medium text-gray-900">Total</span>
                        <span className="text-lg font-medium text-gray-900">
                          {formatPrice(total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-200">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? 'Processing...' : `Place Order - ${formatPrice(total)}`}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}