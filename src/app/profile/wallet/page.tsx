"use client";

import { motion } from "framer-motion";
import { Wallet, Settings, ArrowLeft, Construction } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/core/Button";

export default function WalletPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-40 flex items-center bg-surface px-4 py-4 border-b border-gray-100 dark:border-gray-800">
                <button
                    onClick={() => router.back()}
                    className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 transition-colors hover:bg-gray-200"
                >
                    <ArrowLeft className="h-4 w-4 text-foreground" />
                </button>
                <h1 className="text-lg font-bold text-foreground">Minha Carteira</h1>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                {/* Floating Wallet Animation */}
                <div className="relative mb-12">
                    <motion.div
                        animate={{
                            y: [0, -20, 0],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="relative z-10 p-10 bg-brand/10 dark:bg-brand/20 rounded-full"
                    >
                        <Wallet className="h-24 w-24 text-brand" strokeWidth={1.5} />
                    </motion.div>

                    {/* Pulsing rings in the background */}
                    <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 rounded-full border-2 border-brand/30"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.8, 1], opacity: [0.1, 0, 0.1] }}
                        transition={{ duration: 3, delay: 0.5, repeat: Infinity }}
                        className="absolute inset-0 rounded-full border-2 border-brand/20"
                    />

                    {/* Small icons floating around */}
                    <motion.div
                        animate={{ x: [0, 10, -10, 0], y: [0, -5, 5, 0] }}
                        transition={{ duration: 5, repeat: Infinity }}
                        className="absolute -top-4 -right-4 p-2 bg-surface rounded-xl shadow-lg border border-gray-100"
                    >
                        <Settings className="h-5 w-5 text-gray-400 animate-spin-slow" />
                    </motion.div>
                </div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-xs space-y-6"
                >
                    <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2 text-brand">
                            <Construction className="h-5 w-5" />
                            <span className="text-xs font-bold uppercase tracking-widest">Em Construção</span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-foreground leading-tight">
                            Estamos polindo sua nova carteira! 💎
                        </h2>
                        <p className="text-gray-500 text-sm leading-relaxed px-4">
                            Sua experiência financeira proprietária está sendo construída com carinho. Logo você poderá gerenciar saldos, cashback e pagamentos num toque.
                        </p>
                    </div>

                    <div className="pt-4 px-2">
                        <Button
                            onClick={() => router.back()}
                            size="lg"
                            className="w-full shadow-xl shadow-brand/20 font-bold"
                        >
                            Entendi, voltar depois
                        </Button>
                    </div>

                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                        Disponível em breve na versão 2.0
                    </p>
                </motion.div>
            </main>

            {/* Styles for any extra animations */}
            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
            `}</style>
        </div>
    );
}
