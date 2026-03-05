"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, CartItem } from "@/store/cartStore";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, AlertTriangle, Pencil } from "lucide-react";
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
    const { items, removeItem, incrementQuantity, decrementQuantity, totalPrice, totalItems, clearCart } = useCartStore();
    const [confirmingRemoval, setConfirmingRemoval] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [editingItem, setEditingItem] = useState<CartItem | null>(null);
    const [showClearCartModal, setShowClearCartModal] = useState(false);

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
            <header className="sticky top-0 z-40 bg-surface shadow-sm border-b border-gray-100 dark:border-gray-800">
                <div className="mx-auto w-full max-w-lg px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-90 shadow-sm"
                        >
                            <ArrowLeft className="h-5 w-5 text-foreground" />
                        </button>
                        <h1 className="text-lg font-bold text-foreground">Sacola</h1>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowClearCartModal(true)}
                        className="text-[10px] font-black uppercase text-red-500 tracking-widest hover:bg-red-50 dark:hover:bg-red-950/20 px-3 py-2 rounded-lg transition-colors"
                    >
                        Limpar
                    </button>
                </div>
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
                                        <button
                                            onClick={() => {
                                                setSelectedProduct(item.product);
                                                setEditingItem(item);
                                            }}
                                            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 hover:scale-95 transition-transform group/img"
                                        >
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
                                            {/* Ícone de Lápis - Sempre visível para mobile */}
                                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center transition-opacity">
                                                <div className="bg-white/95 dark:bg-black/95 p-1.5 rounded-full shadow-md border border-gray-100 dark:border-gray-800">
                                                    <Pencil className="h-3 w-3 text-brand" />
                                                </div>
                                            </div>
                                        </button>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                            <button
                                                onClick={() => {
                                                    setSelectedProduct(item.product);
                                                    setEditingItem(item);
                                                }}
                                                className="text-left group"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-2 group-hover:text-brand transition-colors">{item.product.name}</h3>
                                                </div>

                                                {item.extras && item.extras.length > 0 && (
                                                    <div className="flex flex-col gap-0.5 mt-0.5">
                                                        {item.extras.map((extra, idx) => (
                                                            <div key={idx} className="flex justify-between items-center pr-2">
                                                                <p className="text-[10px] font-bold uppercase text-gray-500 tracking-tight leading-none group-hover:text-gray-600 transition-colors">
                                                                    + {extra.name}
                                                                </p>
                                                                <span className="text-[10px] font-black italic text-brand/70 tracking-tighter">{fmt(extra.price)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </button>

                                            <div className="flex justify-between items-center mt-auto pt-1">
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
                                                        className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white dark:hover:bg-gray-800 text-brand transition-all"
                                                    >
                                                        {item.quantity > 1 ? (
                                                            <Minus className="h-3.5 w-3.5" />
                                                        ) : (
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        )}
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
                                                        className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white dark:hover:bg-gray-800 text-brand transition-all"
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

                {/* Adicionar mais itens */}
                <div className="px-4 mt-6">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-transparent text-brand font-bold text-sm hover:bg-brand/5 transition-all active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        Adicionar mais itens
                    </Link>
                </div>

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



                {/* Resumo de valores & Ação (Fixo no Rodapé - Fiel à Ref 2 com Ícone Brand) */}
                <section className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800 p-5 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                    <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Subtotal</span>
                            <div className="flex items-baseline gap-1.5">
                                <motion.span
                                    key={subtotal}
                                    initial={{ opacity: 0.8 }}
                                    animate={{ opacity: 1 }}
                                    className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight"
                                >
                                    {fmt(subtotal)}
                                </motion.span>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    / {itemCount} {itemCount === 1 ? "item" : "itens"}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => isStoreOpen && router.push("/checkout")}
                            disabled={!isStoreOpen || subtotal < (storeSettings?.min_order_value || 0)}
                            className={cn(
                                "px-10 h-14 rounded-2xl font-semibold text-lg transition-all active:scale-95 shadow-lg flex items-center justify-center gap-3 relative overflow-hidden group",
                                isStoreOpen && subtotal >= (storeSettings?.min_order_value || 0)
                                    ? "bg-brand text-white shadow-brand/20"
                                    : "bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed shadow-none"
                            )}
                        >
                            <span className="relative z-10">
                                {!isStoreOpen ? "Loja Fechada" : "Continuar"}
                            </span>
                            {isStoreOpen && subtotal >= (storeSettings?.min_order_value || 0) && (
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                                    <motion.div
                                        animate={{ x: [0, 4, 0] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                    >
                                        <ShoppingBag className="h-5 w-5" />
                                    </motion.div>
                                </>
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

            {/* Alerta de Pedido Mínimo (Fixo acima do resumo) */}
            {isStoreOpen && storeSettings && subtotal < (storeSettings.min_order_value || 0) && (
                <div className="fixed bottom-[130px] left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-lg z-30 animate-in slide-in-from-bottom duration-500">
                    <div className="bg-red-50/90 dark:bg-red-950/80 backdrop-blur-xl border border-red-100/30 dark:border-red-800/30 p-4 rounded-2xl shadow-2xl flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black uppercase text-red-500 dark:text-red-400 leading-none tracking-widest italic mb-1">Pedido Mínimo</p>
                            <p className="text-sm font-bold text-red-700 dark:text-red-100 tracking-tight leading-snug">
                                Adicione mais <span className="font-black italic">{fmt(storeSettings.min_order_value - subtotal)}</span> para continuar.
                            </p>
                        </div>
                    </div>
                </div>
            )}



            <ProductDrawer
                product={selectedProduct}
                editingItem={editingItem}
                onClose={() => {
                    setSelectedProduct(null);
                    setEditingItem(null);
                }}
                isStoreOpen={isStoreOpen}
            />

            {/* Clear Cart Confirmation Modal */}
            <AnimatePresence>
                {showClearCartModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowClearCartModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl p-8 text-center shadow-2xl border border-gray-100 dark:border-gray-800"
                        >
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30 text-red-500 shadow-inner">
                                <AlertTriangle className="h-10 w-10" />
                            </div>

                            <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tighter leading-tight mb-3">
                                Limpar Carrinho?
                            </h2>

                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 px-2">
                                Todos os itens serão removidos e você voltará para o cardápio. Deseja continuar?
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        clearCart();
                                        router.push("/");
                                    }}
                                    className="w-full h-14 rounded-xl bg-red-500 text-white font-black uppercase italic tracking-widest shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Sim, Limpar Tudo
                                </button>

                                <button
                                    onClick={() => setShowClearCartModal(false)}
                                    className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-foreground transition-all"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
