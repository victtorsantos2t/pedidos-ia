"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function login(formData: FormData) {
    const supabase = await createClient();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }
    revalidatePath("/", "layout");
    return { success: true };
}

export async function signup(formData: FormData) {
    const supabase = await createClient();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name,
                phone,
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    // UPDATE FORÇADO: Garante que o nome e telefone sejam salvos no perfil
    // independentemente da trigger do Supabase online estar configurada corretamente.
    if (data?.user) {
        const { error: profileError } = await supabase
            .from("profiles")
            .update({
                name,
                phone,
            })
            .eq("id", data.user.id);

        if (profileError) {
            console.error("Erro ao salvar dados do perfil no cadastro:", profileError);
        }
    }
    revalidatePath("/", "layout");
    return { success: true };
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/");
}

export async function getSession() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
        return null;
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

    return { user: data.user, profile };
}
