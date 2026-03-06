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
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { cn } from "@/lib/utils";
import { UserButton } from "../core/UserButton";
import { obterStatusLoja } from "@/lib/actions/adminSettingsActions";
import { logout } from "@/lib/actions/authActions";
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
        <Suspense fallback={<div className="w-16 bg-white dark:bg-black h-screen border-r border-gray-100 dark:border-gray-800 shrink-0" />}>
            <AdminSidebarContent />
        </Suspense>
    );
}

function AdminSidebarContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isFullscreen = searchParams.get("fullscreen") === "true";

    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false); // Retrátil desktop
    const delayedCount = useOrdersStore((state) => state.delayedOrdersCount);
    const refreshDelays = useOrdersStore((state) => state.refreshDelays);

    useEffect(() => {
        const interval = setInterval(() => refreshDelays(), 60000);
        return () => clearInterval(interval);
    }, [refreshDelays]);

    if (isFullscreen) return null;

    const sidebarWidth = collapsed ? "w-16" : "w-64";

    return (
        <aside className="relative shrink-0">
            {/* ── Botão Mobile (hamburger) ───────────────────── */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="fixed top-[calc(env(safe-area-inset-top,0px)+12px)] left-4 z-50 rounded-xl bg-white dark:bg-black p-2 shadow-md border border-gray-100 dark:border-gray-800 lg:hidden text-gray-600 dark:text-gray-300 hover:text-[#FA0000] transition-colors"
            >
                {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* ── Backdrop Mobile ────────────────────────────── */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* ── Sidebar ────────────────────────────────────── */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-black border-r border-gray-100 dark:border-gray-800 transition-all duration-300 ease-in-out lg:static h-screen",
                // Mobile: desliza
                isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0",
                // Desktop: retrátil
                "lg:" + sidebarWidth,
            )}>

                {/* ── Logo + Toggle ──────────────────────────── */}
                <div className="relative flex items-center h-16 px-4 border-b border-gray-100 dark:border-gray-900 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl bg-[#FA0000] text-white shadow-lg shadow-red-500/20">
                            <ShoppingBag className="h-5 w-5" />
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col min-w-0 overflow-hidden">
                                <span className="text-sm font-black text-gray-900 dark:text-white tracking-tight whitespace-nowrap">
                                    RDOS <span className="text-[#FA0000]">BOSS</span>
                                </span>
                                <span className="text-[9px] font-semibold uppercase text-gray-400 tracking-widest whitespace-nowrap">Painel de Gestão</span>
                            </div>
                        )}
                    </div>

                    {/* Toggle retrátil — só desktop */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-400 shadow-sm transition-all z-10"
                        title={collapsed ? "Expandir menu" : "Recolher menu"}
                    >
                        {collapsed
                            ? <ChevronRight className="h-3 w-3" />
                            : <ChevronLeft className="h-3 w-3" />
                        }
                    </button>
                </div>

                {/* ── Nav Items ─────────────────────────────────── */}
                <nav className="flex-1 overflow-y-auto py-3 space-y-0.5">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        const isKitchen = item.name === "Cozinha";

                        return (
                            <Link
                                key={item.href}
                                href={isKitchen ? `${item.href}?fullscreen=true` : item.href}
                                target={isKitchen ? "_blank" : undefined}
                                onClick={() => setIsMobileOpen(false)}
                                title={collapsed ? item.name : undefined}
                                className={cn(
                                    "relative flex h-11 items-center gap-3 mx-2 px-3 rounded-xl text-[12px] font-semibold transition-all duration-150 group overflow-hidden",
                                    collapsed ? "justify-center px-0" : "",
                                    isActive
                                        ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-900"
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/60"
                                )}
                            >
                                {/* Barra indicadora ativa */}
                                {isActive && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[#FA0000]" />
                                )}

                                <item.icon className={cn(
                                    "h-[18px] w-[18px] shrink-0 transition-colors",
                                    isActive ? "text-[#FA0000]" : "text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                                )} />

                                {!collapsed && (
                                    <span className="truncate">{item.name}</span>
                                )}

                                {/* Badge atraso (sempre visível) */}
                                {isKitchen && delayedCount > 0 && (
                                    <span className={cn(
                                        "flex items-center justify-center rounded-full bg-[#FA0000] text-white text-[9px] font-black shadow-md shadow-red-500/30 animate-pulse shrink-0",
                                        collapsed ? "h-4 w-4 absolute top-2 right-2" : "h-4.5 min-w-4 px-1 ml-auto"
                                    )}>
                                        {delayedCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* ── Footer ──────────────────────────────────── */}
                <div className={cn(
                    "border-t border-gray-100 dark:border-gray-800 p-3",
                    collapsed ? "flex flex-col items-center gap-3" : ""
                )}>
                    {/* User */}
                    <div className={cn(
                        "flex items-center gap-3 mb-3",
                        collapsed ? "justify-center mb-2" : ""
                    )}>
                        <div className="relative shrink-0">
                            <UserButton />
                            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-black" />
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col min-w-0">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">Admin Session</p>
                                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 leading-none">Online</span>
                            </div>
                        )}
                    </div>

                    {/* Sair */}
                    <button
                        onClick={async () => {
                            if (confirm("Sair do painel admin?")) {
                                await logout();
                                window.location.href = "/";
                            }
                        }}
                        title={collapsed ? "Sair" : undefined}
                        className={cn(
                            "flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-gray-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-all w-full",
                            collapsed ? "justify-center px-0" : ""
                        )}
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>Sair</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
}
