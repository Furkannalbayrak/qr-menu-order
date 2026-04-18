'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const statusMap: Record<string, { label: string, color: string }> = {
  pending: { label: 'Beklemede', color: 'bg-yellow-600' },
  preparing: { label: 'Hazırlanıyor', color: 'bg-blue-600' },
  completed: { label: 'Teslim Alabilirsiniz', color: 'bg-green-600' },
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

    // Polling: 5 saniyede bir güncelleme
    const pollInterval = setInterval(fetchOrders, 5000)

    // Realtime Subscription (anlık güncelleme için ek destek)
    const channel = supabase
      .channel(`table-orders-${resolvedParams.tableId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'Order',
        },
        (payload: any) => {
          if (payload.new.tableId !== resolvedParams.tableId) return
          
          setOrders(prev => {
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
        },
        (payload: any) => {
          if (payload.new.tableId !== resolvedParams.tableId) return
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      clearInterval(pollInterval)
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
                <div className="space-y-3 mt-2">
                  {/* Sipariş İçeriği (Ürünler) */}
                  <div className="bg-secondary/10 rounded-xl p-3 space-y-2">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-start text-sm">
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-[#3e2723] min-w-[24px]">{item.quantity}x</span>
                          <span className="text-foreground">{item.product?.name || 'Ürün bulunamadı'}</span>
                        </div>
                        <span className="text-muted-foreground whitespace-nowrap ml-2">
                          {(item.product?.price || 0) * item.quantity} ₺
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-end pt-2 border-t border-border/40">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Saat: {new Date(order.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-0.5">Toplam Tutar</p>
                      <p className="font-extrabold text-primary text-xl">{order.totalAmount} ₺</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
