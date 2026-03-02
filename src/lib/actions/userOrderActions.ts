"use server";

import { createClient } from "@/lib/supabase/server";

export async function getOrderById(orderId: string) {
  const supabase = await createClient();

  const { data: order, error } = await supabase
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
    .eq("id", orderId)
    .single();

  if (error || !order) {
    console.error("Erro ao puxar pedido (Detalhes):", JSON.stringify(error, null, 2), "ID Buscado:", orderId);
    return null;
  }

  return order;
}

export async function cancelOrder(orderId: string, reason?: string) {
  const supabase = await createClient();

  // Verifica status atual antes de cancelar
  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  if (!order) return { error: "Pedido não encontrado." };

  // Só permite cancelar se não estiver Pronto, Em Rota ou Concluído
  const allowedStatus = ["NEW", "PREPARING"];
  if (!allowedStatus.includes(order.status)) {
    return { error: "O pedido já está em fase de despacho e não pode mais ser cancelado pelo app." };
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status: "CANCELLED",
      cancel_reason: reason || "Cancelado pelo cliente"
    })
    .eq("id", orderId);

  if (error) return { error: "Erro ao cancelar pedido." };
  return { success: true };
}
