"use server";

import { createClient } from "@/lib/supabase/server";
import { sendNotificationToUser } from "@/lib/actions/pushActions";

export async function getActiveOrders() {
    const supabase = await createClient();

    // Buscar pedidos com status ativo
    const { data: orders, error } = await supabase
        .from("active_orders")
        .select(`
      *,
      order_items (
        id,
        name,
        quantity,
        unit_price,
        notes,
        extras,
        product:products ( name )
      )
    `);

    if (error) {
        console.error("Erro ao buscar pedidos admin:", error);
        return [];
    }

    return orders || [];
}

export async function getManagementOrders() {
    const supabase = await createClient();

    const { data: orders, error } = await supabase
        .from("orders")
        .select(`
      *,
      order_items (
        id,
        name,
        quantity,
        unit_price,
        notes,
        extras,
        product:products ( name )
      )
    `)
        .order("created_at", { ascending: false }); // Mais novos primeiro

    if (error) {
        console.error("Erro ao buscar gestão de pedidos:", error);
        return [];
    }

    return orders || [];
}

export async function updateOrderStatus(orderId: string, newStatus: string, cancelReason?: string) {
    const supabase = await createClient();

    const updateData: any = { status: newStatus };
    if (cancelReason) {
        updateData.cancel_reason = cancelReason;
    }

    const { data: updatedOrder, error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId)
        .select("user_id")
        .single();

    if (error) {
        console.error(`Erro ao atualizar pedido ${orderId} para ${newStatus}:`, error);
        return { error: error.message };
    }

    if (updatedOrder && updatedOrder.user_id) {
        const { data: storeConfig } = await supabase
            .from("store_config")
            .select("store_name")
            .eq("id", 1)
            .single();

        const prefix = storeConfig?.store_name ? `${storeConfig.store_name}: ` : "";

        let title = "";
        let body = "";

        switch (newStatus) {
            case "PREPARING":
                title = `${prefix}👩‍🍳 Em Preparo!`;
                body = "Sua refeição já começou a ser preparada pela nossa cozinha.";
                break;
            case "READY":
                title = `${prefix}🛎️ Pronto!`;
                body = "Seu pedido está pronto para ser embalado e despachado.";
                break;
            case "DELIVERY":
                title = `${prefix}🛵 Saiu para Entrega!`;
                body = "O entregador já está a caminho com o seu pedido.";
                break;
            case "COMPLETED":
                title = `${prefix}✅ Entregue!`;
                body = "Aproveite sua refeição! Obrigado por pedir com a gente.";
                break;
        }

        if (title && body) {
            const url = `/order/${orderId}`;
            await sendNotificationToUser(updatedOrder.user_id, title, body, url);
        }
    }

    return { success: true };
}
