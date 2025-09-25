import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clean up existing data
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.wishlistItem.deleteMany()
  await prisma.review.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.userProfile.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️  Cleaned up existing data')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@ecommerce.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
          phone: '+1234567890',
          address: '123 Admin Street',
          city: 'Admin City',
          state: 'AC',
          zipCode: '12345',
          country: 'USA',
        },
      },
    },
  })

  // Create customer users
  const customerPassword = await bcrypt.hash('customer123', 12)
  const customers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        name: 'John Doe',
        password: customerPassword,
        role: 'CUSTOMER',
        profile: {
          create: {
            firstName: 'John',
            lastName: 'Doe',
            phone: '+1987654321',
            address: '456 Customer Lane',
            city: 'Customer City',
            state: 'CC',
            zipCode: '54321',
            country: 'USA',
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        password: customerPassword,
        role: 'CUSTOMER',
        profile: {
          create: {
            firstName: 'Jane',
            lastName: 'Smith',
            phone: '+1555666777',
            address: '789 Buyer Boulevard',
            city: 'Shopping City',
            state: 'SC',
            zipCode: '67890',
            country: 'USA',
          },
        },
      },
    }),
  ])

  console.log('👥 Created users')

  // Create categories
  const electronicsCategory = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and gadgets',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500',
    },
  })

  const smartphonesCategory = await prisma.category.create({
    data: {
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Latest smartphones and mobile devices',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
      parentId: electronicsCategory.id,
    },
  })

  const laptopsCategory = await prisma.category.create({
    data: {
      name: 'Laptops',
      slug: 'laptops',
      description: 'Laptops and portable computers',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
      parentId: electronicsCategory.id,
    },
  })

  const clothingCategory = await prisma.category.create({
    data: {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Fashion and apparel',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500',
    },
  })

  const mensClothingCategory = await prisma.category.create({
    data: {
      name: "Men's Clothing",
      slug: 'mens-clothing',
      description: "Men's fashion and apparel",
      image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=500',
      parentId: clothingCategory.id,
    },
  })

  const womensClothingCategory = await prisma.category.create({
    data: {
      name: "Women's Clothing",
      slug: 'womens-clothing',
      description: "Women's fashion and apparel",
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500',
      parentId: clothingCategory.id,
    },
  })

  console.log('📂 Created categories')

  // Create products
  const products = await Promise.all([
    // Electronics - Smartphones
    prisma.product.create({
      data: {
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        description: 'The latest iPhone with A17 Pro chip and titanium design',
        price: 999.99,
        comparePrice: 1099.99,
        sku: 'IPHONE15PRO',
        stock: 50,
        lowStock: 5,
        isActive: true,
        isFeatured: true,
        metaTitle: 'iPhone 15 Pro - Latest Apple Smartphone',
        metaDescription: 'Get the newest iPhone 15 Pro with advanced features',
        categoryId: smartphonesCategory.id,
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
              altText: 'iPhone 15 Pro front view',
              order: 0,
            },
            {
              url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500',
              altText: 'iPhone 15 Pro back view',
              order: 1,
            },
          ],
        },
        variants: {
          create: [
            {
              name: 'Storage',
              value: '128GB',
              price: 999.99,
              stock: 20,
              sku: 'IPHONE15PRO-128',
            },
            {
              name: 'Storage',
              value: '256GB',
              price: 1099.99,
              stock: 15,
              sku: 'IPHONE15PRO-256',
            },
            {
              name: 'Storage',
              value: '512GB',
              price: 1299.99,
              stock: 10,
              sku: 'IPHONE15PRO-512',
            },
            {
              name: 'Color',
              value: 'Natural Titanium',
              stock: 25,
            },
            {
              name: 'Color',
              value: 'Blue Titanium',
              stock: 15,
            },
            {
              name: 'Color',
              value: 'White Titanium',
              stock: 10,
            },
          ],
        },
      },
    }),

    prisma.product.create({
      data: {
        name: 'Samsung Galaxy S24 Ultra',
        slug: 'samsung-galaxy-s24-ultra',
        description: 'Premium Android smartphone with S Pen and advanced camera',
        price: 1199.99,
        comparePrice: 1299.99,
        sku: 'GALAXYS24ULTRA',
        stock: 30,
        lowStock: 5,
        isActive: true,
        isFeatured: true,
        categoryId: smartphonesCategory.id,
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500',
              altText: 'Samsung Galaxy S24 Ultra',
              order: 0,
            },
          ],
        },
        variants: {
          create: [
            {
              name: 'Storage',
              value: '256GB',
              price: 1199.99,
              stock: 15,
            },
            {
              name: 'Storage',
              value: '512GB',
              price: 1399.99,
              stock: 10,
            },
            {
              name: 'Color',
              value: 'Titanium Black',
              stock: 20,
            },
            {
              name: 'Color',
              value: 'Titanium Gray',
              stock: 10,
            },
          ],
        },
      },
    }),

    // Electronics - Laptops
    prisma.product.create({
      data: {
        name: 'MacBook Pro 16-inch M3',
        slug: 'macbook-pro-16-m3',
        description: 'Powerful laptop with M3 chip for professional work',
        price: 2499.99,
        comparePrice: 2699.99,
        sku: 'MBP16M3',
        stock: 20,
        lowStock: 3,
        isActive: true,
        isFeatured: true,
        categoryId: laptopsCategory.id,
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
              altText: 'MacBook Pro 16-inch',
              order: 0,
            },
          ],
        },
        variants: {
          create: [
            {
              name: 'Memory',
              value: '16GB',
              price: 2499.99,
              stock: 10,
            },
            {
              name: 'Memory',
              value: '32GB',
              price: 2899.99,
              stock: 8,
            },
            {
              name: 'Storage',
              value: '512GB SSD',
              stock: 12,
            },
            {
              name: 'Storage',
              value: '1TB SSD',
              price: 2699.99,
              stock: 8,
            },
          ],
        },
      },
    }),

    // Men's Clothing
    prisma.product.create({
      data: {
        name: 'Classic Denim Jacket',
        slug: 'classic-denim-jacket',
        description: 'Timeless denim jacket perfect for casual wear',
        price: 89.99,
        comparePrice: 120.00,
        sku: 'DENIMJACKET',
        stock: 40,
        lowStock: 8,
        isActive: true,
        isFeatured: false,
        categoryId: mensClothingCategory.id,
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
              altText: 'Classic Denim Jacket',
              order: 0,
            },
          ],
        },
        variants: {
          create: [
            {
              name: 'Size',
              value: 'S',
              stock: 8,
            },
            {
              name: 'Size',
              value: 'M',
              stock: 12,
            },
            {
              name: 'Size',
              value: 'L',
              stock: 15,
            },
            {
              name: 'Size',
              value: 'XL',
              stock: 5,
            },
            {
              name: 'Color',
              value: 'Classic Blue',
              stock: 25,
            },
            {
              name: 'Color',
              value: 'Dark Wash',
              stock: 15,
            },
          ],
        },
      },
    }),

    // Women's Clothing
    prisma.product.create({
      data: {
        name: 'Elegant Evening Dress',
        slug: 'elegant-evening-dress',
        description: 'Beautiful evening dress for special occasions',
        price: 149.99,
        comparePrice: 199.99,
        sku: 'EVENINGDRESS',
        stock: 25,
        lowStock: 5,
        isActive: true,
        isFeatured: true,
        categoryId: womensClothingCategory.id,
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1566479179817-c5ce6f0c4b7e?w=500',
              altText: 'Elegant Evening Dress',
              order: 0,
            },
          ],
        },
        variants: {
          create: [
            {
              name: 'Size',
              value: 'XS',
              stock: 3,
            },
            {
              name: 'Size',
              value: 'S',
              stock: 8,
            },
            {
              name: 'Size',
              value: 'M',
              stock: 10,
            },
            {
              name: 'Size',
              value: 'L',
              stock: 4,
            },
            {
              name: 'Color',
              value: 'Black',
              stock: 15,
            },
            {
              name: 'Color',
              value: 'Navy Blue',
              stock: 10,
            },
          ],
        },
      },
    }),
  ])

  console.log('📱 Created products')

  // Create reviews
  await Promise.all([
    prisma.review.create({
      data: {
        productId: products[0].id, // iPhone 15 Pro
        userId: customers[0].id,
        rating: 5,
        title: 'Amazing phone!',
        comment: 'The camera quality is incredible and the performance is top-notch.',
        isVerified: true,
      },
    }),
    prisma.review.create({
      data: {
        productId: products[0].id, // iPhone 15 Pro
        userId: customers[1].id,
        rating: 4,
        title: 'Great upgrade',
        comment: 'Loving the new features, though it is quite expensive.',
        isVerified: true,
      },
    }),
    prisma.review.create({
      data: {
        productId: products[2].id, // MacBook Pro
        userId: customers[0].id,
        rating: 5,
        title: 'Perfect for work',
        comment: 'Lightning fast performance for video editing and development.',
        isVerified: true,
      },
    }),
  ])

  console.log('⭐ Created reviews')

  // Create some cart items
  await Promise.all([
    prisma.cartItem.create({
      data: {
        userId: customers[0].id,
        productId: products[1].id, // Samsung Galaxy
        quantity: 1,
      },
    }),
    prisma.cartItem.create({
      data: {
        userId: customers[1].id,
        productId: products[3].id, // Denim Jacket
        quantity: 2,
      },
    }),
  ])

  // Create wishlist items
  await Promise.all([
    prisma.wishlistItem.create({
      data: {
        userId: customers[0].id,
        productId: products[2].id, // MacBook Pro
      },
    }),
    prisma.wishlistItem.create({
      data: {
        userId: customers[1].id,
        productId: products[4].id, // Evening Dress
      },
    }),
  ])

  console.log('🛒 Created cart and wishlist items')

  // Create sample order
  const sampleOrder = await prisma.order.create({
    data: {
      userId: customers[0].id,
      status: 'DELIVERED',
      subtotal: 999.99,
      taxAmount: 79.99,
      shippingAmount: 15.00,
      total: 1094.98,
      paymentMethod: 'Credit Card',
      paymentStatus: 'PAID',
      paidAt: new Date('2024-01-15'),
      shippedAt: new Date('2024-01-16'),
      deliveredAt: new Date('2024-01-20'),
      shippingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        address: '456 Customer Lane',
        city: 'Customer City',
        state: 'CC',
        zipCode: '54321',
        country: 'USA',
        phone: '+1987654321',
      },
      billingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        address: '456 Customer Lane',
        city: 'Customer City',
        state: 'CC',
        zipCode: '54321',
        country: 'USA',
        phone: '+1987654321',
      },
      items: {
        create: [
          {
            productId: products[0].id, // iPhone 15 Pro
            quantity: 1,
            price: 999.99,
          },
        ],
      },
    },
  })

  console.log('📦 Created sample order')

  console.log('✅ Database seeded successfully!')
  
  // Print summary
  const userCount = await prisma.user.count()
  const categoryCount = await prisma.category.count()
  const productCount = await prisma.product.count()
  const orderCount = await prisma.order.count()
  
  console.log(`
📊 Seeding Summary:
   👥 Users: ${userCount}
   📂 Categories: ${categoryCount}
   📱 Products: ${productCount}
   📦 Orders: ${orderCount}
  `)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })