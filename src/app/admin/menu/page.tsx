import { getAdminCatalog } from "@/lib/services/catalogService";
import { MenuManager, Category, Product } from "@/components/domain/AdminMenuManager";
import { ListIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
    // Se é admin, vamos puxar o cardápio
    const { categories, products } = await getAdminCatalog();

    return (
        <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-foreground tracking-tighter italic uppercase flex items-center gap-3">
                        <ListIcon className="h-8 w-8 text-brand" />
                        Gestão do Cardápio
                    </h1>
                    <p className="text-gray-500 font-medium tracking-tight uppercase text-xs">Ative, desative e organize seus pratos e categorias.</p>
                </div>
            </div>

            <MenuManager categories={categories as unknown as Category[]} products={products as unknown as Product[]} />
        </div>
    );
}
