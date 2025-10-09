'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart/cart-context'
import { CartIcon } from '@/components/cart/cart-icon'

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  comparePrice: number | null
  sku: string | null
  stock: number
  isActive: boolean
  isFeatured: boolean
  category: {
    id: string
    name: string
    slug: string
  }
  images: Array<{
    id: string
    url: string
    altText: string | null
    order: number
  }>
  variants: Array<{
    id: string
    name: string
    value: string
    price: number | null
    stock: number | null
    sku: string | null
  }>
  reviews: Array<{
    id: string
    rating: number
    title: string | null
    comment: string | null
    createdAt: string
    user: {
      id: string
      name: string | null
      profile: {
        firstName: string | null
        lastName: string | null
        avatar: string | null
      } | null
    }
  }>
  averageRating: number
  reviewCount: number
}

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { addToCart } = useCart()
  const slug = params.slug as string

  useEffect(() => {
    if (slug) {
      fetchProduct()
    }
  }, [slug])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${slug}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/products')
          return
        }
        throw new Error('Failed to fetch product')
      }
      
      const data = await response.json()
      setProduct(data.product)
    } catch (error) {
      console.error('Failed to fetch product:', error)
      router.push('/products')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${
          i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ))
  }

  const handleAddToCart = async () => {
    if (!session) {
      router.push('/auth/login')
      return
    }
    
    if (!product) return
    
    try {
      await addToCart(product.id, quantity)
      
      // Show success message and offer to go to cart
      const goToCart = confirm('Product added to cart! Would you like to view your cart?')
      if (goToCart) {
        router.push('/cart')
      }
    } catch (error: any) {
      alert(error.message || 'Failed to add product to cart')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Group variants by name (e.g., Size, Color)
  const variantGroups = product.variants.reduce((groups, variant) => {
    if (!groups[variant.name]) {
      groups[variant.name] = []
    }
    groups[variant.name].push(variant)
    return groups
  }, {} as Record<string, typeof product.variants>)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <nav className="flex items-center space-x-2 text-sm">
              <Link href="/products" className="text-indigo-600 hover:text-indigo-500">
                Products
              </Link>
              <span className="text-gray-400">/</span>
              <Link href={`/products?category=${product.category.slug}`} className="text-indigo-600 hover:text-indigo-500">
                {product.category.name}
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900">{product.name}</span>
            </nav>
            <CartIcon />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Product Images */}
          <div className="mb-8 lg:mb-0">
            <div className="mb-4">
              {product.images.length > 0 ? (
                <img
                  src={product.images[selectedImageIndex]?.url || product.images[0].url}
                  alt={product.images[selectedImageIndex]?.altText || product.name}
                  className="w-full h-96 object-cover rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-lg">No Image Available</span>
                </div>
              )}
            </div>
            
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                      index === selectedImageIndex ? 'border-indigo-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.altText || `${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center mb-4">
                {renderStars(product.averageRating)}
                <span className="ml-2 text-sm text-gray-600">
                  ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
              </div>
              {product.sku && (
                <p className="text-sm text-gray-600 mb-4">SKU: {product.sku}</p>
              )}
            </div>

            {product.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Product Variants */}
            {Object.keys(variantGroups).length > 0 && (
              <div className="mb-6">
                {Object.entries(variantGroups).map(([variantName, variants]) => (
                  <div key={variantName} className="mb-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">{variantName}</h3>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariants(prev => ({
                            ...prev,
                            [variantName]: variant.value
                          }))}
                          className={`px-4 py-2 border rounded-md text-sm font-medium ${
                            selectedVariants[variantName] === variant.value
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {variant.value}
                          {variant.price && (
                            <span className="ml-1 text-xs">
                              (+{formatPrice(variant.price)})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <label htmlFor="quantity" className="text-sm font-medium text-gray-900 mr-2">
                    Quantity:
                  </label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-sm text-gray-600">
                  {product.stock > 0 ? (
                    `${product.stock} in stock`
                  ) : (
                    <span className="text-red-600">Out of stock</span>
                  )}
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1"
                >
                  Add to Cart
                </Button>
                <Button variant="outline" className="px-8">
                  Add to Wishlist
                </Button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="text-gray-900">{product.category.name}</span>
                </div>
                {product.sku && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">SKU:</span>
                    <span className="text-gray-900">{product.sku}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Availability:</span>
                  <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {product.reviews.length > 0 && (
          <div className="mt-16 border-t pt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Customer Reviews ({product.reviewCount})
            </h2>
            <div className="space-y-6">
              {product.reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {review.user.profile?.avatar ? (
                          <img
                            src={review.user.profile.avatar}
                            alt={review.user.name || 'User'}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                              {(review.user.profile?.firstName || review.user.name || 'U').charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">
                          {review.user.profile?.firstName && review.user.profile?.lastName
                            ? `${review.user.profile.firstName} ${review.user.profile.lastName}`
                            : review.user.name || 'Anonymous'}
                        </h4>
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                          <span className="ml-2 text-sm text-gray-600">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {review.title && (
                    <h5 className="text-lg font-medium text-gray-900 mb-2">{review.title}</h5>
                  )}
                  {review.comment && (
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}