"use client";

import { useState, useEffect } from "react";
import { Star, Send, CheckCircle2, Loader2, MessageSquare, ChevronLeft, ChevronRight, User, Utensils, Bike } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/core/Button";
import { Textarea } from "@/components/core/Textarea";
import { Card, CardContent } from "@/components/core/Card";
import { cn } from "@/lib/utils";
import { enviarAvaliacao, OrderRating } from "@/lib/actions/orderRatingActions";

interface OrderRatingCardProps {
    orderId: string;
    initialRating?: OrderRating | null;
    onActiveChange?: (active: boolean) => void;
}

const DELIVERY_TAGS = ["Educado", "No prazo", "Cuidadoso", "Limpo", "Trabalha duro", "Bom serviço"];
const PRODUCT_TAGS = ["Comida boa", "Boa embalagem", "Limpo", "Preço justo"];

const AnimatedMotorcycle = () => (
    <motion.div
        animate={{
            y: [0, -2, 0],
            rotate: [0, 0.5, 0]
        }}
        transition={{
            duration: 0.15,
            repeat: Infinity,
            repeatType: "reverse"
        }}
        className="text-brand"
    >
        <Bike className="h-10 w-10" />
    </motion.div>
);

const AnimatedRestaurant = () => (
    <motion.div
        animate={{
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8]
        }}
        transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
        }}
        className="text-brand"
    >
        <Utensils className="h-10 w-10" />
    </motion.div>
);

export function OrderRatingCard({ orderId, initialRating, onActiveChange }: OrderRatingCardProps) {
    const [step, setStep] = useState<1 | 2 | 3>(initialRating ? 3 : 1);

    useEffect(() => {
        if (!initialRating && (step === 1 || step === 2)) {
            onActiveChange?.(true);
        } else {
            onActiveChange?.(false);
        }
    }, [step, initialRating, onActiveChange]);

    const [productRating, setProductRating] = useState(initialRating?.product_rating || 0);
    const [deliveryRating, setDeliveryRating] = useState(initialRating?.delivery_rating || 0);
    const [productTags, setProductTags] = useState<string[]>(initialRating?.product_tags || []);
    const [deliveryTags, setDeliveryTags] = useState<string[]>(initialRating?.delivery_tags || []);
    const [comment, setComment] = useState(initialRating?.comment || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleTag = (tag: string, type: 'product' | 'delivery') => {
        if (type === 'product') {
            setProductTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
        } else {
            setDeliveryTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
        }
    };

    const handleSubmit = async () => {
        if (productRating === 0 || deliveryRating === 0) {
            setError("Por favor, preencha as avaliações.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const res = await enviarAvaliacao({
            orderId,
            productRating,
            deliveryRating,
            productTags,
            deliveryTags,
            comment: comment.trim() || undefined,
        });

        if (res.error) {
            setError(res.error);
        } else {
            setStep(3);
        }
        setIsSubmitting(false);
    };

    const RatingStars = ({ value, onChange, label }: { value: number, onChange: (v: number) => void, label: string }) => (
        <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                    <button
                        key={s}
                        onClick={() => onChange(s)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                    >
                        <Star
                            className={cn(
                                "h-10 w-10 transition-all duration-300",
                                s <= value ? "fill-brand text-brand scale-110 drop-shadow-sm" : "text-gray-200"
                            )}
                        />
                    </button>
                ))}
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
        </div>
    );

    const TagCloud = ({ tags, selectedTags, onToggle, type }: { tags: string[], selectedTags: string[], onToggle: (tag: string, type: 'product' | 'delivery') => void, type: 'product' | 'delivery' }) => (
        <div className="flex flex-wrap justify-center gap-2 mt-4">
            {tags.map((tag) => (
                <button
                    key={tag}
                    onClick={() => onToggle(tag, type)}
                    className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all duration-300 active:scale-95",
                        selectedTags.includes(tag)
                            ? "bg-brand/5 border-brand text-brand shadow-sm scale-105"
                            : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 opacity-60 hover:opacity-100"
                    )}
                >
                    {tag}
                </button>
            ))}
        </div>
    );

    if (initialRating) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm mx-auto"
            >
                <Card className="bg-white dark:bg-gray-900 overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-brand font-black text-xs border border-gray-100 dark:border-gray-800">
                                    <User className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-sm font-bold text-foreground dark:text-white leading-none">Sua Avaliação</h3>
                                    <div className="flex gap-0.5 mt-1">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star
                                                key={s}
                                                className={cn("h-2.5 w-2.5", s <= Math.round((productRating + deliveryRating) / 2) ? "fill-brand text-brand" : "text-gray-100 dark:text-gray-800")}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-1.5">
                                    <Bike className="h-3 w-3" /> Entrega
                                </span>
                                <div className="flex gap-1 flex-wrap">
                                    {deliveryTags.slice(0, 2).map(t => (
                                        <span key={t} className="px-2 py-1 rounded-md bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase tracking-tighter">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-1.5">
                                    <Utensils className="h-3 w-3" /> Produto
                                </span>
                                <div className="flex gap-1 flex-wrap">
                                    {productTags.slice(0, 2).map(t => (
                                        <span key={t} className="px-2 py-1 rounded-md bg-amber-50/50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 text-[8px] font-black uppercase tracking-tighter">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {comment && (
                            <p className="text-sm text-foreground dark:text-gray-300 font-bold italic leading-relaxed pt-2 border-t border-gray-50 dark:border-gray-800/50">
                                &quot;{comment}&quot;
                            </p>
                        )}

                        {initialRating.store_response && (
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-black/20 border-l-2 border-brand space-y-2 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-5 w-5 rounded-full bg-brand/10 flex items-center justify-center">
                                        <CheckCircle2 className="h-3 w-3 text-brand" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase text-brand tracking-widest italic">Resposta da Loja</span>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-bold italic leading-relaxed">
                                    &quot;{initialRating.store_response}&quot;
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full overflow-hidden px-6 py-2 animate-in fade-in slide-in-from-bottom-8 duration-700 no-scrollbar">
            <header className="mb-2 text-center flex-shrink-0">
                <h1 className="text-lg font-black italic uppercase tracking-tighter text-foreground dark:text-white leading-none">
                    {step === 1 ? "Avaliar Entrega" : step === 2 ? "Avaliar Pedido" : "Obrigado!"}
                </h1>
                <motion.div
                    layoutId="header-line"
                    className="h-1 w-8 bg-brand mx-auto mt-1 rounded-full shadow-sm"
                />
            </header>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                        className="w-full space-y-6 flex flex-col items-center max-w-sm mx-auto flex-1"
                    >
                        <div className="relative group">
                            <div className="absolute -inset-2 bg-brand/5 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-all duration-700" />
                            <div className="relative h-24 w-24 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-md border border-brand/5 overflow-hidden">
                                <AnimatedMotorcycle />
                            </div>
                            <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-brand flex items-center justify-center text-white border-2 border-white dark:border-gray-900 shadow-sm">
                                <User className="h-3.5 w-3.5" />
                            </div>
                        </div>

                        <div className="text-center">
                            <h2 className="text-lg font-black uppercase italic tracking-tighter text-foreground dark:text-white mb-0.5 leading-none">Seu Entregador</h2>
                            <p className="text-[8px] uppercase font-bold text-gray-400 tracking-[0.2em] opacity-80 leading-none">O que achou do serviço?</p>
                        </div>

                        <RatingStars
                            value={deliveryRating}
                            onChange={setDeliveryRating}
                            label={deliveryRating === 5 ? "Incrível!" : deliveryRating === 4 ? "Muito Bom" : deliveryRating === 3 ? "Gostei" : deliveryRating === 2 ? "Regular" : deliveryRating === 1 ? "Ruim" : "Sua Nota"}
                        />

                        <TagCloud
                            tags={DELIVERY_TAGS}
                            selectedTags={deliveryTags}
                            onToggle={toggleTag}
                            type="delivery"
                        />

                        <div className="w-full bg-white dark:bg-black/10 p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm focus-within:border-brand/20 transition-all relative">
                            <Textarea
                                className="border-0 bg-transparent shadow-none focus-visible:ring-0 p-0 text-sm font-bold leading-relaxed italic placeholder:text-gray-300 resize-none h-14 dark:text-gray-100"
                                placeholder="Deseja deixar um elogio ou observação?"
                                value={comment}
                                maxLength={250}
                                onChange={(e) => setComment(e.target.value)}
                            />
                            <div className="absolute bottom-2 right-4 text-[8px] font-bold text-gray-300 uppercase tracking-widest">
                                {comment.length}/250
                            </div>
                        </div>

                        <div className="w-full pt-4 pb-2">
                            <button
                                onClick={() => deliveryRating > 0 && setStep(2)}
                                disabled={deliveryRating === 0}
                                className="w-full h-16 rounded-xl bg-brand text-white font-black uppercase italic tracking-[0.2em] shadow-xl shadow-brand/20 disabled:grayscale disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center gap-4 overflow-hidden group relative"
                            >
                                <span className="relative z-10 text-lg">Próximo</span>
                                <ChevronRight className="h-6 w-6 relative z-10 group-hover:translate-x-1 transition-transform" />
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                        className="w-full space-y-6 flex flex-col items-center max-w-sm mx-auto flex-1"
                    >
                        <div className="relative group">
                            <div className="absolute -inset-2 bg-brand/5 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-all duration-700" />
                            <div className="relative h-24 w-24 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-md border border-brand/5 overflow-hidden">
                                <AnimatedRestaurant />
                            </div>
                            <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-brand flex items-center justify-center text-white border-2 border-white dark:border-gray-900 shadow-sm">
                                <Utensils className="h-3.5 w-3.5" />
                            </div>
                        </div>

                        <div className="text-center">
                            <h2 className="text-lg font-black uppercase italic tracking-tighter text-foreground dark:text-white mb-0.5 leading-none">Produtos da Loja</h2>
                            <p className="text-[8px] uppercase font-bold text-gray-400 tracking-[0.2em] opacity-80 leading-none">O que achou dos sabores?</p>
                        </div>

                        <RatingStars
                            value={productRating}
                            onChange={setProductRating}
                            label={productRating === 5 ? "Incrível!" : productRating === 4 ? "Muito Saboroso" : productRating === 3 ? "Gostei" : productRating === 2 ? "Pode Melhorar" : productRating === 1 ? "Não Gostei" : "Sua Nota"}
                        />

                        <TagCloud
                            tags={PRODUCT_TAGS}
                            selectedTags={productTags}
                            onToggle={toggleTag}
                            type="product"
                        />

                        <div className="w-full bg-white dark:bg-black/10 p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm focus-within:border-brand/20 transition-all relative">
                            <Textarea
                                className="border-0 bg-transparent shadow-none focus-visible:ring-0 p-0 text-sm font-bold leading-relaxed italic placeholder:text-gray-300 resize-none h-14 dark:text-gray-100"
                                placeholder="Alguma observação sobre os produtos?"
                                value={comment}
                                maxLength={250}
                                onChange={(e) => setComment(e.target.value)}
                            />
                            <div className="absolute bottom-2 right-4 text-[8px] font-bold text-gray-300 uppercase tracking-widest">
                                {comment.length}/250
                            </div>
                        </div>

                        <div className="grid grid-cols-[80px_1fr] gap-4 w-full pt-4 pb-2">
                            <button
                                onClick={() => setStep(1)}
                                className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || productRating === 0}
                                className="h-16 rounded-xl bg-brand text-white font-black uppercase italic tracking-[0.15em] shadow-xl shadow-brand/20 disabled:grayscale disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center gap-4 overflow-hidden group relative"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <>
                                        <span className="relative z-10 text-lg">Finalizar</span>
                                        <Send className="h-5 w-5 relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="w-full flex flex-col items-center justify-center py-6 max-w-sm mx-auto flex-1"
                    >
                        <div className="relative mb-10">
                            <motion.div
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", damping: 10, stiffness: 150, delay: 0.2 }}
                                className="h-32 w-32 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/30 relative z-10"
                            >
                                <CheckCircle2 className="h-16 w-16" />
                            </motion.div>
                            <motion.div
                                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-[-10%] rounded-full bg-emerald-500/20"
                            />
                        </div>
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-foreground dark:text-white mb-3 text-center leading-none">Incrível!</h2>
                        <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[9px] text-center mb-10 max-w-[240px] leading-loose opacity-70">
                            Sua opinião é o combustível para nossa excelência constante.
                        </p>

                        <button
                            onClick={() => onActiveChange?.(false)}
                            className="w-full h-16 rounded-xl border-2 border-gray-100 dark:border-gray-800 text-gray-400 font-black uppercase italic tracking-[0.2em] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95"
                        >
                            FECHAR
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
