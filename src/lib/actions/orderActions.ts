"use server";

import { createClient } from "@/lib/supabase/server";
import { CartItem } from "@/store/cartStore";

interface CheckoutData {
    items: CartItem[];
    totalAmount: number;
    deliveryAddress: string;
    customerName: string;
    customerPhone: string;
    paymentMethod: "DINHEIRO" | "CREDITO" | "DEBITO" | "PIX";
    deliveryMethod: "ON_DELIVERY" | "ON_PICKUP";
    changeFor?: number | null;
}

export async function createOrder(data: CheckoutData) {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
        return { error: "Usuário não autenticado." };
    }

    // Bloqueio de Segurança: Verificar se a loja está aberta antes de processar
    const { obterStatusLoja } = await import("./adminSettingsActions");
    const isStoreOpen = await obterStatusLoja();
    if (!isStoreOpen) {
        return { error: "O estabelecimento está fechado no momento. Não é possível realizar novos pedidos." };
    }

    try {
        // 1. Criar o Pedido
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                user_id: authData.user.id,
                customer_name: data.customerName,
                customer_phone: data.customerPhone,
                delivery_address: data.deliveryAddress,
                total_amount: data.totalAmount,
                payment_method: data.paymentMethod,
                change_for: data.changeFor,
                status: "NEW", // Fica como NOVO para a cozinha ver
            })
            .select("id")
            .single();

        if (orderError || !order) {
            console.error("Erro ao criar pedido:", orderError);
            return { error: "Erro ao processar o pedido. Tente novamente." };
        }

        // 2. Criar os Itens do Pedido
        const orderItems = data.items.map((item) => {
            const extrasTotal = item.extras?.reduce((acc, current) => acc + current.price, 0) || 0;
            return {
                order_id: order.id,
                product_id: item.product.id,
                name: item.product.name, // Salva o nome para não perder nunca
                quantity: item.quantity,
                unit_price: item.product.price + extrasTotal,
                notes: item.notes || "",
                extras: item.extras || [],
            };
        });

        const { error: itemsError } = await supabase
            .from("order_items")
            .insert(orderItems);

        if (itemsError) {
            console.error("Erro ao criar itens do pedido:", itemsError);
            return { error: "Erro ao registrar itens do pedido." };
        }

        return { success: true, orderId: order.id };
    } catch (err) {
        console.error("Falha inesperada no checkout", err);
        return { error: "Falha catastrófica." };
    }
}
