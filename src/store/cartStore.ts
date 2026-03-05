import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/lib/services/catalogService";

export interface CartItem {
    id: string; // ID único
    product: Product;
    quantity: number;
    extras: { id: string; name: string; price: number }[];
    notes: string;
}

interface CartStore {
    items: CartItem[];
    addItem: (product: Product, quantity: number, extras: { id: string; name: string; price: number }[], notes: string) => void;
    removeItem: (itemId: string) => void;
    updateItem: (itemId: string, quantity: number, extras: { id: string; name: string; price: number }[], notes: string) => void;
    incrementQuantity: (itemId: string) => void;
    decrementQuantity: (itemId: string) => void;
    clearCart: () => void;
    totalItems: () => number;
    totalPrice: () => number;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product, quantity, extras, notes) => {
                set((state) => ({
                    items: [...state.items, { id: generateId(), product, quantity, extras, notes }],
                }));
            },
            removeItem: (itemId) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== itemId),
                }));
            },
            updateItem: (itemId, quantity, extras, notes) => {
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === itemId
                            ? { ...item, quantity, extras, notes }
                            : item
                    ),
                }));
            },
            incrementQuantity: (itemId) => {
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === itemId
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    ),
                }));
            },
            decrementQuantity: (itemId) => {
                set((state) => ({
                    items: state.items
                        .map((item) =>
                            item.id === itemId
                                ? { ...item, quantity: item.quantity - 1 }
                                : item
                        )
                        .filter((item) => item.quantity > 0),
                }));
            },
            clearCart: () => set({ items: [] }),
            totalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },
            totalPrice: () => {
                return get().items.reduce((total, item) => {
                    const extrasTotal = item.extras.reduce((acc, current) => acc + current.price, 0);
                    return total + ((item.product.price + extrasTotal) * item.quantity);
                }, 0);
            },
        }),
        {
            name: "rdos-cart-storage",
        }
    )
);
