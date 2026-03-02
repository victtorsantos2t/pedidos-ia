"use client";

import { useState, useEffect } from "react";
import { Home, Search, ShoppingBag, ClipboardList, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { motion, AnimatePresence } from "framer-motion";

export function BottomNav() {
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);
    const totalItems = useCartStore((state) => state.totalItems());

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const navItems = [
        { icon: Home, label: "Início", href: "/", onClick: () => window.location.href = "/" },
        { icon: Search, label: "Busca", href: "#search" },
        { icon: ShoppingBag, label: "Carrinho", href: "/cart", isCart: true },
        { icon: ClipboardList, label: "Pedidos", href: "/profile/orders" },
        { icon: User, label: "Perfil", href: "/profile" },
    ];

    if (pathname.startsWith("/admin") || pathname.startsWith("/checkout")) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom,0px)]">
            {/* Fade gradiente acima da nav */}
            <div className="h-8 bg-gradient-to-t from-white/60 dark:from-black/60 to-transparent pointer-events-none" />

            <div className="bg-white/90 dark:bg-[#111]/90 backdrop-blur-2xl border-t border-gray-100/80 dark:border-white/[0.06] px-4 pt-2 pb-3 shadow-[0_-8px_32px_rgba(0,0,0,0.10)]">
                <div className="max-w-lg mx-auto flex items-end justify-between">
                    {navItems.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href === "/profile/orders" && pathname.startsWith("/order/"));
                        const Icon = item.icon;

                        /* ── CARRINHO (botão elevado central) ── */
                        if (item.isCart) {
                            return (
                                <Link key={item.href} href={item.href} className="relative flex flex-col items-center -mt-7">
                                    <motion.div
                                        whileTap={{ scale: 0.88 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                        className={cn(
                                            "h-[58px] w-[58px] rounded-2xl flex items-center justify-center text-white shadow-2xl border-[3px] border-white dark:border-[#111] transition-colors duration-300",
                                            isActive
                                                ? "bg-brand shadow-brand/40"
                                                : "bg-[#1F1F1F] dark:bg-white dark:text-[#111] shadow-black/25"
                                        )}
                                    >
                                        <ShoppingBag className="h-6 w-6" />

                                        {/* Badge de quantidade */}
                                        <AnimatePresence>
                                            {isMounted && totalItems > 0 && (
                                                <motion.span
                                                    key="badge"
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0, opacity: 0 }}
                                                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-brand text-white text-[10px] font-black flex items-center justify-center shadow-lg shadow-brand/40 border-2 border-white dark:border-[#111]"
                                                >
                                                    {totalItems > 9 ? "9+" : totalItems}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>

                                    <span className={cn(
                                        "text-[10px] font-bold mt-1.5 tracking-tight transition-colors duration-300",
                                        isActive ? "text-brand" : "text-[#9E9E9E]"
                                    )}>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        }

                        /* ── ITENS NORMAIS ── */
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={item.onClick}
                                className="flex flex-col items-center gap-1 min-w-[48px] relative"
                            >
                                {/* Indicator pill no item ativo */}
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.span
                                            key="pill"
                                            layoutId="nav-pill"
                                            className="absolute -top-2 h-1 w-5 rounded-full bg-brand shadow-[0_0_8px_rgba(250,0,0,0.6)]"
                                            initial={{ opacity: 0, scaleX: 0 }}
                                            animate={{ opacity: 1, scaleX: 1 }}
                                            exit={{ opacity: 0, scaleX: 0 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 28 }}
                                        />
                                    )}
                                </AnimatePresence>

                                <motion.div
                                    whileTap={{ scale: 0.82 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                    className={cn(
                                        "h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-300",
                                        isActive
                                            ? "bg-brand/10 dark:bg-brand/15 text-brand"
                                            : "text-[#9E9E9E] dark:text-[#555]"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "h-5 w-5 transition-all duration-300",
                                            isActive ? "stroke-[2.5px] drop-shadow-[0_0_6px_rgba(250,0,0,0.5)]" : "stroke-[1.8px]"
                                        )}
                                    />
                                </motion.div>

                                <span className={cn(
                                    "text-[10px] font-bold tracking-tight transition-colors duration-300",
                                    isActive ? "text-brand" : "text-[#9E9E9E] dark:text-[#555]"
                                )}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
