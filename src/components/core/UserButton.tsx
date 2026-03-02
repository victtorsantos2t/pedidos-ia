"use client";

import { User } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function UserButton() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <Link
                href="/profile"
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand shadow-xl shadow-black/10 transition-all hover:shadow-2xl hover:shadow-black/20"
                title="Ver meu perfil"
            >
                <User className="h-6 w-6" />
            </Link>
        </motion.div>
    );
}
