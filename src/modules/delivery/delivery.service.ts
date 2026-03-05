import { DeliveryCalculationResult } from "./delivery.types";
import { obterConfiguracoesLoja } from "@/lib/actions/adminSettingsActions";

export async function calculateDelivery({
    userLat,
    userLng,
    orderValue,
}: {
    userLat: number;
    userLng: number;
    orderValue: number;
}): Promise<DeliveryCalculationResult> {
    try {
        const config = await obterConfiguracoesLoja();

        const taxaFixa = config?.delivery_fee || 0;
        const pedidoMinimo = config?.min_order_value || 0;

        // Conversão de estimated_time (ex "40-50 min") para número inteiro aproximado 
        let tempoEstimado = 40;
        if (config?.estimated_time) {
            const match = config.estimated_time.match(/\d+/);
            if (match) tempoEstimado = parseInt(match[0], 10);
        }

        return {
            zona: "Taxa Fixa Padrão",
            distancia: 0, // Ignoramos a distância e zonas geográficas
            taxaEntrega: taxaFixa,
            freteGratis: taxaFixa === 0,
            pedidoMinimo: pedidoMinimo,
            tempoEstimadoMin: tempoEstimado,
        };
    } catch (error) {
        console.error("[DeliveryService] Error in calculation:", error);
        throw new Error("Erro ao calcular taxa de entrega.");
    }
}
