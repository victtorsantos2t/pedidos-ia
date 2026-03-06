"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { obterAvaliacoesPaginadas, responderAvaliacao } from "@/lib/actions/orderRatingActions";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/core/Button";
import { Textarea } from "@/components/core/Textarea";
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

    const pageSize = 15;

    async function fetchRatings() {
        setLoading(true);
        try {
            const { data, total } = await obterAvaliacoesPaginadas(page, pageSize);
            setRatings(data || []);
            setTotal(total || 0);
        } catch {
            toast.error("Erro ao carregar avaliações.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchRatings(); }, [page]);

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
        } catch {
            toast.error("Erro técnico ao enviar resposta.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="space-y-5">
            {/* Header compacto */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Avaliações
                    </h1>
                    <p className="text-xs font-medium text-gray-500 mt-0.5">
                        {total} avaliações recebidas
                    </p>
                </div>
                {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                        <button
                            className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                            disabled={page === 1}
                            onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        >
                            <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        </button>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 tabular-nums px-2">
                            {page} / {totalPages}
                        </span>
                        <button
                            className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                            disabled={page === totalPages}
                            onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        >
                            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>
                )}
            </div>

            {/* Lista de avaliações — compacta */}
            <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800/60 overflow-hidden">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        [1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-16 animate-pulse bg-gray-50 dark:bg-gray-900/50" />
                        ))
                    ) : ratings.length === 0 ? (
                        <div className="py-16 flex flex-col items-center justify-center text-center">
                            <MessageSquare className="h-8 w-8 text-gray-300 dark:text-gray-700 mb-3" />
                            <p className="text-sm font-semibold text-gray-400">Nenhuma avaliação ainda</p>
                        </div>
                    ) : (
                        ratings.map((rating) => {
                            const avg = Math.round((rating.product_rating + rating.delivery_rating) / 2);
                            const hasResponse = !!rating.store_response;
                            const isResponding = respondingTo === rating.id;

                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    key={rating.id}
                                    className="px-4 py-3.5 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors"
                                >
                                    {/* Linha principal — tudo em uma row */}
                                    <div className="flex items-start gap-3">
                                        {/* Avatar */}
                                        <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-[#FA0000] font-bold text-xs shrink-0 overflow-hidden">
                                            {rating.profiles?.avatar_url ? (
                                                <img src={rating.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="uppercase">{rating.profiles?.name?.charAt(0) || "U"}</span>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            {/* Nome + estrelas + tempo */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                    {rating.profiles?.name || "Usuário"}
                                                </span>
                                                <div className="flex gap-px">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <Star key={s} className={cn(
                                                            "h-3 w-3",
                                                            s <= avg ? "fill-amber-400 text-amber-400" : "text-gray-200 dark:text-gray-700"
                                                        )} />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-medium text-gray-400 ml-auto shrink-0">
                                                    {formatDistanceToNow(new Date(rating.created_at), { addSuffix: true, locale: ptBR })}
                                                </span>
                                            </div>

                                            {/* Tags inline — compactas */}
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

                                            {/* Comentário — uma linha */}
                                            {rating.comment && (
                                                <p className="text-[13px] text-gray-600 dark:text-gray-400 mt-1.5 leading-snug line-clamp-2">
                                                    &quot;{rating.comment}&quot;
                                                </p>
                                            )}

                                            {/* Resposta da loja (se existir) */}
                                            {hasResponse && (
                                                <div className="mt-2 pl-3 border-l-2 border-[#FA0000]/30">
                                                    <div className="flex items-center gap-1.5 mb-0.5">
                                                        <CheckCircle className="h-3 w-3 text-[#FA0000]" />
                                                        <span className="text-[10px] font-bold text-[#FA0000]">Respondido</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                                        {rating.store_response}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Botão Responder */}
                                            {!hasResponse && !isResponding && (
                                                <button
                                                    onClick={() => setRespondingTo(rating.id)}
                                                    className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-[#FA0000] hover:underline transition-all"
                                                >
                                                    <MessageSquare className="h-3 w-3" />
                                                    Responder
                                                </button>
                                            )}

                                            {/* Form resposta inline */}
                                            {isResponding && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    className="mt-2.5 space-y-2 overflow-hidden"
                                                >
                                                    <Textarea
                                                        className="h-20 text-sm bg-gray-50 dark:bg-gray-900 rounded-lg border-gray-200 dark:border-gray-800 focus:ring-[#FA0000]/20"
                                                        placeholder="Sua resposta..."
                                                        value={responseValue}
                                                        onChange={(e) => setResponseValue(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            className="h-8 text-xs font-semibold text-gray-500 px-3"
                                                            onClick={() => { setRespondingTo(null); setResponseValue(""); }}
                                                        >
                                                            Cancelar
                                                        </Button>
                                                        <Button
                                                            className="h-8 px-4 rounded-lg bg-[#FA0000] text-white text-xs font-bold shadow-sm"
                                                            disabled={isSubmitting || !responseValue.trim()}
                                                            onClick={() => handleSendResponse(rating.id)}
                                                        >
                                                            {isSubmitting ? "Enviando..." : "Enviar"}
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

            {/* Paginação bottom — repetida para facilidade */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 pt-2">
                    <button
                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                        disabled={page === 1}
                        onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    >
                        <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </button>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 tabular-nums px-3">
                        {page} de {totalPages}
                    </span>
                    <button
                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                        disabled={page === totalPages}
                        onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    >
                        <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
            )}
        </div>
    );
}
