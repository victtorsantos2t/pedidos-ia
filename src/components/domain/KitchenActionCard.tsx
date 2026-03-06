"use client";

import { useEffect } from "react";
import { useOrdersStore } from "@/lib/ordersStore";
import { ChefHat, ArrowRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
        { label: "Novos", value: newOrders, bg: "bg-blue-50 dark:bg-blue-950/30", color: "text-blue-600 dark:text-blue-400", border: "border-blue-100 dark:border-blue-900/40" },
        { label: "Preparo", value: preparing, bg: "bg-amber-50 dark:bg-amber-950/30", color: "text-amber-600 dark:text-amber-400", border: "border-amber-100 dark:border-amber-900/40" },
        { label: "Prontos", value: ready, bg: "bg-emerald-50 dark:bg-emerald-950/30", color: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-100 dark:border-emerald-900/40" },
    ];

    return (
        <a
            href="/admin/orders"
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-950 border-2 border-[#FA0000]/20 p-6 flex flex-col justify-between min-h-[210px] hover:border-[#FA0000]/50 transition-all duration-200 hover:shadow-xl hover:shadow-[#FA0000]/5 hover:-translate-y-0.5 cursor-pointer"
        >
            {/* Topo vermelho sutil */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FA0000] via-[#FA0000]/80 to-transparent" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1">Canal de Preparo</span>
                        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Cozinha</h3>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-[#FA0000]/10 flex items-center justify-center text-[#FA0000] shrink-0 group-hover:bg-[#FA0000] group-hover:text-white transition-all duration-200">
                        <ChefHat className="h-5 w-5" />
                    </div>
                </div>

                {/* Contadores — KPIs coloridos */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {stats.map((s) => (
                        <div key={s.label} className={cn("rounded-xl p-3 text-center border", s.bg, s.border)}>
                            <p className={cn("text-2xl font-extrabold tabular-nums leading-none mb-1", s.color)}>{s.value}</p>
                            <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Alerta de atraso */}
                {delayedCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl px-3 py-2"
                    >
                        <AlertCircle className="h-3.5 w-3.5 text-[#FA0000] shrink-0 animate-pulse" />
                        <span className="text-xs font-bold text-[#FA0000]">
                            {delayedCount} pedido{delayedCount > 1 ? "s" : ""} em atraso
                        </span>
                    </motion.div>
                )}
            </div>

            {/* Footer */}
            <div className="relative z-10 flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 mt-4">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
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
