"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { DeliveryZone } from "@/modules/delivery/delivery.types";

async function verificarAdmin() {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return false;

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", authData.user.id)
        .single();

    return profile?.is_admin === true;
}

export async function listarZonasEntrega(): Promise<DeliveryZone[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("delivery_zones")
        .select("*")
        .order("raio_min_km", { ascending: true });

    if (error) {
        console.error("Erro ao listar zonas:", error);
        return [];
    }

    return data as DeliveryZone[];
}

export async function salvarZonaEntrega(zona: Partial<DeliveryZone>) {
    const isAdmin = await verificarAdmin();
    if (!isAdmin) return { error: "Sem permissão." };

    const supabase = await createClient();

    if (zona.id) {
        const { error } = await supabase
            .from("delivery_zones")
            .update(zona)
            .eq("id", zona.id);

        if (error) return { error: error.message };
    } else {
        const { error } = await supabase
            .from("delivery_zones")
            .insert(zona);

        if (error) return { error: error.message };
    }

    revalidatePath("/admin/settings");
    return { sucesso: true };
}

export async function excluirZonaEntrega(id: string) {
    const isAdmin = await verificarAdmin();
    if (!isAdmin) return { error: "Sem permissão." };

    const supabase = await createClient();
    const { error } = await supabase
        .from("delivery_zones")
        .delete()
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/settings");
    return { sucesso: true };
}
