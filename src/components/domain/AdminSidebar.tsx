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
                                    "relative flex h-[52px] items-center gap-4 mx-4 xl:mx-4 lg:mx-2 px-5 lg:px-0 xl:px-5 lg:justify-center xl:justify-start rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 group",
                                    isActive
                                        ? "text-white bg-[#FA0000] shadow-xl shadow-red-500/20 italic"
                                        : "text-gray-500 hover:text-[#FA0000] hover:bg-red-50/50 dark:hover:bg-red-950/10 italic"
                                )}
                            >
                                <item.icon className={cn(
                                    "h-5 w-5 transition-all duration-300 shrink-0",
                                    isActive ? "text-white" : "text-gray-400 group-hover:text-[#FA0000] group-hover:scale-110"
                                )} />
                                <span className="tracking-tight hidden xl:block">{item.name}</span>

                                {/* Badge de Urgência (Apenas para Cozinha) */}
                                {item.name.includes("Cozinha") && delayedCount > 0 && (
                                    <div className={cn(
                                        "absolute right-4 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black shadow-lg animate-pulse border-2",
                                        isActive
                                            ? "bg-white text-[#FA0000] border-[#FA0000]"
                                            : "bg-[#FA0000] text-white border-white dark:border-black shadow-red-500/40"
                                    )}>
                                        {delayedCount}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 xl:p-6 lg:p-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/10">
                    <div className="flex items-center gap-4 lg:gap-0 xl:gap-4 mb-6 lg:justify-center xl:justify-start">
                        <div className="relative shrink-0">
                            <UserButton />
                            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-black" />
                        </div>
                        <div className="hidden xl:flex flex-col min-w-0">
                            <p className="text-sm font-black text-[#2A2A2A] dark:text-white truncate">Admin Session</p>
                            <span className="text-[10px] font-black text-[#FA0000] uppercase tracking-widest leading-none">Status: Online</span>
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
