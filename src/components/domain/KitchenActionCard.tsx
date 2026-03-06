"use client";

import { useEffect } from "react";
import { useOrdersStore } from "@/lib/ordersStore";
import { ChefHat, ArrowRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export function KitchenActionCard({ initialOrders }: { initialOrders: any[] }) {
    const orders = useOrdersStore(s => s.orders);
    const setOrders = useOrdersStore(s => s.setOrders);
    const subscribeStore = useOrdersStore(s => s.subscribe);
    const unsubscribeStore = useOrdersStore(s => s.unsubscribe);
    const delayedCount = useOrdersStore(s => s.delayedOrdersCount);
    const refreshDelays = useOrdersStore(s => s.refreshDelays);

    useEffect(() => {
        setOrders(initialOrders);
        refreshDelays();
        subscribeStore();
        return () => unsubscribeStore();
    }, [initialOrders, setOrders, subscribeStore, unsubscribeStore, refreshDelays]);

    const newOrders = orders.filter(o => o.status === "NEW").length;
    const preparing = orders.filter(o => o.status === "PREPARING").length;
    const ready = orders.filter(o => o.status === "READY").length;
    const activeTotal = newOrders + preparing + ready;

    const stats = [
        { label: "Novos", value: newOrders, color: "text-blue-400" },
        { label: "Preparo", value: preparing, color: "text-amber-400" },
        { label: "Prontos", value: ready, color: "text-emerald-400" },
    ];

    return (
        <a
            href="/admin/orders"
            className="group relative overflow-hidden rounded-2xl bg-gray-900 dark:bg-[#0c0c0c] border border-gray-800 p-6 flex flex-col justify-between min-h-[210px] hover:border-[#FA0000]/40 transition-all duration-300 hover:shadow-2xl hover:shadow-black/30 hover:-translate-y-0.5 cursor-pointer"
        >
            {/* Glow hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FA0000]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block mb-1">Canal de Preparo</span>
                        <h3 className="text-xl font-black text-white tracking-tight">Cozinha</h3>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-[#FA0000]/10 border border-[#FA0000]/20 flex items-center justify-center text-[#FA0000] shrink-0 group-hover:bg-[#FA0000] group-hover:text-white transition-all duration-300">
                        <ChefHat className="h-5 w-5" />
                    </div>
                </div>

                {/* Contadores por status */}
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                    {stats.map((s) => (
                        <div key={s.label} className="bg-white/5 dark:bg-white/3 rounded-xl p-3 text-center border border-white/5">
                            <p className={`text-2xl font-black tabular-nums leading-none mb-1 ${s.color}`}>{s.value}</p>
                            <p className="text-[9px] font-semibold text-gray-600 uppercase tracking-wide">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Alerta de atraso */}
                {delayedCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 bg-[#FA0000]/10 border border-[#FA0000]/25 rounded-xl px-3 py-2"
                    >
                        <AlertCircle className="h-3.5 w-3.5 text-[#FA0000] shrink-0 animate-pulse" />
                        <span className="text-xs font-semibold text-[#FA0000]">
                            {delayedCount} pedido{delayedCount > 1 ? "s" : ""} em atraso
                        </span>
                    </motion.div>
                )}
            </div>

            {/* Footer */}
            <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/5 mt-4">
                <span className="text-sm font-medium text-gray-500 group-hover:text-gray-300 transition-colors">
                    {activeTotal > 0 ? `${activeTotal} ativo${activeTotal > 1 ? "s" : ""}` : "Sem pedidos ativos"}
                </span>
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#FA0000]">Abrir Kanban</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#FA0000] group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </a>
    );
}
