import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const addToCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).max(99),
})

const updateCartSchema = z.object({
  quantity: z.number().int().min(0).max(99),
})

// GET - Fetch user's cart items
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        product: {
          include: {
            images: {
              orderBy: { order: 'asc' },
              take: 1,
            },
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate totals
    const subtotal = cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity)
    }, 0)

    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)

    return NextResponse.json({
      items: cartItems,
      summary: {
        subtotal,
        totalItems,
        itemCount: cartItems.length,
      },
    })
  } catch (error) {
    console.error('Cart GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, quantity } = addToCartSchema.parse(body)

    // Check if product exists and is active
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        isActive: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found or inactive' },
        { status: 404 }
      )
    }

    // Check stock availability
    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      )
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    })

    let cartItem

    if (existingCartItem) {
      // Update quantity of existing item
      const newQuantity = existingCartItem.quantity + quantity
      
      if (newQuantity > product.stock) {
        return NextResponse.json(
          { error: 'Insufficient stock' },
          { status: 400 }
        )
      }

      cartItem = await prisma.cartItem.update({
        where: {
          id: existingCartItem.id,
        },
        data: {
          quantity: newQuantity,
        },
        include: {
          product: {
            include: {
              images: {
                orderBy: { order: 'asc' },
                take: 1,
              },
            },
          },
        },
      })
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId,
          quantity,
        },
        include: {
          product: {
            include: {
              images: {
                orderBy: { order: 'asc' },
                take: 1,
              },
            },
          },
        },
      })
    }

    return NextResponse.json({
      message: 'Item added to cart',
      item: cartItem,
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Cart POST error:', error)
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    )
  }
}