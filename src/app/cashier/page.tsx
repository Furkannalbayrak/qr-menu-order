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

    const channel = supabase
      .channel('cashier-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Order' }, () => {
        fetchActive() 
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handlePay = async () => {
    if (!selectedTable) return
    const res = await markTableAsPaid(selectedTable)
    if (res.success) {
      setSelectedTable(null)
    }
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
        <SheetContent className="w-full sm:max-w-md border-l border-border bg-background">
          <SheetHeader>
            <SheetTitle className="text-3xl text-primary font-bold">Masa {selectedTable}</SheetTitle>
          </SheetHeader>
          <div className="mt-8 flex flex-col h-full gap-4 pb-12">
            <div className="flex-1 overflow-auto space-y-4 pr-4">
              <h3 className="font-semibold text-lg border-b pb-2">Aktif Siparişler</h3>
              {activeOrders.filter(o => o.tableId === selectedTable).map((order) => (
                <div key={order.id} className="bg-secondary/40 p-4 rounded-xl border border-border/50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-mono bg-background px-2 py-1 rounded-md">ID: {order.id.slice(-6).toUpperCase()}</span>
                    <span className="font-bold text-lg text-primary">{order.totalAmount} ₺</span>
                  </div>
                  <ul className="space-y-2">
                    {order.items?.map((item: any) => (
                      <li key={item.id} className="text-sm flex justify-between items-center bg-background/50 p-2 rounded-md">
                        <span className="font-medium text-foreground/80">{item.quantity}x {item.product?.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t pt-6 bg-background">
               <div className="flex justify-between items-center text-3xl font-extrabold mb-8 text-primary">
                  <span>Genel Toplam</span>
                  <span>
                    {activeOrders.filter(o => o.tableId === selectedTable).reduce((sum, o) => sum + o.totalAmount, 0)} ₺
                  </span>
               </div>
               <Button className="w-full h-16 text-xl rounded-xl shadow-lg" onClick={handlePay}>
                 Hesabı Kapat
               </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
