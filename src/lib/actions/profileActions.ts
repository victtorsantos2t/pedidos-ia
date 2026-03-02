"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- DADOS PESSOAIS ---

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Não autenticado" };

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;

    const { error } = await supabase
        .from("profiles")
        .update({ name, phone, updated_at: new Date().toISOString() })
        .eq("id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/profile");
    return { success: true };
}

// --- ENDEREÇOS ---

export async function getUserAddresses() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

    if (error) return [];
    return data;
}

export async function createAddress(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Não autenticado" };

    const street = formData.get("street") as string;
    const number = formData.get("number") as string;
    const neighborhood = formData.get("neighborhood") as string;
    const city = formData.get("city") as string;
    const complement = formData.get("complement") as string;
    const is_default = formData.get("is_default") === "on";

    // Se for o primeiro endereço ou marcado como padrão, remove padrão dos outros
    if (is_default) {
        await supabase
            .from("user_addresses")
            .update({ is_default: false })
            .eq("user_id", user.id);
    }

    const { error } = await supabase
        .from("user_addresses")
        .insert({
            user_id: user.id,
            street,
            number,
            neighborhood,
            city,
            complement,
            is_default
        });

    if (error) return { error: error.message };

    revalidatePath("/profile");
    return { success: true };
}

export async function updateAddress(addressId: string, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Não autenticado" };

    const street = formData.get("street") as string;
    const number = formData.get("number") as string;
    const neighborhood = formData.get("neighborhood") as string;
    const city = formData.get("city") as string;
    const complement = formData.get("complement") as string;
    const is_default = formData.get("is_default") === "on";

    if (is_default) {
        await supabase
            .from("user_addresses")
            .update({ is_default: false })
            .eq("user_id", user.id);
    }

    const { error } = await supabase
        .from("user_addresses")
        .update({
            street,
            number,
            neighborhood,
            city,
            complement,
            is_default
        })
        .eq("id", addressId)
        .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/profile");
    return { success: true };
}

export async function deleteAddress(addressId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Não autenticado" };

    const { error } = await supabase
        .from("user_addresses")
        .delete()
        .eq("id", addressId)
        .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/profile");
    return { success: true };
}

export async function setDefaultAddress(addressId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Não autenticado" };

    // Remove padrão de todos
    await supabase
        .from("user_addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);

    // Define novo padrão
    const { error } = await supabase
        .from("user_addresses")
        .update({ is_default: true })
        .eq("id", addressId)
        .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/profile");
    return { success: true };
}
