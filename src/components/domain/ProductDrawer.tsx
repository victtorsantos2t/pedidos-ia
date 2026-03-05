"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Product } from "@/lib/services/catalogService";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, Star, ShoppingBag, ChevronRight, Minus, Plus } from "lucide-react";
import { useCartStore, CartItem } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { Textarea } from "@/components/core/Textarea";
import { cn } from "@/lib/utils";

interface ProductDrawerProps {
    product: Product | null;
    editingItem?: CartItem | null;
    onClose: () => void;
    isStoreOpen?: boolean;
}

export function ProductDrawer({ product, editingItem, onClose, isStoreOpen = true }: ProductDrawerProps) {
    const { addItem, updateItem } = useCartStore();
    const { toggleFavorite, isFavorite } = useFavoritesStore();
    const [quantity, setQuantity] = useState(1);
    const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
    const [notes, setNotes] = useState("");
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const favorited = useMemo(() => product ? isFavorite(product.id) : false, [product, isFavorite]);

    // Bloqueio de scroll do body
    useEffect(() => {
        if (product) {
            document.body.style.overflow = "hidden";
            setImageError(false);
            return () => {
                document.body.style.overflow = "unset";
            };
        }
    }, [product]);

    // Reset de estados
    useEffect(() => {
        if (editingItem) {
            setQuantity(editingItem.quantity);
            setSelectedExtras(editingItem.extras.map(e => e.id));
            setNotes(editingItem.notes);
            setIsDescriptionExpanded(false);
        } else if (product) {
            setQuantity(1);
            setSelectedExtras([]);
            setNotes("");
            setIsDescriptionExpanded(false);
        }
    }, [product, editingItem]);

    const handleToggleExtra = useCallback((extraId: string) => {
        setSelectedExtras((prev) =>
            prev.includes(extraId) ? prev.filter((id) => id !== extraId) : [...prev, extraId]
        );
    }, []);

    const handleAddToCart = useCallback(() => {
        if (!product) return;
        const extrasList = product.product_extras || [];
        const chosenExtras = extrasList.filter((e) => selectedExtras.includes(e.id));

        if (editingItem) {
            updateItem(editingItem.id, quantity, chosenExtras, notes);
        } else {
            addItem(product, quantity, chosenExtras, notes);
        }
        onClose();
    }, [product, quantity, selectedExtras, notes, addItem, updateItem, editingItem, onClose]);

    const extrasList = useMemo(() => product?.product_extras || [], [product]);

    const finalPrice = useMemo(() => {
        if (!product) return 0;
        const extraTotal = selectedExtras.reduce((sum, id) => {
            const match = extrasList.find((e) => e.id === id);
            return sum + (match?.price || 0);
        }, 0);
        return (product.price + extraTotal) * quantity;
    }, [product, selectedExtras, extrasList, quantity]);

    return (
        <AnimatePresence>
            {product && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center">
                    {/* Overlay escuro */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
                        onClick={onClose}
                    />

                    {/* Drawer Content */}
                    <motion.div
                        key={product.id}
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
                        className="relative flex h-[92vh] w-full flex-col rounded-t-[20px] bg-white dark:bg-black sm:max-w-md sm:rounded-[20px] shadow-2xl overflow-hidden pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 🟢 TOP ACTIONS BAR (Fixed On Top of Image) */}
                        <div className="absolute top-4 left-4 right-4 z-[110] flex justify-between items-center pointer-events-none">
                            <button
                                onClick={onClose}
                                className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md hover:bg-black/40 transition-all active:scale-90"
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </button>
                            <button
                                onClick={() => toggleFavorite(product.id)}
                                className={cn(
                                    "pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-all active:scale-90 border",
                                    favorited
                                        ? "bg-brand text-white border-brand"
                                        : "bg-white text-gray-300 border-gray-100 dark:border-gray-800"
                                )}
                            >
                                <Heart className={cn("h-5 w-5", favorited && "fill-current")} />
                            </button>
                        </div>

                        {/* 🟢 SCROLLABLE CONTAINER */}
                        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">

                            {/* 🟢 IMAGE SECTION */}
                            <div className="relative w-full h-[320px] bg-gray-50 dark:bg-[#111] shrink-0">
                                {product.image_url && !imageError ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="h-full w-full object-cover"
                                        loading="eager"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <div className="h-full w-full flex flex-col items-center justify-center gap-2">
                                        <ShoppingBag className="h-10 w-10 text-gray-300" />
                                        <span className="text-[10px] uppercase font-black text-gray-400">Sem imagem</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent h-24" />
                            </div>

                            {/* 🟢 CONTENT SECTION */}
                            <div className="px-6 py-8 pb-40">
                                <div className="space-y-6">
                                    {/* Name & Prices */}
                                    <div className="space-y-2">
                                        <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-tight">
                                            {product.name}
                                        </h1>
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl font-black text-[#FA0000] tabular-nums italic">
                                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price)}
                                            </span>
                                        </div>
                                    </div>



                                    {/* Description */}
                                    {product.description && (
                                        <div className="space-y-1">
                                            <p className={cn(
                                                "text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed transition-all italic",
                                                !isDescriptionExpanded && "line-clamp-2"
                                            )}>
                                                {product.description}
                                            </p>
                                            {product.description.length > 100 && (
                                                <button
                                                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                                    className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1 mt-1"
                                                >
                                                    {isDescriptionExpanded ? "Ver menos" : "Ver mais"}
                                                    <ChevronRight className={cn("h-3 w-3 transition-transform", isDescriptionExpanded && "rotate-90")} />
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Adicionais Extras */}
                                    {extrasList.length > 0 && (
                                        <div className="pt-2">
                                            <h3 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-6 italic">
                                                Adicionais Extras :
                                            </h3>

                                            <div className="space-y-3.5">
                                                {extrasList.map((extra) => (
                                                    <label
                                                        key={extra.id}
                                                        className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-red-500/20 transition-all cursor-pointer group bg-white dark:bg-[#0F0F0F]"
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-[#FA0000] transition-colors">
                                                                {extra.name}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-[#FA0000] mt-1 uppercase italic">
                                                                + {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(extra.price)}
                                                            </span>
                                                        </div>
                                                        <div className="relative h-6 w-6">
                                                            <input
                                                                type="checkbox"
                                                                className="peer sr-only"
                                                                checked={selectedExtras.includes(extra.id)}
                                                                onChange={() => handleToggleExtra(extra.id)}
                                                            />
                                                            <div className="h-full w-full rounded-lg border-2 border-gray-100 dark:border-gray-800 flex items-center justify-center transition-all peer-checked:border-[#FA0000] peer-checked:bg-[#FA0000]">
                                                                <Plus className="h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Observations Area */}
                                    <div className="pt-2">
                                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 italic">Alguma observação?</h3>
                                        <Textarea
                                            className="min-h-[100px] rounded-xl border-gray-100 dark:border-gray-800 focus:ring-red-500/10 text-xs font-medium italic bg-gray-50/50 dark:bg-gray-900/50 p-4"
                                            placeholder="Ex: Sem cebola, ponto da carne mal passado..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 🟢 FLOATING ACTION BAR */}
                        <div className="absolute bottom-6 left-6 right-6 z-[120]">
                            <div className="bg-white dark:bg-[#111] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-800 p-3 flex items-center gap-4">
                                {/* Quantity */}
                                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-black/40 rounded-lg p-1 shrink-0">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="h-9 w-9 flex items-center justify-center rounded-md bg-white dark:bg-gray-800 shadow-sm text-gray-400 hover:text-red-500 transition-all active:scale-90"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-6 text-center text-sm font-black text-gray-900 dark:text-white tabular-nums">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="h-9 w-9 flex items-center justify-center rounded-md bg-white dark:bg-gray-800 shadow-sm text-gray-400 hover:text-red-500 transition-all active:scale-90"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Add Button */}
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!isStoreOpen}
                                    className={cn(
                                        "flex-1 h-12 rounded-lg bg-[#FA0000] text-white flex items-center justify-center gap-3 shadow-[0_10px_30px_-5px_rgba(250,0,0,0.35)] transition-all active:scale-95",
                                        !isStoreOpen && "grayscale opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <ShoppingBag className="h-4 w-4 shrink-0 sm:block hidden lg:block" />
                                    <span className="flex items-center justify-center w-full gap-1.5 text-[10px] sm:text-[11px] font-black uppercase italic tracking-widest leading-none whitespace-nowrap overflow-hidden">
                                        <span className="truncate">{editingItem ? "Atualizar" : "Adicionar"}</span>
                                        <span className="opacity-50 text-[10px] shrink-0">•</span>
                                        <span className="shrink-0">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(finalPrice)}</span>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
