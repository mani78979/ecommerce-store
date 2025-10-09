import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Welcome to E-Commerce Store
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          A modern e-commerce platform built with Next.js, TypeScript, Tailwind CSS, and Prisma
        </p>
        
        {/* Navigation Links */}
        <div className="mb-8 space-x-4">
          <Link href="/products">
            <Button size="lg">Browse Products</Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline">Sign In</Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="outline">Create Account</Button>
          </Link>
        </div>

        <div className="grid max-w-4xl grid-cols-1 gap-6 mx-auto md:grid-cols-3">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-2 text-xl font-semibold">Next.js 14</h2>
            <p className="text-gray-600">Latest features with App Router</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-2 text-xl font-semibold">TypeScript</h2>
            <p className="text-gray-600">Type-safe development</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-2 text-xl font-semibold">Prisma + MongoDB</h2>
            <p className="text-gray-600">Modern database with Atlas</p>
          </div>
        </div>

        {/* Test Credentials */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
          <h3 className="font-semibold text-blue-900 mb-2">Test Credentials</h3>
          <p className="text-sm text-blue-700">
            <strong>Admin:</strong> admin@ecommerce.com / admin123<br />
            <strong>Customer:</strong> john.doe@example.com / customer123
          </p>
        </div>
      </div>
    </div>
  )
}