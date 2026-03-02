import { getCatalog } from "@/lib/services/catalogService";
import { CatalogView } from "@/components/domain/CatalogView";
import { obterEstatisticasAvaliacoes } from "@/lib/actions/orderRatingActions";

export const revalidate = 60; // ISR cache por 60 segundos

export default async function Home() {
  const { categories, products, isStoreOpen, storeSettings } = await getCatalog();
  const ratingStats = await obterEstatisticasAvaliacoes();

  return (
    <main>
      <CatalogView
        categories={categories}
        products={products}
        isStoreOpen={isStoreOpen}
        storeSettings={storeSettings}
        ratingStats={ratingStats}
      />
    </main>
  );
}
