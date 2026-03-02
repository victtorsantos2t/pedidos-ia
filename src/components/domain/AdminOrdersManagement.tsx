"use client";

import { useState } from "react";
import {
    Search,
    Filter,
    ChevronRight,
    Package,
    ShoppingBag,
    Clock,
    XCircle,
    CheckCircle2,
    MapPin,
    Phone,
    CreditCard,
    Banknote,
    AlertTriangle,
    X,
    AlertCircle,
    ChefHat
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/core/Card";
import { cn } from "@/lib/utils";
import { updateOrderStatus } from "@/lib/actions/adminActions";
import { Button } from "../core/Button";
import { useOrdersStore } from "@/lib/ordersStore";
import { parseEstimatedTime } from "@/lib/storeUtils";
import { useEffect } from "react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    NEW: { label: "Novo", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: ShoppingBag },
    PREPARING: { label: "Preparando", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: Clock },
    READY: { label: "Pronto", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle2 },
    DELIVERY: { label: "Em Rota", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: MapPin },
    COMPLETED: { label: "Concluído", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: Package },
    CANCELLED: { label: "Cancelado", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
};

export function AdminOrdersManagement({ initialOrders }: { initialOrders: any[] }) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    // Store Hooks
    const orders = useOrdersStore(s => s.orders);
    const setStoreOrders = useOrdersStore(s => s.setOrders);
    const refreshDelays = useOrdersStore(s => s.refreshDelays);
    const subscribeStore = useOrdersStore(s => s.subscribe);
    const unsubscribeStore = useOrdersStore(s => s.unsubscribe);
    const updateOrder = useOrdersStore(s => s.updateOrder);

    useEffect(() => {
        setStoreOrders(initialOrders);
        refreshDelays();
        subscribeStore();

        const interval = setInterval(() => {
            setCurrentTime(new Date());
            refreshDelays();
        }, 30000);

        return () => {
            clearInterval(interval);
            unsubscribeStore();
        };
    }, [initialOrders, setStoreOrders, refreshDelays, subscribeStore, unsubscribeStore]);

    // Estados do Cancelamento
    const [cancelStep, setCancelStep] = useState<"IDLE" | "CONFIRM" | "REASON">("IDLE");
    const [cancelReason, setCancelReason] = useState("");
    const [customReason, setCustomReason] = useState("");
    const [isCancelling, setIsCancelling] = useState(false);

    const ADMIN_CANCEL_REASONS = [
        "Estoque esgotado",
        "Fora da região de entrega",
        "Horário encerrado",
        "Problema técnico / Cozinha",
        "Pedido duplicado",
        "Outro"
    ];

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-0">
            {/* Standardized Tab Navigation - Elite Style */}
            <div className="sticky top-0 z-20 bg-white/80 dark:bg-black/94 backdrop-blur-2xl border-b border-gray-100 dark:border-gray-800 -mx-8 px-8 mb-8">
                <div className="flex items-center gap-8 overflow-x-auto no-scrollbar pt-4">
                    <button
                        onClick={() => setStatusFilter("ALL")}
                        className={cn(
                            "relative pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap px-1",
                            statusFilter === "ALL" ? "text-[#FA0000]" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        Todos os Pedidos
                        {statusFilter === "ALL" && (
                            <motion.div
                                layoutId="admin-orders-tab-underline"
                                className="absolute bottom-0 left-0 right-0 h-1 bg-[#FA0000] rounded-t-full"
                            />
                        )}
                    </button>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <button
                            key={key}
                            onClick={() => setStatusFilter(key)}
                            className={cn(
                                "relative pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap px-1",
                                statusFilter === key ? "text-[#FA0000]" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            {config.label}
                            {statusFilter === key && (
                                <motion.div
                                    layoutId="admin-orders-tab-underline"
                                    className="absolute bottom-0 left-0 right-0 h-1 bg-[#FA0000] rounded-t-full"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-8">
                {/* Search Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                    <div className="flex-1 max-w-md relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#FA0000] transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar por ID ou nome do cliente..."
                            className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm font-medium focus:ring-4 ring-red-500/5 transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Orders List */}
                <div className="grid grid-cols-1 gap-4">
                    {filteredOrders.length === 0 ? (
                        <div className="py-20 text-center space-y-4 rounded-xl bg-gray-50 dark:bg-gray-950 border border-dashed border-gray-200 dark:border-gray-800">
                            <div className="h-16 w-16 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center mx-auto shadow-sm">
                                <ShoppingBag className="h-8 w-8 text-gray-300" />
                            </div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Nenhum pedido encontrado</p>
                        </div>
                    ) : (
                        filteredOrders.map((order) => {
                            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.NEW;
                            const StatusIcon = config.icon;

                            const createdAt = new Date(order.created_at).getTime();
                            const elapsedMin = Math.floor((currentTime.getTime() - createdAt) / 60000);
                            const maxMin = useOrdersStore.getState().maxEstimatedTime;
                            const isDelayed = elapsedMin > (maxMin + 5) && (order.status === "NEW" || order.status === "PREPARING");
                            const remainingMin = maxMin - elapsedMin;

                            return (
                                <motion.div
                                    layout
                                    key={order.id}
                                    onClick={() => setSelectedOrder(order)}
                                    className="group cursor-pointer"
                                    whileHover={{ y: -2 }}
                                >
                                    <div className={cn(
                                        "p-5 flex items-center justify-between bg-white dark:bg-gray-950 rounded-xl border transition-all shadow-sm group-hover:shadow-xl group-hover:shadow-red-500/5",
                                        isDelayed
                                            ? "border-2 border-[#FA0000] animate-[pulse_2s_infinite] shadow-[0_0_15px_rgba(250,0,0,0.2)]"
                                            : "border-gray-100 dark:border-gray-800 group-hover:border-[#FA0000]/30"
                                    )}>
                                        <div className="flex items-center gap-6">
                                            <div className={cn(
                                                "h-14 w-14 rounded-xl flex items-center justify-center shadow-inner transition-all",
                                                isDelayed ? "bg-[#FA0000] text-white opacity-100 scale-110 shadow-lg shadow-red-500/20" : cn("opacity-80 group-hover:opacity-100", config.color)
                                            )}>
                                                {isDelayed ? <AlertCircle className="h-7 w-7 animate-bounce" /> : <StatusIcon className="h-7 w-7" />}
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <span className={cn("text-sm font-black italic tracking-tighter uppercase", isDelayed ? "text-[#FA0000]" : "text-[#2A2A2A] dark:text-white")}>
                                                        #{order.id.slice(0, 8).toUpperCase()}
                                                    </span>
                                                    <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full", isDelayed ? "bg-[#FA0000] text-white" : config.color)}>
                                                        {isDelayed ? "ATRASO CRÍTICO" : config.label}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-base font-bold text-[#2A2A2A] dark:text-gray-200 leading-tight mb-1">{order.customer_name}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight opacity-60 italic">
                                                            {format(new Date(order.created_at), "HH:mm", { locale: ptBR })}
                                                        </span>
                                                        {isDelayed && (
                                                            <span className="text-[10px] text-[#FA0000] font-black uppercase italic tracking-tighter">
                                                                Atrasado {elapsedMin}min
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className="hidden md:flex flex-col items-end">
                                                {isDelayed ? (
                                                    <div className="bg-[#FA0000] text-white px-3 py-1.5 rounded-lg text-xs font-black italic tracking-tighter flex items-center gap-2 shadow-lg shadow-red-500/20">
                                                        <Clock className="h-3 w-3" />
                                                        -{Math.abs(remainingMin)} MIN
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="text-[10px] font-black italic text-gray-400 tracking-tighter uppercase leading-none opacity-40">Total</span>
                                                        <span className="text-xl font-black text-[#2A2A2A] dark:text-gray-400 italic tracking-tighter tabular-nums">
                                                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.total_amount)}
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            {isDelayed ? (
                                                <Button
                                                    className="h-11 px-6 rounded-xl bg-[#FA0000] text-white text-[10px] font-black uppercase italic tracking-widest gap-2 shadow-lg shadow-red-500/20"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        updateOrderStatus(order.id, "PREPARING");
                                                        refreshDelays();
                                                    }}
                                                >
                                                    <ChefHat className="h-4 w-4" /> PRIORIZAR
                                                </Button>
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center group-hover:bg-[#FA0000] group-hover:text-white group-hover:border-[#FA0000] transition-all">
                                                    <ChevronRight className="h-5 w-5" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>

                {/* Side Modal (Details Drawer) */}
                <AnimatePresence>
                    {selectedOrder && (
                        <div className="fixed inset-0 z-[100] flex items-stretch justify-end">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedOrder(null)}
                                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            />

                            <motion.div
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="relative w-full max-w-xl bg-gray-50 dark:bg-gray-950 shadow-2xl overflow-y-auto"
                            >
                                <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => {
                                                setSelectedOrder(null);
                                                setCancelStep("IDLE");
                                            }}
                                            className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                        >
                                            <X className="h-6 w-6 text-gray-400" />
                                        </button>
                                        <div>
                                            <h3 className="text-xl font-black italic tracking-tighter uppercase text-[#2A2A2A] dark:text-white">Detalhes do Pedido</h3>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">#{selectedOrder.id.toUpperCase()}</p>
                                        </div>
                                    </div>

                                    <div className={cn(
                                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest",
                                        STATUS_CONFIG[selectedOrder.status].color
                                    )}>
                                        {STATUS_CONFIG[selectedOrder.status].label}
                                    </div>
                                </div>

                                <div className="p-8 space-y-8">
                                    {/* Alerta de Cancelamento */}
                                    {selectedOrder.status === "CANCELLED" && (
                                        <div className="p-6 rounded-xl bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30">
                                            <div className="flex items-center gap-3 text-[#FA0000] mb-2">
                                                <AlertTriangle className="h-5 w-5" />
                                                <h4 className="font-extrabold uppercase italic tracking-tighter">Detalhes do Cancelamento</h4>
                                            </div>
                                            <p className="text-sm font-medium text-red-700 dark:text-red-400 italic">
                                                <span className="font-black uppercase text-[10px] opacity-40 block mb-1">Motivo:</span>
                                                "{selectedOrder.cancel_reason || "Não informado."}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Admin Actions (Apenas para pedidos não finalizados) */}
                                    {selectedOrder.status !== "COMPLETED" && selectedOrder.status !== "CANCELLED" && (
                                        <div className="flex gap-4">
                                            <Button
                                                variant="outline"
                                                className="flex-1 h-14 rounded-xl border-red-100 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-black uppercase italic tracking-[0.2em] text-[10px] gap-2"
                                                onClick={() => setCancelStep("CONFIRM")}
                                            >
                                                <XCircle className="h-5 w-5" />
                                                Cancelar Pedido
                                            </Button>
                                        </div>
                                    )}

                                    {/* Customer Info */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Dados do Cliente</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                                                <div className="flex items-center gap-3 text-gray-400 mb-1">
                                                    <Phone className="h-4 w-4" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest leading-none">Contatos</span>
                                                </div>
                                                <p className="text-sm font-black text-[#2A2A2A] dark:text-white uppercase tracking-tighter">{selectedOrder.customer_name}</p>
                                                <p className="text-xs font-bold text-gray-500">{selectedOrder.customer_phone}</p>
                                            </div>

                                            <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                                                <div className="flex items-center gap-3 text-gray-400 mb-1">
                                                    <MapPin className="h-4 w-4" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest leading-none">Endereço</span>
                                                </div>
                                                <p className="text-sm font-bold text-[#2A2A2A] dark:text-gray-200 leading-tight italic uppercase tracking-tighter">{selectedOrder.delivery_address}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Produtos do Pedido</h4>
                                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                                            <ul className="divide-y divide-gray-50 dark:divide-gray-800">
                                                {selectedOrder.order_items?.map((item: any) => (
                                                    <li key={item.id} className="p-6 flex items-start justify-between gap-4">
                                                        <div className="flex gap-4">
                                                            <div className="h-10 w-10 rounded-lg bg-red-500/5 dark:bg-red-500/10 border border-red-500/10 text-[#FA0000] flex items-center justify-center text-xs font-black italic">
                                                                {item.quantity}x
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-sm font-black uppercase tracking-tighter text-[#2A2A2A] dark:text-white leading-none">
                                                                    {item.name || item.product?.name || "Produto RDOS"}
                                                                </p>
                                                                {item.extras && item.extras.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                                        {item.extras.map((ex: any, i: number) => (
                                                                            <span key={i} className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] italic bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded leading-none">
                                                                                + {ex.name}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                {item.notes && (
                                                                    <p className="text-[10px] text-[#FA0000] font-black italic mt-2 bg-red-500/5 px-2 py-1 rounded-lg border border-red-500/5 inline-block uppercase leading-none">
                                                                        Obs: {item.notes}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className="text-sm font-black tabular-nums whitespace-nowrap text-[#2A2A2A] dark:text-white">
                                                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.unit_price * item.quantity)}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Payment Info */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pagamento e Total</h4>
                                        <div className="p-8 rounded-xl bg-[#2A2A2A] text-white shadow-2xl shadow-gray-400/20">
                                            <div className="flex items-center justify-between mb-8 opacity-60">
                                                <div className="flex items-center gap-2">
                                                    {selectedOrder.payment_method === 'PIX' ? <CreditCard className="h-4 w-4" /> : <Banknote className="h-4 w-4" />}
                                                    <span className="text-[10px] font-black uppercase tracking-widest italic">Meio de Pagamento</span>
                                                </div>
                                                <span className="text-xs font-black uppercase italic tracking-widest">{selectedOrder.payment_method}</span>
                                            </div>

                                            <div className="flex items-end justify-between">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Total Recebido</p>
                                                    <p className="text-4xl font-black italic tracking-tighter tabular-nums leading-none text-[#FA0000]">
                                                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(selectedOrder.total_amount)}
                                                    </p>
                                                </div>
                                                <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/5">
                                                    <CheckCircle2 className="h-7 w-7 text-[#FA0000]" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-10" />
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Modal de Cancelamento Administrativo (Gestão) */}
                <AnimatePresence>
                    {cancelStep !== "IDLE" && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white dark:bg-gray-900 rounded-xl p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800"
                            >
                                {cancelStep === "CONFIRM" ? (
                                    <div>
                                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/20 text-[#FA0000]">
                                            <AlertTriangle className="h-8 w-8" />
                                        </div>
                                        <h2 className="text-xl font-black text-[#2A2A2A] dark:text-white uppercase italic tracking-tighter mb-2 text-center">Cancelar Pedido?</h2>
                                        <p className="text-xs text-gray-500 mb-8 text-center uppercase tracking-tight font-bold italic">Esta ação irá avisar o cliente e remover o pedido da produção ativa.</p>

                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={() => setCancelStep("IDLE")}
                                                className="h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]"
                                            >
                                                Voltar
                                            </Button>
                                            <Button
                                                onClick={() => setCancelStep("REASON")}
                                                className="h-12 rounded-xl bg-[#FA0000] text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-red-500/20"
                                            >
                                                Próximo
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h2 className="text-lg font-black text-[#2A2A2A] dark:text-white uppercase italic tracking-tighter mb-4">Selecione o Motivo</h2>
                                        <div className="space-y-2 mb-6">
                                            {ADMIN_CANCEL_REASONS.map((r) => (
                                                <button
                                                    key={r}
                                                    onClick={() => setCancelReason(r)}
                                                    className={cn(
                                                        "w-full px-4 py-3 rounded-xl border text-left text-[10px] font-black uppercase tracking-[0.1em] transition-all italic",
                                                        cancelReason === r
                                                            ? "border-[#FA0000] bg-red-500/5 text-[#FA0000]"
                                                            : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-500 hover:text-gray-700"
                                                    )}
                                                >
                                                    {r}
                                                </button>
                                            ))}
                                        </div>

                                        {cancelReason === "Outro" && (
                                            <textarea
                                                value={customReason}
                                                onChange={(e) => setCustomReason(e.target.value)}
                                                placeholder="Descreve o motivo aqui..."
                                                className="w-full h-24 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs font-bold uppercase outline-none focus:ring-2 ring-red-500/10 transition-all italic"
                                            />
                                        )}

                                        <div className="flex gap-3 mt-8">
                                            <button
                                                onClick={() => setCancelStep("CONFIRM")}
                                                className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-600 transition-colors italic border border-gray-200 dark:border-gray-800"
                                            >
                                                Voltar
                                            </button>
                                            <Button
                                                disabled={!cancelReason || isCancelling}
                                                onClick={async () => {
                                                    setIsCancelling(true);
                                                    const finalReason = cancelReason === "Outro" ? customReason : cancelReason;
                                                    const res = await updateOrderStatus(selectedOrder.id, "CANCELLED", finalReason || "Cancelado pela loja");

                                                    if (res.error) {
                                                        alert(res.error);
                                                    } else {
                                                        // Atualiza o estado global
                                                        updateOrder({ id: selectedOrder.id, status: "CANCELLED" });
                                                        setSelectedOrder({ ...selectedOrder, status: "CANCELLED", cancel_reason: finalReason });
                                                        setCancelStep("IDLE");
                                                        setCancelReason("");
                                                        setCustomReason("");
                                                    }
                                                    setIsCancelling(false);
                                                }}
                                                className="flex-[2] h-12 rounded-xl bg-[#FA0000] text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-red-500/20 disabled:opacity-50 italic"
                                            >
                                                {isCancelling ? "Processando..." : "Confirmar"}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
