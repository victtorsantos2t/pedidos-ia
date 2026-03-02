import { obterConfiguracoesLoja, StoreConfig } from "@/lib/actions/adminSettingsActions";
import { AdminSettingsForm } from "@/components/domain/AdminSettingsForm";
import { Settings } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
    const config = await obterConfiguracoesLoja();

    // Valor default caso não exista (prevenir erro de renderização)
    const defaultConfig: StoreConfig = {
        is_open: true,
        store_name: "Restaurante RDOS",
        contact_phone: "",
        pickup_address: "Av. Principal, 123",
        delivery_fee: 0,
        delivery_radius: 5, // <== ATUALIZAÇÃO NECESSÁRIA PARA O TYPESCRIPT
        min_order_value: 0,
        estimated_time: "30-45 min",
        pickup_estimated_time: "15-20 min"
    };

    const initialConfig = config || defaultConfig;

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-foreground tracking-tighter italic uppercase flex items-center gap-3">
                        <Settings className="h-8 w-8 text-brand" />
                        Centro de Controle
                    </h1>
                    <p className="text-gray-500 font-medium tracking-tight uppercase text-xs">Gerencie taxas, endereços, contatos e o coração operacional do sistema.</p>
                </div>
            </div>

            <AdminSettingsForm initialConfig={initialConfig} />
        </div>
    );
}
