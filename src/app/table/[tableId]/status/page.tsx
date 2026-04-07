'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const statusMap: Record<string, { label: string, color: string }> = {
  pending: { label: 'Beklemede', color: 'bg-yellow-600' },
  preparing: { label: 'Hazırlanıyor', color: 'bg-blue-600' },
  completed: { label: 'Masaya İletildi', color: 'bg-green-600' },
}

export default function StatusPage({ params }: { params: Promise<{ tableId: string }> }) {
  const resolvedParams = use(params);
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // 1. Initial fetch (aktif siparişler)
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders?tableId=${resolvedParams.tableId}&status=active`)
        if (res.ok) {
          const data = await res.json()
          setOrders(data.orders)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()

    // 2. Realtime Subscription
    const channel = supabase
      .channel('table-orders')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'Order',
          filter: `tableId=eq.${resolvedParams.tableId}`,
        },
        (payload) => {
          setOrders(prev => {
            // Eğer status paid veya canceled olduysa listeden çıkarabiliriz
            if (payload.new.status === 'paid' || payload.new.status === 'canceled') {
              return prev.filter(o => o.id !== payload.new.id)
            }
            return prev.map(o => o.id === payload.new.id ? { ...o, status: payload.new.status } : o)
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Order',
          filter: `tableId=eq.${resolvedParams.tableId}`,
        },
        (payload) => {
          setOrders(prev => [payload.new, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [resolvedParams.tableId])

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-6 shadow-md rounded-b-3xl">
        <h1 className="text-2xl font-bold text-center">Sipariş Durumu</h1>
        <p className="text-center mt-1 opacity-80 text-sm">Masa {resolvedParams.tableId}</p>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-4 pb-20">
        {loading ? (
          <p className="text-center text-muted-foreground mt-10 animate-pulse">Siparişleriniz yükleniyor...</p>
        ) : orders.length === 0 ? (
          <div className="text-center mt-10">
            <p className="text-muted-foreground text-lg">Şu an aktif bir siparişiniz bulunmuyor.</p>
            <p className="text-sm mt-2">Hesabınız ödenmiş veya sipariş iptal edilmiş olabilir.</p>
          </div>
        ) : (
          orders.map(order => (
            <Card key={order.id} className="shadow-sm border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>Sipariş #{order.id.slice(-4).toUpperCase()}</span>
                  <Badge className={`${statusMap[order.status]?.color || 'bg-gray-500'} text-white border-0 shadow-sm`}>
                    {statusMap[order.status]?.label || order.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Saat: {new Date(order.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <p className="font-extrabold text-primary text-xl">{order.totalAmount} ₺</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
