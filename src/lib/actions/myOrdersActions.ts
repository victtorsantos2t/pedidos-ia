"use server";

import { createClient } from "@/lib/supabase/server";

export async function getMyOrders() {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData?.user) return [];

    const { data: orders, error } = await supabase
        .from("orders")
        .select(`
            *,
            order_items (
                id,
                quantity,
                unit_price,
                notes,
                extras,
                product:products ( name, image_url )
            )
        `)
        .eq("user_id", authData.user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Erro ao buscar pedidos do usuário:", error);
        return [];
    }

    return orders || [];
}
