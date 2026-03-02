"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateOrderStatus } from "@/lib/actions/adminActions";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/core/Card";
import { Button } from "@/components/core/Button";
import { Clock, MapPin, Phone, ArrowRight, Navigation, XCircle, AlertTriangle, ChevronRight, AlertCircle, ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrdersStore } from "@/lib/ordersStore";
import { parseEstimatedTime } from "@/lib/storeUtils";

type OrderStatus = "NEW" | "PREPARING" | "READY" | "DELIVERY" | "COMPLETED" | "CANCELLED";

interface OrderItem {
    id: string;
    name?: string;
    quantity: number;
    product: { name: string };
    unit_price: number;
    extras?: { id: string; name: string; price: number }[];
    notes?: string;
}

interface Order {
    id: string;
    customer_name: string;
    customer_phone: string;
    delivery_address: string;
    payment_method: string;
    status: OrderStatus;
    total_amount: number;
    created_at: string;
    order_items?: OrderItem[];
}

const COLUMNS: { id: OrderStatus; label: string; color: string }[] = [
    { id: "NEW", label: "Novos Pedidos", color: "bg-blue-50 dark:bg-blue-950/20 border-blue-200" },
    { id: "PREPARING", label: "Em Preparo", color: "bg-amber-50 dark:bg-amber-950/20 border-amber-200" },
    { id: "READY", label: "Prontos / Despache", color: "bg-green-50 dark:bg-green-950/20 border-green-200" },
    { id: "DELIVERY", label: "Em Rota", color: "bg-purple-50 dark:bg-purple-950/20 border-purple-200" },
];

const STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
    NEW: "PREPARING",
    PREPARING: "READY",
    READY: "DELIVERY",
    DELIVERY: "COMPLETED",
    COMPLETED: null,
    CANCELLED: null,
};

export function KanbanBoard({ initialOrders, storeSettings }: { initialOrders: Order[], storeSettings: any }) {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [soundEnabled, setSoundEnabled] = useState(false);

    // Estados do Modal de Cancelamento
    const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState("");
    const [customReason, setCustomReason] = useState("");
    const [isCancelling, setIsCancelling] = useState(false);
    const isCancellingRef = useRef(false);

    // Store Hooks
    const setStoreOrders = useOrdersStore(s => s.setOrders);
    const setStoreSettings = useOrdersStore(s => s.setStoreSettings);
    const subscribeStore = useOrdersStore(s => s.subscribe);
    const unsubscribeStore = useOrdersStore(s => s.unsubscribe);
    const refreshDelays = useOrdersStore(s => s.refreshDelays);

    const ADMIN_CANCEL_REASONS = [
        "Estoque esgotado",
        "Fora da região de entrega",
        "Horário encerrado",
        "Problema técnico / Cozinha",
        "Pedido duplicado",
        "Outro"
    ];
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const NOTIFY_SOUND = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTdvT18AAAAA";

    useEffect(() => {
        audioRef.current = new Audio("/notify.mp3");

        // Inicializa o Store
        setStoreSettings(storeSettings);
        setStoreOrders(initialOrders);
        subscribeStore();

        // Atualiza o tempo a cada 10 segundos para o cronômetro
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
            refreshDelays();
        }, 10000);

        const supabase = createClient();
        const channel = supabase
            .channel("kanban-orders-realtime")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "orders" },
                (payload) => {
                    if (soundEnabled && audioRef.current) {
                        audioRef.current.play().catch(() => {
                            new Audio(NOTIFY_SOUND).play().catch(() => { });
                        });
                    }
                    window.location.reload();
                }
            )
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "orders" },
                (payload) => {
                    const newRow = payload.new as Order;
                    if (newRow.status === "CANCELLED") {
                        if (isCancellingRef.current) return;
                        setOrders((prev) => prev.filter(o => o.id !== newRow.id));
                    } else {
                        setOrders((prev) => prev.map(o => o.id === newRow.id ? { ...o, status: newRow.status } : o));
                    }
                    refreshDelays();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            unsubscribeStore();
            clearInterval(timeInterval);
        };
    }, [soundEnabled, initialOrders, storeSettings, setStoreOrders, setStoreSettings, subscribeStore, unsubscribeStore, refreshDelays]);

    const handleAdvanceStatus = async (orderId: string, currentStatus: OrderStatus, deliveryMethod: string) => {
        let nextStatus = STATUS_FLOW[currentStatus];
        if (currentStatus === "READY" && deliveryMethod === "ON_PICKUP") {
            nextStatus = "COMPLETED";
        }
        if (!nextStatus) return;

        setOrders((prev) => prev.map(o => o.id === orderId ? { ...o, status: nextStatus as OrderStatus } : o));
        await updateOrderStatus(orderId, nextStatus);
        refreshDelays();
    };

    const handleCancelOrder = async () => {
        if (!orderToCancel) return;
        setIsCancelling(true);
        isCancellingRef.current = true;
        const finalReason = cancelReason === "Outro" ? customReason : cancelReason;
        const res = await updateOrderStatus(orderToCancel, "CANCELLED", finalReason || "Cancelado pela loja");
        if (!res.error) {
            setOrders((prev) => prev.filter(o => o.id !== orderToCancel));
            setOrderToCancel(null);
            setCancelReason("");
            setCustomReason("");
        }
        setIsCancelling(false);
        isCancellingRef.current = false;
        refreshDelays();
    };

    return (
        <div className="flex h-full lg:overflow-x-auto xl:overflow-x-hidden p-6 gap-6 bg-gray-50/50 dark:bg-background relative no-scrollbar">
            <div className="fixed bottom-10 right-10 z-50">
                <Button
                    variant={soundEnabled ? "default" : "outline"}
                    className={cn("rounded-full h-14 w-14 shadow-2xl flex items-center justify-center transition-all", soundEnabled ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-white dark:bg-gray-800')}
                    onClick={() => setSoundEnabled(!soundEnabled)}
                >
                    {soundEnabled ? <Clock className="w-6 h-6 animate-pulse" /> : <ArrowRight className="w-6 h-6 rotate-90" />}
                </Button>
                {soundEnabled && <span className="absolute -top-12 right-0 bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-full font-bold whitespace-nowrap shadow-sm border border-green-200">SISTEMA RADAR ATIVO ðŸ””</span>}
            </div>

            {COLUMNS.map((col) => (
                <div key={col.id} className="flex min-w-[320px] max-w-[350px] flex-col rounded-xl bg-gray-100/50 p-4 dark:bg-gray-900/50">
                    <div className="mb-4 flex items-center justify-between px-2 text-sm font-black uppercase italic tracking-tighter text-gray-500">
                        <h2>{col.label}</h2>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs shadow-sm dark:bg-gray-800">{orders.filter(o => o.status === col.id).length}</span>
                    </div>

                    <div className="flex flex-1 flex-col gap-4 overflow-y-auto no-scrollbar pb-4">
                        <AnimatePresence>
                            {orders.filter(o => o.status === col.id).map((order) => {
                                const createdAt = new Date(order.created_at).getTime();
                                const elapsedMin = Math.floor((currentTime.getTime() - createdAt) / 60000);
                                const maxMin = parseEstimatedTime(storeSettings?.estimated_time);
                                const isDelayed = elapsedMin > (maxMin + 5);
                                const remainingMin = maxMin - elapsedMin;

                                return (
                                    <motion.div key={order.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                                        <Card className={cn(
                                            "border shadow-sm transition-all duration-500",
                                            col.color,
                                            isDelayed ? "border-2 border-[#FA0000] animate-[pulse_2s_infinite] shadow-[0_0_20px_rgba(250,0,0,0.4)] bg-white dark:bg-gray-900" : ""
                                        )}>
                                            <CardHeader className="p-4 pb-2">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {isDelayed && (
                                                            <div className="h-8 w-8 rounded-lg bg-[#FA0000] text-white flex items-center justify-center animate-bounce shadow-lg shadow-red-500/40">
                                                                <AlertCircle className="h-5 w-5" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <CardTitle className={cn("text-base tracking-tighter italic", isDelayed ? "text-[#FA0000] font-black" : "text-foreground")}>#{order.id.slice(0, 6).toUpperCase()}</CardTitle>
                                                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{order.customer_name}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        {isDelayed ? (
                                                            <div className="bg-[#FA0000] text-white px-2 py-1 rounded-lg text-[11px] font-black italic tracking-tighter flex items-center gap-1.5 shadow-lg shadow-red-500/20">
                                                                <Clock className="h-3 w-3" />
                                                                <span>-{Math.abs(remainingMin)} MIN</span>
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm font-black text-foreground tabular-nums opacity-40 italic">
                                                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.total_amount)}
                                                            </div>
                                                        )}
                                                        <p className="mt-1 text-[9px] uppercase font-bold text-gray-400 opacity-60 italic">{order.payment_method === "ON_DELIVERY" ? "PGTO ENTREGA" : "PGTO PIX"}</p>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0">
                                                <div className="space-y-3">
                                                    <ul className="text-sm space-y-1 mt-2 text-foreground font-medium bg-white/50 dark:bg-black/20 p-2 rounded-lg border border-white/20">
                                                        {order.order_items?.map((item) => (
                                                            <li key={item.id} className="flex flex-col border-b border-gray-100 dark:border-gray-800 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
                                                                <span className="font-bold text-xs uppercase tracking-tighter text-foreground italic"><span className="text-[#FA0000] mr-2">{item.quantity}x</span> {item.name || item.product?.name}</span>
                                                                {item.notes && <p className="text-[10px] italic text-[#FA0000] font-black pl-2 mt-1 border-l-2 border-[#FA0000]/20 bg-red-500/5 px-1 py-0.5 rounded">Obs: {item.notes}</p>}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <div className="mt-3 flex flex-col gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-tight italic">
                                                        <div className="flex items-center gap-2 truncate"><MapPin className="h-3 w-3 text-gray-300" /> {order.delivery_address}</div>
                                                        <div className="flex items-center gap-2"><Clock className={cn("h-3 w-3", isDelayed ? "text-[#FA0000]" : "text-gray-300")} /> <span className={cn(isDelayed && "text-[#FA0000] font-black")}>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {isDelayed && `(Atraso: ${elapsedMin}min)`}</span></div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="p-4 pt-0 flex gap-2">
                                                {isDelayed ? (
                                                    <Button className="w-full h-11 bg-[#FA0000] hover:bg-[#D00000] text-white text-[10px] font-black uppercase italic tracking-widest shadow-lg shadow-red-500/20 gap-2 border-0" onClick={() => handleAdvanceStatus(order.id, order.status, order.payment_method)}>
                                                        <ChefHat className="h-4 w-4" /> PRIORIZAR NA COZINHA
                                                    </Button>
                                                ) : (
                                                    <>
                                                        <Button variant="ghost" className="flex-1 text-[10px] h-10 gap-2 text-gray-400 hover:text-red-500 hover:bg-red-50 font-bold uppercase italic" onClick={() => setOrderToCancel(order.id)}><XCircle className="h-3 w-3" /> Cancelar</Button>
                                                        <Button className="flex-[2] text-[10px] h-10 gap-2 font-black uppercase italic tracking-widest" onClick={() => handleAdvanceStatus(order.id, order.status, order.payment_method)}>Avançar <ArrowRight className="h-4 w-4" /></Button>
                                                    </>
                                                )}
                                            </CardFooter>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            ))}

            <AnimatePresence>
                {orderToCancel && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-gray-900 rounded-xl p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3 text-red-500 mb-6">
                                <div className="h-12 w-12 rounded-xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
                                    <AlertTriangle className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none">Cancelar Pedido</h3>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1 italic">Ação Irreversível</p>
                                </div>
                            </div>
                            <div className="space-y-2 mb-8">
                                {ADMIN_CANCEL_REASONS.map((r) => (
                                    <button key={r} onClick={() => setCancelReason(r)} className={cn("w-full px-4 py-3 rounded-xl border text-left text-xs font-bold uppercase tracking-tight transition-all italic", cancelReason === r ? "border-brand bg-brand/5 text-brand" : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-400 hover:text-gray-600")}>{r}</button>
                                ))}
                            </div>
                            {cancelReason === "Outro" && <textarea value={customReason} onChange={(e) => setCustomReason(e.target.value)} placeholder="Motivo..." className="w-full h-24 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-sm mb-6 outline-none focus:ring-2 ring-brand/10 italic" />}
                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest italic" onClick={() => { setOrderToCancel(null); setCancelReason(""); }}>Voltar</Button>
                                <Button className="flex-[2] h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20 italic" onClick={handleCancelOrder} disabled={!cancelReason || isCancelling}>{isCancelling ? "Cancelando..." : "Confirmar"}</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
