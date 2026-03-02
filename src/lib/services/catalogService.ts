import { createClient } from "@/lib/supabase/server"
import { obterStatusLoja, obterConfiguracoesLoja, StoreConfig } from "../actions/adminSettingsActions";

export interface Category {
    id: string;
    name: string;
    sort_order: number;
    is_active: boolean;
}

export interface ProductExtra {
    id: string;
    name: string;
    price: number;
}

export interface Product {
    id: string;
    category_id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    is_available: boolean;
    product_extras?: ProductExtra[];
}

import { isStoreOpen as checkStoreOpen } from "../storeUtils";

export async function getCatalog() {
    const supabase = await createClient()

    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

    const { data: products } = await supabase
        .from('products')
        .select(`
            *,
            product_extras (
                id,
                name,
                price
            )
        `)
        .eq('is_available', true)
        .order('created_at', { ascending: false })

    const storeSettings = await obterConfiguracoesLoja();

    return {
        categories: (categories as Category[]) || [],
        products: (products as Product[]) || [],
        isStoreOpen: checkStoreOpen(storeSettings?.opening_hours),
        storeSettings
    }
}

// Versão admin que retorna TODOS os produtos (inclusive desativados)
export async function getAdminCatalog() {
    const supabase = await createClient()

    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })

    const { data: products } = await supabase
        .from('products')
        .select(`
            *,
            product_extras (
                id,
                name,
                price
            )
        `)
        .order('created_at', { ascending: false })

    return {
        categories: (categories as Category[]) || [],
        products: (products as Product[]) || []
    }
}
