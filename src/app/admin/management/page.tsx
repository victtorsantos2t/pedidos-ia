import { getManagementOrders } from "@/lib/actions/adminActions";
import { AdminOrdersManagement } from "@/components/domain/AdminOrdersManagement";
import { ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminManagementPage() {
    const orders = await getManagementOrders();

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50 dark:bg-background animate-in fade-in duration-500">
            {/* Header Sticky */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-6 pt-[calc(env(safe-area-inset-top,0px)+24px)] pb-6 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-foreground tracking-tighter italic uppercase flex items-center gap-3">
                            <ShoppingBag className="h-8 w-8 text-brand" />
                            Gestão de Pedidos
                        </h1>
                        <p className="text-gray-500 font-medium tracking-tight uppercase text-[10px] leading-none">Controle geral, histórico e análise de cancelamentos.</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] uppercase font-black text-gray-400">TOTAL PEDIDOS</span>
                            <span className="text-xl font-black text-foreground italic tracking-tighter tabular-nums leading-none">
                                {orders.length.toString().padStart(2, '0')}
                            </span>
                        </div>
                        <div className="h-8 w-px bg-gray-100 dark:bg-gray-800" />
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] uppercase font-black text-red-400">CANCELADOS</span>
                            <span className="text-xl font-black text-red-500 italic tracking-tighter tabular-nums leading-none">
                                {orders.filter(o => o.status === 'CANCELLED').length.toString().padStart(2, '0')}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1">
                <AdminOrdersManagement initialOrders={orders as any} />
            </div>
        </div>
    );
}
