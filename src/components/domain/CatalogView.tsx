"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Category, Product } from "@/lib/services/catalogService";
import { StickyCategoryBar } from "./StickyCategoryBar";
import { ProductCard } from "./ProductCard";
import { FloatingCart } from "./FloatingCart";
import { ProductDrawer } from "./ProductDrawer";
import { TrendingUp, Sparkles, PlusCircle, Search, Info, Clock, Wallet, Bike, Star, Plus } from "lucide-react";
import { UserButton } from "../core/UserButton";
import { Input } from "@/components/core/Input";
import { StoreConfig } from "@/lib/actions/adminSettingsActions";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CatalogViewProps {
    categories: Category[];
    products: Product[];
    isStoreOpen?: boolean;
    storeSettings?: StoreConfig | null;
    ratingStats?: {
        averageProduct: number;
        averageDelivery: number;
        total: number;
    };
}

export function CatalogView({ categories, products, isStoreOpen = true, storeSettings, ratingStats }: CatalogViewProps) {
    const [activeCategory, setActiveCategory] = useState<string | null>(
        categories.length > 0 ? categories[0].id : null
    );
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const isScrollingRef = useRef(false);
    const [scrolled, setScrolled] = useState(false);

    // Monitor de Scroll para o Header Sticky
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Filtragem por busca
    const filteredProductsBySearch = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredCategoriesBySearch = searchQuery
        ? categories.filter(cat => filteredProductsBySearch.some(p => p.category_id === cat.id))
        : categories;

    // Scroll suave ao clicar na categoria
    const handleSelectCategory = useCallback((categoryId: string) => {
        setSearchQuery(""); // Limpa busca ao trocar categoria
        setActiveCategory(categoryId);
        isScrollingRef.current = true;

        const el = document.getElementById(`section-${categoryId}`);
        if (el) {
            const offset = 120; // Altura do header encolhido + margens
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = el.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });

            setTimeout(() => {
                isScrollingRef.current = false;
            }, 800);
        }
    }, []);

    // IntersectionObserver: detecta automaticamente qual seção está visível
    useEffect(() => {
        if (searchQuery) return; // Desativa auto-scroll enquanto busca p/ não pular seções

        const sectionIds = categories
            .map((cat) => `section-${cat.id}`);

        const observer = new IntersectionObserver(
            (entries) => {
                if (isScrollingRef.current) return;

                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const id = entry.target.id.replace("section-", "");
                        setActiveCategory(id);
                        break;
                    }
                }
            },
            {
                rootMargin: "-100px 0px -60% 0px",
                threshold: 0,
            }
        );

        sectionIds.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [categories, products, searchQuery]);

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Sticky Branding Header - Glassmorphism */}
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[var(--ease-out)] px-5",
                    scrolled
                        ? "bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 py-3 h-[64px]"
                        : "bg-transparent py-6 pt-[calc(env(safe-area-inset-top,0px)+24px)] h-[120px]"
                )}
            >
                <div className="max-w-lg mx-auto flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 cursor-pointer group active:scale-95 transition-all"
                        onClick={() => window.location.href = "/ratings"}
                    >
                        {/* Logo Circular com Borda Brand */}
                        <motion.div
                            animate={{
                                width: scrolled ? 32 : 44,
                                height: scrolled ? 32 : 44
                            }}
                            className={cn(
                                "relative rounded-full border-2 border-brand p-0.5 bg-white overflow-hidden shadow-sm transition-all duration-300",
                                scrolled ? "h-8 w-8" : "h-11 w-11"
                            )}
                        >
                            {storeSettings?.logo_url ? (
                                <Image src={storeSettings.logo_url} alt="Logo" fill className="object-cover rounded-full" />
                            ) : (
                                <div className="h-full w-full bg-brand flex items-center justify-center rounded-full">
                                    <span className="text-white font-black text-xs">{storeSettings?.store_name?.charAt(0) || "S"}</span>
                                </div>
                            )}
                        </motion.div>

                        {/* Nome e Status */}
                        <div className="flex flex-col">
                            <h1 className={cn(
                                "font-black tracking-tighter leading-none transition-all duration-300",
                                scrolled ? "text-base" : "text-xl text-[#2A2A2A] dark:text-white"
                            )}>
                                {storeSettings?.store_name || "SMASH GOURMET"}
                            </h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="flex items-center gap-1">
                                    <div className={cn(
                                        "h-1.5 w-1.5 rounded-full",
                                        isStoreOpen ? "bg-[#00C853] animate-pulse-glow" : "bg-gray-400"
                                    )} />
                                    <span className={cn(
                                        "text-[11px] font-bold uppercase tracking-tight",
                                        isStoreOpen ? "text-[#00C853]" : "text-gray-400"
                                    )}>
                                        {isStoreOpen ? "Aberto agora" : "Fechado"}
                                    </span>
                                </div>
                                {ratingStats && ratingStats.total > 0 && (
                                    <div className="flex items-center gap-1 border-l border-gray-200 dark:border-gray-800 pl-2">
                                        <span className="text-[10px] font-black">{ratingStats.averageProduct}</span>
                                        <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                                        <span className="text-[10px] text-gray-400 font-bold">({ratingStats.total})</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    <div className="flex items-center gap-3">
                        <UserButton />
                    </div>
                </div>
            </header>

            {/* Espaçador para o Header Fixed */}
            <div className="h-[120px]" />

            <motion.div
                animate={{
                    opacity: scrolled ? 0 : 1,
                    y: scrolled ? -20 : 0,
                    height: scrolled ? 0 : "auto",
                    marginBottom: scrolled ? 0 : 32
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={cn("px-5 overflow-hidden", scrolled && "pointer-events-none")}
            >
                <div className="max-w-lg mx-auto relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-brand transition-colors" />
                    </div>
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Busque por "${products[0]?.name || 'Smash Chicken'}"...`}
                        className="w-full bg-gray-100 dark:bg-gray-900 border-none h-14 pl-12 pr-4 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand/20 transition-all shadow-sm"
                    />
                </div>
            </motion.div>

            {
                !isStoreOpen && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/50 px-5 py-4 flex items-center gap-4 animate-in slide-in-from-top duration-500">
                        <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/10">
                            <Info className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-black text-amber-900 dark:text-amber-100 uppercase tracking-tighter italic text-xs">Loja Fechada no momento</h3>
                            <p className="text-amber-700 dark:text-amber-400 text-[10px] font-bold leading-tight uppercase tracking-tighter">Já encerramos por hoje, mas sinta-se à vontade para navegar!</p>
                        </div>
                    </div>
                )
            }

            {isStoreOpen && storeSettings && (
                <motion.div
                    animate={{
                        opacity: scrolled ? 0 : 1,
                        height: scrolled ? 0 : "auto",
                        marginTop: scrolled ? 0 : 4
                    }}
                    className={cn("overflow-hidden", scrolled && "pointer-events-none")}
                >
                    <div
                        className="bg-surface border-b border-gray-100 dark:border-gray-800 px-5 py-3 flex items-center justify-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                        onClick={() => window.location.href = "/ratings"}
                    >
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="bg-orange-50 dark:bg-orange-950 px-2 py-1.5 rounded-lg flex items-center gap-2 border border-orange-100/50 dark:border-orange-800/30">
                                <Clock className="h-4 w-4 text-orange-600" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase text-orange-400 leading-none">Entrega</span>
                                    <span className="text-xs font-black text-orange-800 dark:text-orange-200 tracking-tight italic uppercase">{storeSettings.estimated_time || "30-45 min"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <div className="bg-brand/5 px-2 py-1.5 rounded-lg flex items-center gap-2 border border-brand/10">
                                <Wallet className="h-4 w-4 text-brand" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase text-brand/50 leading-none">Mínimo</span>
                                    <span className="text-xs font-black text-brand tracking-tight italic uppercase">
                                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(storeSettings.min_order_value || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <div className="bg-blue-50 dark:bg-blue-950 px-2 py-1.5 rounded-lg flex items-center gap-2 border border-blue-100/50 dark:border-blue-800/30">
                                <Bike className="h-4 w-4 text-blue-600" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase text-blue-400 leading-none">Taxa</span>
                                    <span className="text-xs font-black text-blue-800 dark:text-blue-200 tracking-tight italic uppercase">
                                        {storeSettings.delivery_fee > 0 ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(storeSettings.delivery_fee) : "Grátis"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {
                !searchQuery && categories.length > 0 && (
                    <StickyCategoryBar
                        categories={categories}
                        activeCategoryId={activeCategory}
                        onSelect={handleSelectCategory}
                        scrolled={scrolled}
                    />
                )
            }

            <div className="px-5 py-8 space-y-14">
                {/* Herói / Sugestão do Chef (Fase 4) */}
                {!searchQuery && products.length > 0 && (
                    <div className="relative overflow-hidden rounded-xl bg-black h-48 flex items-center group cursor-pointer shadow-2xl shadow-brand/10 transition-transform active:scale-95"
                        onClick={() => setSelectedProduct(products[0])}>
                        <div className="absolute inset-0 opacity-60">
                            {products[0].image_url ? (
                                <Image
                                    src={products[0].image_url}
                                    alt="Destaque"
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                            ) : (
                                <div className="bg-gradient-to-br from-brand to-red-900 h-full w-full" />
                            )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                        <div className="relative z-10 px-6 space-y-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                <div className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                                Sugestão do Chef
                            </span>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">{products[0].name}</h3>
                                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-1">Experimente o nosso sabor mais exclusivo</p>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <span className="text-lg font-black text-white italic tracking-tighter">
                                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(products[0].price)}
                                </span>
                                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-brand">
                                    <Plus className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Seção Mais Pedidos */}
                {!searchQuery && products.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2.5 px-1">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 shadow-sm">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">Mais Pedidos</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">OS QUERIDINHOS DA CASA</p>
                            </div>
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-5 px-5 scroll-smooth">
                            {products.slice(0, 7).map((product) => (
                                <div key={`top-${product.id}`} className="shrink-0">
                                    <ProductCard
                                        product={product}
                                        onAdd={(p) => isStoreOpen && setSelectedProduct(p)}
                                        isStoreOpen={isStoreOpen}
                                        isCompact={true}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {filteredCategoriesBySearch.map((category) => {
                    const catProducts = filteredProductsBySearch.filter(
                        (p) => p.category_id === category.id
                    );

                    return (
                        <div key={category.id} id={`section-${category.id}`} className="scroll-mt-28">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-2xl font-bold text-foreground">
                                    {category.name}
                                </h2>
                                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-3 py-1 rounded-full font-bold">
                                    {catProducts.length} itens
                                </span>
                            </div>
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {catProducts.length > 0 ? (
                                    catProducts.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            onAdd={(p) => isStoreOpen && setSelectedProduct(p)}
                                            isStoreOpen={isStoreOpen}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-full py-8 text-center bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                                        <p className="text-gray-400 text-sm">Nenhum produto disponível nesta categoria ainda.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {filteredProductsBySearch.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-full mb-4">
                            <Search className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">Nada encontrado</h3>
                        <p className="text-sm text-gray-500 max-w-xs mt-2">
                            Não encontramos nenhum item chamado "{searchQuery}". Tente outro nome ou navegue pelas categorias.
                        </p>
                    </div>
                )}
            </div>

            <ProductDrawer
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
                isStoreOpen={isStoreOpen}
            />
            <div className="h-20" />
        </div >
    );
}
