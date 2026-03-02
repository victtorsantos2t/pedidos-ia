"use client";

import { Category } from "@/lib/services/catalogService";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StickyCategoryBarProps {
    categories: Category[];
    activeCategoryId: string | null;
    onSelect: (id: string) => void;
    scrolled?: boolean;
}

export function StickyCategoryBar({
    categories,
    activeCategoryId,
    onSelect,
    scrolled = false,
}: StickyCategoryBarProps) {
    return (
        <div className={cn(
            "sticky z-40 w-full bg-white/95 dark:bg-black/95 px-5 transition-all duration-300 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800",
            scrolled
                ? "top-[64px] py-2.5 shadow-md"
                : "top-0 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-3"
        )}>
            <div className="no-scrollbar flex gap-2.5 overflow-x-auto">
                {categories.map((cat) => {
                    const isActive = activeCategoryId === cat.id;

                    return (
                        <button
                            key={cat.id}
                            onClick={() => onSelect(cat.id)}
                            className={cn(
                                "relative whitespace-nowrap rounded-full px-5 py-2 text-[11px] font-black uppercase italic tracking-widest transition-all active:scale-95 border",
                                isActive
                                    ? "text-white border-transparent"
                                    : "bg-white dark:bg-black border-brand/20 text-brand"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeCategory"
                                    className="absolute inset-0 rounded-full bg-brand shadow-lg shadow-brand/20"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">{cat.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
