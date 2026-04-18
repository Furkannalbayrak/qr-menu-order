import { create } from 'zustand'

export type CartItem = {
  id: string; // productId
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  incrementItem: (id: string) => void;
  decrementItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalAmount: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => {
    const existingItem = state.items.find(i => i.id === item.id)
    if (existingItem) {
      return {
        items: state.items.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        )
      }
    }
    return { items: [...state.items, item] }
  }),
  incrementItem: (id) => set((state) => ({
    items: state.items.map(i =>
      i.id === id ? { ...i, quantity: i.quantity + 1 } : i
    )
  })),
  decrementItem: (id) => set((state) => {
    const item = state.items.find(i => i.id === id)
    if (item && item.quantity <= 1) {
      // Adet 1 veya altındaysa ürünü tamamen kaldır
      return { items: state.items.filter(i => i.id !== id) }
    }
    return {
      items: state.items.map(i =>
        i.id === id ? { ...i, quantity: i.quantity - 1 } : i
      )
    }
  }),
  removeItem: (id) => set((state) => ({
    items: state.items.filter(i => i.id !== id)
  })),
  clearCart: () => set({ items: [] }),
  totalAmount: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
  totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0)
}))

