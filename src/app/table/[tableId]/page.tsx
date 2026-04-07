import prisma from '@/lib/prisma'
import { ProductMenu } from '@/components/menu/ProductMenu'
import { CartDrawer } from '@/components/cart/CartDrawer'

export default async function TablePage({ params }: { params: Promise<{ tableId: string }> }) {
  const resolvedParams = await params;
  const products = await prisma.product.findMany({
    orderBy: { category: 'asc' }
  })

  return (
    <main className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-8 shadow-md rounded-b-3xl mb-6">
        <h1 className="text-4xl font-extrabold text-center tracking-tight">QR Menü</h1>
        <p className="text-center mt-2 opacity-90 font-medium text-lg">Masa {resolvedParams.tableId}</p>
      </header>
      
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <ProductMenu products={products} />
      </div>

      <CartDrawer tableId={resolvedParams.tableId} />
    </main>
  )
}
