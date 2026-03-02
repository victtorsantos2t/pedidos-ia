"use client";

import { useEffect, ReactNode, useRef, useState } from "react";
import { useOrdersStore } from "@/lib/ordersStore";
import { getActiveOrders } from "@/lib/actions/adminActions";
import { BellRing, BellOff } from "lucide-react";

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
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [audioEnabled, setAudioEnabled] = useState(false);

    useEffect(() => {
        audioRef.current = new Audio("/urgent.mp3");

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

        return () => {
            unsubscribe();
            clearInterval(delayInterval);
            clearInterval(fallbackInterval);
        };
    }, [initialOrders, storeSettings, setOrders, setSettings, subscribe, unsubscribe, refreshDelays]);

    const tryPlayAudio = () => {
        if (!audioEnabled) return;
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => console.log("Áudio bloqueado pelo navegador."));
        }
    };

    // Efeito para som de alerta de atraso (Urgent Orders)
    useEffect(() => {
        if (delayedCount > prevDelayedCount.current) {
            tryPlayAudio();
        }
        prevDelayedCount.current = delayedCount;
    }, [delayedCount]);

    const handleEnableAudio = () => {
        setAudioEnabled(true);
        // Toca num volume imperceptível para furar o bloqueio de AutoPlay do DOM
        if (audioRef.current) {
            audioRef.current.volume = 0.01;
            audioRef.current.play().then(() => {
                setTimeout(() => { if (audioRef.current) audioRef.current.volume = 1; }, 500);
            }).catch(() => { });
        }
    };

    return (
        <>
            {!audioEnabled && (
                <div className="fixed top-4 right-4 z-50 bg-red-600/90 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-md cursor-pointer hover:bg-red-700 transition-all animate-bounce" onClick={handleEnableAudio}>
                    <BellOff className="w-5 h-5 animate-pulse" />
                    <span className="text-sm font-bold tracking-tight">Habilitar Alerta Sonoro</span>
                </div>
            )}
            {children}
        </>
    );
}
