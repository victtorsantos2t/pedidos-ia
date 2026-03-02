"use server";

import { createClient } from "@/lib/supabase/server";
import { obterEstatisticasAvaliacoes } from "./orderRatingActions";

export async function getDashboardMetrics() {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData?.user) return null;

    // Verifica se é admin
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", authData.user.id)
        .single();

    if (!profile?.is_admin) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: orders, error } = await supabase
        .from("orders")
        .select("total_amount, status")
        .gte("created_at", today.toISOString());

    if (error) return null;

    const totalOrders = orders.length;
    const completedOrders = orders.filter((o: any) => o.status === "COMPLETED").length;
    const newOrders = orders.filter((o: any) => o.status === "NEW").length;

    const revenue = orders
        .filter((o: any) => o.status !== "CANCELLED")
        .reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);

    const avgOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;
    const ratingStats = await obterEstatisticasAvaliacoes();

    return {
        totalOrders,
        completedOrders,
        newOrders,
        revenue,
        avgOrderValue,
        ratingStats
    };
}
