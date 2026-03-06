"use client";

import { useEffect, useState } from "react";
import { getDashboardMetrics } from "@/lib/actions/adminMetricsActions";
import { ShoppingBag, DollarSign, TrendingUp, Star, ArrowUpRight } from "lucide-react";
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
                <div key={i} className="h-[132px] bg-white dark:bg-gray-900 animate-pulse rounded-2xl border border-gray-200 dark:border-gray-800" />
            ))}
        </div>
    );

    if (!metrics) return null;

    const fmt = (v: number) =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

    const cards = [
        {
            id: "orders",
            label: "Pedidos Hoje",
            sub: `${metrics.completedOrders} concluídos`,
            value: metrics.totalOrders.toString(),
            icon: ShoppingBag,
            iconBg: "bg-blue-50 dark:bg-blue-950/30",
            iconColor: "text-blue-600 dark:text-blue-400",
            highlight: true,
        },
        {
            id: "revenue",
            label: "Faturamento",
            sub: "receita do dia",
            value: fmt(metrics.revenue),
            icon: DollarSign,
            iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
            iconColor: "text-emerald-600 dark:text-emerald-400",
        },
        {
            id: "avg",
            label: "Ticket Médio",
            sub: "por pedido",
            value: fmt(metrics.avgOrderValue),
            icon: TrendingUp,
            iconBg: "bg-orange-50 dark:bg-orange-950/30",
            iconColor: "text-orange-600 dark:text-orange-400",
        },
        {
            id: "rating",
            label: "Nota Média",
            sub: metrics.ratingStats?.total ? `${metrics.ratingStats.total} avaliações` : "sem dados",
            value: metrics.ratingStats?.averageProduct > 0
                ? metrics.ratingStats.averageProduct.toFixed(1)
                : "—",
            icon: Star,
            iconBg: "bg-amber-50 dark:bg-amber-950/30",
            iconColor: "text-amber-600 dark:text-amber-400",
            isRating: true,
            ratingValue: metrics.ratingStats?.averageProduct ?? 0,
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, idx) => (
                <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                        "relative rounded-2xl p-5 overflow-hidden border transition-all duration-200 hover:-translate-y-0.5 group cursor-default",
                        "bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800",
                        "hover:shadow-lg hover:shadow-gray-200/60 dark:hover:shadow-black/30 hover:border-gray-300 dark:hover:border-gray-700",
                        card.highlight && "border-l-[3px] border-l-[#FA0000]"
                    )}
                >
                    {/* Topo: icon + badge */}
                    <div className="flex items-center justify-between mb-5">
                        <div className={cn(
                            "h-9 w-9 rounded-xl flex items-center justify-center",
                            card.iconBg
                        )}>
                            <card.icon className={cn("h-[18px] w-[18px]", card.iconColor)} />
                        </div>
                        {card.highlight && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                                <ArrowUpRight className="h-3 w-3" />
                                Hoje
                            </span>
                        )}
                    </div>

                    {/* Número — máximo destaque */}
                    <p className={cn(
                        "font-extrabold tracking-tight leading-none tabular-nums text-gray-900 dark:text-white mb-1.5",
                        card.value.length > 10 ? "text-xl" : card.value.length > 6 ? "text-2xl" : "text-3xl"
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
                                        "h-3 w-3",
                                        s <= Math.round(card.ratingValue!)
                                            ? "fill-amber-400 text-amber-400"
                                            : "text-gray-200 dark:text-gray-700"
                                    )}
                                />
                            ))}
                        </div>
                    )}

                    {/* Label (forte) */}
                    <p className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 leading-tight">
                        {card.label}
                    </p>
                    {/* Sub (info complementar) */}
                    {card.sub && (
                        <p className="text-[11px] mt-0.5 font-medium text-gray-500 dark:text-gray-500">
                            {card.sub}
                        </p>
                    )}
                </motion.div>
            ))}
        </div>
    );
}
