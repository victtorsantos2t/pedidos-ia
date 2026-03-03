"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChefHat, MapPin, Package, ArrowLeft, Clock, ShoppingBag, XCircle, AlertTriangle, ChevronRight, Copy, MessageCircle, Phone, HelpCircle, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderRatingCard } from "./OrderRatingCard";
import { enviarAvaliacao, OrderRating } from "@/lib/actions/orderRatingActions";
import { cancelOrder } from "@/lib/actions/userOrderActions";
import { StoreConfig } from "@/lib/actions/adminSettingsActions";

type OrderStatus = "NEW" | "PREPARING" | "READY" | "DELIVERY" | "COMPLETED" | "CANCELLED";

interface OrderTrackerProps {
    initialOrder: any;
    initialRating?: OrderRating | null;
    storeConfig?: StoreConfig | null;
    ratingStats?: {
        averageProduct: number;
        averageDelivery: number;
        total: number;
    } | null;
}

const STATUS_STEPS = [
    { id: "NEW", label: "Pedido Recebido", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-600", shadow: "shadow-[0_0_15px_rgba(37,99,235,0.4)]" },
    { id: "PREPARING", label: "Cozinha Preparando", icon: ChefHat, color: "text-orange-500", bg: "bg-orange-500", shadow: "shadow-[0_0_20px_rgba(249,115,22,0.6)]" },
    { id: "READY", label: "Pronto / Aguardando Despacho", icon: Package, color: "text-brand", bg: "bg-brand", shadow: "shadow-[0_0_15px_rgba(250,0,0,0.4)]" },
    { id: "DELIVERY", label: "Em Rota de Entrega", icon: MapPin, color: "text-brand", bg: "bg-brand", shadow: "shadow-[0_0_15px_rgba(250,0,0,0.4)]" },
    { id: "COMPLETED", label: "Pedido Concluído", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500", shadow: "shadow-[0_0_15px_rgba(16,185,129,0.4)]" },
];

export function OrderTracker({ initialOrder, initialRating, storeConfig, ratingStats }: OrderTrackerProps) {
    const [order, setOrder] = useState(initialOrder);
    const [cancelStep, setCancelStep] = useState<"IDLE" | "CONFIRM" | "REASON">("IDLE");
    const [selectedReason, setSelectedReason] = useState("");
    const [customReason, setCustomReason] = useState("");
    const [isRatingActive, setIsRatingActive] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const CANCEL_REASONS = [
        "Demora na entrega",
        "Endereço incorreto",
        "Mudei de ideia",
        "Adicionei itens errados",
        "Outro"
    ];

    const [remainingTime, setRemainingTime] = useState<number | null>(null);
    const [isItemsExpanded, setIsItemsExpanded] = useState(false);
    const [showHelpMenu, setShowHelpMenu] = useState(false);

    useEffect(() => {
        const supabase = createClient();

        const channel = supabase
            .channel(`order-track-${order.id}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "orders",
                    filter: `id=eq.${order.id}`,
                },
                (payload) => {
                    setOrder((prev: any) => ({ ...prev, status: payload.new.status }));
                    if (typeof window !== "undefined" && navigator.vibrate) {
                        navigator.vibrate([100, 50, 100]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [order.id]);

    useEffect(() => {
        if (order.status === "COMPLETED" || order.status === "CANCELLED") {
            setRemainingTime(null);
            return;
        }

        const updateTime = () => {
            const created = new Date(order.created_at).getTime();
            const now = new Date().getTime();
            const elapsed = Math.floor((now - created) / 60000);
            const totalEstimate = storeConfig?.estimated_time ? parseInt(storeConfig.estimated_time) : 45;
            const remaining = Math.max(5, totalEstimate - elapsed);
            setRemainingTime(remaining);
        };

        updateTime();
        const timer = setInterval(updateTime, 60000);
        return () => clearInterval(timer);
    }, [order.created_at, order.status, storeConfig?.estimated_time]);

    const groupedItems = order.order_items?.reduce((acc: any[], item: any) => {
        const prodId = item.product_id || item.id;
        const key = `${prodId}-${item.notes || ''}`;
        const existing = acc.find(i => i.groupKey === key);
        if (existing) {
            existing.quantity += item.quantity;
        } else {
            acc.push({ ...item, groupKey: key });
        }
        return acc;
    }, []) || [];

    if (!order) return null;

    let stepsToRender = STATUS_STEPS;
    if (order.payment_method === "ON_PICKUP") {
        stepsToRender = stepsToRender.filter(s => s.id !== "DELIVERY");
    }

    const activeIndexToRender = stepsToRender.findIndex(s => s.id === order.status) !== -1
        ? stepsToRender.findIndex(s => s.id === order.status)
        : stepsToRender.length - 1;

    if (isRatingActive) {
        return (
            <div className="fixed inset-0 bg-background z-[100] w-full flex flex-col items-center justify-center animate-in fade-in duration-500 overflow-hidden">
                <div className="w-full max-w-md h-full flex flex-col justify-center">
                    <OrderRatingCard
                        orderId={order.id}
                        initialRating={initialRating}
                        onActiveChange={setIsRatingActive}
                    />
                </div>
            </div>
        );
    }

    const copyOrderId = () => {
        navigator.clipboard.writeText(order.id);
        const btn = document.getElementById("copy-btn");
        if (btn) {
            const originalContent = btn.innerHTML;
            btn.innerHTML = "Copiado!";
            setTimeout(() => {
                if (btn) btn.innerHTML = originalContent;
            }, 2000);
        }
    };

    const CurrentStageIcon = stepsToRender[activeIndexToRender]?.icon || Clock;

    return (
        <>
            <div className="min-h-screen bg-background pb-32">
                <header className="sticky top-0 z-40 flex items-center justify-between bg-surface/80 backdrop-blur-sm px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-4 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center">
                        <button onClick={() => window.location.href = "/"} className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-90 shadow-sm">
                            <ArrowLeft className="h-5 w-5 text-foreground" />
                        </button>
                        <div>
                            <h1 className="text-sm font-black uppercase italic tracking-tighter text-gray-600 dark:text-gray-400 leading-none mb-1">Status do Pedido</h1>
                            <button
                                id="copy-btn"
                                onClick={copyOrderId}
                                className="text-[11px] text-foreground font-black uppercase tracking-widest flex items-center hover:text-brand transition-colors"
                            >
                                <span className="h-2 w-2 bg-brand rounded-full mr-2 shadow-[0_0_2px_#FA0000]" />
                                PEDIDO #{order.id.slice(0, 8).toUpperCase()}
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2" />
                </header>

                <div className="mx-auto max-w-md p-4">
                    {(order.status === "COMPLETED" || initialRating) && (
                        <div className="mb-6">
                            <OrderRatingCard
                                orderId={order.id}
                                initialRating={initialRating}
                                onActiveChange={setIsRatingActive}
                            />
                        </div>
                    )}

                    <div className={cn("mb-8 overflow-hidden rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 transition-all",
                        order.status === "CANCELLED" && "border-red-100 bg-red-50/50 shadow-red-500/5"
                    )}>
                        <div className="p-8 pb-6">
                            <div className="flex items-center gap-5 mb-6">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.05, 1],
                                    }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className={cn("h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-lg",
                                        order.status === "CANCELLED" ? "bg-red-500 shadow-red-500/20" : "bg-brand shadow-[0_10px_20px_rgba(250,0,0,0.2)]")}
                                >
                                    {order.status === "CANCELLED" ? <AlertTriangle className="h-8 w-8" /> :
                                        order.status === "COMPLETED" ? <CheckCircle2 className="h-8 w-8" /> :
                                            order.status === "DELIVERY" ? <MapPin className="h-8 w-8 animate-bounce" /> :
                                                order.status === "PREPARING" ? <ChefHat className="h-8 w-8" /> :
                                                    <Clock className="h-8 w-8" />}
                                </motion.div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-foreground leading-none">
                                        {order.status === "CANCELLED" ? "Pedido Cancelado" :
                                            order.status === "COMPLETED" ? "Entregue!" :
                                                order.status === "DELIVERY" ? "A Caminho!" :
                                                    order.status === "READY" ? "Pronto!" :
                                                        "Preparando..."}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
                                        </span>
                                        <p className="text-[10px] font-black uppercase text-brand tracking-[0.2em] mt-0.5">
                                            {order.status === "CANCELLED" ? "Encerrado" : "Status em tempo real"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                                <div className="pt-2">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-brand" />
                                            <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest italic mt-0.5">Previsão de Entrega</span>
                                        </div>
                                        <span className="text-sm font-black text-brand italic">
                                            {(() => {
                                                if (order.status === "COMPLETED") return "Entregue";
                                                if (order.status === "READY") return "Pronto para Retirada";
                                                if (order.status === "DELIVERY") return "~8 min para chegar";
                                                return remainingTime !== null ? `${remainingTime - 5}-${remainingTime} min` : "Calculando...";
                                            })()}
                                        </span>
                                    </div>

                                    <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${((activeIndexToRender + 1) / stepsToRender.length) * 100}%` }}
                                            className="h-full bg-brand rounded-full"
                                        />
                                    </div>
                                </div>

                                <p className="text-[9px] text-gray-300 font-black uppercase tracking-[0.1em] text-center pt-2">
                                    {order.status === "CANCELLED"
                                        ? "Sentimos muito pelo imprevisto."
                                        : order.status === "COMPLETED"
                                            ? "Agradecemos a preferência! Bom apetite."
                                            : "Nossa equipe está cuidando de cada detalhe."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative mb-12 ml-6">
                        <div className="absolute left-[11px] top-6 bottom-6 w-[2px] bg-gray-100 dark:bg-gray-800 rounded-full" />
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(activeIndexToRender / (stepsToRender.length - 1)) * 100}%` }}
                            className="absolute left-[11px] top-6 w-[2px] bg-brand rounded-full z-0"
                        />

                        <div className="space-y-12">
                            {stepsToRender.map((step, index) => {
                                const isActive = index === activeIndexToRender;
                                const isPast = index < activeIndexToRender;
                                const Icon = step.icon;

                                return (
                                    <div key={step.id} className="relative flex items-center gap-8">
                                        <div className="relative z-10 shrink-0">
                                            <motion.div
                                                animate={{
                                                    scale: isActive ? 1.4 : 1,
                                                }}
                                                className={cn(
                                                    "flex h-6 w-6 items-center justify-center rounded-full text-white ring-[4px] ring-background transition-all duration-500",
                                                    isPast ? "bg-blue-600" : isActive ? cn(step.bg, step.shadow) : "bg-gray-100 dark:bg-gray-800 text-gray-400 ring-transparent"
                                                )}
                                            >
                                                {isPast ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3 w-3" />}
                                            </motion.div>
                                        </div>

                                        <div className="flex-1">
                                            <h3 className={cn("text-xs uppercase tracking-[0.15em] font-black italic transition-all duration-500",
                                                isActive ? "text-foreground text-sm" : isPast ? "text-gray-600 dark:text-gray-300" : "text-gray-300")}>
                                                {step.label}
                                            </h3>
                                            {isActive && (
                                                <p className="text-[9px] font-bold text-brand uppercase tracking-widest mt-0.5 animate-pulse">Acontecendo agora</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        onClick={() => setShowHelpMenu(true)}
                        className="w-full mt-2 py-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#FA0000] transition-all border border-red-100/50 dark:border-red-900/30 rounded-xl bg-red-50/50 dark:bg-red-950/20 shadow-sm"
                    >
                        <HelpCircle className="h-4 w-4" />
                        PROBLEMAS COM O PEDIDO?
                    </button>
                </div>

                <div className="mx-auto max-w-md p-4 pt-0">
                    <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800 overflow-hidden relative transition-all">
                        <button
                            onClick={() => setIsItemsExpanded(!isItemsExpanded)}
                            className="w-full p-6 text-left"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gray-50/80 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                                        <ShoppingBag className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-[11px] font-black uppercase italic tracking-[0.15em] text-foreground">Resumo do Pedido</h4>
                                        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-0.5 block">
                                            {groupedItems.length} {groupedItems.length === 1 ? 'ITEM' : 'ITENS'} agrupados
                                        </span>
                                    </div>
                                </div>
                                <div className={cn("h-8 w-8 rounded-full border border-gray-100 dark:border-gray-800 flex items-center justify-center transition-transform",
                                    isItemsExpanded && "rotate-180"
                                )}>
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                        </button>

                        <AnimatePresence>
                            {isItemsExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-6 pb-6 space-y-6">
                                        <div className="h-[1px] w-full bg-gray-100 dark:bg-gray-800 mb-6" />
                                        {groupedItems.map((item: any) => (
                                            <div key={item.groupKey} className="flex items-center justify-between group">
                                                <div className="flex gap-4 items-center">
                                                    <div className="h-16 w-16 shrink-0 relative rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                                                        {item.product?.image_url || item.image_url ? (
                                                            <img
                                                                src={item.product?.image_url || item.image_url}
                                                                alt={item.product?.name || item.name}
                                                                className="h-full w-full object-cover"
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center">
                                                                <Package className="h-5 w-5 text-gray-200" />
                                                            </div>
                                                        )}
                                                        <div className="absolute top-1 left-1 h-5 min-w-[1.25rem] bg-brand text-white text-[9px] font-black flex items-center justify-center px-1 rounded-md shadow-sm">
                                                            {item.quantity}x
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h5 className="text-sm font-black text-foreground uppercase tracking-tight italic leading-tight">
                                                            {item.product?.name || item.name}
                                                        </h5>
                                                        <p className="text-[10px] font-bold text-gray-400 mt-1">{item.notes || "Sem observações"}</p>
                                                    </div>
                                                </div>
                                                <span className="text-base font-black text-foreground tabular-nums tracking-tighter italic">
                                                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.unit_price * item.quantity)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-6 pt-0">
                            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-6">
                                <div className="flex justify-between items-center text-[9px] font-bold text-gray-300 uppercase tracking-[0.1em] px-1">
                                    <span>Método de Pagamento</span>
                                    <div className="flex items-center gap-2 text-foreground">
                                        {order.payment_method === 'PIX' && (
                                            <div className="h-4 w-4 bg-[#32BCAD] rounded flex items-center justify-center p-0.5 shadow-sm">
                                                <img src="https://logospng.org/download/pix/logo-pix-icone-512.png" alt="PIX" className="brightness-0 invert h-full w-full" />
                                            </div>
                                        )}
                                        <span className="text-[10px] font-black uppercase italic text-foreground tracking-wider">
                                            {order.payment_method === 'PIX' ? 'PIX Dinâmico' :
                                                order.payment_method === 'CREDITO' ? 'Cartão de Crédito' :
                                                    order.payment_method === 'DEBITO' ? 'Cartão de Débito' : 'Dinheiro'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end border-t border-gray-100 dark:border-gray-800 pt-6 px-1">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase italic tracking-[0.2em] text-gray-300 leading-none">
                                            Recibo Digital
                                        </span>
                                        <div className="mt-2">
                                            <span className={cn("text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border",
                                                order.payment_method === 'DINHEIRO'
                                                    ? "text-amber-600 bg-amber-50 border-amber-200"
                                                    : "text-[#32BCAD] bg-[#32BCAD]/10 border-[#32BCAD]/30"
                                            )}>
                                                {order.payment_method === 'DINHEIRO' ? "Pagar na Entrega" : "Total Liquidado"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] font-black uppercase text-gray-300 tracking-[0.1em] mb-1">Valor Total</span>
                                        <span className="text-3xl font-black text-foreground tabular-nums tracking-tighter italic leading-none">
                                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.total_amount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showHelpMenu && (
                    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="w-full max-w-md bg-white dark:bg-gray-950 rounded-t-[3rem] p-8 shadow-xl pb-[calc(env(safe-area-inset-bottom,0px)+32px)]"
                        >
                            <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-8" />
                            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2 text-foreground">Central de Ajuda</h3>
                            <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-8">Como podemos te ajudar com o pedido #{order.id.slice(0, 6)}?</p>

                            <div className="space-y-3">
                                {(order.status === 'NEW' || order.status === 'PREPARING') && (
                                    <button
                                        onClick={() => { setShowHelpMenu(false); setCancelStep("CONFIRM"); }}
                                        className="w-full p-6 flex justify-between items-center bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl group"
                                    >
                                        <div className="text-left">
                                            <p className="text-xs font-black uppercase italic text-red-600">Cancelar Pedido</p>
                                            <p className="text-[9px] font-black text-red-500/60 uppercase tracking-tight">Ainda é possível cancelar agora</p>
                                        </div>
                                        <XCircle className="h-5 w-5 text-red-400 group-hover:text-red-500 transition-colors" />
                                    </button>
                                )}

                                <button
                                    onClick={() => {
                                        const phone = storeConfig?.contact_phone?.replace(/\D/g, '') || "00000000000";
                                        window.open(`https://wa.me/55${phone}?text=Olá! Preciso de ajuda com meu pedido #${order.id.slice(0, 6)}`, '_blank');
                                    }}
                                    className="w-full p-6 flex justify-between items-center bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl group"
                                >
                                    <div className="text-left">
                                        <p className="text-xs font-black uppercase italic text-emerald-600">Alterar Endereço</p>
                                        <p className="text-[9px] font-black text-emerald-500/60 uppercase tracking-tight">Fale com nossa equipe agora</p>
                                    </div>
                                    <MapPin className="h-5 w-5 text-emerald-400 group-hover:text-emerald-500 transition-colors" />
                                </button>

                                <button
                                    onClick={() => setShowHelpMenu(false)}
                                    className="w-full h-14 mt-4 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-[11px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Fechar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {cancelStep !== "IDLE" && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/20 backdrop-blur-[2px]">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl p-8 shadow-xl"
                        >
                            {cancelStep === "CONFIRM" ? (
                                <div className="text-center">
                                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
                                        <AlertTriangle className="h-8 w-8" />
                                    </div>
                                    <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Cancelar?</h2>
                                    <p className="text-sm text-gray-500 mb-8">Esta ação não pode ser desfeita.</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={() => setCancelStep("IDLE")} className="h-14 rounded-xl bg-gray-100 text-gray-600 font-bold uppercase">Sair</button>
                                        <button onClick={() => setCancelStep("REASON")} className="h-14 rounded-xl bg-red-600 text-white font-black uppercase italic">Sim, Cancelar</button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h2 className="text-xl font-black uppercase italic tracking-tighter mb-6">Por que cancelar?</h2>
                                    <div className="space-y-2 mb-6">
                                        {CANCEL_REASONS.map((reason) => (
                                            <button
                                                key={reason}
                                                onClick={() => setSelectedReason(reason)}
                                                className={cn("w-full flex items-center justify-between p-4 rounded-xl border text-sm font-bold transition-all",
                                                    selectedReason === reason ? "border-brand bg-brand/5 text-brand" : "border-gray-100 text-gray-500 hover:border-gray-200")}
                                            >
                                                {reason}
                                                {selectedReason === reason && <div className="h-2 w-2 rounded-full bg-brand animate-pulse" />}
                                            </button>
                                        ))}
                                    </div>

                                    {selectedReason === "Outro" && (
                                        <textarea
                                            value={customReason}
                                            onChange={(e) => setCustomReason(e.target.value)}
                                            placeholder="Descreva o motivo..."
                                            className="w-full h-24 p-4 rounded-xl border border-gray-100 bg-gray-50 dark:bg-gray-800 text-sm outline-none mb-6 resize-none focus:ring-2 ring-brand/20 transition-all"
                                        />
                                    )}

                                    <button
                                        disabled={cancelling}
                                        className="w-full h-14 rounded-xl bg-brand text-white font-black uppercase italic tracking-widest shadow-lg shadow-brand/20 disabled:opacity-50"
                                        onClick={async () => {
                                            setCancelling(true);
                                            const finalReason = selectedReason === "Outro" ? customReason : selectedReason;
                                            const res = await cancelOrder(order.id, finalReason || "Motivo não informado");
                                            if (!res.error) setCancelStep("IDLE");
                                            setCancelling(false);
                                        }}
                                    >
                                        {cancelling ? "Aguarde..." : "Concluir"}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
