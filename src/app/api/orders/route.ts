import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tableId = searchParams.get('tableId')
  const status = searchParams.get('status') // e.g., 'active' for avoiding paid/canceled

  try {
    let whereClause: any = {}
    if (tableId) whereClause.tableId = tableId
    if (status === 'active') {
      whereClause.status = { notIn: ['paid', 'canceled'] }
    } else if (status) {
      whereClause.status = status
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Fetch orders err:", error)
    return NextResponse.json({ error: "Siparişler getirilemedi." }, { status: 500 })
  }
}
