"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Clock, Package, ChefHat, MapPin, CheckCircle2, XCircle, ShoppingBag, RotateCcw, Star, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/services/catalogService";

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
    NEW: { label: "Novo", color: "bg-blue-100 text-blue-700", icon: Clock },
    PREPARING: { label: "Preparando", color: "bg-amber-100 text-amber-700", icon: ChefHat },
    READY: { label: "Pronto", color: "bg-green-100 text-green-700", icon: Package },
    DELIVERY: { label: "Em Rota", color: "bg-purple-100 text-purple-700", icon: MapPin },
    COMPLETED: { label: "Concluído", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
    CANCELLED: { label: "Cancelado", color: "bg-red-100 text-red-700", icon: XCircle },
};

export function MyOrdersList({ orders }: { orders: any[] }) {
    const [filter, setFilter] = useState<"ongoing" | "history">("ongoing");
    const [reorderingId, setReorderingId] = useState<string | null>(null);
    const router = useRouter();
    const addItem = useCartStore((state) => state.addItem);

    const handleReorder = (order: any) => {
        setReorderingId(order.id);

        // Simular um breve loading para feedback visual
        setTimeout(() => {
            order.order_items?.forEach((item: any) => {
                const product: Product = {
                    id: item.product_id,
                    name: item.product.name,
                    price: item.unit_price,
                    image_url: item.product.image_url,
                    category_id: "", // Não temos aqui mas o cartStore aceita
                    is_available: true,
                    description: ""
                };

                const extras = item.extras || [];
                addItem(product, item.quantity, extras, item.notes || "");
            });

            setReorderingId(null);
            router.push("/"); // Volta para o cardápio
        }, 600);
    };

    const ongoingStats = orders.filter((o) => !["COMPLETED", "CANCELLED"].includes(o.status));
    const historyStats = orders.filter((o) => ["COMPLETED", "CANCELLED"].includes(o.status));

    const filtered = filter === "ongoing" ? ongoingStats : historyStats;

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-black pb-10 transition-colors duration-500">
            {/* Header — Somente Navegação */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800/50 pt-[calc(env(safe-area-inset-top,0px)+8px)]">
                <div className="flex items-center h-16 px-4 max-w-lg mx-auto gap-4">
                    <Link href="/profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-90 shrink-0">
                        <ArrowLeft className="h-4 w-4 text-foreground" />
                    </Link>
                    <h1 className="text-base font-black uppercase italic tracking-tighter text-foreground">
                        Meus Pedidos
                    </h1>
                </div>

                {/* Barra de Abas abaixo do Header */}
                <div className="max-w-lg mx-auto flex border-t border-gray-100 dark:border-gray-800">
                    {([
                        { key: "ongoing", label: "Em Andamento" },
                        { key: "history", label: "Histórico" },
                    ] as const).map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className="relative flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-colors duration-300"
                        >
                            <span className={filter === tab.key ? "text-brand" : "text-gray-400"}>
                                {tab.label}
                            </span>
                            {filter === tab.key && (
                                <motion.div
                                    layoutId="tab-underline-orders"
                                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand rounded-t-full"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </header>

            <main className="max-w-lg mx-auto p-4 space-y-6 pt-8">
                {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm opacity-60">
                        <div className="h-16 w-16 bg-gray-50 dark:bg-black rounded-full flex items-center justify-center mb-6">
                            <Package className="h-8 w-8 text-gray-200" />
                        </div>
                        <p className="text-sm font-bold uppercase italic tracking-tighter text-gray-400">Nenhum pedido nesta aba</p>
                    </div>
                )}

                <div className="space-y-6">
                    {filtered.map((order, i) => {
                        const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.NEW;
                        const StatusIcon = statusInfo.icon;
                        const itemCount = order.order_items?.reduce((acc: number, it: any) => acc + it.quantity, 0) || 0;
                        const firstProduct = order.order_items?.[0]?.product;
                        const isCompleted = order.status === "COMPLETED";

                        return (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/5 dark:shadow-none space-y-5"
                            >
                                {/* Order Header */}
                                <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-300">#</span>
                                        <span>Pedido {order.id.slice(0, 6)}</span>
                                    </div>
                                    <div className={`flex items-center gap-1.5 ${isCompleted ? "text-emerald-500" : "text-brand"} italic`}>
                                        <StatusIcon className="h-3 w-3" />
                                        {statusInfo.label}
                                    </div>
                                    <span className="text-gray-300 font-medium">
                                        {new Date(order.created_at).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short' })}
                                    </span>
                                </div>

                                <div className="h-px bg-gray-50 dark:bg-gray-800/50" />

                                {/* Product Info */}
                                <Link href={`/order/${order.id}`} className="flex items-center gap-5 group">
                                    <div className="h-20 w-20 rounded-xl bg-gray-50 dark:bg-black overflow-hidden border border-gray-100 dark:border-gray-800 shadow-inner shrink-0">
                                        {firstProduct?.image_url ? (
                                            <img src={firstProduct.image_url} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-gray-200">
                                                <ShoppingBag className="h-8 w-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <h3 className="text-lg font-black text-foreground italic uppercase tracking-tighter leading-tight">RDOS Restaurante</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                            {itemCount} {itemCount === 1 ? 'item' : 'itens'} â€¢ {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.total_amount)}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 font-medium">
                                            {order.order_items?.map((it: any) => it.product?.name).filter(Boolean).join(", ")}
                                        </p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-200 group-hover:text-brand group-hover:translate-x-1 transition-all" />
                                </Link>

                                {/* Actions */}
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    {isCompleted ? (
                                        <>
                                            <Link
                                                href={`/profile/ratings`}
                                                className="flex items-center justify-center gap-2 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 text-[10px] font-extrabold uppercase italic tracking-widest text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-700 shadow-sm"
                                            >
                                                <Star className="h-3.5 w-3.5 fill-gray-500" />
                                                Avaliar
                                            </Link>
                                            <button
                                                onClick={() => handleReorder(order)}
                                                disabled={!!reorderingId}
                                                className="flex items-center justify-center gap-2 h-12 rounded-xl bg-brand text-white text-[10px] font-extrabold uppercase italic tracking-widest shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                                            >
                                                {reorderingId === order.id ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <RotateCcw className="h-3.5 w-3.5" />
                                                )}
                                                Refazer
                                            </button>
                                        </>
                                    ) : (
                                        <Link
                                            href={`/order/${order.id}`}
                                            className="col-span-2 flex items-center justify-center gap-2 h-12 rounded-xl bg-brand text-white text-[10px] font-extrabold uppercase italic tracking-widest shadow-lg shadow-brand/20 hover:scale-[1.01] active:scale-95 transition-all"
                                        >
                                            <Clock className="h-4 w-4" />
                                            Acompanhar Pedido
                                        </Link>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
