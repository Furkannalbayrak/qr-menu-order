'use client'

import React, { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

export default function QRGeneratorPage() {
  const [baseUrl, setBaseUrl] = useState('')

  useEffect(() => {
    // Component yüklendiğinde mevcut hostname'i al (Örn: https://myapp.com veya http://localhost:3000)
    setBaseUrl(window.location.origin)
  }, [])

  // 1'den 20'ye kadar masalar için
  const tables = Array.from({ length: 20 }, (_, i) => i + 1)

  const handlePrint = () => {
    window.print()
  }

  if (!baseUrl) return null

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-center print:hidden border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">QR Kod Oluşturucu</h1>
            <p className="text-muted-foreground mt-2">Masalara yapıştırmak için karekodların çıktılarını alın.</p>
          </div>
          <Button onClick={handlePrint} size="lg" className="h-12 px-6">
            <Printer className="mr-2" />
            Yazdır (PDF Kaydet)
          </Button>
        </header>

        {/* Yazdırılabilir Alan */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 print:grid-cols-3 print:gap-4">
          {tables.map((tableNo) => {
            const tableUrl = `${baseUrl}/table/${tableNo}`
            
            return (
              <Card key={tableNo} className="border-2 border-border break-inside-avoid print:shadow-none print:border-black">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                  <div className="bg-white p-4 rounded-xl mb-4 border border-border shadow-sm print:border-none print:shadow-none">
                    <QRCodeSVG 
                      value={tableUrl} 
                      size={140} 
                      level="H" 
                      includeMargin={false} 
                      fgColor="#3e2723" // Cafe Koyu Kahvesi
                    />
                  </div>
                  <h2 className="text-xl font-extrabold text-foreground mb-1">Masa {tableNo}</h2>
                  <p className="text-xs text-muted-foreground font-mono print:text-black">Masanızdaki menüyü görmek için okutun</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
        
        {/* Yazdırma işlemi için özel CSS */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body { background: white !important; }
            .print\\:hidden { display: none !important; }
          }
        `}} />
      </div>
    </div>
  )
}
