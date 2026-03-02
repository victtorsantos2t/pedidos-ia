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
        // Pega as 5 mais recentes
        const { data } = await obterAvaliacoesRecentes(1, 5);
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
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-sm font-black uppercase italic tracking-tighter flex items-center gap-3 text-[#2A2A2A] dark:text-white">
                    <Star className="h-5 w-5 text-[#FA0000] fill-[#FA0000]/10" />
                    Feedbacks Recentes
                </h3>
            </div>

            {ratings.map((rating) => {
                const averageRating = Math.round((rating.product_rating + rating.delivery_rating) / 2);

                return (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={rating.id}
                        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:border-[#FA0000]/20 transition-all duration-300"
                    >
                        {/* Header: Avatar + Info */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-[#FA0000] font-black text-xs border border-gray-100 dark:border-gray-800 overflow-hidden shrink-0">
                                    {rating.profiles?.avatar_url ? (
                                        <img src={rating.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="uppercase">{rating.profiles?.name?.charAt(0) || "U"}</span>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-bold text-[#2A2A2A] dark:text-white leading-none">
                                            {rating.profiles?.name || "Usuário"}
                                        </h4>
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star
                                                    key={s}
                                                    className={`h-2.5 w-2.5 ${s <= averageRating ? "fill-[#FA0000] text-[#FA0000]" : "text-gray-100 dark:text-gray-800"}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-bold mt-1">
                                        {formatDistanceToNow(new Date(rating.created_at), { addSuffix: true, locale: ptBR })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        {(rating.delivery_tags?.length > 0 || rating.product_tags?.length > 0) && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {[...(rating.delivery_tags || []), ...(rating.product_tags || [])].slice(0, 3).map((tag: string) => (
                                    <span key={tag} className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 text-[9px] font-black uppercase tracking-widest border border-gray-100 dark:border-gray-700">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Content */}
                        {rating.comment && (
                            <p className="text-sm text-[#2A2A2A] dark:text-gray-300 italic font-medium leading-relaxed mb-4">
                                "{rating.comment}"
                            </p>
                        )}

                        {/* Footer Interactions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800/50">
                            <div className="flex items-center gap-3">
                                <Heart className="h-4 w-4 text-[#FA0000] fill-[#FA0000]/10" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{rating.likes_count || 0} REAÇÕES</span>
                            </div>
                            {!rating.store_response && respondingTo !== rating.id && (
                                <button
                                    className="text-[10px] font-black uppercase text-[#FA0000] italic hover:translate-x-1 transition-all flex items-center gap-1"
                                    onClick={() => setRespondingTo(rating.id)}
                                >
                                    <MessageSquare className="h-3.5 w-3.5" /> Responder
                                </button>
                            )}
                        </div>

                        {/* Store Response */}
                        {rating.store_response ? (
                            <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-black/20 border-l-2 border-[#FA0000] space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-5 w-5 rounded-full bg-[#FA0000]/10 flex items-center justify-center">
                                        <CheckCircle className="h-3 w-3 text-[#FA0000]" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase text-[#FA0000] tracking-widest italic">Resposta da Loja</span>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-bold italic">
                                    "{rating.store_response}"
                                </p>
                            </div>
                        ) : (
                            respondingTo === rating.id && (
                                <div className="mt-4 bg-gray-50 dark:bg-black/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
                                    <Textarea
                                        className="h-20 text-xs font-medium focus:ring-[#FA0000]/20 bg-white dark:bg-black"
                                        placeholder="Sua resposta..."
                                        value={responseValue}
                                        onChange={(e) => setResponseValue(e.target.value)}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" className="h-8 px-3 text-[10px] uppercase font-black" onClick={() => setRespondingTo(null)}>Cancelar</Button>
                                        <Button className="h-8 px-4 rounded-lg bg-[#FA0000] text-white text-[10px] font-black uppercase tracking-widest italic" disabled={isSubmitting || !responseValue.trim()} onClick={() => handleSendResponse(rating.id)}>
                                            {isSubmitting ? "ENVIANDO..." : "RESPONDER"}
                                        </Button>
                                    </div>
                                </div>
                            )
                        )}
                    </motion.div>
                );
            })}

            <div className="pt-2">
                <Button
                    variant="ghost"
                    className="w-full text-xs font-black uppercase tracking-[0.2em] italic text-gray-400 hover:text-[#FA0000] border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl h-12 transition-all"
                    asChild
                >
                    <Link href="/admin/ratings">
                        VER TODA A REPUTAÇÃO
                    </Link>
                </Button>
            </div>
        </div>
    );
}
