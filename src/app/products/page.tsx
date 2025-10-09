'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CartIcon } from '@/components/cart/cart-icon'

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  comparePrice: number | null
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
  }>
  averageRating: number
  reviewCount: number
}

interface Category {
  id: string
  name: string
  slug: string
  _count: {
    products: number
  }
}

interface ProductsResponse {
  products: Product[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<ProductsResponse['pagination'] | null>(null)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const currentPage = parseInt(searchParams.get('page') || '1')
  const currentCategory = searchParams.get('category') || ''
  const currentSearch = searchParams.get('search') || ''
  const currentSort = searchParams.get('sort') || 'createdAt'

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [currentPage, currentCategory, currentSearch, currentSort])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data.categories)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(currentCategory && { category: currentCategory }),
        ...(currentSearch && { search: currentSearch }),
        ...(currentSort && { sortBy: currentSort }),
      })

      const response = await fetch(`/api/products?${params}`)
      const data: ProductsResponse = await response.json()
      
      setProducts(data.products)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateFilters = (filters: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams)
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    // Reset to page 1 when filters change
    if (filters.category !== undefined || filters.search !== undefined || filters.sort !== undefined) {
      params.set('page', '1')
    }
    
    router.push(`/products?${params.toString()}`)
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
        className={`text-sm ${
          i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <div className="flex items-center space-x-4">
              <CartIcon />
              <Link href="/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-lg shadow p-6">
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Products
                </label>
                <input
                  type="text"
                  placeholder="Search..."
                  defaultValue={currentSearch}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      updateFilters({ search: e.currentTarget.value || null })
                    }
                  }}
                />
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => updateFilters({ category: null })}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                      !currentCategory
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => updateFilters({ category: category.slug })}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                        currentCategory === category.slug
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {category.name} ({category._count.products})
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Sort By</h3>
                <select
                  value={currentSort}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="createdAt">Newest First</option>
                  <option value="name">Name A-Z</option>
                  <option value="price">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-w-4 aspect-h-3">
                        {product.images[0] ? (
                          <img
                            src={product.images[0].url}
                            alt={product.images[0].altText || product.name}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="text-sm text-gray-500 mb-1">
                          {product.category.name}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center mb-2">
                          {renderStars(product.averageRating)}
                          <span className="ml-2 text-sm text-gray-600">
                            ({product.reviewCount})
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900">
                              {formatPrice(product.price)}
                            </span>
                            {product.comparePrice && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(product.comparePrice)}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center space-x-2">
                    <Button
                      variant="outline"
                      disabled={!pagination.hasPreviousPage}
                      onClick={() => updateFilters({ page: (currentPage - 1).toString() })}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          const distance = Math.abs(page - currentPage)
                          return distance <= 2 || page === 1 || page === pagination.totalPages
                        })
                        .map((page, index, array) => {
                          const prevPage = array[index - 1]
                          const showEllipsis = prevPage && page - prevPage > 1
                          
                          return (
                            <div key={page} className="flex items-center">
                              {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                              <Button
                                variant={page === currentPage ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateFilters({ page: page.toString() })}
                              >
                                {page}
                              </Button>
                            </div>
                          )
                        })}
                    </div>
                    
                    <Button
                      variant="outline"
                      disabled={!pagination.hasNextPage}
                      onClick={() => updateFilters({ page: (currentPage + 1).toString() })}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}