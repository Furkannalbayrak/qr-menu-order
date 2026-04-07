'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function Home() {
  // Telefonla taratabilmek için local IP'yi kullanıyoruz. (Gerekirse text kutusundan değiştirilebilir).
  const [networkUrl, setNetworkUrl] = useState('http://192.168.1.56:3001/table/1')

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">Sipariş Yönetim Sistemi</h1>
          <p className="text-muted-foreground text-lg">Lütfen giriş yapmak istediğiniz paneli seçin</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/cashier" className="block group">
            <Card className="h-full border-border/50 transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:bg-secondary/20">
              <CardHeader>
                <CardTitle className="text-2xl text-primary text-center">Kasa Paneli</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                <p>Tüm masaların anlık hesap durumunu görün, detayları inceleyin ve ödemeleri kolayca alın.</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard" className="block group">
            <Card className="h-full border-border/50 transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:bg-secondary/20">
              <CardHeader>
                <CardTitle className="text-2xl text-primary text-center">Mutfak / Barista Paneli</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                <p>Yeni gelen siparişleri takip edin, hazırlayın ve hazır olduğunda masalara teslim edildi olarak işaretleyin.</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Canlı QR Kod Oluşturucu */}
        <div className="mt-12 text-center bg-secondary/30 p-8 rounded-2xl border border-border/50 flex flex-col items-center">
          <p className="font-bold mb-4 text-xl text-primary">Telefonunuzla Hemen Test Edin!</p>
          <p className="mb-6 text-foreground/80 max-w-lg">
            Telefonunuz PC'niz ile aynı Wi-Fi ağındaysa, aşağıdaki karekodu okutarak 1 Numaralı Masa'nın sipariş ekranına direkt girebilirsiniz.
          </p>

          <div className="bg-white p-4 rounded-xl border border-border/50 shadow-md mb-6">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(networkUrl)}`}
              alt="Masa 1 QR"
              width={250}
              height={250}
            />
          </div>

          <div className="flex items-center gap-4 w-full max-w-md">
            <span className="text-sm font-bold text-muted-foreground shrink-0">QR Linki:</span>
            <Input
              value={networkUrl}
              onChange={(e) => setNetworkUrl(e.target.value)}
              className="font-mono text-center bg-background border-border"
            />
          </div>
        </div>

      </div>
    </main>
  )
}
