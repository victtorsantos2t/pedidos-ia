"use client";

import { useState, useEffect } from "react";
import { Star, Clock, MapPin, CreditCard, Info, MessageSquare, ChevronRight, CheckCircle2, ShieldCheck, ArrowLeft, ExternalLink, Heart, Flag, Flame, QrCode, Banknote, UtensilsCrossed } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { isStoreOpen } from "@/lib/storeUtils";

interface RatingsViewProps {
    ratings: any[];
    stats: any;
    config: any;
}

function RatingLikeButton({ ratingId, initialLikes = 0 }: { ratingId: string, initialLikes?: number }) {
    const [isLiked, setIsLiked] = useState(false);
    const [count, setCount] = useState(initialLikes);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const liked = localStorage.getItem(`rating_liked_${ratingId}`);
            if (liked === "true") {
                setIsLiked(true);
                setCount(initialLikes + 1);
            }
        }
    }, [ratingId, initialLikes]);

    const toggleLike = () => {
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setCount(prev => newIsLiked ? prev + 1 : prev - 1);
        if (typeof window !== "undefined") {
            localStorage.setItem(`rating_liked_${ratingId}`, newIsLiked.toString());
        }
    };

    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleLike}
            className={cn(
                "flex items-center gap-1.5 group transition-colors",
                isLiked ? "text-brand" : "text-gray-400 hover:text-gray-600"
            )}
        >
            <div className="relative h-4 w-4">
                <Heart className={cn("h-4 w-4 absolute inset-0 transition-colors duration-300", !isLiked && "text-gray-300 group-hover:text-brand/50")} />
                <AnimatePresence>
                    {isLiked && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute inset-0"
                        >
                            <Heart className="h-4 w-4 fill-brand text-brand" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <span className="text-[11px] font-bold">
                {count} {count === 1 ? 'gostei' : 'gostei'}
            </span>
        </motion.button>
    );
}

export function RatingsView({ ratings, stats, config }: RatingsViewProps) {
    const [activeTab, setActiveTab] = useState<'avaliacoes' | 'informacoes'>('avaliacoes');
    const [filter, setFilter] = useState<'recentes' | 'comentarios'>('recentes');
    const [starFilter, setStarFilter] = useState<number | null>(null);

    const average = stats.averageProduct || 0;
    const total = stats.total || 0;

    // Lógica de Nível (iFood Style)
    const getLevel = (avg: number) => {
        if (avg >= 4.8) return { label: "Experiência excelente", status: "Super", level: 5, color: "bg-emerald-500", desc: "A loja mantém um desempenho excepcional constante!" };
        if (avg >= 4.4) return { label: "Muito bom", status: "Nível 4", level: 4, color: "bg-brand", desc: "Ótimo desempenho nos últimos meses." };
        if (avg >= 3.8) return { label: "Experiência regular", status: "Nível 3", level: 3, color: "bg-yellow-500", desc: "Bom desempenho, mas com alguns pontos de atenção." };
        if (avg >= 3.0) return { label: "Experiência ruim", status: "Nível 2", level: 2, color: "bg-red-500", desc: "Com base nos pedidos dos últimos meses, a loja tem um desempenho baixo" };
        return { label: "Experiência crítica", status: "Nível 1", level: 1, color: "bg-red-700", desc: "Desempenho muito abaixo do esperado. Requer atenção imediata." };
    };

    const levelData = getLevel(average);

    const filteredRatings = [...ratings]
        .filter(r => {
            if (filter === 'comentarios') return !!r.comment;
            return true;
        })
        .sort((a, b) => {
            if (filter === 'recentes') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            return 0;
        });

    // Função para abrir o Google Maps
    const openMap = () => {
        const address = encodeURIComponent(config.pickup_address);
        window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#0A0A0A] transition-colors duration-500 font-sans">
            {/* Header — Somente Navegação */}
            <div className="bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-gray-100/50 dark:border-gray-800/50 sticky top-0 z-50 pt-[calc(env(safe-area-inset-top,0px)+8px)]">
                <div className="max-w-lg mx-auto flex items-center h-16 px-4 gap-4">
                    <Link href="/" className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-90 shadow-sm shrink-0">
                        <ArrowLeft className="h-5 w-5 text-gray-900 dark:text-gray-100" />
                    </Link>
                    <h1 className="text-base font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">
                        Loja & Avaliações
                    </h1>
                </div>

                {/* Barra de Abas abaixo do Header */}
                <div className="max-w-lg mx-auto flex border-t border-gray-100 dark:border-gray-800">
                    {(['avaliacoes', 'informacoes'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className="relative flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-colors duration-300"
                        >
                            <span className={activeTab === tab ? 'text-brand' : 'text-gray-400'}>
                                {tab === 'avaliacoes' ? 'Avaliações' : 'Informações'}
                            </span>
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="tab-underline-ratings"
                                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand rounded-t-full"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <main className="max-w-lg mx-auto p-6 pt-8 pb-24">
                <AnimatePresence mode="wait">
                    {activeTab === 'avaliacoes' ? (
                        <motion.div
                            key="avaliacoes"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            {/* Performance Header - Circular Progress */}
                            <section className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800/50 flex flex-col items-center">
                                <h2 className="text-[18px] font-bold text-gray-900 dark:text-white uppercase tracking-tight mb-6 self-start">Desempenho do restaurante</h2>

                                <div className="relative h-32 w-32 mb-6">
                                    <svg className="h-full w-full transform -rotate-90">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="58"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            className="text-gray-100 dark:text-gray-800"
                                        />
                                        <motion.circle
                                            cx="64"
                                            cy="64"
                                            r="58"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            strokeDasharray={364}
                                            initial={{ strokeDashoffset: 364 }}
                                            animate={{ strokeDashoffset: 364 - (364 * (average / 5)) }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className={average >= 4.5 ? "text-amber-500" : "text-gray-400"}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-black text-gray-900 dark:text-white">{average}</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nível {levelData.level}</span>
                                    </div>
                                </div>

                                <p className="text-[13px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-full mb-8">
                                    Top 5% da região em atendimento!
                                </p>

                                <div className="grid grid-cols-3 gap-8 w-full pt-6 border-t border-gray-50 dark:border-gray-800/50">
                                    <div className="flex flex-col items-center text-center">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500 mb-2" />
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Aprovado</span>
                                    </div>
                                    <div className="flex flex-col items-center text-center">
                                        <Clock className="h-5 w-5 text-amber-500 mb-2" />
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Pontualidade</span>
                                    </div>
                                    <div className="flex flex-col items-center text-center">
                                        <Heart className="h-5 w-5 text-brand mb-2" />
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Qualidade</span>
                                    </div>
                                </div>
                            </section>

                            {/* Resumo e Filtros Ativos */}
                            <section className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800/50">
                                <h2 className="text-[18px] font-bold text-gray-900 dark:text-white uppercase tracking-tight mb-6">Resumo de avaliações</h2>

                                <div className="flex items-center gap-8 mb-8">
                                    <div className="text-center">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-4xl font-black text-gray-900 dark:text-white leading-none">{average}</span>
                                            <Star className="h-6 w-6 fill-amber-500 text-amber-500" />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{total} avaliações</span>
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        {[5, 4, 3, 2, 1].map((star) => {
                                            const count = ratings.filter(r => Math.round(r.product_rating) === star).length;
                                            const pct = total > 0 ? (count / total) * 100 : 0;
                                            return (
                                                <button
                                                    key={star}
                                                    onClick={() => setStarFilter(starFilter === star ? null : star)}
                                                    className={cn(
                                                        "flex items-center gap-3 w-full group transition-all",
                                                        starFilter === star ? "scale-105 opacity-100" : starFilter ? "opacity-40" : "opacity-100"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-1 w-6">
                                                        <span className="text-[11px] font-bold text-gray-900 dark:text-white">{star}</span>
                                                        <Star className="h-2 w-2 fill-gray-400 text-gray-400" />
                                                    </div>
                                                    <div className="flex-1 h-2 bg-gray-50 dark:bg-gray-950 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${pct}%` }}
                                                            className={cn(
                                                                "h-full rounded-full transition-colors",
                                                                starFilter === star ? "bg-amber-500" : "bg-amber-500/60 group-hover:bg-amber-500"
                                                            )}
                                                        />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {['recentes', 'comentarios'].map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setFilter(f as any)}
                                            className={cn(
                                                "flex-1 h-11 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all",
                                                filter === f
                                                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                            )}
                                        >
                                            {f === 'recentes' ? 'Recentes' : 'Comentários'}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Feed de Comentários */}
                            <div className="space-y-4">
                                <h2 className="text-[18px] font-bold text-gray-900 dark:text-white uppercase tracking-tight mb-6">Feed de comentários</h2>
                                {filteredRatings.map((rating) => {
                                    const averageRating = Math.round((rating.product_rating + rating.delivery_rating) / 2);

                                    return (
                                        <section key={rating.id} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800/50 hover:border-[#FA0000]/20 transition-all duration-300">
                                            {/* Header do Card */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700 overflow-hidden shrink-0">
                                                        {rating.profiles?.avatar_url ? (
                                                            <img src={rating.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <span className="text-sm font-bold text-gray-400 uppercase">
                                                                {rating.profiles?.name?.charAt(0) || "U"}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                                                                {rating.profiles?.name || "Cliente Satisfeito"}
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
                                                        <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">
                                                            {formatDistanceToNow(new Date(rating.created_at), { addSuffix: true, locale: ptBR })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Comentário */}
                                            {rating.comment && (
                                                <p className="text-[14px] text-gray-700 dark:text-gray-300 font-bold italic leading-relaxed mb-4">
                                                    "{rating.comment}"
                                                </p>
                                            )}

                                            {/* Likes/Ações */}
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800/50">
                                                <RatingLikeButton
                                                    ratingId={rating.id}
                                                    initialLikes={rating.likes_count || 0}
                                                />
                                                <button className="text-gray-200 hover:text-[#FA0000] transition-colors">
                                                    <Flag className="h-4 w-4" />
                                                </button>
                                            </div>

                                            {/* Resposta do Restaurante */}
                                            {rating.store_response && (
                                                <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-black/20 border-l-2 border-[#FA0000] space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-5 w-5 rounded-full bg-[#FA0000]/10 flex items-center justify-center">
                                                            <CheckCircle2 className="h-3 w-3 text-[#FA0000]" />
                                                        </div>
                                                        <span className="text-[9px] font-black uppercase text-[#FA0000] tracking-widest italic">Resposta do Restaurante</span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-bold italic leading-relaxed">
                                                        "{rating.store_response}"
                                                    </p>
                                                </div>
                                            )}
                                        </section>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="informacoes"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-10"
                        >
                            {/* Descrição - Tipografia Refinada */}
                            <section className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                                <h2 className="text-[18px] font-bold text-[#2A2A2A] dark:text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                                    <Info className="h-5 w-5 text-gray-400" />
                                    Descrição da loja
                                </h2>
                                <div className="space-y-4 text-[14px] text-[#616161] dark:text-gray-400 font-medium leading-[1.6]">
                                    <p className="flex items-start gap-2">
                                        <Flame className="h-4 w-4 text-brand flex-shrink-0 mt-1" />
                                        <span>{config.description?.split('\n')[0] || "Bem-vindo ao nosso restaurante! Sabor e qualidade em cada pedido."}</span>
                                    </p>
                                    {config.description?.split('\n').slice(1).map((p: string, i: number) => (
                                        <p key={i}>{p}</p>
                                    ))}
                                </div>
                            </section>

                            {/* Horários / Status Badge */}
                            <section className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-[18px] font-bold text-[#2A2A2A] dark:text-white uppercase tracking-tight">
                                        Horário de Atendimento
                                    </h2>
                                    {isStoreOpen(config.opening_hours) && (
                                        <div className="flex items-center gap-2 bg-[#00C853]/10 px-3 py-1.5 rounded-full border border-[#00C853]/20">
                                            <motion.div
                                                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="h-2 w-2 rounded-full bg-[#00C853]"
                                            />
                                            <span className="text-[10px] font-bold text-[#00C853] uppercase tracking-wider">Aberto agora</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {/* Exibição por agrupamento sugerido */}
                                    <div className="space-y-3">
                                        {/* Agrupamento Inteligente (Exemplo sugerido na doc) */}
                                        <div className="flex justify-between items-center text-[13px] font-semibold text-[#616161] dark:text-gray-400 border-b border-gray-50 dark:border-gray-800 pb-2">
                                            <span>Segunda</span>
                                            <span className="text-[#2A2A2A] dark:text-gray-100">06:00 às 23:59</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[13px] font-semibold text-[#616161] dark:text-gray-400 border-b border-gray-50 dark:border-gray-800 pb-2">
                                            <span>Terça a Sábado</span>
                                            <span className="text-[#2A2A2A] dark:text-gray-100">18:00 às 23:00</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[13px] font-semibold text-[#616161] dark:text-gray-400">
                                            <span>Domingo</span>
                                            <span className="text-[#2A2A2A] dark:text-gray-100">15:00 às 23:59</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Formas de Pagamento - Grid 2 Colunas */}
                            <section className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                                <h2 className="text-[18px] font-bold text-[#2A2A2A] dark:text-white uppercase tracking-tight mb-6">
                                    Pagamento
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: "Pix", icon: <QrCode className="h-6 w-6" /> },
                                        { label: "Dinheiro", icon: <Banknote className="h-6 w-6" /> },
                                        { label: "Crédito", icon: <CreditCard className="h-6 w-6" /> },
                                        { label: "Débito", icon: <CreditCard className="h-6 w-6" /> },
                                    ].map((method) => (
                                        <div key={method.label} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20 hover:border-brand/20 transition-all cursor-default">
                                            <div className="text-brand opacity-80">
                                                {method.icon}
                                            </div>
                                            <span className="text-[13px] font-bold text-[#2A2A2A] dark:text-gray-200">{method.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Endereço & Mapa Estilizado */}
                            <section className="bg-white dark:bg-gray-900 rounded-xl p-2 shadow-sm border border-gray-100 dark:border-gray-800">
                                <div className="p-4 pt-6 pb-2">
                                    <h2 className="text-[18px] font-bold text-[#2A2A2A] dark:text-white uppercase tracking-tight mb-4 text-center">
                                        Onde estamos
                                    </h2>
                                    <div className="text-[14px] text-[#616161] dark:text-gray-300 font-medium leading-relaxed flex items-center justify-center gap-2 mb-6">
                                        <MapPin className="h-4 w-4 text-brand" />
                                        {config.pickup_address}
                                    </div>
                                </div>

                                <div className="relative rounded-xl overflow-hidden group">
                                    {/* Container do Mapa Simulando Styled Map (Grayscale/Silver) */}
                                    <div className="h-64 w-full bg-[#E5E7EB] dark:bg-gray-800 relative grayscale hover:grayscale-0 transition-all duration-700">
                                        {/* Grid do mapa decorativo */}
                                        <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'linear-gradient(#ccc 1px, transparent 1px), linear-gradient(90deg, #ccc 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-brand/20 blur-xl animate-pulse rounded-full" />
                                                <MapPin className="h-12 w-12 text-brand relative z-10 drop-shadow-lg" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botão CTA conforme especificação (Full-width, 8px radius, white shadow) */}
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <button
                                            onClick={openMap}
                                            className="w-full bg-white text-[#2A2A2A] font-bold py-4 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] flex items-center justify-center gap-3 transition-transform active:scale-95 text-[14px] uppercase tracking-wider"
                                        >
                                            Ver no Google Maps
                                            <ExternalLink className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
