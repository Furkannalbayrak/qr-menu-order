'use server'

import prisma from '@/lib/prisma'
import { CartItem } from '@/store/cart'

export async function placeOrder(tableId: string, items: CartItem[], totalAmount: number) {
  try {
    const order = await prisma.order.create({
      data: {
        tableId,
        totalAmount,
        status: 'pending',
        items: {
          create: items.map(item => ({
            productId: item.id,
            quantity: item.quantity
          }))
        }
      }
    });
    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Order creation error:", error);
    return { success: false, error: "Sipariş oluşturulamadı." };
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
    return { success: true };
  } catch (error) {
    console.error("Update status error:", error);
    return { success: false };
  }
}

export async function markTableAsPaid(tableId: string) {
  try {
    await prisma.order.updateMany({
      where: {
        tableId,
        status: { notIn: ['paid', 'canceled'] }
      },
      data: { status: 'paid' }
    });
    return { success: true };
  } catch (error) {
    console.error("Mark paid error:", error);
    return { success: false };
  }
}
