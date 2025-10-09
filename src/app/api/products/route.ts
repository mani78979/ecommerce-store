import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isActive: true,
    }

    if (category) {
      where.category = {
        slug: category
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Build orderBy clause
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    // Fetch products with pagination
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            orderBy: { order: 'asc' },
            take: 1,
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ])

    // Calculate average ratings (simplified - you might want to cache this)
    const productsWithRatings = await Promise.all(
      products.map(async (product) => {
        const ratings = await prisma.review.aggregate({
          where: { productId: product.id },
          _avg: { rating: true },
        })

        return {
          ...product,
          averageRating: ratings._avg.rating || 0,
          reviewCount: product._count.reviews,
        }
      })
    )

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      products: productsWithRatings,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    })
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}