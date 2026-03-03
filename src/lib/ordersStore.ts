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
    audioUnlocked: boolean;

    setOrders: (orders: Order[]) => void;
    updateOrder: (order: Partial<Order> & { id: string }) => void;
    setStoreSettings: (settings: any) => void;
    refreshDelays: () => void;
    subscribe: () => void;
    unsubscribe: () => void;
    unlockAudio: () => void;
    setAudioUnlocked: (unlocked: boolean) => void;
}

let channel: any = null;
let audioContext: AudioContext | null = null;
let audioUnlocked = false;

// Melodia de notificação — 5 notas ascendentes com sustain
export function playBeep() {
    if (!audioContext || !audioUnlocked) return;

    const notes = [
        { freq: 523, dur: 0.15 }, // C5
        { freq: 659, dur: 0.15 }, // E5
        { freq: 784, dur: 0.15 }, // G5
        { freq: 659, dur: 0.12 }, // E5
        { freq: 1047, dur: 0.35 }, // C6 — nota longa final
    ];

    let t = audioContext.currentTime + 0.05;

    notes.forEach(({ freq, dur }) => {
        const osc = audioContext!.createOscillator();
        const gain = audioContext!.createGain();
        osc.connect(gain);
        gain.connect(audioContext!.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t);

        // Envelope: attack rápido + decay suave
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.55, t + 0.04);
        gain.gain.setValueAtTime(0.55, t + dur - 0.05);
        gain.gain.linearRampToValueAtTime(0, t + dur);

        osc.start(t);
        osc.stop(t + dur);
        t += dur + 0.04; // pausa entre notas
    });
}

// Desbloqueia o contexto no primeiro gesto do usuário em qualquer lugar
function setupAutoUnlock() {
    if (typeof window === "undefined") return;
    const unlock = () => {
        if (audioUnlocked) return;
        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            // Oscillator mudo só para acordar o contexto
            const o = audioContext.createOscillator();
            const g = audioContext.createGain();
            o.connect(g); g.connect(audioContext.destination);
            g.gain.setValueAtTime(0.001, audioContext.currentTime);
            o.start(); o.stop(audioContext.currentTime + 0.05);
            audioUnlocked = true;
            useOrdersStore.getState().setAudioUnlocked(true);
            console.log("[Audio] Desbloqueado automaticamente!");
        } catch (e) {
            console.warn("[Audio] Auto-unlock falhou:", e);
        }
        window.removeEventListener("click", unlock);
        window.removeEventListener("touchstart", unlock);
        window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("click", unlock);
    window.addEventListener("touchstart", unlock);
    window.addEventListener("keydown", unlock);
}

// Inicia o listener assim que o módulo carrega no cliente
if (typeof window !== "undefined") {
    setupAutoUnlock();
}

export const useOrdersStore = create<OrdersStore>((set, get) => ({
    orders: [],
    maxEstimatedTime: 45,
    delayedOrdersCount: 0,
    lastRefresh: Date.now(),
    audioUnlocked: false,

    setAudioUnlocked: (unlocked: boolean) => set({ audioUnlocked: unlocked }),

    unlockAudio: () => {
        if (typeof window !== "undefined" && !audioUnlocked) {
            try {
                audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                gain.gain.setValueAtTime(0.001, audioContext.currentTime);
                osc.start();
                osc.stop(audioContext.currentTime + 0.1);
                audioUnlocked = true;
                set({ audioUnlocked: true });
                console.log("[Audio] Web Audio API desbloqueada com sucesso!");
            } catch (e) {
                console.error("[Audio] Falha ao desbloquear Web Audio API:", e);
            }
        }
    },

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
            if (order.status === "READY" || order.status === "DELIVERY") return false;

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
                        // Toca o bipe via Web Audio API
                        playBeep();

                        // Busca pormenorizado do pedido com os itens (pois payload.new vem raso)
                        // DELAY DE TRANSAÇÃO (1 segundo): A internet envia o Order milisegundos antes do Order_Items,
                        // gerando uma Race Condition. Isso faz aguardar a tabela inteira selar antes de desenhar.
                        setTimeout(async () => {
                            const { data } = await supabase.from('orders').select(`
                                *,
                                order_items (
                                    id, name, quantity, unit_price, notes, extras,
                                    product:products ( name )
                                )
                            `).eq('id', next.id).single();

                            if (data) {
                                const st = get();
                                if (!st.orders.some(o => o.id === data.id)) {
                                    set({ orders: [data as Order, ...st.orders] });
                                    st.refreshDelays();
                                } else {
                                    // Fallback: se o polling já pegou sem itens, a gente atualiza repondo os itens.
                                    set((state) => ({
                                        orders: state.orders.map((o) =>
                                            o.id === data.id ? { ...o, order_items: data.order_items } : o
                                        )
                                    }));
                                }
                            }
                        }, 1500);
                    } else if (eventType === "UPDATE") {
                        if (next.status === "COMPLETED" || next.status === "CANCELLED") {
                            set({ orders: orders.filter((o) => o.id !== next.id) });
                        } else {
                            // Sync status directly or fetch if needed
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
            const supabase = createClient();
            supabase.removeChannel(channel);
            channel = null;
        }
    }
}));
