import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().positive(),
    price: z.number().positive(),
  })),
  shippingAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  billingAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  paymentMethod: z.enum(['card', 'paypal', 'cash_on_delivery']),
  subtotal: z.number().positive(),
  taxAmount: z.number().min(0),
  shippingAmount: z.number().min(0),
  total: z.number().positive(),
  notes: z.string().optional(),
})

const getOrdersSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  status: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createOrderSchema.parse(body)

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check product availability and update stock
      const productUpdates = []
      for (const item of validatedData.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        })

        if (!product) {
          throw new Error(`Product ${item.productId} not found`)
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`)
        }

        // Prepare stock update
        productUpdates.push({
          id: item.productId,
          newStock: product.stock - item.quantity
        })
      }

      // Update product stock
      for (const update of productUpdates) {
        await tx.product.update({
          where: { id: update.id },
          data: { stock: update.newStock }
        })
      }

      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          status: 'pending',
          paymentStatus: validatedData.paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending',
          paymentMethod: validatedData.paymentMethod,
          subtotal: validatedData.subtotal,
          taxAmount: validatedData.taxAmount,
          shippingAmount: validatedData.shippingAmount,
          total: validatedData.total,
          notes: validatedData.notes,
          shippingAddress: {
            create: {
              firstName: validatedData.shippingAddress.firstName,
              lastName: validatedData.shippingAddress.lastName,
              email: validatedData.shippingAddress.email,
              phone: validatedData.shippingAddress.phone,
              address: validatedData.shippingAddress.address,
              city: validatedData.shippingAddress.city,
              state: validatedData.shippingAddress.state,
              zipCode: validatedData.shippingAddress.zipCode,
              country: validatedData.shippingAddress.country,
            }
          },
          billingAddress: {
            create: {
              firstName: validatedData.billingAddress.firstName,
              lastName: validatedData.billingAddress.lastName,
              email: validatedData.billingAddress.email,
              phone: validatedData.billingAddress.phone,
              address: validatedData.billingAddress.address,
              city: validatedData.billingAddress.city,
              state: validatedData.billingAddress.state,
              zipCode: validatedData.billingAddress.zipCode,
              country: validatedData.billingAddress.country,
            }
          },
          orderItems: {
            create: validatedData.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            }))
          }
        },
        include: {
          orderItems: {
            include: {
              product: true
            }
          },
          shippingAddress: true,
          billingAddress: true,
        }
      })

      // Clear user's cart after successful order
      await tx.cart.deleteMany({
        where: { userId: session.user.id }
      })

      return order
    })

    return NextResponse.json({
      success: true,
      order: result,
      message: 'Order created successfully'
    })

  } catch (error: any) {
    console.error('Order creation error:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Order number conflict. Please try again.' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const { page, limit, status } = getOrdersSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
    })

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    // Build where clause
    const where: any = {
      userId: session.user.id
    }

    if (status) {
      where.status = status
    }

    // Get orders with pagination
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                }
              }
            }
          },
          shippingAddress: true,
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limitNum,
      }),
      prisma.order.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limitNum)

    return NextResponse.json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      }
    })

  } catch (error: any) {
    console.error('Fetch orders error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}