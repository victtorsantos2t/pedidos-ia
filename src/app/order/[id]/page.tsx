import { getSession } from "@/lib/actions/authActions";
import { getOrderById } from "@/lib/actions/userOrderActions";
import { obterAvaliacaoPorPedido, obterEstatisticasAvaliacoes } from "@/lib/actions/orderRatingActions";
import { obterConfiguracoesLoja } from "@/lib/actions/adminSettingsActions";
import { OrderTracker } from "@/components/domain/OrderTracker";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OrderTrackerPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    const resolvedParams = await params;

    if (!session?.user) {
        redirect("/checkout");
    }

    const order = await getOrderById(resolvedParams.id);

    if (!order) {
        redirect("/profile/orders");
    }

    const initialRating = await obterAvaliacaoPorPedido(resolvedParams.id);
    const storeConfig = await obterConfiguracoesLoja();
    const ratingStats = await obterEstatisticasAvaliacoes();

    return (
        <OrderTracker
            initialOrder={order}
            initialRating={initialRating}
            storeConfig={storeConfig}
            ratingStats={ratingStats}
        />
    );
}
