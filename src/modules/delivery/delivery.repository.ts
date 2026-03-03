import { createClient } from "@/lib/supabase/server";
import { DeliveryZone } from "./delivery.types";

let zonesCache: DeliveryZone[] | null = null;
let lastFetch = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutos

export async function getDeliveryZones(): Promise<DeliveryZone[]> {
    const now = Date.now();

    // Cache implementation
    if (zonesCache && now - lastFetch < CACHE_TTL) {
        return zonesCache;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("delivery_zones")
        .select("*")
        .eq("ativo", true)
        .order("raio_min_km", { ascending: true });

    if (error) {
        console.error("[DeliveryRepository] Error fetching zones:", error);
        return zonesCache || [];
    }

    zonesCache = data as DeliveryZone[];
    lastFetch = now;
    return zonesCache;
}

export async function clearDeliveryCache() {
    zonesCache = null;
    lastFetch = 0;
}
