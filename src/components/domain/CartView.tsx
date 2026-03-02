"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { Category, Product } from "@/lib/services/catalogService";
import { StoreConfig } from "@/lib/actions/adminSettingsActions";
import { ProductCard } from "./ProductCard";
import { ProductDrawer } from "./ProductDrawer";
import { TrendingUp, Sparkles, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

interface CartViewProps {
    allCategories?: Category[];
    allProducts?: Product[];
    isStoreOpen?: boolean;
    storeSettings?: StoreConfig | null;
}
export function CartView({ allCategories = [], allProducts = [], isStoreOpen = true, storeSettings }: CartViewProps) {
    const router = useRouter();
    const { items, removeItem, incrementQuantity, decrementQuantity, totalPrice, totalItems } = useCartStore();
    const [confirmingRemoval, setConfirmingRemoval] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    if (items.length === 0) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
                    <ShoppingBag className="h-10 w-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Sua sacola está vazia</h2>
                <p className="mt-2 text-sm text-gray-500">Adicione itens do cardápio para começar.</p>
                <button
                    onClick={() => router.push("/")}
                    className="mt-6 h-12 px-8 rounded-xl bg-brand text-white font-semibold hover:bg-brand-hover transition-colors"
                >
                    Ver Cardápio
                </button>
            </div>
        );
    }

    const subtotal = totalPrice();
    const itemCount = totalItems();

    const handleRemoveRequest = (itemId: string) => {
        setConfirmingRemoval(itemId);
    };

    const confirmRemoval = () => {
        if (confirmingRemoval) {
            removeItem(confirmingRemoval);
            setConfirmingRemoval(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background pb-32">
            {/* Header */}
            <header className="sticky top-0 z-40 flex items-center gap-3 bg-surface px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-4 shadow-sm border-b border-gray-100 dark:border-gray-800">
                <button
                    onClick={() => router.back()}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-90 shadow-sm"
                >
                    <ArrowLeft className="h-5 w-5 text-foreground" />
                </button>
                <h1 className="text-lg font-bold text-foreground">Sacola</h1>
            </header>

            <div className="max-w-lg mx-auto">
                {/* Itens adicionados */}
                <section className="bg-surface mx-4 mt-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h2 className="font-bold text-foreground px-4 pt-4 pb-2">Itens adicionados</h2>

                    <AnimatePresence initial={false}>
                        {items.map((item) => {
                            const extrasTotal = item.extras?.reduce((a, e) => a + e.price, 0) || 0;
                            const unitTotal = item.product.price + extrasTotal;
                            const lineTotal = unitTotal * item.quantity;

                            return (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="border-b border-gray-50 dark:border-gray-800 last:border-0"
                                >
                                    <div className="flex gap-4 p-5">
                                        {/* Imagem do produto */}
                                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800">
                                            {item.product.image_url ? (
                                                <Image
                                                    src={item.product.image_url}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="80px"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-gray-300">
                                                    <ShoppingBag className="h-8 w-8" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-2">{item.product.name}</h3>
                                                    <button
                                                        onClick={() => handleRemoveRequest(item.id)}
                                                        className="h-7 w-7 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                {item.extras && item.extras.length > 0 && (
                                                    <p className="text-[10px] font-bold uppercase text-gray-400 mt-1 truncate tracking-tight">
                                                        {item.extras.map(e => e.name).join(", ")}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-end mt-2">
                                                <motion.p
                                                    key={lineTotal}
                                                    initial={{ opacity: 0.5, y: -2 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-base font-bold text-foreground tracking-tighter"
                                                >
                                                    {fmt(lineTotal)}
                                                </motion.p>

                                                {/* Controles de quantidade */}
                                                <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-950 p-1 rounded-xl border border-gray-100 dark:border-gray-800">
                                                    <motion.button
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => item.quantity > 1 ? decrementQuantity(item.id) : handleRemoveRequest(item.id)}
                                                        className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white dark:hover:bg-gray-800 text-foreground transition-all"
                                                    >
                                                        <Minus className="h-3.5 w-3.5" />
                                                    </motion.button>

                                                    <AnimatePresence mode="wait">
                                                        <motion.span
                                                            key={item.quantity}
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.8 }}
                                                            className="w-6 text-center text-xs font-black text-foreground"
                                                        >
                                                            {item.quantity}
                                                        </motion.span>
                                                    </AnimatePresence>

                                                    <motion.button
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => incrementQuantity(item.id)}
                                                        className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white dark:hover:bg-gray-800 text-foreground transition-all"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </section>

                {/* Upsell / Sugestões */}
                {allProducts.length > 0 && (
                    <section className="mt-10 px-4">
                        {(() => {
                            const cartCategoryIds = new Set(items.map(i => i.product.category_id));
                            const missingCategories = allCategories.filter(c => !cartCategoryIds.has(c.id));

                            let sectionTitle = "Combine com seu pedido 🍟";
                            let sectionIcon = <Sparkles className="h-5 w-5" />;
                            let productsToShow: Product[] = [];

                            if (missingCategories.length > 0) {
                                const targetCategory = missingCategories.find(c =>
                                    c.name.toLowerCase().includes('acompanhamento') ||
                                    c.name.toLowerCase().includes('bebida')
                                ) || missingCategories[0];

                                sectionTitle = `Combine com seu pedido 🍟`;
                                sectionIcon = <PlusCircle className="h-5 w-5" />;
                                productsToShow = allProducts.filter(p => p.category_id === targetCategory.id).slice(0, 6);
                            } else {
                                sectionTitle = "Os mais pedidos ✨";
                                productsToShow = allProducts.slice(0, 6);
                            }

                            if (productsToShow.length === 0) return null;

                            return (
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1 px-1">
                                        <div className="flex items-center gap-2 text-foreground">
                                            <h3 className="font-black text-xl italic uppercase tracking-tighter">{sectionTitle}</h3>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Clientes geralmente pedem junto</p>
                                    </div>

                                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 scroll-smooth">
                                        {productsToShow.map((product) => (
                                            <div key={`upsell-${product.id}`} className="min-w-[200px] shrink-0">
                                                <ProductCard
                                                    product={product}
                                                    onAdd={(p) => isStoreOpen && setSelectedProduct(p)}
                                                    isCompact
                                                    isStoreOpen={isStoreOpen}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
                    </section>
                )}

                {/* Adicionar mais itens */}
                <div className="px-4 mt-6">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-gray-100 dark:bg-gray-800 text-foreground font-bold text-sm hover:bg-gray-200 transition-all active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        Adicionar mais itens
                    </Link>
                </div>

                {/* Resumo de valores & Ação */}
                <section className="bg-surface mx-4 mt-8 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800 p-6 mb-20">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Resumo da Compra</h2>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-gray-400 leading-none mb-1">Subtotal</span>
                            <div className="flex items-baseline gap-1">
                                <motion.span
                                    key={subtotal}
                                    initial={{ scale: 0.98, opacity: 0.8 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-2xl font-black text-foreground tracking-tighter"
                                >
                                    {fmt(subtotal)}
                                </motion.span>
                                <span className="text-[9px] text-brand font-black uppercase tracking-tight italic">/ {itemCount} UN</span>
                            </div>
                        </div>

                        <button
                            onClick={() => isStoreOpen && router.push("/checkout")}
                            disabled={!isStoreOpen || subtotal < (storeSettings?.min_order_value || 0)}
                            className={cn(
                                "h-14 px-8 rounded-xl font-black text-sm uppercase italic tracking-widest transition-all shadow-xl active:scale-95 group relative overflow-hidden",
                                isStoreOpen && subtotal >= (storeSettings?.min_order_value || 0)
                                    ? "bg-brand text-white shadow-brand/20 hover:brightness-110"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                            )}
                        >
                            <span className="relative z-10">
                                {!isStoreOpen ? "LOJA FECHADA" : "FINALIZAR PEDIDO"}
                            </span>
                            {isStoreOpen && subtotal >= (storeSettings?.min_order_value || 0) && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                            )}
                        </button>
                    </div>
                </section>
            </div>

            {/* Modal de Confirmação de Remoção */}
            <AnimatePresence>
                {confirmingRemoval && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setConfirmingRemoval(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-sm overflow-hidden rounded-xl bg-surface p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/30 text-red-600">
                                    <AlertTriangle className="h-8 w-8" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">Remover item?</h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    Deseja realmente remover este item da sua sacola?
                                </p>

                                <div className="mt-8 flex w-full gap-3">
                                    <button
                                        onClick={() => setConfirmingRemoval(null)}
                                        className="flex-1 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 text-foreground font-bold text-sm hover:bg-gray-200 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={confirmRemoval}
                                        className="flex-1 h-12 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                                    >
                                        Remover
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Alerta de Pedido Mínimo */}
            {isStoreOpen && storeSettings && subtotal < (storeSettings.min_order_value || 0) && (
                <div className="fixed bottom-[180px] left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-lg z-40 animate-in slide-in-from-bottom duration-500">
                    <div className="bg-red-50/90 dark:bg-red-950/40 backdrop-blur-md border border-red-100 dark:border-red-800 p-4 rounded-xl shadow-xl shadow-red-500/10 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-600 flex items-center justify-center shrink-0">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-black uppercase text-red-400 leading-none">Pedido Mínimo insuficiente</p>
                            <p className="text-sm font-bold text-red-700 dark:text-red-300 tracking-tight mt-0.5">
                                Faltam <span className="text-red-600 font-extrabold">{fmt(storeSettings.min_order_value - subtotal)}</span> para atingir o valor mínimo.
                            </p>
                        </div>
                    </div>
                </div>
            )}



            <ProductDrawer
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
                isStoreOpen={isStoreOpen}
            />
        </div>
    );
}
