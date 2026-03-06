"use client";

import { useEffect, useState } from "react";
import { getDashboardMetrics } from "@/lib/actions/adminMetricsActions";
import { ShoppingBag, DollarSign, TrendingUp, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type Metrics = Awaited<ReturnType<typeof getDashboardMetrics>>;

export function AdminMetrics({ onMetricsLoaded }: { onMetricsLoaded?: (m: Metrics) => void }) {
    const [metrics, setMetrics] = useState<Metrics>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const data = await getDashboardMetrics();
            if (data) {
                setMetrics(data);
                onMetricsLoaded?.(data);
            }
            setLoading(false);
        }
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [onMetricsLoaded]);

    if (loading) return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-[120px] bg-gray-100 dark:bg-gray-900 animate-pulse rounded-2xl" />
            ))}
        </div>
    );

    if (!metrics) return null;

    const fmt = (v: number) =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

    // Ordem de prioridade: pedidos, receita, ticket, nota
    const cards = [
        {
            id: "orders",
            label: "Pedidos Hoje",
            sub: `${metrics.completedOrders} concluídos`,
            value: metrics.totalOrders.toString(),
            icon: ShoppingBag,
            dark: true, // card principal escuro
        },
        {
            id: "revenue",
            label: "Faturamento",
            sub: "hoje",
            value: fmt(metrics.revenue),
            icon: DollarSign,
            dark: false,
            accent: true, // borda vermelha esquerda
        },
        {
            id: "avg",
            label: "Ticket Médio",
            sub: "por pedido",
            value: fmt(metrics.avgOrderValue),
            icon: TrendingUp,
            dark: false,
        },
        {
            id: "rating",
            label: "Nota Média",
            sub: metrics.ratingStats?.total ? `${metrics.ratingStats.total} avaliações` : "sem dados",
            value: metrics.ratingStats?.averageProduct > 0
                ? metrics.ratingStats.averageProduct.toFixed(1)
                : "—",
            icon: Star,
            dark: false,
            isRating: true,
            ratingValue: metrics.ratingStats?.averageProduct ?? 0,
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, idx) => (
                <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                        "relative rounded-2xl p-5 overflow-hidden border transition-all duration-300 hover:-translate-y-0.5 group cursor-default",
                        card.dark
                            ? "bg-gray-900 dark:bg-[#0c0c0c] border-gray-800 hover:border-gray-700 hover:shadow-xl hover:shadow-black/20"
                            : card.accent
                                ? "bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 hover:border-[#FA0000]/30 hover:shadow-lg hover:shadow-[#FA0000]/5 border-l-4 border-l-[#FA0000]"
                                : "bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg hover:shadow-gray-100/80 dark:hover:shadow-black/30"
                    )}
                >
                    {/* Icon topo */}
                    <div className="flex items-start justify-between mb-4">
                        <div className={cn(
                            "h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                            card.dark
                                ? "bg-white/10 text-white"
                                : "bg-gray-100 dark:bg-gray-900 text-gray-400 group-hover:bg-[#FA0000]/10 group-hover:text-[#FA0000]"
                        )}>
                            <card.icon className="h-4 w-4" />
                        </div>
                    </div>

                    {/* Número principal — elemento mais forte */}
                    <p className={cn(
                        "font-black tracking-tight leading-none tabular-nums mb-1",
                        card.dark ? "text-white" : "text-gray-900 dark:text-white",
                        card.value.length > 8 ? "text-2xl" : "text-3xl"
                    )}>
                        {card.value}
                    </p>

                    {/* Estrelinhas para rating */}
                    {card.isRating && card.ratingValue > 0 && (
                        <div className="flex gap-0.5 mb-1.5">
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star
                                    key={s}
                                    className={cn(
                                        "h-2.5 w-2.5",
                                        s <= Math.round(card.ratingValue!)
                                            ? "fill-[#FA0000] text-[#FA0000]"
                                            : "text-gray-200 dark:text-gray-800"
                                    )}
                                />
                            ))}
                        </div>
                    )}

                    {/* Label e sub */}
                    <p className={cn(
                        "text-xs font-semibold leading-tight",
                        card.dark ? "text-gray-400" : "text-gray-600 dark:text-gray-400"
                    )}>
                        {card.label}
                    </p>
                    {card.sub && (
                        <p className={cn(
                            "text-[10px] mt-0.5 font-medium",
                            card.dark ? "text-gray-600" : "text-gray-400 dark:text-gray-600"
                        )}>
                            {card.sub}
                        </p>
                    )}
                </motion.div>
            ))}
        </div>
    );
}
