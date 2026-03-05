"use client";

import { Category } from "@/lib/services/catalogService";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

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
    const [isStuck, setIsStuck] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsStuck(!entry.isIntersecting);
            },
            {
                threshold: [1],
                rootMargin: "-1px 0px 0px 0px"
            }
        );

        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <>
            <div ref={sentinelRef} className="h-px w-full" />
            <div className={cn(
                "sticky top-0 z-40 w-full bg-white dark:bg-black px-5 transition-all duration-300 py-4 border-b border-gray-100 dark:border-gray-800",
                isStuck && "shadow-md shadow-black/5 dark:shadow-black/20"
            )}>
                <div className="no-scrollbar flex gap-6 overflow-x-auto items-center">
                    {categories.map((cat) => {
                        const isActive = activeCategoryId === cat.id;

                        return (
                            <button
                                key={cat.id}
                                onClick={() => onSelect(cat.id)}
                                className={cn(
                                    "relative whitespace-nowrap py-1 text-[11px] font-black uppercase italic tracking-widest transition-all active:scale-95",
                                    isActive ? "text-brand" : "text-color-primary opacity-60"
                                )}
                            >
                                <span className="relative z-10">{cat.name}</span>

                                {isActive && (
                                    <motion.div
                                        layoutId="activeCategoryIndicator"
                                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand rounded-full"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
