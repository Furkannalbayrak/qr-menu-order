'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { updateOrderStatus } from '@/app/actions'

export default function DashboardPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Sadece tamamlanmamış/mutfakta olan siparişleri getir
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders?status=active`)
        if (res.ok) {
          const data = await res.json()
          setOrders(data.orders.filter((o: any) => o.status === 'pending' || o.status === 'preparing' || o.status === 'completed'))
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()

    // Polling: 5 saniyede bir güncelleme
    const pollInterval = setInterval(fetchOrders, 5000)

    // Realtime subscription (anlık güncelleme için ek destek)
    const channel = supabase
      .channel('kitchen-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'Order' },
        () => { fetchOrders() }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'Order' },
        (payload: any) => {
          if (payload.new.status === 'paid' || payload.new.status === 'canceled') {
            setOrders(prev => prev.filter(o => o.id !== payload.new.id))
          } else {
            setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, status: payload.new.status } : o))
          }
        }
      )
      .subscribe()

    return () => {
      clearInterval(pollInterval)
      supabase.removeChannel(channel)
    }
  }, [])

  const handleStatus = async (id: string, newStatus: string) => {
    // Optimistic update: Butona basıldığı anda local state'i hemen güncelle
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
    // Sonra sunucuya gönder
    await updateOrderStatus(id, newStatus)
  }

  // Gruplama (Eskiden Yeniye / İlk Giren İlk Çıkar)
  const sortedOrders = [...orders].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  
  const pending = sortedOrders.filter(o => o.status === 'pending')
  const preparing = sortedOrders.filter(o => o.status === 'preparing')
  const completed = sortedOrders.filter(o => o.status === 'completed') // Sadece ekranda gözüksün diye

  const Column = ({ title, items, nextLabel, nextStatus, colorClass }: any) => (
    <div className="flex-1 bg-secondary/30 p-4 rounded-xl min-w-[300px]">
      <h2 className="text-xl font-bold mb-4 flex items-center justify-between border-b pb-2">
        {title}
        <Badge variant="secondary">{items.length}</Badge>
      </h2>
      <div className="space-y-4">
        {items.map((order: any) => (
          <Card key={order.id} className={`border-l-4 ${colorClass}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between">
                <span>Masa {order.tableId}</span>
                <span className="text-sm font-normal text-muted-foreground">
                   {new Date(order.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <ul className="list-disc pl-4 space-y-1">
                {order.items?.map((item: any) => (
                  <li key={item.id} className="text-sm">
                    <span className="font-semibold">{item.quantity}x</span> {item.product?.name || 'Ürün'}
                  </li>
                ))}
                {!order.items && <li className="text-sm italic text-muted-foreground">Detaylar yükleniyor...</li>}
              </ul>
            </CardContent>
            {nextStatus && (
              <CardFooter className="pt-2">
                <Button 
                  className="w-full" 
                  onClick={() => handleStatus(order.id, nextStatus)}
                >
                  {nextLabel}
                </Button>
              </CardFooter>
            )}
            {order.status === 'completed' && (
              <CardFooter className="pt-2">
                 <p className="text-xs text-muted-foreground mx-auto">Garsona veya Müşteriye teslim edildi.</p>
              </CardFooter>
            )}
          </Card>
        ))}
        {items.length === 0 && <p className="text-center text-muted-foreground text-sm mt-4">Sipariş yok</p>}
      </div>
    </div>
  )

  if (loading) return <div className="p-8 text-center bg-background min-h-screen text-foreground">Yükleniyor...</div>

  return (
    <div className="min-h-screen bg-background p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Barista / Mutfak Paneli</h1>
        <p className="text-muted-foreground">Gerçek zamanlı sipariş akışı</p>
      </header>

      <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-8">
        <Column 
          title="🔥 Yeni (Beklemede)" 
          items={pending} 
          nextLabel="Hazırlamaya Başla" 
          nextStatus="preparing" 
          colorClass="border-yellow-500" 
        />
        <Column 
          title="⏳ Hazırlanıyor" 
          items={preparing} 
          nextLabel="Tamamlandı (Teslim Et)" 
          nextStatus="completed" 
          colorClass="border-blue-500" 
        />
        <Column 
          title="✅ Tamamlandı" 
          items={completed} 
          colorClass="border-green-500" 
        />
      </div>
    </div>
  )
}
