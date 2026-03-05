"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, ShoppingBag, Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Product } from "@/lib/services/catalogService";
import { useFavoritesStore } from "@/store/favoritesStore";
import { ProductCard } from "./ProductCard";
import { ProductDrawer } from "./ProductDrawer";

const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

interface FavoritesViewProps {
    allProducts: Product[];
    isStoreOpen?: boolean;
}

export function FavoritesView({ allProducts, isStoreOpen = true }: FavoritesViewProps) {
    const router = useRouter();
    const { favoriteIds } = useFavoritesStore();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const favoriteProducts = useMemo(() => {
        return allProducts.filter(p => favoriteIds.includes(p.id));
    }, [allProducts, favoriteIds]);

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Header Sticky */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 h-[70px] flex items-center px-4">
                <div className="max-w-lg mx-auto w-full flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => router.back()}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-foreground"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </motion.button>
                        <h1 className="text-xl font-black text-foreground uppercase italic tracking-tighter italic">Meus Favoritos</h1>
                    </div>
                </div>
            </header>

            {/* Espaçador */}
            <div className="h-[70px]" />

            <main className="max-w-lg mx-auto p-5">
                {favoriteProducts.length > 0 ? (
                    <div className="grid gap-5">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-5 w-5 text-brand" />
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest leading-none">
                                {favoriteProducts.length} itens salvos
                            </p>
                        </div>

                        {favoriteProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAdd={(p) => setSelectedProduct(p)}
                                isStoreOpen={isStoreOpen}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="h-20 w-20 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900 mb-6">
                            <Heart className="h-10 w-10 text-gray-200" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Nada por aqui ainda</h2>
                        <p className="mt-2 text-sm text-gray-500 max-w-[250px]">
                            Favorite seus itens preferidos para encontrá-los rapidamente aqui.
                        </p>
                        <button
                            onClick={() => router.push("/")}
                            className="mt-8 h-12 px-8 rounded-xl bg-brand text-white font-black uppercase italic tracking-widest text-[11px] shadow-lg shadow-brand/20 active:scale-95 transition-all"
                        >
                            Explorar Cardápio
                        </button>
                    </div>
                )}
            </main>

            <ProductDrawer
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
                isStoreOpen={isStoreOpen}
            />
        </div>
    );
}

// Pequeno componente local para ícone
function Sparkles({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" /><path d="M3 5h4" /><path d="M21 17v4" /><path d="M19 19h4" />
        </svg>
    );
}
