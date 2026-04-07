'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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

  if (products.length === 0) {
    return <p className="text-center text-muted-foreground mt-8">Menüde ürün bulunmuyor.</p>
  }

  return (
    <div className="space-y-10 pb-24">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h2 className="text-2xl font-bold mb-4 border-b-2 border-border/50 pb-2 capitalize tracking-tight text-primary">
            {category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {items.map(product => (
              <Card key={product.id} className="flex flex-col shadow-sm border-border/50 hover:shadow-md transition-shadow">
                {product.image && (
                  <div className="w-full h-48 sm:h-40 overflow-hidden rounded-t-xl">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xl flex justify-between items-start gap-4">
                    <span className="leading-tight">{product.name}</span>
                    <span className="text-primary font-bold shrink-0">{product.price} ₺</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-1">
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  )}
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
                    onClick={() => addItem({ id: product.id, name: product.name, price: product.price, quantity: 1 })}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Sepete Ekle
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
