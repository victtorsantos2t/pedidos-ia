"use client";

import { Star, ArrowLeft, MessageSquare, Clock, CheckCircle, ShoppingBag, Heart, Flag, ArrowRight } from "lucide-react";
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
    const userInitial = userProfile?.name?.charAt(0) || "U";

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-black pb-12 transition-colors duration-500">
            {/* Header Elite - Sticky Glassmorphism */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/90 backdrop-blur-2xl px-6 pt-[calc(env(safe-area-inset-top,0px)+24px)] pb-6 border-b border-gray-100 dark:border-gray-800/50">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/profile" className="mr-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:text-[#FA0000] transition-all active:scale-95 shadow-sm group">
                            <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-[#2A2A2A] dark:text-white uppercase tracking-tighter italic leading-none">Meus Feedbacks</h1>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.25em] mt-3 opacity-60">
                                Sua <span className="text-[#FA0000]">Voz</span> importa
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto p-6 pt-10 space-y-16">
                {/* Oportunidades de Feedback */}
                {pendentes.length > 0 && (
                    <div className="space-y-8">
                        <div className="flex items-end justify-between px-2">
                            <div className="space-y-1">
                                <h2 className="text-[10px] font-black text-[#FA0000] uppercase tracking-[0.3em] italic">Nova Oportunidade</h2>
                                <p className="text-2xl font-black text-[#2A2A2A] dark:text-white italic uppercase tracking-tighter">Pedidos para avaliar</p>
                            </div>
                            <div className="bg-[#FA0000] text-white px-5 py-2 rounded-xl shadow-xl shadow-red-500/20 font-black text-xs italic">
                                {pendentes.length}
                            </div>
                        </div>

                        <div className="grid gap-5">
                            {pendentes.map((pedido) => (
                                <Link
                                    key={pedido.id}
                                    href={`/order/${pedido.id}`}
                                    className="block p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 rounded-xl relative overflow-hidden group hover:border-[#FA0000]/30 hover:shadow-2xl hover:shadow-red-500/5 transition-all duration-500 shadow-sm"
                                >
                                    <div className="flex justify-between items-center relative z-10">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-black text-[#2A2A2A]/30 dark:text-white/30 tracking-widest uppercase italic">Pedido #{pedido.id_short}</span>
                                                <span className="h-1 w-1 rounded-full bg-gray-200" />
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                                                    {formatDistanceToNow(new Date(pedido.created_at), { addSuffix: true, locale: ptBR })}
                                                </p>
                                            </div>
                                            <p className="text-2xl font-black italic tracking-tighter text-[#2A2A2A] dark:text-white group-hover:translate-x-2 transition-transform duration-500">O que você achou?</p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-[#FA0000] text-white px-8 py-4 rounded-xl shadow-xl shadow-red-500/10 hover:scale-105 transition-all active:scale-95 group-hover:shadow-red-500/30">
                                            <span className="text-[10px] font-black uppercase italic tracking-[0.2em]">Avaliar</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <ShoppingBag className="absolute -right-8 -bottom-8 h-32 w-32 text-[#FA0000] opacity-[0.03] dark:opacity-[0.05] group-hover:rotate-12 transition-transform duration-700" />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Histórico */}
                <div className="space-y-10">
                    <div className="flex items-center gap-4 px-2">
                        <div className="h-2 w-12 bg-[#FA0000] rounded-full" />
                        <div>
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Histórico</h2>
                            <p className="text-2xl font-black text-[#2A2A2A] dark:text-white italic uppercase tracking-tighter">Avaliações Enviadas</p>
                        </div>
                    </div>

                    {avaliadas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-100 dark:border-gray-800 shadow-sm opacity-60">
                            <MessageSquare className="h-16 w-16 text-gray-200 mb-6" />
                            <p className="text-sm font-black uppercase italic tracking-widest text-gray-400">Nenhum feedback registrado ainda</p>
                        </div>
                    ) : (
                        <div className="space-y-10 pb-12">
                            <AnimatePresence mode="popLayout">
                                {avaliadas.map((rating) => {
                                    const averageRating = Math.round((rating.product_rating + (rating.delivery_rating || 5)) / 2);

                                    return (
                                        <motion.div
                                            key={rating.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:border-[#FA0000]/20 transition-all duration-500 relative group overflow-hidden"
                                        >
                                            {/* Header: Avatar + Info */}
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-full bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-[#FA0000] font-black text-sm border border-gray-100 dark:border-gray-800 overflow-hidden shrink-0 shadow-inner">
                                                        {rating.profiles?.avatar_url ? (
                                                            <img src={rating.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <span className="uppercase italic">{rating.profiles?.name?.charAt(0) || userInitial}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="text-sm font-black text-[#2A2A2A] dark:text-white leading-none uppercase italic tracking-tight">
                                                                {rating.profiles?.name || userName}
                                                            </h4>
                                                            <div className="flex gap-0.5">
                                                                {[1, 2, 3, 4, 5].map((s) => (
                                                                    <Star
                                                                        key={s}
                                                                        className={cn(
                                                                            "h-2.5 w-2.5 transition-all text-[#FA0000]",
                                                                            s <= averageRating ? "fill-[#FA0000]" : "text-gray-100 dark:text-gray-800 fill-transparent"
                                                                        )}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2 opacity-60">
                                                            {formatDistanceToNow(new Date(rating.created_at), { addSuffix: true, locale: ptBR })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="text-[9px] font-black text-[#FA0000] uppercase tracking-tighter italic px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/20">#{rating.order_id_short}</span>
                                            </div>

                                            {/* Content */}
                                            {rating.comment && (
                                                <p className="text-sm text-[#2A2A2A] dark:text-gray-100 font-bold italic leading-relaxed mb-6">
                                                    &quot;{rating.comment}&quot;
                                                </p>
                                            )}

                                            {/* Footer: Social Interactions */}
                                            <div className="flex items-center justify-between pt-5 border-t border-gray-50 dark:border-gray-800/50">
                                                <div className="flex items-center gap-3">
                                                    <Heart className="h-4 w-4 text-[#FA0000] fill-[#FA0000]" />
                                                    <span className="text-[#FA0000] font-black text-[10px] uppercase tracking-widest">
                                                        {rating.likes_count || 1} Feedbacks que ajudam
                                                    </span>
                                                </div>
                                                <button className="text-gray-200 hover:text-[#FA0000] transition-colors">
                                                    <Flag className="h-4 w-4" />
                                                </button>
                                            </div>

                                            {/* Store Response */}
                                            {rating.store_response && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    className="mt-6 p-5 rounded-xl bg-gray-50 dark:bg-black/20 border-l-2 border-[#FA0000] space-y-2"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-5 w-5 rounded-full bg-[#FA0000]/10 flex items-center justify-center">
                                                            <CheckCircle className="h-3 w-3 text-[#FA0000]" />
                                                        </div>
                                                        <span className="text-[9px] font-black uppercase text-[#FA0000] tracking-widest italic">Resposta do restaurante</span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-bold italic leading-relaxed">
                                                        &quot;{rating.store_response}&quot;
                                                    </p>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
