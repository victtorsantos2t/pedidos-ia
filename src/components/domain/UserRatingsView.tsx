"use client";

import { Star, ArrowLeft, MessageSquare, Clock, CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface UserRatingsViewProps {
    avaliadas: any[];
    pendentes: any[];
    userProfile?: any;
}

export function UserRatingsView({ avaliadas, pendentes, userProfile }: UserRatingsViewProps) {
    const userName = userProfile?.name || "Você";
    const userInitial = userProfile?.name?.charAt(0)?.toUpperCase() || "V";

    return (
        <div className="min-h-screen bg-[#f8f9fb] dark:bg-black pb-12 transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/90 dark:bg-black/90 backdrop-blur-xl px-5 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-4 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <Link href="/profile" className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors active:scale-95 shrink-0">
                        <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">Minhas Avaliações</h1>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">
                            {avaliadas.length} enviada{avaliadas.length !== 1 ? "s" : ""}
                            {pendentes.length > 0 && ` · ${pendentes.length} pendente${pendentes.length !== 1 ? "s" : ""}`}
                        </p>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto p-5 pt-6 space-y-8">
                {/* Pedidos pendentes */}
                {pendentes.length > 0 && (
                    <section className="space-y-3">
                        <h2 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                            Pedidos para avaliar
                        </h2>

                        <div className="space-y-2">
                            {pendentes.map((pedido) => (
                                <Link
                                    key={pedido.id}
                                    href={`/order/${pedido.id}`}
                                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-[#FA0000]/30 hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-9 w-9 rounded-full bg-[#FA0000]/10 flex items-center justify-center shrink-0">
                                            <ShoppingBag className="h-4 w-4 text-[#FA0000]" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">Pedido #{pedido.id_short}</p>
                                            <p className="text-[10px] font-medium text-gray-400">
                                                {formatDistanceToNow(new Date(pedido.created_at), { addSuffix: true, locale: ptBR })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#FA0000] shrink-0 group-hover:translate-x-0.5 transition-transform">
                                        Avaliar
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Histórico */}
                <section className="space-y-3">
                    <h2 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                        Histórico de avaliações
                    </h2>

                    {avaliadas.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800">
                            <MessageSquare className="h-8 w-8 text-gray-300 dark:text-gray-700 mb-3" />
                            <p className="text-sm font-semibold text-gray-400">Nenhuma avaliação enviada ainda</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800/60 overflow-hidden">
                            <AnimatePresence mode="popLayout">
                                {avaliadas.map((rating) => {
                                    const avg = Math.round((rating.product_rating + (rating.delivery_rating || 5)) / 2);

                                    return (
                                        <motion.div
                                            key={rating.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="px-4 py-3.5 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors"
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Avatar */}
                                                <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-[#FA0000] font-bold text-xs shrink-0 overflow-hidden">
                                                    {userProfile?.avatar_url ? (
                                                        <img src={userProfile.avatar_url} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span className="uppercase">{userInitial}</span>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                            {userName}
                                                        </span>
                                                        <div className="flex gap-px">
                                                            {[1, 2, 3, 4, 5].map(s => (
                                                                <Star key={s} className={cn(
                                                                    "h-3 w-3",
                                                                    s <= avg ? "fill-amber-400 text-amber-400" : "text-gray-200 dark:text-gray-700"
                                                                )} />
                                                            ))}
                                                        </div>
                                                        <span className="text-[9px] font-medium text-gray-400 bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded">
                                                            #{rating.order_id_short}
                                                        </span>
                                                        <span className="text-[10px] font-medium text-gray-400 ml-auto shrink-0">
                                                            {formatDistanceToNow(new Date(rating.created_at), { addSuffix: true, locale: ptBR })}
                                                        </span>
                                                    </div>

                                                    {/* Tags */}
                                                    {(rating.delivery_tags?.length > 0 || rating.product_tags?.length > 0) && (
                                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                                            {rating.delivery_tags?.map((tag: string) => (
                                                                <span key={tag} className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[9px] font-bold uppercase tracking-wide">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                            {rating.product_tags?.map((tag: string) => (
                                                                <span key={tag} className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-[9px] font-bold uppercase tracking-wide">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Comentário */}
                                                    {rating.comment && (
                                                        <p className="text-[13px] text-gray-600 dark:text-gray-400 mt-1.5 leading-snug line-clamp-2">
                                                            &quot;{rating.comment}&quot;
                                                        </p>
                                                    )}

                                                    {/* Resposta da loja */}
                                                    {rating.store_response && (
                                                        <div className="mt-2 pl-3 border-l-2 border-[#FA0000]/30">
                                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                                <CheckCircle className="h-3 w-3 text-[#FA0000]" />
                                                                <span className="text-[10px] font-bold text-[#FA0000]">Resposta do Restaurante</span>
                                                            </div>
                                                            <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-snug line-clamp-2">
                                                                {rating.store_response}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
