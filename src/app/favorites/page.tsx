import { getCatalog } from "@/lib/services/catalogService";
import { FavoritesView } from "@/components/domain/FavoritesView";

export default async function FavoritesPage() {
    const { products, isStoreOpen } = await getCatalog();

    return (
        <main>
            <FavoritesView
                allProducts={products}
                isStoreOpen={isStoreOpen}
            />
        </main>
    );
}
