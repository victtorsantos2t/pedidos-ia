import { DeliveryZone } from "./delivery.types";

/**
 * Calcula a distância entre dois pontos (Haversine)
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Futura implementação para ajuste de demanda (pico, chuva, etc)
 */
export function getDemandMultiplier(): number {
    return 0; // Por enquanto retornar 0
}

/**
 * Calcula a taxa final baseada na zona e distância
 */
export function computeDeliveryFee(
    distance: number,
    zone: DeliveryZone,
    orderValue: number
): { fee: number; isFree: boolean } {
    // Regra de Frete Grátis
    if (orderValue >= zone.frete_gratis_acima && zone.frete_gratis_acima > 0) {
        return { fee: 0, isFree: true };
    }

    // Cálculo: Base + (KM Extra * Distância) + Demanda
    const baseFee = Number(zone.taxa_base);
    const kmExtraRate = Number(zone.valor_km_extra);
    const demandAdjustment = getDemandMultiplier();

    // Se a distância for maior que o raio mínimo, aplicamos o valor extra no proporcional
    const effectiveDistance = Math.max(0, distance - zone.raio_min_km);
    const fee = baseFee + (effectiveDistance * kmExtraRate) + demandAdjustment;

    return { fee, isFree: false };
}

/**
 * Tempo estimado: 20 + (distancia * 3)
 */
export function calculateEstimatedTime(distance: number): number {
    return Math.round(20 + distance * 3);
}
