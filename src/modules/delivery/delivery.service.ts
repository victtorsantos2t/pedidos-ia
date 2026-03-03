import { getDeliveryZones } from "./delivery.repository";
import { calculateDistance, computeDeliveryFee, calculateEstimatedTime } from "./delivery.calculator";
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
        // 1. Obter configurações da loja (coordenadas de origem)
        // Nota: Como não temos coordenadas da loja no store_config ainda, 
        // assumiremos uma coordenada central padrão ou precisaremos adicionar ao banco.
        // Por enquanto, usaremos uma constante baseada no pickup_address ou um placeholder.
        // TODO: Adicionar store_lat e store_lng ao store_config.
        const config = await obterConfiguracoesLoja();

        // Coordenadas mock para o restaurante (Exemplo: Centro de São Paulo)
        // Em produção, isso deve vir do store_config
        const STORE_LAT = -23.5505;
        const STORE_LNG = -46.6333;

        // 2. Calcular distância via Haversine
        const distance = calculateDistance(STORE_LAT, STORE_LNG, userLat, userLng);

        // 3. Segurança: Limitar distância máxima (requisito UX)
        if (distance > 12) {
            return {
                zona: "Fora da Área",
                distancia: distance,
                taxaEntrega: 0,
                freteGratis: false,
                pedidoMinimo: 0,
                tempoEstimadoMin: 0,
                error: "Desculpe, seu endereço está fora da nossa área de entrega (máx 12km).",
            };
        }

        // 4. Encontrar zona correspondente
        const zones = await getDeliveryZones();
        const zone = zones.find(
            (z) => distance >= z.raio_min_km && distance <= z.raio_max_km
        );

        if (!zone) {
            return {
                zona: "Área não coberta",
                distancia: distance,
                taxaEntrega: 0,
                freteGratis: false,
                pedidoMinimo: 0,
                tempoEstimadoMin: 0,
                error: "Infelizmente ainda não entregamos nesta distância.",
            };
        }

        // 5. Aplicar cálculo de taxa
        const { fee, isFree } = computeDeliveryFee(distance, zone, orderValue);

        // 6. Tempo estimado
        const estimatedTime = calculateEstimatedTime(distance);

        return {
            zona: zone.nome,
            distancia: Number(distance.toFixed(2)),
            taxaEntrega: Number(fee.toFixed(2)),
            freteGratis: isFree,
            pedidoMinimo: zone.pedido_minimo,
            tempoEstimadoMin: estimatedTime,
        };
    } catch (error) {
        console.error("[DeliveryService] Error in calculation:", error);
        throw new Error("Erro ao calcular taxa de entrega.");
    }
}
