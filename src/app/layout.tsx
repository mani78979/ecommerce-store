import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth/auth-provider'
import { CartProvider } from '@/components/cart/cart-context'
import { Navigation } from '@/components/ui/navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'E-Commerce Store',
  description: 'A modern e-commerce store built with Next.js, TypeScript, and Prisma',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen bg-background">
              <Navigation />
              <main>
                {children}
              </main>
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}