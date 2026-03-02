"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, Flag, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/Card";
import { obterAvaliacoesPaginadas, responderAvaliacao } from "@/lib/actions/orderRatingActions";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/core/Button";
import { Textarea } from "@/components/core/Textarea";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function AdminRatingsManager() {
    const [ratings, setRatings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [respondingTo, setRespondingTo] = useState<string | null>(null);
    const [responseValue, setResponseValue] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const pageSize = 10;

    async function fetchRatings() {
        setLoading(true);
        try {
            const { data, total } = await obterAvaliacoesPaginadas(page, pageSize);
            setRatings(data || []);
            setTotal(total || 0);
        } catch (error) {
            toast.error("Erro ao carregar avaliações.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchRatings();
    }, [page]);

    const handleSendResponse = async (ratingId: string) => {
        if (!responseValue.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await responderAvaliacao(ratingId, responseValue);
            if (res.success) {
                toast.success("Resposta enviada!");
                setRespondingTo(null);
                setResponseValue("");
                await fetchRatings();
            } else {
                toast.error(res.error || "Erro ao responder.");
            }
        } catch (error) {
            toast.error("Erro técnico ao enviar resposta.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="space-y-10">
            {/* Header Elite */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
                <div className="flex items-center gap-6">
                    <Link
                        href="/admin"
                        className="h-11 w-11 flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm text-gray-400 hover:text-[#FA0000] transition-all active:scale-95 group"
                    >
                        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-[#2A2A2A] dark:text-white tracking-tighter italic uppercase leading-none">Reputação</h1>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mt-3 opacity-60">
                            Central de <span className="text-[#FA0000]">Voz do Cliente</span>
                        </p>
                    </div>
                </div>

                <div className="bg-[#FA0000] text-white px-8 py-4 rounded-xl shadow-xl shadow-red-500/20 border border-white/10 flex items-center gap-3">
                    <Star className="h-4 w-4 fill-white" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">{total} Avaliações Totais</span>
                </div>
            </div>

            {/* Listagem Elite */}
            <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-gray-50/50 dark:bg-gray-900/50 animate-pulse rounded-xl border border-gray-100 dark:border-gray-800" />
                        ))
                    ) : ratings.length === 0 ? (
                        <div className="bg-white dark:bg-black/20 p-24 rounded-xl border border-dashed border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center opacity-40 shadow-sm">
                            <MessageSquare className="h-16 w-16 text-gray-200 mb-6" />
                            <p className="text-sm font-black uppercase tracking-widest italic">Histórico de Feedbacks Vazio</p>
                        </div>
                    ) : (
                        ratings.map((rating) => {
                            const averageRating = Math.round((rating.product_rating + rating.delivery_rating) / 2);

                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={rating.id}
                                    className="bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:border-[#FA0000]/20 transition-all duration-500 relative group overflow-hidden"
                                >
                                    {/* Header: Avatar + Info */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-[#FA0000] font-black text-sm border border-gray-100 dark:border-gray-800 overflow-hidden shrink-0 shadow-inner">
                                                {rating.profiles?.avatar_url ? (
                                                    <img src={rating.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="uppercase">{rating.profiles?.name?.charAt(0) || "U"}</span>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-base font-black text-[#2A2A2A] dark:text-white leading-none">
                                                        {rating.profiles?.name || "Usuário"}
                                                    </h4>
                                                    <div className="flex gap-0.5">
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <Star
                                                                key={s}
                                                                className={cn(
                                                                    "h-3 w-3 transition-all",
                                                                    s <= averageRating ? "fill-[#FA0000] text-[#FA0000]" : "text-gray-100 dark:text-gray-800"
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
                                        <div className="text-[9px] font-black text-gray-200 dark:text-gray-800 uppercase tracking-widest group-hover:text-gray-300 transition-colors">
                                            ID #{rating.orders?.id?.substring(0, 8) || "N/A"}
                                        </div>
                                    </div>

                                    {/* Tags Area */}
                                    {(rating.delivery_tags?.length > 0 || rating.product_tags?.length > 0) && (
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {rating.delivery_tags?.map((tag: string) => (
                                                <span key={tag} className="px-3 py-1.5 rounded-full bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/40">
                                                    {tag}
                                                </span>
                                            ))}
                                            {rating.product_tags?.map((tag: string) => (
                                                <span key={tag} className="px-3 py-1.5 rounded-full bg-amber-50/50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-widest border border-amber-100 dark:border-amber-900/40">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Content Area */}
                                    {rating.comment && (
                                        <div className="mb-6">
                                            <p className="text-[#2A2A2A] dark:text-gray-200 font-medium italic leading-relaxed text-sm">
                                                "{rating.comment}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Action Footer */}
                                    <div className="flex items-center justify-between pt-5 border-t border-gray-50 dark:border-gray-800/50">
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <Heart className={cn(
                                                    "h-4 w-4 transition-all",
                                                    (rating.likes_count > 0) ? "text-[#FA0000] fill-[#FA0000]" : "text-gray-300"
                                                )} />
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest transition-colors",
                                                    (rating.likes_count > 0) ? "text-[#FA0000]" : "text-gray-400"
                                                )}>
                                                    {rating.likes_count || 0} REAÇÕES
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {!rating.store_response && respondingTo !== rating.id && (
                                                <button
                                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic text-[#FA0000] hover:translate-x-1 transition-all"
                                                    onClick={() => setRespondingTo(rating.id)}
                                                >
                                                    <MessageSquare className="h-4 w-4" />
                                                    Responder
                                                </button>
                                            )}
                                            <button className="text-gray-200 hover:text-[#FA0000] transition-colors">
                                                <Flag className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Response Layer */}
                                    {rating.store_response ? (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="mt-6 p-5 rounded-xl bg-gray-50 dark:bg-black/20 border-l-2 border-[#FA0000] space-y-3"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="h-5 w-5 rounded-full bg-[#FA0000]/10 flex items-center justify-center">
                                                    <CheckCircle className="h-3.5 w-3.5 text-[#FA0000]" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase text-[#FA0000] tracking-widest italic">Resposta da Loja</span>
                                            </div>
                                            <p className="text-xs text-gray-700 dark:text-gray-400 font-bold italic leading-relaxed">
                                                "{rating.store_response}"
                                            </p>
                                        </motion.div>
                                    ) : (
                                        respondingTo === rating.id && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-gray-50 dark:bg-black/40 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
                                                <Textarea
                                                    className="h-28 text-sm font-medium focus:ring-[#FA0000]/20 bg-white dark:bg-black rounded-xl"
                                                    placeholder="Sua resposta cordial..."
                                                    value={responseValue}
                                                    onChange={(e) => setResponseValue(e.target.value)}
                                                />
                                                <div className="flex justify-end gap-3 mt-4">
                                                    <Button
                                                        variant="ghost"
                                                        className="h-10 text-[10px] uppercase font-black"
                                                        onClick={() => setRespondingTo(null)}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                    <Button
                                                        className="h-11 px-6 rounded-xl bg-[#FA0000] text-white text-[10px] font-black uppercase italic tracking-widest shadow-xl shadow-red-500/20"
                                                        disabled={isSubmitting || !responseValue.trim()}
                                                        onClick={() => handleSendResponse(rating.id)}
                                                    >
                                                        {isSubmitting ? "ENVIANDO..." : "PUBLICAR RESPOSTA"}
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )
                                    )}
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

            {/* Pagination Controls Elite */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-6 py-10">
                    <button
                        className="h-16 w-16 flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 disabled:opacity-20 shadow-sm hover:border-[#FA0000]/40 transition-all active:scale-90 group"
                        disabled={page === 1}
                        onClick={() => {
                            setPage(prev => Math.max(1, prev - 1));
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    >
                        <ChevronLeft className="h-8 w-8 text-[#2A2A2A] dark:text-white group-hover:-translate-x-1 transition-transform" />
                    </button>

                    <div className="flex items-center gap-6">
                        <div className="bg-[#FA0000] text-white h-16 w-16 rounded-xl flex items-center justify-center text-xl font-black shadow-2xl shadow-red-500/30 italic rotate-3 border-4 border-white dark:border-black">
                            {page}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-gray-300 uppercase tracking-[0.5em] leading-none mb-1">Página de</span>
                            <span className="text-sm font-black text-gray-400 uppercase tracking-widest italic">{totalPages}</span>
                        </div>
                    </div>

                    <button
                        className="h-16 w-16 flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 disabled:opacity-20 shadow-sm hover:border-[#FA0000]/40 transition-all active:scale-90 group"
                        disabled={page === totalPages}
                        onClick={() => {
                            setPage(prev => Math.min(totalPages, prev + 1));
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    >
                        <ChevronRight className="h-8 w-8 text-[#2A2A2A] dark:text-white group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            )}
        </div>
    );
}
