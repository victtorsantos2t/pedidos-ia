import { getCatalog } from "@/lib/services/catalogService";
import { CartView } from "@/components/domain/CartView";

export const dynamic = "force-dynamic";

export default async function CartPage() {
    const { categories, products, isStoreOpen, storeSettings } = await getCatalog();

    return (
        <main className="min-h-screen bg-background">
            <CartView
                allCategories={categories}
                allProducts={products}
                isStoreOpen={isStoreOpen}
                storeSettings={storeSettings}
            />
        </main>
    );
}
