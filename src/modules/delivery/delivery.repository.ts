import { createClient } from "@/lib/supabase/server";
import { DeliveryZone } from "./delivery.types";
import { unstable_noStore as noStore } from "next/cache";

export async function getDeliveryZones(): Promise<DeliveryZone[]> {
    noStore(); // Garante atualização imediata
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("delivery_zones")
        .select("*")
        .eq("ativo", true)
        .order("raio_min_km", { ascending: true });

    if (error) {
        console.error("[DeliveryRepository] Error fetching zones:", error);
        return [];
    }

    return data as DeliveryZone[];
}

export async function clearDeliveryCache() {
    // Agora é no-op, não precisamos mais do TTL em Serverless com noStore.
}
