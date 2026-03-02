"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface StatusToggleProps {
    isStoreOpen: boolean;
    onToggle?: (isOpen: boolean) => void;
}

export function StatusToggle({ isStoreOpen: initialStatus, onToggle }: StatusToggleProps) {
    const [isOpen, setIsOpen] = useState(initialStatus);

    const handleToggle = () => {
        const newStatus = !isOpen;
        setIsOpen(newStatus);
        if (onToggle) onToggle(newStatus);
    };

    return (
        <div className="flex items-center gap-1.5 p-1 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl w-fit">
            <button
                onClick={() => { setIsOpen(true); if (onToggle) onToggle(true); }}
                className={cn(
                    "px-5 py-2 rounded-[12px] text-[10px] font-black uppercase tracking-widest italic transition-all duration-300 whitespace-nowrap",
                    isOpen
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                        : "text-gray-400 hover:text-emerald-500"
                )}
            >
                Aberto
            </button>
            <button
                onClick={() => { setIsOpen(false); if (onToggle) onToggle(false); }}
                className={cn(
                    "px-5 py-2 rounded-[12px] text-[10px] font-black uppercase tracking-widest italic transition-all duration-300 whitespace-nowrap",
                    !isOpen
                        ? "bg-[#FA0000] text-white shadow-lg shadow-red-500/20"
                        : "text-gray-400 hover:text-[#FA0000]"
                )}
            >
                Fechado
            </button>
        </div>
    );
}
