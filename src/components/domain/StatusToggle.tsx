"use client";

import { cn } from "@/lib/utils";

interface StoreStatusBadgeProps {
    isStoreOpen: boolean;
}

export function StatusToggle({ isStoreOpen }: StoreStatusBadgeProps) {
    return (
        <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest select-none",
            isStoreOpen
                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
        )}>
            <span className={cn(
                "h-1.5 w-1.5 rounded-full",
                isStoreOpen
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-red-500"
            )} />
            {isStoreOpen ? "Aberta" : "Fechada"}
        </div>
    );
}
