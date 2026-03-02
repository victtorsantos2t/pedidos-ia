"use client";

import { useEffect, ReactNode, useRef } from "react";
import { useOrdersStore } from "@/lib/ordersStore";

interface AdminRealtimeProviderProps {
    children: ReactNode;
    initialOrders: any[];
    storeSettings: any;
}

export function AdminRealtimeProvider({
    children,
    initialOrders,
    storeSettings,
}: AdminRealtimeProviderProps) {
    const setOrders = useOrdersStore((s) => s.setOrders);
    const setSettings = useOrdersStore((s) => s.setStoreSettings);
    const subscribe = useOrdersStore((s) => s.subscribe);
    const unsubscribe = useOrdersStore((s) => s.unsubscribe);
    const refreshDelays = useOrdersStore((s) => s.refreshDelays);
    const delayedCount = useOrdersStore((s) => s.delayedOrdersCount);
    const prevDelayedCount = useRef(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const DELAY_SOUND = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTdvT18AAAAA"; // Diferente do normal (TODO: URL real)

    useEffect(() => {
        audioRef.current = new Audio("/urgent.mp3");

        // Inicializa o store com dados do servidor
        setOrders(initialOrders);
        setSettings(storeSettings);
        subscribe();

        // Timer de refresh de atraso (Urgency Detection)
        const delayInterval = setInterval(() => {
            refreshDelays();
        }, 15000);

        return () => {
            unsubscribe();
            clearInterval(delayInterval);
        };
    }, [initialOrders, storeSettings, setOrders, setSettings, subscribe, unsubscribe, refreshDelays]);

    // Efeito para som de alerta de atraso
    useEffect(() => {
        if (delayedCount > prevDelayedCount.current) {
            // Um novo pedido entrou em atraso!
            if (audioRef.current) {
                audioRef.current.play().catch(() => {
                    new Audio(DELAY_SOUND).play().catch(() => { });
                });
            }
        }
        prevDelayedCount.current = delayedCount;
    }, [delayedCount]);

    return <>{children}</>;
}
