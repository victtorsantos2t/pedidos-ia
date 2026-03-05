import { getActiveOrders } from "@/lib/actions/adminActions";
import { obterConfiguracoesLoja } from "@/lib/actions/adminSettingsActions";
import { KanbanBoard, Order } from "@/components/domain/KanbanBoard";
import { ChefHat } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
    const orders = await getActiveOrders();
    const settings = await obterConfiguracoesLoja();

    return (
        <div className="flex flex-col h-screen animate-in fade-in duration-500">
            <div className="p-6 lg:p-10 pb-0 space-y-1">
                <h1 className="text-3xl font-black text-foreground tracking-tighter italic uppercase flex items-center gap-3">
                    <ChefHat className="h-8 w-8 text-brand" />
                    Cozinha (Pedidos)
                </h1>
                <p className="text-gray-500 font-medium tracking-tight uppercase text-xs">Acompanhamento e gestão de produção em tempo real.</p>
            </div>

            <div className="flex-1 min-h-0">
                <KanbanBoard initialOrders={orders as unknown as Order[]} storeSettings={settings} />
            </div>
        </div>
    );
}
