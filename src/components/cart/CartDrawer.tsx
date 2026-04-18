'use client'

import { ShoppingCart, Plus, Minus, Trash2, Coffee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useCartStore } from '@/store/cart'
import { placeOrder } from '@/app/actions'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CartDrawer({ tableId }: { tableId: string }) {
  const { items, incrementItem, decrementItem, removeItem, totalAmount, totalItems, clearCart } = useCartStore()
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

  const itemCount = totalItems()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-90 hover:scale-105 z-50"
          style={{
            background: 'linear-gradient(135deg, #5d4037, #3e2723)',
            color: 'white',
          }}
        >
          <ShoppingCart className="h-7 w-7" />
          {itemCount > 0 && (
            <span
              className="absolute -top-1 -right-1 h-7 w-7 rounded-full flex items-center justify-center text-xs font-extrabold animate-bounce shadow-md"
              style={{ background: '#d84315', color: 'white' }}
            >
              {itemCount}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent className="flex flex-col p-0 border-l-0 w-[380px] sm:w-[420px]" style={{ background: '#faf6f1' }}>
        {/* Başlık */}
        <div className="px-5 sm:px-6 pt-3 pb-3" style={{ background: 'linear-gradient(135deg, #5d4037, #3e2723)' }}>
          <SheetHeader>
            <SheetTitle className="text-white text-xl sm:text-2xl font-extrabold flex flex-wrap items-center gap-2 sm:gap-3">
              <Coffee className="h-6 w-6 sm:h-7 sm:w-7" />
              <span>Sepetim</span>
              {itemCount > 0 && (
                <span className="text-white/90 text-xs sm:text-sm font-medium ml-1 sm:ml-2 px-2.5 py-0.5 sm:px-3 sm:py-1 bg-white/20 rounded-full whitespace-nowrap">
                  {items.length} çeşit, {itemCount} adet
                </span>
              )}
            </SheetTitle>
          </SheetHeader>
        </div>

        {/* Ürün Listesi */}
        <div className="flex-1 overflow-auto px-3 sm:px-4 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 opacity-60">
              <ShoppingCart className="h-14 w-14 text-[#8d6e63]" />
              <p className="text-[#5d4037] font-medium text-base">Sepetiniz boş</p>
              <p className="text-[#8d6e63] text-xs">Menüden ürün ekleyerek başlayın</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-3 shadow-sm border border-[#e8e0d8] transition-all hover:shadow-md"
                >
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <div className="flex flex-1 items-center gap-3 min-w-0">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-16 h-16 object-cover rounded-xl shrink-0 border border-black/5" 
                        />
                      ) : (
                        <div className="w-16 h-16 bg-[#f5f0eb] rounded-xl shrink-0 flex items-center justify-center border border-black/5">
                          <Coffee className="w-6 h-6 text-[#8d6e63]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[#3e2723] text-sm truncate">{item.name}</h4>
                        <p className="text-[#8d6e63] text-xs mt-0.5">{item.price} ₺ / adet</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Adet kontrol */}
                    <div className="flex items-center gap-0.5 bg-[#f5f0eb] rounded-lg p-0.5">
                      <button
                        onClick={() => decrementItem(item.id)}
                        className="h-7 w-7 rounded-md flex items-center justify-center transition-all active:scale-90 hover:bg-[#e8e0d8] text-[#5d4037]"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center font-extrabold text-[#3e2723] text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => incrementItem(item.id)}
                        className="h-7 w-7 rounded-md flex items-center justify-center transition-all active:scale-90 hover:bg-[#e8e0d8] text-[#5d4037]"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Satır toplam fiyat */}
                    <span className="font-extrabold text-[#3e2723] text-sm sm:text-base">
                      {(item.price * item.quantity).toFixed(0)} ₺
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alt kısım - Toplam ve Sipariş Butonu */}
        {items.length > 0 && (
          <div className="border-t border-[#e8e0d8] bg-white px-6 py-5" style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.05)' }}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#8d6e63] font-medium text-base">Toplam Tutar</span>
              <span className="font-extrabold text-2xl text-[#3e2723]">{totalAmount().toFixed(0)} ₺</span>
            </div>
            <Button
              className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #5d4037, #3e2723)', color: 'white' }}
              onClick={handleOrder}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Onaylanıyor...
                </span>
              ) : (
                'Siparişi Onayla ☕'
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
