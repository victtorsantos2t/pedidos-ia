"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
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

// ===================== CATEGORIAS =====================

export async function createCategory(formData: FormData) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: "Sem permissão." };

    const supabase = await createClient();
    const name = formData.get("name") as string;
    const station = formData.get("station") as string || "MAIN";

    // Busca o maior sort_order atual para adicionar ao final
    const { data: maxOrderData } = await supabase
        .from("categories")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1);

    const maxOrder = maxOrderData && maxOrderData.length > 0 ? maxOrderData[0].sort_order : -1;
    const nextOrder = maxOrder + 1;

    const { error } = await supabase
        .from("categories")
        .insert({ name, station, sort_order: nextOrder, is_active: true });

    if (error) return { error: error.message };

    revalidatePath("/admin/menu");
    revalidatePath("/");
    return { success: true };
}

export async function updateCategory(categoryId: string, newName: string, station: string = "MAIN") {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: "Sem permissão." };

    const supabase = await createClient();
    const { error } = await supabase
        .from("categories")
        .update({ name: newName, station })
        .eq("id", categoryId);

    if (error) return { error: error.message };

    revalidatePath("/admin/menu");
    revalidatePath("/");
    return { success: true };
}

export async function deleteCategory(categoryId: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: "Sem permissão." };

    const supabase = await createClient();

    // Verifica se há produtos vinculados (não excluídos)
    const { data: linkedProducts } = await supabase
        .from("products")
        .select("id")
        .eq("category_id", categoryId)
        .is("deleted_at", null);

    if (linkedProducts && linkedProducts.length > 0) {
        return { error: `Não é possível excluir. Existem ${linkedProducts.length} produto(s) vinculado(s) a esta categoria.` };
    }

    const { error } = await supabase
        .from("categories")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", categoryId);

    if (error) return { error: error.message };

    revalidatePath("/admin/menu");
    revalidatePath("/");
    return { success: true };
}

export async function updateCategoryOrder(categoryId: string, direction: 'up' | 'down') {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: "Sem permissão." };

    const supabase = await createClient();

    // 1. Busca a categoria atual
    const { data: currentCat } = await supabase
        .from("categories")
        .select("id, sort_order")
        .eq("id", categoryId)
        .single();

    if (!currentCat) return { error: "Categoria não encontrada." };

    // 2. Busca a categoria vizinha
    const query = supabase
        .from("categories")
        .select("id, sort_order");

    if (direction === 'up') {
        query.lt("sort_order", currentCat.sort_order).order("sort_order", { ascending: false });
    } else {
        query.gt("sort_order", currentCat.sort_order).order("sort_order", { ascending: true });
    }

    const { data: neighbors } = await query.limit(1);
    const neighborCat = neighbors && neighbors.length > 0 ? neighbors[0] : null;

    if (!neighborCat) return { success: true }; // Já está no limite

    // 3. Troca os valores (usando um valor temporário negativo para evitar conflito se houvesse unique, mas aqui trocamos direto)
    const { error: err1 } = await supabase
        .from("categories")
        .update({ sort_order: neighborCat.sort_order })
        .eq("id", currentCat.id);

    const { error: err2 } = await supabase
        .from("categories")
        .update({ sort_order: currentCat.sort_order })
        .eq("id", neighborCat.id);

    if (err1 || err2) return { error: "Erro ao trocar ordem." };

    revalidatePath("/admin/menu");
    revalidatePath("/");
    return { success: true };
}

// ===================== PRODUTOS =====================

async function uploadProductImage(imageFile: File) {
    const supabase = await createClient();
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile);

    if (error) throw new Error(`Upload error: ${error.message}`);

    const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

    return publicUrl;
}

export async function createProduct(formData: FormData) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: "Sem permissão." };

    const supabase = await createClient();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const priceText = formData.get("price") as string;
    const price = parseFloat(priceText.replace(",", "."));
    const category_id = formData.get("category_id") as string;

    // Suporte para upload de imagem ou URL
    let image_url = formData.get("image_url") as string;
    const imageFile = formData.get("image_file") as File;

    if (imageFile && imageFile.size > 0) {
        try {
            image_url = await uploadProductImage(imageFile);
        } catch (e: any) {
            return { error: e.message };
        }
    }

    const { error } = await supabase
        .from("products")
        .insert({
            name,
            description: description || null,
            price,
            category_id,
            image_url: image_url || null,
            is_available: true
        });

    if (error) return { error: error.message };

    revalidatePath("/admin/menu");
    revalidatePath("/");
    return { success: true };
}

export async function updateProduct(productId: string, formData: FormData) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: "Sem permissão." };

    const supabase = await createClient();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const priceText = formData.get("price") as string;
    const price = parseFloat(priceText.replace(",", "."));
    const category_id = formData.get("category_id") as string;

    // Suporte para novo upload ou manter URL antiga
    let image_url = formData.get("image_url") as string;
    const imageFile = formData.get("image_file") as File;

    if (imageFile && imageFile.size > 0) {
        try {
            image_url = await uploadProductImage(imageFile);
        } catch (e: any) {
            return { error: e.message };
        }
    }

    const { error } = await supabase
        .from("products")
        .update({
            name,
            description: description || null,
            price,
            category_id,
            image_url: image_url || null,
        })
        .eq("id", productId);

    if (error) return { error: error.message };

    revalidatePath("/admin/menu");
    revalidatePath("/");
    return { success: true };
}

// ===================== TASK 21: TOGGLE DISPONIBILIDADE =====================

export async function toggleProductAvailability(productId: string, currentValue: boolean) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: "Sem permissão." };

    const supabase = await createClient();
    const { error } = await supabase
        .from("products")
        .update({ is_available: !currentValue })
        .eq("id", productId);

    if (error) return { error: error.message };

    revalidatePath("/admin/menu");
    revalidatePath("/");
    return { success: true, newValue: !currentValue };
}

// ===================== TASK 22: CRUD ADICIONAIS (EXTRAS) =====================

export async function createExtra(formData: FormData) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: "Sem permissão." };

    const supabase = await createClient();
    const product_id = formData.get("product_id") as string;
    const name = formData.get("extra_name") as string;
    const priceText = formData.get("extra_price") as string;
    const price = parseFloat(priceText.replace(",", "."));

    const { error } = await supabase
        .from("product_extras")
        .insert({ product_id, name, price, is_active: true });

    if (error) return { error: error.message };

    revalidatePath("/admin/menu");
    revalidatePath("/");
    return { success: true };
}

export async function deleteExtra(extraId: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: "Sem permissão." };

    const supabase = await createClient();
    const { error } = await supabase
        .from("product_extras")
        .delete()
        .eq("id", extraId);

    if (error) return { error: error.message };

    revalidatePath("/admin/menu");
    revalidatePath("/");
    return { success: true };
}
