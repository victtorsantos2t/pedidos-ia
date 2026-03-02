import { obterRecentesAvaliacoes, obterEstatisticasAvaliacoes } from "@/lib/actions/orderRatingActions";
import { obterConfiguracoesLoja } from "@/lib/actions/adminSettingsActions";
import { RatingsView } from "@/components/domain/RatingsView";

export const dynamic = "force-dynamic";

export default async function RatingsPage() {
    const ratings = await obterRecentesAvaliacoes(100);
    const stats = await obterEstatisticasAvaliacoes();
    const config = await obterConfiguracoesLoja();

    // Fallback config if null
    const defaultConfig = {
        is_open: true,
        store_name: "Restaurante RDOS",
        pickup_address: "Consultar endereço de entrega",
        description: "Qualidade e sabor RDOS em cada pedido.",
        opening_hours: []
    };

    return (
        <RatingsView
            ratings={ratings}
            stats={stats}
            config={config || defaultConfig}
        />
    );
}
