"use client"

import { useCartStore } from "@/store/cartStore"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export function FloatingCart() {
    const [mounted, setMounted] = useState(false)
    const items = useCartStore((state) => state.items)
    const totalItems = useCartStore((state) => state.totalItems())
    const totalPrice = useCartStore((state) => state.totalPrice())

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted || items.length === 0) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-4 right-4 z-50 flex justify-center"
            >
                <Link href="/cart" className="w-full max-w-md">
                    <div className="flex h-14 items-center justify-between rounded-xl bg-brand px-4 font-medium text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <ShoppingBag className="h-6 w-6" />
                                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-brand">
                                    {totalItems}
                                </span>
                            </div>
                            <span>Ver sacola</span>
                        </div>
                        <span>
                            {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            }).format(totalPrice)}
                        </span>
                    </div>
                </Link>
            </motion.div>
        </AnimatePresence>
    )
}
