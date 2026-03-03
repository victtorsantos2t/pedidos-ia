"use client";

import { DeliveryCalculationResult } from "./delivery.types";

export async function calculateDeliveryRemote({
    lat,
    lng,
    orderValue,
}: {
    lat: number;
    lng: number;
    orderValue: number;
}): Promise<DeliveryCalculationResult> {
    try {
        const response = await fetch("/api/delivery/calculate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ lat, lng, orderValue }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Erro ao calcular entrega");
        }

        return await response.json();
    } catch (error: any) {
        console.error("[DeliveryClient] Error:", error);
        return {
            zona: "Erro",
            distancia: 0,
            taxaEntrega: 0,
            freteGratis: false,
            pedidoMinimo: 0,
            tempoEstimadoMin: 0,
            error: error.message,
        };
    }
}
