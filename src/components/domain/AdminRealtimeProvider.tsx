"use client";

import { useEffect, ReactNode, useRef } from "react";
import { useOrdersStore, playBeep } from "@/lib/ordersStore";
import { getActiveOrders } from "@/lib/actions/adminActions";

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
    const prevOrdersCount = useRef(initialOrders.length);
    const unlockAudio = useOrdersStore((s) => s.unlockAudio);

    useEffect(() => {
        // Inicializa o store
        setOrders(initialOrders);
        setSettings(storeSettings);
        subscribe();

        // 1. Timer de refresh de atraso (Urgency Detection)
        const delayInterval = setInterval(() => {
            refreshDelays();
        }, 15000);

        // 2. Fallback de Polling Híbrido:
        // Cobre falhas de Realtime em ambiente de Produção Vercel/Supabase 
        // e garante que a tela nunca fique estagnada
        const fallbackInterval = setInterval(async () => {
            try {
                const updatedOrders = await getActiveOrders();
                if (updatedOrders) {
                    setOrders(updatedOrders as any);
                    // Dispara som caso cheguem novos pedidos via polling (fallback sonoro)
                    if (updatedOrders.length > prevOrdersCount.current) {
                        tryPlayAudio();
                    }
                    prevOrdersCount.current = updatedOrders.length;
                }
            } catch (err) { }
        }, 20000);

        // 3. Alerta Recorrente para Pedidos Pendentes (NEW)
        // Se houver pedido em status NOVO, repete o som a cada 1 minuto
        const alertLoopInterval = setInterval(() => {
            const currentOrders = useOrdersStore.getState().orders;
            const hasNewPendingOrders = currentOrders.some(o => o.status === "NEW");
            if (hasNewPendingOrders) {
                tryPlayAudio();
            }
        }, 60000);

        return () => {
            unsubscribe();
            clearInterval(delayInterval);
            clearInterval(fallbackInterval);
            clearInterval(alertLoopInterval);
        };
    }, [initialOrders, storeSettings, setOrders, setSettings, subscribe, unsubscribe, refreshDelays]);

    const tryPlayAudio = () => {
        playBeep();
    };

    // Efeito para som de alerta de atraso (Urgent Orders)
    useEffect(() => {
        if (delayedCount > prevDelayedCount.current) {
            tryPlayAudio();
        }
        prevDelayedCount.current = delayedCount;
    }, [delayedCount]);

    return (
        <>
            {children}
        </>
    );
}
