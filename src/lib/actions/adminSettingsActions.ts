"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { OpeningHours, isStoreOpen } from "@/lib/storeUtils";

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

export type StoreConfig = {
    is_open: boolean;
    store_name: string;
    contact_phone: string;
    pickup_address: string;
    delivery_fee: number;
    delivery_radius: number;
    min_order_value: number;
    estimated_time: string;
    pickup_estimated_time: string;
    description?: string;
    logo_url?: string;
    payment_methods?: any;
    opening_hours?: OpeningHours[];
};

export async function obterStatusLoja() {
    const supabase = await createClient();
    const { data } = await supabase
        .from("store_config")
        .select("is_open, opening_hours")
        .eq("id", 1)
        .single();

    if (!data) return false;

    // Agora o sistema é automatizado pelos horários de funcionamento
    return isStoreOpen(data.opening_hours as OpeningHours[]);
}

export async function obterConfiguracoesLoja(): Promise<StoreConfig | null> {
    const supabase = await createClient();
    const { data } = await supabase
        .from("store_config")
        .select("*")
        .eq("id", 1)
        .single();

    return data as StoreConfig;
}

export async function atualizarStatusLoja(isOpen: boolean) {
    const isAdmin = await verificarAdmin();
    if (!isAdmin) return { error: "Sem permissão." };

    const supabase = await createClient();
    const { error } = await supabase
        .from("store_config")
        .update({ is_open: isOpen, updated_at: new Date().toISOString() })
        .eq("id", 1);

    if (error) return { error: error.message };

    revalidatePath("/", "layout");
    return { sucesso: true, novoValor: isOpen };
}

async function uploadStoreLogo(imageFile: File) {
    const supabase = await createClient();
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `logo_${Date.now()}.${fileExt}`;
    const filePath = `branding/${fileName}`;

    const { data, error } = await supabase.storage
        .from('restaurant-assets')
        .upload(filePath, imageFile, {
            upsert: true
        });

    if (error) throw new Error(`Upload error: ${error.message}`);

    const { data: { publicUrl } } = supabase.storage
        .from('restaurant-assets')
        .getPublicUrl(filePath);

    return publicUrl;
}

export async function atualizarConfiguracoesLoja(formData: FormData) {
    const isAdmin = await verificarAdmin();
    if (!isAdmin) return { error: "Sem permissão." };

    const supabase = await createClient();

    // Extrai dados do FormData
    const settings: any = {};
    formData.forEach((value, key) => {
        if (key !== 'logo_file') {
            try {
                // Tenta fazer parse de JSON para campos complexos como opening_hours
                settings[key] = JSON.parse(value as string);
            } catch {
                // Se não for JSON, trata como string ou número
                settings[key] = isNaN(Number(value)) || value === '' ? value : Number(value);
            }
        }
    });

    const logoFile = formData.get("logo_file") as File;
    if (logoFile && logoFile.size > 0) {
        try {
            settings.logo_url = await uploadStoreLogo(logoFile);
        } catch (e: any) {
            return { error: e.message };
        }
    }

    const { error } = await supabase
        .from("store_config")
        .update({
            ...settings,
            updated_at: new Date().toISOString()
        })
        .eq("id", 1);

    if (error) return { error: error.message };

    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    return { sucesso: true };
}
