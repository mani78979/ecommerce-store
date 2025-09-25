export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to E-Commerce Store
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          A modern e-commerce platform built with Next.js, TypeScript, Tailwind CSS, and Prisma
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Next.js 14</h2>
            <p className="text-gray-600">Latest features with App Router</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">TypeScript</h2>
            <p className="text-gray-600">Type-safe development</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Prisma</h2>
            <p className="text-gray-600">Modern database toolkit</p>
          </div>
        </div>
      </div>
    </div>
  )
}