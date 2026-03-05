import { NextResponse } from "next/server";
import { calculateDelivery } from "@/modules/delivery/delivery.service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const { lat, lng, orderValue } = await req.json();

        if (lat === undefined || lng === undefined || orderValue === undefined) {
            return NextResponse.json(
                { error: "Parâmetros lat, lng e orderValue são obrigatórios." },
                { status: 400 }
            );
        }

        const result = await calculateDelivery({
            userLat: Number(lat),
            userLng: Number(lng),
            orderValue: Number(orderValue),
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("[API Delivery] Calculation error:", error);
        return NextResponse.json(
            { error: error.message || "Erro interno ao calcular entrega." },
            { status: 500 }
        );
    }
}
