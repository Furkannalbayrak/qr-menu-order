'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { markTableAsPaid } from '@/app/actions'

export default function CashierPage() {
  const [activeOrders, setActiveOrders] = useState<any[]>([])
  
  // Sabit 20 masa oluşturuyoruz
  const tables = Array.from({ length: 20 }, (_, i) => ({ tableNo: (i + 1).toString() }))
  
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await fetch('/api/orders?status=active')
        if (res.ok) {
          const data = await res.json()
          setActiveOrders(data.orders)
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchActive()

    // Polling: 5 saniyede bir güncelleme
    const pollInterval = setInterval(fetchActive, 5000)

    // Realtime subscription (anlık güncelleme)
    const channel = supabase
      .channel('cashier-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'Order' },
        () => { fetchActive() }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'Order' },
        (payload: any) => {
          if (payload.new.status === 'paid' || payload.new.status === 'canceled') {
            setActiveOrders(prev => prev.filter(o => o.id !== payload.new.id))
          } else {
            setActiveOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o))
          }
        }
      )
      .subscribe()

    return () => {
      clearInterval(pollInterval)
      supabase.removeChannel(channel)
    }
  }, [])

  const handlePay = async () => {
    if (!selectedTable) return
    const tableToClose = selectedTable
    // Optimistic: anında masanın siparişlerini kaldır ve drawer'ı kapat
    setActiveOrders(prev => prev.filter(o => o.tableId !== tableToClose))
    setSelectedTable(null)
    // Sunucuya gönder
    await markTableAsPaid(tableToClose)
  }

  const activeTableIds = Array.from(new Set(activeOrders.map(o => o.tableId)))

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <header className="mb-8 border-b border-border/50 pb-4">
        <h1 className="text-4xl font-extrabold text-primary tracking-tight">Kasa Paneli</h1>
        <p className="text-muted-foreground mt-2 text-lg">Tüm masaların anlık sipariş ve hesap durumu</p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
        {tables.map(t => {
          const isOccupied = activeTableIds.includes(t.tableNo)
          const tableOrders = activeOrders.filter(o => o.tableId === t.tableNo)
          const totalAmount = tableOrders.reduce((sum, o) => sum + o.totalAmount, 0)
          
          return (
            <Card 
              key={t.tableNo}
              className={`cursor-pointer transition-all duration-300 border-2 ${
                isOccupied 
                ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-black/10 scale-[1.02]' 
                : 'bg-background border-border/50 text-foreground hover:bg-secondary/50'
              }`}
              onClick={() => isOccupied && setSelectedTable(t.tableNo)}
            >
              <CardContent className="p-0 flex flex-col items-center justify-center aspect-square text-center">
                <span className="text-2xl sm:text-3xl font-bold mb-1">Masa {t.tableNo}</span>
                {isOccupied ? (
                  <span className="text-lg sm:text-xl font-medium mt-1 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    {totalAmount} ₺
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground mt-2">Boş</span>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Sheet open={!!selectedTable} onOpenChange={(open) => !open && setSelectedTable(null)}>
        <SheetContent className="w-full sm:max-w-md border-l-0 p-0 flex flex-col" style={{ background: '#faf6f1' }}>
          {/* Header */}
          <div className="px-6 pt-6 pb-4" style={{ background: 'linear-gradient(135deg, #5d4037, #3e2723)' }}>
            <SheetHeader>
              <SheetTitle className="text-white text-3xl font-extrabold flex items-center gap-3">
                Masa {selectedTable}
              </SheetTitle>
            </SheetHeader>
            <p className="text-white/70 text-sm mt-1">Adisyon Özeti</p>
          </div>

          {/* Adisyon Listesi */}
          <div className="flex-1 overflow-auto px-5 sm:px-6 py-6">
            <h3 className="font-bold text-[#3e2723] text-lg border-b border-[#e8e0d8] pb-2 mb-4">Sipariş Geçmişi</h3>
            <div className="space-y-4">
              {activeOrders.filter(o => o.tableId === selectedTable).map((order) => (
                <div key={order.id} className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-[#e8e0d8]">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#f5f0eb] border-dashed">
                    <span className="text-xs font-bold text-[#8d6e63]">ID: #{order.id.slice(-4).toUpperCase()}</span>
                    <span className="text-xs font-medium text-[#8d6e63]">
                      {new Date(order.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <ul className="space-y-3">
                    {order.items?.map((item: any) => (
                      <li key={item.id} className="text-sm flex justify-between items-start">
                        <div className="flex items-start gap-2">
                          <span className="font-extrabold text-[#3e2723] min-w-[20px]">{item.quantity}x</span>
                          <span className="text-[#5d4037] font-medium leading-tight">{item.product?.name || 'Ürün'}</span>
                        </div>
                        <span className="text-[#8d6e63] font-bold whitespace-nowrap ml-3">
                          {(item.product?.price || 0) * item.quantity} ₺
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-3 border-t border-[#f5f0eb] border-dashed flex justify-between items-center">
                    <span className="text-xs font-bold text-[#8d6e63] uppercase tracking-wider">Sipariş Toplamı</span>
                    <span className="font-extrabold text-lg text-[#3e2723]">{order.totalAmount} ₺</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alt Kısım - Ödeme */}
          <div className="border-t border-[#e8e0d8] bg-white px-6 py-6" style={{ boxShadow: '0 -4px 25px rgba(0,0,0,0.06)' }}>
             <div className="flex justify-between items-end mb-6">
                <span className="text-[#8d6e63] font-bold uppercase tracking-wider text-sm">Genel Toplam</span>
                <span className="text-4xl font-extrabold text-[#3e2723]">
                  {activeOrders.filter(o => o.tableId === selectedTable).reduce((sum, o) => sum + o.totalAmount, 0)} ₺
                </span>
             </div>
             <Button 
               className="w-full h-16 text-xl font-bold rounded-2xl shadow-lg transition-all active:scale-95" 
               style={{ background: 'linear-gradient(135deg, #2e7d32, #1b5e20)', color: 'white' }}
               onClick={handlePay}
             >
               Hesabı Kapat / Ödendi
             </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
