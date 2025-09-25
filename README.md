# E-Commerce Store

A modern, full-featured e-commerce platform built with Next.js 14, TypeScript, Tailwind CSS, and Prisma.

## 🚀 Features

- **Modern Tech Stack**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with multiple providers
- **UI Components**: Radix UI components with Tailwind CSS
- **Database Seeding**: Comprehensive seed data for testing
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript support throughout the application

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **UI Components**: Radix UI
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React Context/useState

## 📦 Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
│   └── ui/             # Base UI components
├── lib/                 # Utility functions and configurations
└── types/              # TypeScript type definitions

prisma/
├── schema.prisma       # Database schema
└── seed.ts            # Database seeding script
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mani78979/ecommerce-store.git
   cd ecommerce-store
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your database credentials and other configurations.

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   
   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset database and run migrations

## 🗄️ Database Schema

The application includes comprehensive e-commerce models:

- **Users**: Customer and admin accounts with profiles
- **Products**: Full product catalog with variants, images, and inventory
- **Categories**: Hierarchical product categorization
- **Orders**: Complete order management with items and status tracking
- **Reviews**: Product reviews and ratings
- **Cart & Wishlist**: Shopping cart and wishlist functionality

## 🔐 Authentication

The application supports:
- Email/password authentication
- OAuth providers (Google, GitHub) - configure in `.env`
- Role-based access control (Customer, Admin, Super Admin)

## 🎨 UI Components

Built with:
- Radix UI primitives for accessibility
- Tailwind CSS for styling
- Custom design system with CSS variables
- Dark mode support ready
- Responsive design

## 📧 Sample Accounts

After seeding, you can use these accounts:

**Admin Account:**
- Email: `admin@ecommerce.com`
- Password: `admin123`

**Customer Accounts:**
- Email: `john.doe@example.com` / Password: `customer123`
- Email: `jane.smith@example.com` / Password: `customer123`

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Configure environment variables
4. Deploy

### Manual Deployment

1. Build the application: `npm run build`
2. Start the production server: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review existing issues and discussions