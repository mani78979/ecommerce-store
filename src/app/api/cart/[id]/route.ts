import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateCartSchema = z.object({
  quantity: z.number().int().min(0).max(99),
})

// PUT - Update cart item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { quantity } = updateCartSchema.parse(body)

    // Find cart item and verify ownership
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        product: true,
      },
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      )
    }

    // If quantity is 0, delete the item
    if (quantity === 0) {
      await prisma.cartItem.delete({
        where: { id: params.id },
      })

      return NextResponse.json({
        message: 'Item removed from cart',
      })
    }

    // Check stock availability
    if (cartItem.product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      )
    }

    // Update quantity
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: params.id },
      data: { quantity },
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

    return NextResponse.json({
      message: 'Cart item updated',
      item: updatedCartItem,
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Cart PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    )
  }
}

// DELETE - Remove cart item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find cart item and verify ownership
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      )
    }

    // Delete the cart item
    await prisma.cartItem.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Item removed from cart',
    })

  } catch (error) {
    console.error('Cart DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to remove cart item' },
      { status: 500 }
    )
  }
}