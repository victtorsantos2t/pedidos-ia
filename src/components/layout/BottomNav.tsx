"use client";

import { useState, useEffect } from "react";
import { Home, Search, ShoppingBag, ClipboardList, User, Heart } from "lucide-react";
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
        let mounted = true;
        if (mounted) setIsMounted(true);
        return () => { mounted = false; };
    }, []);

    const navItems = [
        { icon: Home, label: "Início", href: "/", onClick: () => window.location.href = "/" },
        { icon: Heart, label: "Favoritos", href: "/favorites" },
        { icon: ShoppingBag, label: "Carrinho", href: "/cart", isCart: true },
        { icon: ClipboardList, label: "Pedidos", href: "/profile/orders" },
        { icon: User, label: "Perfil", href: "/profile" },
    ];

    if (pathname.startsWith("/admin") || pathname.startsWith("/checkout") || pathname === "/cart") return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50">
            {/* Fade gradiente acima da nav */}
            <div className="h-8 bg-gradient-to-t from-white/60 dark:from-black/60 to-transparent pointer-events-none" />

            <div className="bg-white dark:bg-[#111] border-t border-gray-100 dark:border-white/[0.06] px-4 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
                <div className="max-w-lg mx-auto flex items-center justify-between">
                    {navItems.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href === "/profile/orders" && pathname.startsWith("/order/"));
                        const Icon = item.icon;

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
                                            className="absolute -top-2 h-1 w-5 rounded-full bg-brand"
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
                                        "h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-300 relative",
                                        isActive
                                            ? "bg-brand/5 dark:bg-brand/10 text-brand"
                                            : "text-[#9E9E9E] dark:text-[#555]"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "h-5 w-5 transition-all duration-300",
                                            isActive ? "stroke-[2.5px]" : "stroke-[1.8px]"
                                        )}
                                    />

                                    {/* Badge de quantidade para o Carrinho */}
                                    {item.isCart && (
                                        <AnimatePresence>
                                            {isMounted && totalItems > 0 && (
                                                <motion.span
                                                    key="badge"
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0, opacity: 0 }}
                                                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-brand text-white text-[9px] font-black flex items-center justify-center shadow-lg shadow-brand/40 border-2 border-white dark:border-[#111]"
                                                >
                                                    {totalItems > 9 ? "9+" : totalItems}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    )}
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
