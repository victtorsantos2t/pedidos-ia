"use client";

import { useEffect, useState } from "react";
import { getDashboardMetrics } from "@/lib/actions/adminMetricsActions";
import { Card, CardContent } from "@/components/core/Card";
import { TrendingUp, ShoppingBag, DollarSign, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminMetrics() {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            const data = await getDashboardMetrics();
            if (data) setMetrics(data);
            setLoading(false);
        }
        fetch();

        const interval = setInterval(fetch, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />
            ))}
        </div>
    );

    if (!metrics) return null;

    const items = [
        { label: "Faturamento Hoje", value: `R$ ${metrics.revenue.toFixed(2)}`, icon: DollarSign, brand: true },
        { label: "Pedidos Hoje", value: metrics.totalOrders, icon: ShoppingBag, brand: false },
        { label: "Ticket Médio", value: `R$ ${metrics.avgOrderValue.toFixed(2)}`, icon: TrendingUp, brand: false },
        { label: "Nota Média", value: metrics.ratingStats?.averageProduct > 0 ? `${metrics.ratingStats.averageProduct}` : "--", icon: Star, brand: true },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {items.map((item, idx) => {
                const isRevenue = idx === 0;

                return (
                    <Card
                        key={idx}
                        className={cn(
                            "border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900/40 rounded-xl overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:border-[#FA0000]/30 hover:shadow-xl hover:shadow-red-500/5",
                            isRevenue && "md:col-span-2 lg:col-span-1 border-l-4 border-l-[#FA0000]"
                        )}
                    >
                        <CardContent className="p-6 flex flex-col gap-4">
                            <div className="flex items-center justify-between w-full">
                                <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110",
                                    item.brand
                                        ? "bg-red-50 dark:bg-red-950/30 text-[#FA0000]"
                                        : "bg-gray-50 dark:bg-gray-900 text-gray-400 group-hover:text-[#FA0000] group-hover:bg-red-50 transition-colors"
                                )}>
                                    <item.icon className="h-5 w-5" />
                                </div>
                                {isRevenue && (
                                    <span className="text-[10px] font-black text-[#FA0000] bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded-full uppercase tracking-widest italic">
                                        Principal
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col">
                                <p className="text-xs font-bold text-gray-500 tracking-widest mb-1">
                                    {item.label}
                                </p>
                                <h3 className={cn(
                                    "font-bold text-gray-900 dark:text-white tracking-tight leading-none group-hover:text-[#FA0000] transition-colors",
                                    isRevenue ? "text-4xl" : "text-3xl"
                                )}>
                                    {item.value}
                                </h3>

                                {idx === 3 && metrics.ratingStats?.total > 0 && (
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star key={s} className={cn("h-2.5 w-2.5", s <= Math.round(metrics.ratingStats.averageProduct) ? "fill-[#FA0000] text-[#FA0000]" : "text-gray-100 dark:text-gray-800")} />
                                            ))}
                                        </div>
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                                            {metrics.ratingStats.total} Feedbacks
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div >
    );
}
