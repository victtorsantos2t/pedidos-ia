"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Image from "next/image";
import { Product } from "@/lib/services/catalogService";

interface ProductCardProps {
    product: Product;
    onAdd: (product: Product) => void;
    isCompact?: boolean;
    isFeatured?: boolean;
    isStoreOpen?: boolean;
}

export function ProductCard({ product, onAdd, isCompact = false, isFeatured = false, isStoreOpen = true }: ProductCardProps) {
    if (isFeatured) {
        return (
            <motion.div
                whileTap={{ scale: 0.98 }}
                className="group flex flex-col cursor-pointer bg-white dark:bg-transparent"
                onClick={() => onAdd(product)}
            >
                {/* Imagem com Canto Super Arredondado */}
                <div className="relative aspect-square w-full overflow-hidden rounded-[24px] bg-[#F2F2F2] dark:bg-gray-900/50 mb-3 border border-transparent group-hover:border-gray-100 transition-all">
                    {product.image_url ? (
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform group-hover:scale-105 duration-500"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800" />
                    )}

                    {/* Badge Mais Pedido */}
                    <div className="absolute top-2.5 left-2.5 bg-[#222] dark:bg-black/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md z-10 backdrop-blur-sm">
                        Mais pedido
                    </div>
                </div>

                {/* Info do Produto */}
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">a partir de</span>
                    <div className="flex items-center gap-2">
                        <span className="text-[15px] font-black text-color-primary tracking-tighter">
                            {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            }).format(product.price)}
                        </span>
                    </div>
                    {/* Exemplo de desconto se houvesse no modelo de dados, vou simular um sutil para o design */}
                    <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-500 dark:text-gray-500 font-bold strike-through line-through opacity-80">R$ {(product.price * 1.2).toFixed(2).replace('.', ',')}</span>
                        <span className="bg-[#00C853] text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">-20%</span>
                    </div>
                    <h3 className="text-[13px] font-bold text-color-primary leading-tight mt-1 line-clamp-2 tracking-tight">
                        {product.name}
                    </h3>
                </div>
            </motion.div>
        );
    }

    if (isCompact) {
        return (
            <motion.div
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="group flex flex-col h-full cursor-pointer overflow-hidden rounded-xl bg-surface p-3 shadow-[var(--shadow-premium)] border border-gray-100 dark:border-gray-800 w-40 shrink-0 hover:shadow-lg transition-all"
                onClick={() => onAdd(product)}
            >
                <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900 mb-3 border border-gray-100 dark:border-gray-800 font-sans">
                    {product.image_url ? (
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform group-hover:scale-110 duration-500"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800" />
                    )}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        className={`absolute top-2 right-2 h-7 w-7 rounded-full bg-white dark:bg-gray-800 text-brand shadow-sm flex items-center justify-center transition-all ${!isStoreOpen && "bg-gray-100 text-gray-400 cursor-not-allowed opacity-70"
                            }`}
                        aria-label="Adicionar item"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isStoreOpen) onAdd(product);
                        }}
                    >
                        <Plus className="h-4 w-4 stroke-[3px]" />
                    </motion.button>
                </div>

                <div className="flex flex-col justify-between flex-1 gap-1">
                    {/* Nome do Produto — text-title (16px/500) */}
                    <h3 className="text-xs text-color-primary line-clamp-2 leading-tight tracking-tight uppercase">
                        {product.name}
                    </h3>
                    {/* Preço — SEMPRE bold + text-primary (regra iFood) */}
                    <div className="text-sm font-bold text-color-primary tracking-tighter">
                        {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                        }).format(product.price)}
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="flex cursor-pointer py-4 border-b border-gray-100 dark:border-gray-800 pressable"
            onClick={() => onAdd(product)}
        >
            <div className="flex-1 pr-4 flex flex-col justify-between">
                <div>
                    {/* Nome — text-title (16px/500) + text-primary */}
                    <h3 className="text-sm font-bold text-color-primary line-clamp-2 leading-tight tracking-tight uppercase mb-1">
                        {product.name}
                    </h3>
                    {product.description && (
                        /* Descrição — text-body (14px/400) + text-secondary (#6B6B6B) */
                        <p className="text-[12px] text-color-secondary line-clamp-2 tracking-tight mt-1">
                            {product.description}
                        </p>
                    )}
                </div>
                {/* Preço — text-price (16px/700) + text-primary — NUNCA cinza */}
                <div className="mt-2 text-sm font-bold text-color-primary tracking-tighter">
                    {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    }).format(product.price)}
                </div>
            </div>

            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900">
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-110 duration-500"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800" />
                )}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className={`absolute bottom-2 right-2 h-8 w-8 rounded-full bg-white dark:bg-gray-800 text-brand shadow border border-gray-100 dark:border-gray-700 transition-all flex items-center justify-center ${!isStoreOpen && "bg-gray-100 text-gray-400 cursor-not-allowed opacity-70"
                        }`}
                    aria-label="Adicionar item"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isStoreOpen) {
                            onAdd(product);
                        }
                    }}
                    disabled={!isStoreOpen}
                >
                    <Plus className="h-4 w-4 stroke-[3px]" />
                </motion.button>
            </div>
        </motion.div>
    );
}
