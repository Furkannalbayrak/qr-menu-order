'use client'

import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart'
import { Plus } from 'lucide-react'

// Using Prisma's Product type structure
type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category: string;
}

export function ProductMenu({ products }: { products: Product[] }) {
  const addItem = useCartStore(state => state.addItem)

  // Group by category
  const grouped = products.reduce((acc, product) => {
    acc[product.category] = acc[product.category] || []
    acc[product.category].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  // Custom Category Order
  const CATEGORY_ORDER = ['İçecekler', 'Tatlılar', 'Yiyecekler'];

  const sortedCategories = Object.entries(grouped).sort(([catA], [catB]) => {
    const indexA = CATEGORY_ORDER.indexOf(catA);
    const indexB = CATEGORY_ORDER.indexOf(catB);
    if (indexA === -1 && indexB === -1) return catA.localeCompare(catB);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  if (products.length === 0) {
    return <p className="text-center text-muted-foreground mt-8">Menüde ürün bulunmuyor.</p>
  }

  return (
    <div className="space-y-10 pb-24">
      {sortedCategories.map(([category, items]) => (
        <div key={category}>
          <h2 className="text-2xl font-bold mb-6 border-b-2 border-border/50 pb-2 capitalize tracking-tight text-primary">
            {category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {items.map(product => (
              <div
                key={product.id}
                className="flex flex-col rounded-2xl overflow-hidden shadow-sm border border-border/30 hover:shadow-xl transition-all duration-300 group bg-white"
              >
                {/* Görsel alanı - sıfır padding, resim kartın tavanına tam yapışık */}
                {product.image && (
                  <div className="w-full h-52 relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Alt kısma hafif gradyan */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                )}

                {/* İçerik alanı */}
                <div className="flex flex-col flex-1 p-4">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="text-lg font-bold text-[#3e2723] leading-tight">{product.name}</h3>
                    <span className="bg-[#3e2723] text-white px-3 py-1 rounded-full text-sm font-bold shrink-0">
                      {product.price} ₺
                    </span>
                  </div>

                  {product.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                      {product.description}
                    </p>
                  )}

                  <Button
                    className="w-full bg-[#3e2723] hover:bg-[#2d1c19] text-white font-bold rounded-xl transition-all active:scale-95 h-12 text-base mt-auto"
                    onClick={() => addItem({ id: product.id, name: product.name, price: product.price, quantity: 1, image: product.image })}
                  >
                    <Plus className="mr-2 h-5 w-5" /> Sepete Ekle
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
