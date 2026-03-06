"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
    LayoutDashboard,
    ChefHat,
    ListIcon,
    ShoppingBag,
    LogOut,
    Menu,
    X,
    Settings,
    Bell
} from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { cn } from "@/lib/utils";
import { UserButton } from "../core/UserButton";
import { obterStatusLoja } from "@/lib/actions/adminSettingsActions";
import { logout } from "@/lib/actions/authActions"; // #11 — logout real
import { motion } from "framer-motion";
import { useOrdersStore } from "@/lib/ordersStore";

const menuItems = [
    { name: "Painel", href: "/admin", icon: LayoutDashboard },
    { name: "Histórico", href: "/admin/management", icon: ShoppingBag },
    { name: "Cozinha", href: "/admin/orders", icon: ChefHat },
    { name: "Cardápio", href: "/admin/menu", icon: ListIcon },
    { name: "Configurações", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
    return (
        <Suspense fallback={<div className="w-20 xl:w-64 bg-white dark:bg-black h-screen border-r border-gray-100 dark:border-gray-800" />}>
            <AdminSidebarContent />
        </Suspense>
    );
}

function AdminSidebarContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isFullscreen = searchParams.get("fullscreen") === "true";

    if (isFullscreen) return null;
    const [isOpen, setIsOpen] = useState(false);
    const [isStoreOpen, setIsStoreOpen] = useState(true);
    const delayedCount = useOrdersStore((state) => state.delayedOrdersCount);
    const refreshDelays = useOrdersStore((state) => state.refreshDelays);

    useEffect(() => {
        async function fetchStatus() {
            const status = await obterStatusLoja();
            setIsStoreOpen(status);
        }
        fetchStatus();

        // Inicia timer para atualizar atrasos a cada 1 minuto
        const interval = setInterval(() => {
            refreshDelays();
        }, 60000);

        return () => clearInterval(interval);
    }, [refreshDelays]);


    return (
        <aside className="relative">
            {/* Botão Mobile */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-[calc(env(safe-area-inset-top,0px)+16px)] left-4 z-50 rounded-lg bg-surface p-2 shadow-sm border border-gray-100 dark:border-gray-800 lg:hidden text-foreground"
            >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Backdrop Mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar — Elite Navigation */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white dark:bg-black border-r border-gray-100 dark:border-gray-800 transition-all duration-300 ease-in-out lg:static lg:w-20 xl:w-64 lg:translate-x-0 h-screen",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-24 items-center justify-between lg:justify-center xl:justify-between px-6 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FA0000] text-white shadow-xl shadow-red-500/20">
                            <ShoppingBag className="h-6 w-6" />
                        </div>
                        <div className="hidden xl:flex flex-col">
                            <span className="text-xl font-black text-[#2A2A2A] dark:text-white tracking-tighter italic uppercase whitespace-nowrap">
                                RDOS <span className="text-[#FA0000]">BOSS</span>
                            </span>
                            <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest mt-0.5">Painel de Gestão</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.name.includes("Cozinha") ? `${item.href}?fullscreen=true` : item.href}
                                target={item.name.includes("Cozinha") ? "_blank" : undefined}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "relative flex h-11 items-center gap-3.5 mx-3 xl:mx-3 lg:mx-2 px-3.5 lg:px-0 xl:px-3.5 lg:justify-center xl:justify-start rounded-xl text-[12px] font-semibold transition-all duration-200 group overflow-hidden",
                                    isActive
                                        ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-900"
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/60"
                                )}
                            >
                                {/* Indicator ativo: barra vertical esquerda */}
                                {isActive && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[#FA0000]" />
                                )}

                                <item.icon className={cn(
                                    "h-4.5 w-4.5 transition-all duration-200 shrink-0",
                                    isActive ? "text-[#FA0000]" : "text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                                )} />
                                <span className="font-semibold tracking-normal hidden xl:block">{item.name}</span>

                                {/* Badge de Urgência */}
                                {item.name.includes("Cozinha") && delayedCount > 0 && (
                                    <div className="absolute right-3 h-4.5 min-w-4.5 px-1 flex items-center justify-center rounded-full bg-[#FA0000] text-white text-[9px] font-black shadow-md shadow-red-500/30 animate-pulse">
                                        {delayedCount}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 xl:p-5 lg:p-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3 lg:gap-0 xl:gap-3 mb-4 lg:justify-center xl:justify-start">
                        <div className="relative shrink-0">
                            <UserButton />
                            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-black" />
                        </div>
                        <div className="hidden xl:flex flex-col min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">Admin Session</p>
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 leading-none">Online</span>
                        </div>
                    </div>

                    {/* #11 — Logout real com confirmação */}
                    <button
                        onClick={async () => {
                            if (confirm("Sair do painel admin?")) {
                                await logout();
                                window.location.href = "/";
                            }
                        }}
                        className="flex h-11 items-center gap-3 lg:justify-center xl:justify-start rounded-xl px-4 lg:px-0 xl:px-4 text-sm font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        <span className="hidden xl:block">Sair</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
