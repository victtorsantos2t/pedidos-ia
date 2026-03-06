"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getSession } from "./authActions";

export interface OrderRating {
    id: string;
    order_id: string;
    user_id: string;
    product_rating: number;
    delivery_rating: number;
    product_tags?: string[];
    delivery_tags?: string[];
    comment: string | null;
    store_response: string | null;
    responded_at: string | null;
    created_at: string;
}

export async function enviarAvaliacao(data: {
    orderId: string;
    productRating: number;
    deliveryRating: number;
    productTags?: string[];
    deliveryTags?: string[];
    comment?: string;
}) {
    const session = await getSession();
    if (!session?.user) {
        return { error: "Você precisa estar logado para avaliar." };
    }

    const supabase = await createClient();

    // Verifica se o pedido pertence ao usuário e está concluído
    const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("status, user_id")
        .eq("id", data.orderId)
        .single();

    if (orderError || !order) {
        return { error: "Pedido não encontrado." };
    }

    if (order.user_id !== session.user.id) {
        return { error: "Você só pode avaliar seus próprios pedidos." };
    }

    if (order.status !== "COMPLETED") {
        return { error: "Você só pode avaliar pedidos que já foram finalizados." };
    }

    const { error: ratingError } = await supabase
        .from("order_ratings")
        .insert({
            order_id: data.orderId,
            user_id: session.user.id,
            product_rating: data.productRating,
            delivery_rating: data.deliveryRating,
            product_tags: data.productTags || [],
            delivery_tags: data.deliveryTags || [],
            comment: data.comment || null,
        });

    if (ratingError) {
        if (ratingError.code === "23505") {
            return { error: "Este pedido já foi avaliado." };
        }
        return { error: "Erro ao enviar a avaliação. Tente novamente." };
    }

    revalidatePath(`/order/${data.orderId}`);
    revalidatePath("/");

    return { success: true };
}

export async function obterAvaliacaoPorPedido(orderId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("order_ratings")
        .select("*")
        .eq("order_id", orderId)
        .maybeSingle();

    if (error) return null;
    return data as OrderRating;
}

export async function obterEstatisticasAvaliacoes() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("order_ratings")
        .select("product_rating, delivery_rating");

    if (error || !data || data.length === 0) {
        return {
            averageProduct: 0,
            averageDelivery: 0,
            total: 0
        };
    }

    const total = data.length;
    const sumProduct = data.reduce((acc, curr) => acc + curr.product_rating, 0);
    const sumDelivery = data.reduce((acc, curr) => acc + curr.delivery_rating, 0);

    return {
        averageProduct: Number((sumProduct / total).toFixed(1)),
        averageDelivery: Number((sumDelivery / total).toFixed(1)),
        total
    };
}


export async function obterRecentesAvaliacoes(limit = 10) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("order_ratings")
        .select(`
            *,
            profiles:user_id (name, avatar_url),
            orders:order_id (id, customer_name)
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) return [];
    return data;
}

export async function obterAvaliacoesPaginadas(page: number, pageSize: number = 10) {
    const supabase = await createClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
        .from("order_ratings")
        .select(`
            *,
            profiles:user_id (name, avatar_url),
            orders:order_id (id, customer_name)
        `, { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) return { data: [], total: 0 };
    return { data: data || [], total: count || 0 };
}

export async function responderAvaliacao(ratingId: string, response: string) {
    const session = await getSession();
    if (!session?.profile?.is_admin) {
        return { error: "Apenas administradores podem responder avaliações." };
    }

    const supabase = await createClient();
    const { error } = await supabase
        .from("order_ratings")
        .update({
            store_response: response,
            responded_at: new Date().toISOString()
        })
        .eq("id", ratingId);

    if (error) {
        return { error: "Erro ao enviar resposta." };
    }

    revalidatePath("/admin");
    revalidatePath("/ratings");
    revalidatePath("/profile/ratings");
    return { success: true };
}

export async function obterDadosAvaliacaoUsuario() {
    const session = await getSession();
    if (!session?.user) return { avaliadas: [], pendentes: [] };

    const supabase = await createClient();

    // 1. Buscar pedidos finalizados do usuário
    const { data: orders } = await supabase
        .from("orders")
        .select("id, created_at, total_amount, status")
        .eq("user_id", session.user.id)
        .eq("status", "COMPLETED")
        .order("created_at", { ascending: false });

    if (!orders || orders.length === 0) return { avaliadas: [], pendentes: [] };

    // 2. Buscar TODAS as avaliações deste usuário diretamente na tabela order_ratings
    // Isso evita problemas de JOIN caso o RLS ou nome da relação esteja travando
    const { data: ratings } = await supabase
        .from("order_ratings")
        .select("*, profiles:user_id (name)")
        .eq("user_id", session.user.id);

    const ratingsMap = new Map();
    ratings?.forEach(r => ratingsMap.set(r.order_id, r));

    const avaliadas: any[] = [];
    const pendentes: any[] = [];

    orders.forEach(o => {
        const rating = ratingsMap.get(o.id);
        if (rating) {
            avaliadas.push({
                ...rating,
                order_id_short: o.id.substring(0, 6),
                // Garantir que temos os dados da resposta caso existam
                store_response: rating.store_response,
                responded_at: rating.responded_at
            });
        } else {
            pendentes.push({
                id: o.id,
                id_short: o.id.substring(0, 6),
                created_at: o.created_at,
                total_amount: o.total_amount
            });
        }
    });

    return { avaliadas, pendentes };
}
