import prisma from '@/lib/prisma'
import { ProductMenu } from '@/components/menu/ProductMenu'
import { CartDrawer } from '@/components/cart/CartDrawer'
import Link from 'next/link'
import { ReceiptText } from 'lucide-react'

export default async function TablePage({ params }: { params: Promise<{ tableId: string }> }) {
  const resolvedParams = await params;
  const products = await prisma.product.findMany({
    orderBy: { category: 'asc' }
  })

  return (
    <main className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-5 px-6 shadow-md rounded-b-2xl mb-6 relative">
        <h1 className="text-3xl font-extrabold text-center tracking-tight">QR Menü</h1>
        <p className="text-center mt-1 opacity-90 font-medium text-base">Masa {resolvedParams.tableId}</p>
        
        {/* Siparişlerim Butonu */}
        <Link 
          href={`/table/${resolvedParams.tableId}/status`} 
          className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center opacity-90 hover:opacity-100 transition-opacity active:scale-95"
        >
          <div className="bg-white/20 p-2 rounded-xl">
            <ReceiptText className="h-6 w-6 text-white" />
          </div>
          <span className="text-[10px] mt-1 font-bold uppercase tracking-wider">Siparişlerim</span>
        </Link>
      </header>
      
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <ProductMenu products={products} />
      </div>

      <CartDrawer tableId={resolvedParams.tableId} />
    </main>
  )
}
