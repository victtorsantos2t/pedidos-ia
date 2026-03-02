"use client";

import { useState, useEffect } from "react";
import { Home, Search, ShoppingBag, ClipboardList, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { motion } from "framer-motion";

export function BottomNav() {
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);
    const totalItems = useCartStore((state) => state.totalItems());

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const navItems = [
        { icon: Home, label: "Início", href: "/", onClick: () => window.location.href = "/" },
        { icon: Search, label: "Busca", href: "#search" }, // Simulado ou real
        { icon: ShoppingBag, label: "Carrinho", href: "/cart", isCart: true },
        { icon: ClipboardList, label: "Pedidos", href: "/profile/orders" },
        { icon: User, label: "Perfil", href: "/profile" },
    ];

    // Não exibir nav no painel admin
    if (pathname.startsWith("/admin")) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 px-6 pb-[calc(env(safe-area-inset-bottom,0px)+8px)] pt-3 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            <div className="max-w-lg mx-auto flex items-center justify-between">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href === "/my-orders" && pathname.startsWith("/order/"));
                    const Icon = item.icon;

                    if (item.isCart) {
                        return (
                            <Link key={item.href} href={item.href} className="relative -mt-10">
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={cn("h-14 w-14 rounded-full flex items-center justify-center text-white shadow-xl border-4 border-white dark:border-gray-900 transition-colors duration-300",
                                        isActive ? "bg-brand shadow-brand/30" : "bg-text-secondary shadow-black/10"
                                    )}
                                >
                                    <ShoppingBag className="h-6 w-6" />
                                    {isMounted && totalItems > 0 && (
                                        <motion.span
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                            className={cn("absolute -top-1.5 -right-1.5 bg-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 shadow-sm transition-colors duration-300",
                                                isActive ? "text-brand border-brand" : "text-text-secondary border-text-secondary"
                                            )}
                                        >
                                            {totalItems}
                                        </motion.span>
                                    )}
                                </motion.div>
                                <span className={cn("text-[10px] font-bold block mt-1 text-center transition-colors duration-300",
                                    isActive ? "text-brand" : "text-text-secondary"
                                )}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={item.onClick}
                            className={cn(
                                "flex flex-col items-center gap-1 transition-colors duration-300",
                                isActive ? "text-brand" : "text-text-secondary"
                            )}
                        >
                            <Icon className={cn("h-6 w-6", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
