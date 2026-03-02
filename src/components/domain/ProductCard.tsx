"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Image from "next/image";
import { Product } from "@/lib/services/catalogService";

interface ProductCardProps {
    product: Product;
    onAdd: (product: Product) => void;
    isCompact?: boolean;
    isStoreOpen?: boolean;
}

export function ProductCard({ product, onAdd, isCompact = false, isStoreOpen = true }: ProductCardProps) {
    if (isCompact) {
        return (
            <motion.div
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="group flex flex-col h-full cursor-pointer overflow-hidden rounded-xl bg-surface p-4 shadow-[var(--shadow-premium)] border border-gray-100 dark:border-gray-800 w-52 shrink-0 hover:shadow-lg transition-all"
                onClick={() => onAdd(product)}
            >
                <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900 mb-4 border border-gray-100 dark:border-gray-800 font-sans">
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
                        className={`absolute top-2 right-2 h-7 w-7 rounded-lg shadow-lg shadow-brand/20 flex items-center justify-center transition-all ${isStoreOpen ? "bg-brand text-white" : "bg-gray-400 text-white cursor-not-allowed opacity-70"
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
                    <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-tight tracking-tight uppercase">
                        {product.name}
                    </h3>
                    <div className="font-black text-foreground text-base tracking-tighter">
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
            className="flex cursor-pointer overflow-hidden rounded-xl bg-surface p-5 shadow-[var(--shadow-premium)] border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow"
            onClick={() => onAdd(product)}
        >
            <div className="flex-1 pr-4 flex flex-col justify-between">
                <div>
                    <h3 className="text-base font-bold text-foreground line-clamp-2 leading-tight tracking-tight uppercase mb-2">
                        {product.name}
                    </h3>
                    {product.description && (
                        <p className="mt-1 text-xs text-gray-400 font-medium line-clamp-1 tracking-tight">
                            {product.description}
                        </p>
                    )}
                </div>
                <div className="mt-3 font-black text-foreground text-base tracking-tighter">
                    {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    }).format(product.price)}
                </div>
            </div>

            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-inner">
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
                    className={`absolute bottom-2 right-2 h-7 w-7 rounded-lg text-white shadow-lg shadow-brand/20 transition-all flex items-center justify-center ${isStoreOpen ? "bg-brand" : "bg-gray-400 cursor-not-allowed opacity-70"
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
