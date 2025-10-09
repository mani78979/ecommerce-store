import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Create a new product
export async function POST(req: Request) {
  const data = await req.json();

  try {
    const product = await prisma.product.create({
      data,
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

// Get all products
export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// Update a product
export async function PUT(req: Request) {
  const data = await req.json();

  try {
    const product = await prisma.product.update({
      where: { id: data.id },
      data,
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// Delete a product
export async function DELETE(req: Request) {
  const { id } = await req.json();

  try {
    await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}