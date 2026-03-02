"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/core/Button";
import { motion, AnimatePresence } from "framer-motion";
import { Input, Label } from "@/components/core/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/core/Card";
import { login, signup } from "@/lib/actions/authActions";
import { createOrder } from "@/lib/actions/orderActions";
import { ArrowLeft, MapPin, Navigation, ShoppingBag, CreditCard, Banknote, QrCode, Clock, Info, User, Smartphone, Mail, Lock, Wallet, CheckCircle2, ShoppingCart, ChevronDown, ChevronUp, Plus, AlertTriangle, Loader2, ExternalLink } from "lucide-react";
import { StoreConfig } from "@/lib/actions/adminSettingsActions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

interface CheckoutViewProps {
    user: any;
    profile: any;
    savedAddresses?: any[];
    storeSettings?: StoreConfig | null;
    isStoreOpen?: boolean;
}

export function CheckoutView({ user, profile, savedAddresses = [], storeSettings, isStoreOpen = true }: CheckoutViewProps) {
    const router = useRouter();
    const { items, totalPrice, totalItems, clearCart } = useCartStore();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [authMode, setAuthMode] = useState<"LOGIN" | "SIGNUP">("LOGIN");
    const [deliveryMethod, setDeliveryMethod] = useState<"ON_DELIVERY" | "ON_PICKUP">("ON_DELIVERY");
    const [paymentMethod, setPaymentMethod] = useState<"DINHEIRO" | "CREDITO" | "DEBITO" | "PIX">("DINHEIRO");
    const [changeFor, setChangeFor] = useState<string>("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
    const [isOutsideArea, setIsOutsideArea] = useState(false);
    const [isCheckingArea, setIsCheckingArea] = useState(false);

    const { addItem } = useCartStore(); // Para o upsell

    // Pega o endereço padrão se existir, senão o primeiro, senão vazio
    const defaultAddr = savedAddresses.find(a => a.is_default) || savedAddresses[0];
    const initialAddressString = defaultAddr
        ? `${defaultAddr.street}, ${defaultAddr.number}${defaultAddr.complement ? ' - ' + defaultAddr.complement : ''}. ${defaultAddr.neighborhood}, ${defaultAddr.city}`
        : "";

    const [address, setAddress] = useState(initialAddressString);

    // Validação de Ãrea de Entrega (Simulada para demonstração conforme pedido)
    useEffect(() => {
        if (deliveryMethod === "ON_DELIVERY" && address && storeSettings?.delivery_radius) {
            setIsCheckingArea(true);
            // Simula uma chamada de API de distância
            const timer = setTimeout(() => {
                // Se o raio for por exemplo 5km e simulamos que está fora (ex: se endereço contiver 'Longe' ou random)
                const distance = Math.floor(Math.random() * 8) + 1; // 1 a 8km
                setIsOutsideArea(distance > (storeSettings.delivery_radius || 5));
                setIsCheckingArea(false);
            }, 1500);
            return () => clearTimeout(timer);
        } else {
            setIsOutsideArea(false);
            setIsCheckingArea(false);
        }
    }, [address, deliveryMethod, storeSettings?.delivery_radius]);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const formData = new FormData(e.currentTarget);
        const res = await login(formData);
        if ((res as any).error) {
            setError((res as any).error);
        } else {
            // Roteamento Inteligente:
            // Se o carrinho estiver vazio, muito provavelmente o usuário clicou no menu "Perfil"
            if (items.length === 0) {
                router.push("/profile");
            } else {
                // Caso contrário (fazendo pedido), mantém na mesma tela
                window.location.reload();
            }
        }
        setLoading(false);
    };

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const formData = new FormData(e.currentTarget);
        const res = await signup(formData);
        if ((res as any).error) {
            setError((res as any).error);
        } else {
            if (items.length === 0) {
                router.push("/profile");
            } else {
                window.location.reload();
            }
        }
        setLoading(false);
    };

    const handleCreateOrder = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const data = {
            items,
            totalAmount: totalPrice(),
            deliveryAddress: deliveryMethod === "ON_PICKUP" ? "RETIRADA NA LOJA" : address,
            customerName: profile?.name || user?.user_metadata?.name || "Cliente",
            customerPhone: profile?.phone || user?.user_metadata?.phone || "000000000",
            paymentMethod: paymentMethod,
            deliveryMethod: deliveryMethod,
            changeFor: paymentMethod === "DINHEIRO" ? Number(changeFor) || null : null,
        };

        if (!isStoreOpen) {
            setError("O estabelecimento fechou. Não é possível concluir o pedido.");
            setLoading(false);
            return;
        }

        const res = await createOrder(data as any);

        if (res.error) {
            setError(res.error);
            setLoading(false);
        } else {
            clearCart();
            setOrderId(res.orderId);
            setShowSuccess(true);
            setLoading(false);
        }
    };

    // -------- AUTH FORM --------
    const renderAuthForm = () => (
        <div className="flex flex-col min-h-screen bg-gray-50/50 dark:bg-black w-full pb-10">
            {/* Header / Nav */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-4 flex items-center justify-between shadow-sm">
                <button
                    onClick={() => router.back()}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100/80 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors active:scale-95"
                >
                    <ArrowLeft className="h-5 w-5 text-foreground" />
                </button>
                <div className="text-xs font-black uppercase tracking-widest text-[#9E9E9E]">
                    Acesso Seguro
                </div>
                <div className="w-10" /> {/* spacer */}
            </header>

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="mx-auto w-full max-w-md px-5 pt-8"
            >
                <div className="mb-8">
                    <h1 className="text-[28px] font-black tracking-tight text-foreground leading-tight mb-2">
                        {authMode === "LOGIN" ? "Que bom te ver\npor aqui!" : "Crie sua conta"}
                    </h1>
                    <p className="text-[14px] text-gray-700 dark:text-gray-300 font-medium">
                        {authMode === "LOGIN"
                            ? "Entre para confirmar o seu pedido rapidinho."
                            : "Preencha seus dados para acompanhar seus pedidos."}
                    </p>
                </div>

                <div className="bg-white dark:bg-[#111] p-6 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-none border border-gray-100 dark:border-white/5">
                    <form
                        key={authMode}
                        onSubmit={authMode === "LOGIN" ? handleLogin : handleSignup}
                        className="space-y-5"
                        autoComplete="off"
                    >
                        <AnimatePresence mode="popLayout">
                            {authMode === "SIGNUP" && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-5"
                                >
                                    <div className="space-y-1.5">
                                        <Label htmlFor="name">Nome completo</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            required
                                            placeholder="João Silva"
                                            leftIcon={<User className="h-5 w-5" />}
                                            className="bg-gray-50 dark:bg-white/5 border border-transparent focus:border-brand/20 transition-all font-medium text-base shadow-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="phone">Celular (com DDD)</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            required
                                            placeholder="(11) 90000-0000"
                                            leftIcon={<Smartphone className="h-5 w-5" />}
                                            className="bg-gray-50 dark:bg-white/5 border border-transparent focus:border-brand/20 transition-all font-medium text-base shadow-none"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-1.5 focus-within:relative z-10">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="exemplo@email.com"
                                leftIcon={<Mail className="h-5 w-5" />}
                                className="bg-gray-50 dark:bg-white/5 border border-transparent focus:border-brand/20 transition-all font-medium text-base shadow-none"
                            />
                        </div>

                        <div className="space-y-1.5 focus-within:relative z-10">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                leftIcon={<Lock className="h-5 w-5" />}
                                autoComplete={authMode === "SIGNUP" ? "new-password" : "current-password"}
                                className="bg-gray-50 dark:bg-white/5 border border-transparent focus:border-brand/20 transition-all font-medium text-base shadow-none"
                            />
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="pt-1">
                                <p className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 p-3 rounded-xl border border-red-100 dark:border-red-500/20 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    {error}
                                </p>
                            </motion.div>
                        )}

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full h-14 rounded-2xl text-[15px] font-bold shadow-xl shadow-brand/20 active:scale-[0.98] transition-all"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Processando...</span>
                                ) : (
                                    authMode === "LOGIN" ? "Continuar" : "Criar Conta"
                                )}
                            </Button>
                        </div>

                        <div className="text-center pt-3 border-t border-gray-100 dark:border-white/5 mt-6">
                            <button
                                type="button"
                                onClick={() => setAuthMode(authMode === "LOGIN" ? "SIGNUP" : "LOGIN")}
                                className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-foreground transition-colors p-2"
                            >
                                {authMode === "LOGIN" ? "Ainda não tem conta? " : "Já possui conta? "}
                                <span className="text-foreground underline decoration-gray-400 dark:decoration-gray-600 underline-offset-4 font-black">
                                    {authMode === "LOGIN" ? "Cadastre-se" : "Faça login"}
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );

    const selectSavedAddress = (addr: any) => {
        const addrStr = `${addr.street}, ${addr.number}${addr.complement ? ' - ' + addr.complement : ''}. ${addr.neighborhood}, ${addr.city}`;
        setAddress(addrStr);
    };

    // -------- CHECKOUT FORM (authenticated) --------
    const renderOrderForm = () => {
        if (items.length === 0) {
            return (
                <div className="flex h-screen flex-col items-center justify-center p-6 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
                        <ShoppingBag className="h-10 w-10 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Sua sacola está vazia</h2>
                    <p className="mt-2 text-sm text-gray-500">Adicione itens antes de finalizar.</p>
                    <Button className="mt-6" onClick={() => router.push("/")}>
                        Voltar ao Cardápio
                    </Button>
                </div>
            );
        }

        const subtotal = totalPrice();
        const count = totalItems();
        const deliveryFee = deliveryMethod === "ON_DELIVERY" ? storeSettings?.delivery_fee || 0 : 0;
        const total = subtotal + deliveryFee;

        return (
            <div className="mx-auto w-full max-w-lg pt-[calc(env(safe-area-inset-top,0px)+24px)] px-4 pb-20">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => router.push("/cart")} className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-90 shadow-sm">
                        <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    </button>
                    <h1 className="text-xl font-bold">Finalizar Pedido</h1>
                </div>

                <form onSubmit={handleCreateOrder} className="space-y-6">
                    {/* Resumo do pedido Accordion */}
                    <div className="rounded-xl bg-surface shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                            className="w-full p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-brand/5 flex items-center justify-center text-brand">
                                    <ShoppingBag className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                    <h2 className="text-sm font-black uppercase italic tracking-tighter text-foreground">Resumo do pedido</h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{count} {count === 1 ? 'item' : 'itens'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-black text-foreground tracking-tighter">{fmt(total)}</span>
                                {isSummaryExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                            </div>
                        </button>

                        <AnimatePresence>
                            {isSummaryExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden border-t border-gray-50 dark:border-gray-800/50 bg-gray-50/30 dark:bg-black/10"
                                >
                                    <div className="p-5 space-y-3">
                                        {items.map((item) => {
                                            const extrasTotal = item.extras?.reduce((acc, curr) => acc + curr.price, 0) || 0;
                                            return (
                                                <div key={item.id} className="flex justify-between text-sm items-center">
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-900 dark:text-gray-100 font-bold text-xs">
                                                            {item.quantity}x {item.product.name}
                                                        </span>
                                                        {item.extras.length > 0 && (
                                                            <span className="text-[9px] text-gray-400 font-medium uppercase italic">
                                                                + {item.extras.map(e => e.name).join(', ')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="font-black text-xs text-foreground tracking-tight">{fmt((item.product.price + extrasTotal) * item.quantity)}</span>
                                                </div>
                                            );
                                        })}

                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                                                <span className="text-gray-400">Subtotal</span>
                                                <span className="text-gray-500">{fmt(subtotal)}</span>
                                            </div>
                                            {deliveryMethod === "ON_DELIVERY" && (
                                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                                                    <span className="text-gray-400">Taxa de entrega</span>
                                                    <span className="text-emerald-500">{deliveryFee > 0 ? fmt(deliveryFee) : "Grátis"}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Método de entrega */}
                    <div className="space-y-3">
                        <h2 className="font-bold text-foreground">Como deseja receber?</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setDeliveryMethod("ON_DELIVERY")}
                                className={cn(
                                    "p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all active:scale-95",
                                    deliveryMethod === "ON_DELIVERY"
                                        ? "border-brand bg-transparent text-foreground shadow-sm"
                                        : "border-gray-100 bg-surface dark:bg-gray-900 text-gray-400 opacity-60 hover:opacity-100"
                                )}
                            >
                                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center transition-colors shadow-sm",
                                    deliveryMethod === "ON_DELIVERY" ? "bg-gray-100 dark:bg-gray-800 text-foreground" : "bg-gray-50 dark:bg-gray-900")}>
                                    <MapPin className={cn("h-5 w-5", deliveryMethod === "ON_DELIVERY" && "stroke-[2.5px]")} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest italic">Entrega</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setDeliveryMethod("ON_PICKUP")}
                                className={cn(
                                    "p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all active:scale-95",
                                    deliveryMethod === "ON_PICKUP"
                                        ? "border-brand bg-transparent text-foreground shadow-sm"
                                        : "border-gray-100 bg-surface dark:bg-gray-900 text-gray-400 opacity-60 hover:opacity-100"
                                )}
                            >
                                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center transition-colors shadow-sm",
                                    deliveryMethod === "ON_PICKUP" ? "bg-gray-100 dark:bg-gray-800 text-foreground" : "bg-gray-50 dark:bg-gray-900")}>
                                    <Navigation className={cn("h-5 w-5", deliveryMethod === "ON_PICKUP" && "stroke-[2.5px]")} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest italic">Retirada</span>
                            </button>
                        </div>
                    </div>

                    {deliveryMethod === "ON_DELIVERY" && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
                            <div className="flex items-center justify-between">
                                <h2 className="font-bold text-foreground">Endereço de Entrega</h2>
                                <button
                                    type="button"
                                    onClick={() => router.push("/profile/addresses")}
                                    className="text-[10px] font-bold uppercase text-brand tracking-widest hover:brightness-110"
                                >
                                    {address ? "Alterar" : "Cadastrar"}
                                </button>
                            </div>

                            {address ? (
                                <div className="p-5 rounded-xl bg-surface border border-gray-100 dark:border-gray-800 shadow-sm flex items-start gap-4 hover:border-brand/20 transition-colors group cursor-pointer" onClick={() => router.push("/profile/addresses")}>
                                    <div className="h-10 w-10 min-w-[40px] rounded-xl bg-brand/5 flex items-center justify-center text-brand">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-foreground leading-tight line-clamp-1">{address.split('.')[0]}</p>
                                        <p className="text-[10px] font-black uppercase text-gray-400 mt-1 tracking-tight truncate">
                                            {address.includes('.') ? address.split('.')[1] : ""}
                                        </p>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-gray-300 mt-3 group-hover:text-brand transition-colors" />
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => router.push("/profile/addresses")}
                                    className="w-full p-8 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 flex flex-col items-center gap-3 text-center transition-all hover:bg-gray-50 dark:hover:bg-gray-900/50"
                                >
                                    <div className="h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center text-brand mb-1">
                                        <Plus className="h-6 w-6" />
                                    </div>
                                    <p className="text-xs font-bold text-gray-500">Nenhum endereço selecionado.<br />Cadastre um agora para prosseguir.</p>
                                </button>
                            )}

                            {/* Alerta de Ãrea de Entrega (Visual Placeholder) */}
                            {deliveryMethod === "ON_DELIVERY" && address && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={cn(
                                        "p-4 rounded-xl border flex gap-3 transition-colors",
                                        isCheckingArea ? "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800" :
                                            isOutsideArea ? "bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30" :
                                                "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30"
                                    )}
                                >
                                    {isCheckingArea ? (
                                        <Loader2 className="h-5 w-5 text-gray-400 animate-spin shrink-0" />
                                    ) : isOutsideArea ? (
                                        <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                                    ) : (
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                    )}
                                    <div className="space-y-1">
                                        <p className={cn(
                                            "text-[10px] font-black uppercase tracking-wider leading-none mt-1",
                                            isCheckingArea ? "text-gray-400" : isOutsideArea ? "text-red-600" : "text-emerald-600"
                                        )}>
                                            {isCheckingArea ? "Validando distância..." : isOutsideArea ? "Fora da área de entrega!" : "Endereço dentro do raio."}
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-tight leading-tight">
                                            {isCheckingArea ? "Consultando serviços de localização..." :
                                                isOutsideArea ? `Desculpe, atendemos apenas até ${storeSettings?.delivery_radius || 5}km.` :
                                                    "Sua entrega será priorizada por nossa logística."}
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Hidden Input for Form Submission if needed, but we handle in handleCreateOrder */}
                            <input type="hidden" name="address" value={address} required />
                        </div>
                    )}

                    {deliveryMethod === "ON_PICKUP" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
                                <h3 className="text-center font-black uppercase italic tracking-tighter text-foreground text-sm">Onde Estamos</h3>

                                <div className="flex items-center justify-center gap-2 px-4 text-center">
                                    <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                                    <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 leading-tight">
                                        {storeSettings?.pickup_address || "Endereço não cadastrado"}
                                    </p>
                                </div>

                                {/* Mini Mapa Placeholder Estilo Premium */}
                                <div className="relative w-full h-44 rounded-2xl bg-gray-50 dark:bg-black/20 overflow-hidden border border-gray-100 dark:border-gray-800 group">
                                    {/* Grid Pattern */}
                                    <div
                                        className="absolute inset-0 opacity-[0.4]"
                                        style={{
                                            backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
                                            backgroundSize: '24px 24px'
                                        }}
                                    />

                                    {/* Pin Centralizado */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-black/10 blur-xl rounded-full scale-150" />
                                            <div className="relative h-12 w-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-xl border border-gray-100 dark:border-gray-800">
                                                <MapPin className="h-6 w-6 text-gray-900 dark:text-gray-100 fill-current" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* BotÃ£o Flutuante Estilo ReferÃªncia */}
                                    <div className="absolute bottom-5 left-5 right-5">
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeSettings?.pickup_address || '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-white dark:bg-gray-900 shadow-lg border border-gray-100 dark:border-gray-800 text-foreground text-[11px] font-black uppercase italic tracking-widest hover:scale-[1.02] transition-all"
                                        >
                                            Ver no Google Maps
                                            <ExternalLink className="h-3 w-3 opacity-50" />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 flex items-center gap-3 border border-gray-100 dark:border-gray-800">
                                <Info className="h-4 w-4 text-brand" />
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">O seu pedido estará disponível em aproximadamente <span className="text-foreground">{storeSettings?.pickup_estimated_time || '15-20 min'}</span>.</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <h2 className="font-bold text-foreground">Forma de Pagamento</h2>
                        <div className="grid grid-cols-4 gap-2">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("PIX")}
                                className={cn(
                                    "py-3 px-1 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-95",
                                    paymentMethod === "PIX"
                                        ? "border-brand bg-transparent text-foreground shadow-sm"
                                        : "border-gray-50 bg-surface dark:bg-gray-900 text-gray-400 opacity-60 hover:opacity-100"
                                )}
                            >
                                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center transition-colors shadow-sm",
                                    paymentMethod === "PIX" ? "bg-gray-100 dark:bg-gray-800 text-foreground" : "bg-gray-50 dark:bg-gray-900")}>
                                    <QrCode className={cn("h-4 w-4", paymentMethod === "PIX" && "stroke-[2.5px]")} />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-tight italic">PIX</span>
                            </button>

                            {/* DINHEIRO */}
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("DINHEIRO")}
                                className={cn(
                                    "py-3 px-1 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-95",
                                    paymentMethod === "DINHEIRO"
                                        ? "border-brand bg-transparent text-foreground shadow-sm"
                                        : "border-gray-50 bg-surface dark:bg-gray-900 text-gray-400 opacity-60 hover:opacity-100"
                                )}
                            >
                                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center transition-colors shadow-sm",
                                    paymentMethod === "DINHEIRO" ? "bg-gray-100 dark:bg-gray-800 text-foreground" : "bg-gray-50 dark:bg-gray-900")}>
                                    <Banknote className={cn("h-4 w-4", paymentMethod === "DINHEIRO" && "stroke-[2.5px]")} />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-tight italic">Dinheiro</span>
                            </button>

                            {/* CREDITO */}
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("CREDITO")}
                                className={cn(
                                    "py-3 px-1 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-95",
                                    paymentMethod === "CREDITO"
                                        ? "border-brand bg-transparent text-foreground shadow-sm"
                                        : "border-gray-50 bg-surface dark:bg-gray-900 text-gray-400 opacity-60 hover:opacity-100"
                                )}
                            >
                                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center transition-colors shadow-sm",
                                    paymentMethod === "CREDITO" ? "bg-gray-100 dark:bg-gray-800 text-foreground" : "bg-gray-50 dark:bg-gray-900")}>
                                    <CreditCard className={cn("h-4 w-4", paymentMethod === "CREDITO" && "stroke-[2.5px]")} />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-tight italic">Crédito</span>
                            </button>

                            {/* DEBITO */}
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("DEBITO")}
                                className={cn(
                                    "py-3 px-1 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-95",
                                    paymentMethod === "DEBITO"
                                        ? "border-brand bg-transparent text-foreground shadow-sm"
                                        : "border-gray-50 bg-surface dark:bg-gray-900 text-gray-400 opacity-60 hover:opacity-100"
                                )}
                            >
                                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center transition-colors shadow-sm",
                                    paymentMethod === "DEBITO" ? "bg-gray-100 dark:bg-gray-800 text-foreground" : "bg-gray-50 dark:bg-gray-900")}>
                                    <CreditCard className={cn("h-4 w-4", paymentMethod === "DEBITO" && "stroke-[2.5px]")} />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-tight italic">Débito</span>
                            </button>
                        </div>

                        <AnimatePresence>
                            {paymentMethod === "DINHEIRO" && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-1 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-2">
                                            <div className="h-5 w-5 rounded-md bg-brand/10 text-brand flex items-center justify-center">
                                                <Banknote className="h-3 w-3" />
                                            </div>
                                            <Label htmlFor="changeFor" className="mb-0">Precisa de troco para quanto?</Label>
                                        </div>
                                        <Input
                                            id="changeFor"
                                            type="number"
                                            step="0.01"
                                            value={changeFor}
                                            onChange={(e) => setChangeFor(e.target.value)}
                                            leftIcon={<span className="text-sm font-bold text-gray-400">R$</span>}
                                            placeholder="0,00"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center text-brand shrink-0">
                                <Info className="h-4 w-4" />
                            </div>
                            <p className="text-[11px] font-bold text-gray-500 leading-relaxed uppercase tracking-tighter">
                                O pagamento será realizado no momento da <span className="text-brand italic">{deliveryMethod === 'ON_DELIVERY' ? 'entrega' : 'retirada'}</span>.
                                {paymentMethod === 'PIX' && ' Mostraremos a chave dinâmica no fim do pedido.'}
                            </p>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500 font-bold text-center">{error}</p>}

                    {/* Static Premium Footer */}
                    <div className="mt-2 pt-4 pb-8">
                        <div className="rounded-xl bg-surface border border-gray-100 dark:border-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.05)] overflow-hidden">
                            <div className="flex items-center justify-between p-5">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] leading-none mb-1 opacity-70 italic">Checkout Total</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-black text-foreground tracking-tighter">{fmt(total)}</span>
                                        <span className="text-[10px] text-brand font-black uppercase italic tracking-tight">{count} UN</span>
                                    </div>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    disabled={loading || (deliveryMethod === "ON_DELIVERY" && (!address || isOutsideArea)) || !isStoreOpen}
                                    className={cn(
                                        "relative h-14 px-10 rounded-xl font-black text-[13px] uppercase italic tracking-widest transition-all shadow-xl overflow-hidden group",
                                        loading || (deliveryMethod === "ON_DELIVERY" && (!address || isOutsideArea)) || !isStoreOpen
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                                            : "bg-brand text-white shadow-brand/30 hover:brightness-110 active:shadow-none"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="relative z-10">
                                            {!isStoreOpen ? "LOJA FECHADA" : (loading ? "Enviando..." : "Confirmar")}
                                        </span>
                                        {isStoreOpen && !loading && <ArrowLeft className="h-4 w-4 relative z-10 rotate-180 group-hover:translate-x-1 transition-transform" />}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        );
    };

    return (
        <>
            {user ? renderOrderForm() : renderAuthForm()}

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccess && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        // Não fecha ao clicar fora para garantir que o user veja o sucesso
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl p-8 text-center shadow-2xl border border-gray-100 dark:border-gray-800"
                        >
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 shadow-inner">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                                >
                                    <CheckCircle2 className="h-10 w-10" />
                                </motion.div>
                            </div>

                            <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tighter leading-tight mb-3">
                                {paymentMethod === 'PIX' ? "Quase lá!" : "Pedido Realizado!"}
                            </h2>

                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6 px-2">
                                {paymentMethod === 'PIX'
                                    ? "Finalize o pagamento com a chave PIX abaixo para iniciarmos a preparação."
                                    : "Seu pedido foi confirmado e já está sendo preparado pela nossa cozinha."}
                            </p>

                            {paymentMethod === 'PIX' && (
                                <div className="mb-8 p-6 rounded-xl bg-brand/5 border border-brand/10 space-y-4">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-[10px] font-black uppercase text-brand tracking-widest leading-none">Chave PIX (E-mail)</span>
                                        <p className="text-sm font-black text-foreground select-all bg-white dark:bg-black px-4 py-2 rounded-xl border border-brand/20 shadow-sm">
                                            pagamentos@rdos.com.br
                                        </p>
                                    </div>
                                    <div className="pt-2">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase leading-relaxed italic border-t border-brand/10 pt-4">
                                            Após o pagamento, o sistema detectará o recebimento e enviará para a cozinha automaticamente.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <Button
                                    onClick={() => router.push(`/order/${orderId}`)}
                                    className="w-full h-14 rounded-xl bg-brand text-white font-black uppercase italic tracking-widest shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Acompanhar Pedido
                                </Button>

                                <button
                                    onClick={() => router.push("/")}
                                    className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand transition-all"
                                >
                                    Voltar para o Cardápio
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
