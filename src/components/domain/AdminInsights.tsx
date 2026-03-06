"use client";

import { useOrdersStore } from "@/lib/ordersStore";
import { TrendingUp, AlertCircle, Star, ChefHat, Package, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type MetricsData = {
    revenue: number;
    totalOrders: number;
    avgOrderValue: number;
    ratingStats?: { averageProduct: number; total: number };
} | null;

export function AdminInsights({ metrics }: { metrics: MetricsData }) {
    const delayedCount = useOrdersStore(s => s.delayedOrdersCount);
    const orders = useOrdersStore(s => s.orders);

    const newOrders = orders.filter(o => o.status === "NEW").length;
    const activeOrders = orders.filter(o => ["NEW", "PREPARING", "READY"].includes(o.status)).length;

    const fmt = (v: number) =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

    type InsightType = "critical" | "warning" | "success" | "info";

    const insights: { icon: any; text: string; type: InsightType }[] = [];

    if (delayedCount > 0) {
        insights.push({
            icon: AlertCircle,
            text: `${delayedCount} pedido${delayedCount > 1 ? "s" : ""} em atraso crítico`,
            type: "critical",
        });
    }

    if (newOrders > 2) {
        insights.push({
            icon: ChefHat,
            text: `${newOrders} pedidos aguardando a cozinha`,
            type: "warning",
        });
    }

    if (metrics?.revenue && metrics.revenue > 0) {
        insights.push({
            icon: TrendingUp,
            text: `Faturamento de ${fmt(metrics.revenue)} registrado hoje`,
            type: "info",
        });
    }

    if (metrics?.avgOrderValue && metrics.avgOrderValue > 0) {
        insights.push({
            icon: Package,
            text: `Ticket médio de ${fmt(metrics.avgOrderValue)} por pedido`,
            type: "info",
        });
    }

    if (metrics?.ratingStats?.averageProduct && metrics.ratingStats.averageProduct > 0) {
        const rating = metrics.ratingStats.averageProduct;
        const total = metrics.ratingStats.total;
        insights.push({
            icon: Star,
            text: `Nota ${rating.toFixed(1)}★ com ${total} avaliação${total > 1 ? "ões" : ""}`,
            type: rating >= 4.5 ? "success" : rating >= 3.5 ? "info" : "warning",
        });
    }

    if (activeOrders > 0 && delayedCount === 0) {
        insights.push({
            icon: Package,
            text: `${activeOrders} pedido${activeOrders > 1 ? "s" : ""} em produção agora`,
            type: "success",
        });
    }

    const typeConfig: Record<InsightType, { bg: string; text: string }> = {
        critical: { bg: "bg-red-100 dark:bg-red-950/40", text: "text-[#FA0000]" },
        warning: { bg: "bg-amber-100 dark:bg-amber-950/30", text: "text-amber-600 dark:text-amber-400" },
        success: { bg: "bg-emerald-100 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400" },
        info: { bg: "bg-gray-100 dark:bg-gray-900", text: "text-gray-500 dark:text-gray-400" },
    };

    return (
        <div className="rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 dark:border-gray-900">
                <div className="h-7 w-7 rounded-lg bg-[#FA0000]/10 flex items-center justify-center">
                    <Zap className="h-3.5 w-3.5 text-[#FA0000]" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Insights</h3>
                <span className="ml-auto text-[10px] font-semibold text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded-full">
                    Agora
                </span>
            </div>

            {insights.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center">
                        <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center mx-auto mb-3">
                            <Zap className="h-5 w-5 text-gray-300" />
                        </div>
                        <p className="text-xs text-gray-400">Carregando insights...</p>
                    </div>
                </div>
            ) : (
                <div className="flex-1 divide-y divide-gray-50 dark:divide-gray-900">
                    {insights.slice(0, 5).map((insight, i) => {
                        const cfg = typeConfig[insight.type];
                        const Icon = insight.icon;
                        return (
                            <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                                <div className={cn("h-6 w-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5", cfg.bg)}>
                                    <Icon className={cn("h-3.5 w-3.5", cfg.text)} />
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{insight.text}</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer dica */}
            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/30">
                <p className="text-[10px] text-gray-400 leading-relaxed">
                    💡 Responder feedbacks em menos de 2h melhora o NPS.
                </p>
            </div>
        </div>
    );
}
