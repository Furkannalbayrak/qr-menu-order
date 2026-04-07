'use client'

import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useCartStore } from '@/store/cart'
import { placeOrder } from '@/app/actions'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CartDrawer({ tableId }: { tableId: string }) {
  const { items, removeItem, totalAmount, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleOrder = async () => {
    if (items.length === 0) return;
    setLoading(true)
    const result = await placeOrder(tableId, items, totalAmount())
    setLoading(false)
    if (result.success) {
      clearCart()
      router.push(`/table/${tableId}/status`)
    } else {
      alert(result.error)
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg" size="icon">
          <ShoppingCart className="h-6 w-6" />
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold">
              {items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Sepetim</SheetTitle>
        </SheetHeader>
        <div className="mt-8 flex flex-col h-full gap-4">
          <div className="flex-1 overflow-auto">
            {items.length === 0 ? (
              <p className="text-center text-muted-foreground mt-10">Sepetiniz boş.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-2 border-border">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.quantity} x {item.price} ₺</p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => removeItem(item.id)}>Sil</Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {items.length > 0 && (
            <div className="border-t border-border pt-4 pb-8">
              <div className="flex justify-between font-bold mb-4 text-xl">
                <span>Toplam:</span>
                <span>{totalAmount()} ₺</span>
              </div>
              <Button className="w-full h-12 text-lg" onClick={handleOrder} disabled={loading}>
                {loading ? 'Onaylanıyor...' : 'Siparişi Onayla'}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
