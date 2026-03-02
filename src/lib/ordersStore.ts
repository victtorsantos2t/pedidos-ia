"use client";

import { create } from "zustand";
import { createClient } from "./supabase/client";
import { parseEstimatedTime } from "./storeUtils";

export type OrderStatus = "NEW" | "PREPARING" | "READY" | "DELIVERY" | "COMPLETED" | "CANCELLED";

interface Order {
    id: string;
    customer_name: string;
    customer_phone: string;
    delivery_address: string;
    payment_method: string;
    status: OrderStatus;
    total_amount: number;
    created_at: string;
    order_items?: any[];
}

interface OrdersStore {
    orders: Order[];
    maxEstimatedTime: number;
    delayedOrdersCount: number;
    lastRefresh: number;

    setOrders: (orders: Order[]) => void;
    updateOrder: (order: Partial<Order> & { id: string }) => void;
    setStoreSettings: (settings: any) => void;
    refreshDelays: () => void;
    subscribe: () => void;
    unsubscribe: () => void;
}

let channel: any = null;

export const useOrdersStore = create<OrdersStore>((set, get) => ({
    orders: [],
    maxEstimatedTime: 45,
    delayedOrdersCount: 0,
    lastRefresh: Date.now(),

    setOrders: (orders) => {
        set({ orders });
        get().refreshDelays();
    },

    updateOrder: (updatedOrder) => {
        set((state) => ({
            orders: state.orders.map((o) =>
                o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o
            )
        }));
        get().refreshDelays();
    },

    setStoreSettings: (settings) => {
        const time = parseEstimatedTime(settings?.estimated_time);
        set({ maxEstimatedTime: time });
        get().refreshDelays();
    },

    refreshDelays: () => {
        const { orders, maxEstimatedTime } = get();
        const now = Date.now();
        const delayedCount = orders.filter((order) => {
            if (["COMPLETED", "CANCELLED"].includes(order.status)) return false;
            if (order.status === "READY" || order.status === "DELIVERY") return false; // Por enquanto apenas Novos e Preparando

            const createdAt = new Date(order.created_at).getTime();
            const elapsedMinutes = (now - createdAt) / 60000;
            return elapsedMinutes > (maxEstimatedTime + 5);
        }).length;

        set({ delayedOrdersCount: delayedCount, lastRefresh: now });
    },

    subscribe: () => {
        if (channel) return;
        const supabase = createClient();
        channel = supabase
            .channel("realtime-admin-orders")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "orders" },
                (payload) => {
                    const { eventType, new: next, old } = payload;
                    const { orders } = get();

                    if (eventType === "INSERT") {
                        // Alerta sonoro para novo pedido
                        try {
                            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
                            audio.volume = 0.5;
                            audio.play().catch(e => console.log("Audio play blocked by browser:", e));
                        } catch (e) {
                            console.error("Erro ao tocar alerta:", e);
                        }

                        set({ orders: [next as Order, ...orders] });
                    } else if (eventType === "UPDATE") {
                        if (next.status === "COMPLETED" || next.status === "CANCELLED") {
                            set({ orders: orders.filter((o) => o.id !== next.id) });
                        } else {
                            get().updateOrder(next as Order);
                        }
                    } else if (eventType === "DELETE") {
                        set({ orders: orders.filter((o) => o.id !== old.id) });
                    }
                    get().refreshDelays();
                }
            )
            .subscribe();
    },

    unsubscribe: () => {
        if (channel) {
            channel.unsubscribe();
            channel = null;
        }
    }
}));
