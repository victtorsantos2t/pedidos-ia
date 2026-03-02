"use server";

import { createClient } from "@/lib/supabase/server";

export async function getActiveOrders() {
    const supabase = await createClient();

    // Buscar pedidos com status ativo
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
        .neq("status", "COMPLETED")
        .neq("status", "CANCELLED")
        .order("created_at", { ascending: true }); // Mais antigos primeiro

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

    const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

    if (error) {
        console.error(`Erro ao atualizar pedido ${orderId} para ${newStatus}:`, error);
        return { error: error.message };
    }

    return { success: true };
}
