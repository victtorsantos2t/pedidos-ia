"use client";

import { useRouter } from "next/navigation";
import { User, MapPin, Wallet, ShoppingBag, ArrowLeft, ChevronRight, LogOut, Star } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { logout } from "@/lib/actions/authActions";

interface ProfileViewProps {
    user: {
        name: string;
        email?: string;
    } | null;
}

export function ProfileView({ user }: ProfileViewProps) {
    const router = useRouter();

    const menuItems = [
        { label: "Dados pessoais", icon: User, href: "/profile/personal-data" },
        { label: "Endereços cadastrados", icon: MapPin, href: "/profile/addresses" },
        { label: "Minha carteira", icon: Wallet, href: "/profile/wallet" },
        { label: "Minhas avaliações", icon: Star, href: "/profile/ratings" },
        { label: "Pedidos", icon: ShoppingBag, href: "/my-orders" },
    ];

    const handleLogout = async () => {
        await logout();
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 flex items-center bg-surface px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-4 border-b border-gray-100 dark:border-gray-800">
                <button
                    onClick={() => router.push("/")}
                    className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-90 shadow-sm"
                >
                    <ArrowLeft className="h-5 w-5 text-foreground" />
                </button>
                <h1 className="text-lg font-bold text-foreground">Perfil</h1>
            </header>

            <main className="max-w-lg mx-auto p-6">
                {/* Saudação */}
                <div className="flex items-center gap-4 mb-12 mt-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20">
                        <span className="text-3xl">😊</span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-foreground">
                        Oi, {user?.name.split(' ')[0] || 'Usuário'}! 👋
                    </h2>
                </div>

                <div className="space-y-2">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Perfil</h3>

                    <div className="bg-surface rounded-xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800 overflow-hidden shadow-sm">
                        {menuItems.map((item, idx) => (
                            <Link
                                key={idx}
                                href={item.href}
                                className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-gray-400 group-hover:text-brand transition-colors">
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <span className="font-semibold text-foreground">{item.label}</span>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-300" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Logout opcional, mas útil */}
                <button
                    onClick={handleLogout}
                    className="mt-12 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Sair da conta
                </button>
            </main>
        </div>
    );
}
