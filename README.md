# E-Commerce Store

A modern, full-featured e-commerce platform built with Next.js 14, TypeScript, Tailwind CSS, and Prisma.

## 🚀 Features

- **Modern Stack**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with multiple providers
- **UI Components**: shadcn/ui with Radix UI primitives
- **E-commerce Features**: Products, Categories, Cart, Orders, Reviews, Wishlist
- **Admin Panel**: User and product management
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd Full\ ecomerce\ store

# Install dependencies
npm install
```

### 2. Database Setup

```bash
# Start PostgreSQL and create database
createdb ecommerce_db

# Update DATABASE_URL in .env file
# DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_db"

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:push

# Seed the database with sample data
npm run db:seed
```

### 3. Environment Configuration

The `.env` file is already created with development defaults. Update the following:

- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_SECRET`: Change to a secure random string in production
- `JWT_SECRET`: Change to a secure random string in production

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📚 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset database and reseed

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   └── ui/            # shadcn/ui components
├── lib/               # Utility functions
│   ├── prisma.ts      # Prisma client
│   └── utils.ts       # Helper functions
└── types/             # TypeScript type definitions

prisma/
├── schema.prisma      # Database schema
└── seed.ts           # Database seeding script
```

## 🗄️ Database Schema

The Prisma schema includes:

- **Users**: Authentication and profiles
- **Products**: Product catalog with variants and images
- **Categories**: Hierarchical product categories
- **Orders**: Order management with items
- **Cart**: Shopping cart functionality
- **Reviews**: Product reviews and ratings
- **Wishlist**: User wishlist items

## 🚀 Next Steps

1. **Authentication**: Configure NextAuth.js providers
2. **Payments**: Integrate Stripe or PayPal
3. **File Upload**: Set up Cloudinary or AWS S3
4. **Email**: Configure SMTP for notifications
5. **Deployment**: Deploy to Vercel, Railway, or similar platform

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
