"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquare, CheckCircle, Heart, Flag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/Card";
import { Button } from "@/components/core/Button";
import { Textarea } from "@/components/core/Textarea";
import {
    obterAvaliacoesPaginadas as obterAvaliacoesRecentes,
    responderAvaliacao
} from "@/lib/actions/orderRatingActions";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function AdminRecentRatings() {
    const [ratings, setRatings] = useState<any[]>([]);
    const [respondingTo, setRespondingTo] = useState<string | null>(null);
    const [responseValue, setResponseValue] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        carregarAvaliacoes();
    }, []);

    async function carregarAvaliacoes() {
        // Pega as 3 mais recentes — no dashboard, menos é mais
        const { data } = await obterAvaliacoesRecentes(1, 3);
        if (data) setRatings(data);
    }

    async function handleSendResponse(id: string) {
        if (!responseValue.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await responderAvaliacao(id, responseValue);
            if (res.success) {
                toast.success("Resposta enviada com sucesso!");
                setRespondingTo(null);
                setResponseValue("");
                carregarAvaliacoes();
            } else {
                toast.error(res.error || "Erro ao enviar resposta.");
            }
        } catch (error) {
            toast.error("Erro ao processar resposta.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (ratings.length === 0) {
        return (
            <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-black rounded-xl h-full flex items-center justify-center p-12 text-center">
                <div className="space-y-4">
                    <div className="h-16 w-16 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center mx-auto text-gray-300">
                        <Star className="h-8 w-8" />
                    </div>
                    <div>
                        <h4 className="font-black uppercase italic tracking-tighter text-[#2A2A2A] dark:text-white text-sm">Nenhum feedback</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 opacity-60">As avaliações dos clientes aparecerão aqui.</p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-900">
                <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-[#FA0000] fill-[#FA0000]/20" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Feedbacks Recentes</h3>
                </div>
                <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded-full">
                    {ratings.length} novos
                </span>
            </div>

            {/* Lista compacta */}
            <div className="divide-y divide-gray-50 dark:divide-gray-900">
                {ratings.map((rating) => {
                    const avg = Math.round((rating.product_rating + rating.delivery_rating) / 2);
                    const initial = rating.profiles?.name?.charAt(0) || "U";
                    const tags = [...(rating.delivery_tags || []), ...(rating.product_tags || [])].slice(0, 2);

                    return (
                        <motion.div
                            key={rating.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                        >
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[#FA0000] font-black text-xs overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700">
                                    {rating.profiles?.avatar_url
                                        ? <img src={rating.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                                        : <span>{initial}</span>}
                                </div>

                                {/* Conteúdo */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            {rating.profiles?.name || "Usuário"}
                                        </span>
                                        {/* Estrelas */}
                                        <div className="flex gap-0.5 shrink-0">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star key={s} className={`h-3 w-3 ${s <= avg ? "fill-[#FA0000] text-[#FA0000]" : "text-gray-200 dark:text-gray-700"}`} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tags compactas */}
                                    {tags.length > 0 && (
                                        <div className="flex gap-1.5 mb-1.5">
                                            {tags.map((tag: string) => (
                                                <span key={tag} className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Comment */}
                                    {rating.comment && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 italic leading-relaxed line-clamp-1">
                                            &quot;{rating.comment}&quot;
                                        </p>
                                    )}

                                    {/* Resposta ou botão */}
                                    {rating.store_response ? (
                                        <div className="mt-2 flex items-center gap-1.5">
                                            <CheckCircle className="h-3 w-3 text-emerald-500" />
                                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Respondido</span>
                                        </div>
                                    ) : respondingTo === rating.id ? (
                                        <div className="mt-3 space-y-2">
                                            <Textarea
                                                className="h-16 text-xs bg-gray-50 dark:bg-black border-gray-200 dark:border-gray-700"
                                                placeholder="Sua resposta..."
                                                value={responseValue}
                                                onChange={e => setResponseValue(e.target.value)}
                                            />
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" className="h-7 px-3 text-[10px]" onClick={() => setRespondingTo(null)}>Cancelar</Button>
                                                <Button className="h-7 px-3 bg-[#FA0000] text-white text-[10px] font-semibold rounded-lg" disabled={isSubmitting || !responseValue.trim()} onClick={() => handleSendResponse(rating.id)}>
                                                    {isSubmitting ? "..." : "Enviar"}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-[10px] text-gray-400">
                                                {formatDistanceToNow(new Date(rating.created_at), { addSuffix: true, locale: ptBR })}
                                            </span>
                                            <button
                                                className="text-[10px] font-semibold text-[#FA0000] hover:underline flex items-center gap-1"
                                                onClick={() => setRespondingTo(rating.id)}
                                            >
                                                <MessageSquare className="h-3 w-3" /> Responder
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-900">
                <a href="/admin/ratings" className="text-xs font-semibold text-gray-400 hover:text-[#FA0000] transition-colors flex items-center gap-1.5">
                    Ver todos os feedbacks
                    <Flag className="h-3 w-3" />
                </a>
            </div>
        </div>
    );
}
