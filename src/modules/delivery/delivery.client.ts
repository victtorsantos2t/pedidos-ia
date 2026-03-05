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
        const response = await fetch("/api/delivery", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ lat, lng, orderValue }),
        });

        // Lê como texto primeiro para evitar erro de JSON inválido/vazio
        const text = await response.text();
        if (!text || text.trim() === "") {
            throw new Error("Servidor retornou resposta vazia. Verifique as configurações do motor de entrega.");
        }

        let data: DeliveryCalculationResult;
        try {
            data = JSON.parse(text);
        } catch {
            throw new Error("Resposta inválida do servidor. Tente novamente.");
        }

        if (!response.ok) {
            throw new Error((data as any).error || `Erro ${response.status} ao calcular entrega`);
        }

        return data;
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
