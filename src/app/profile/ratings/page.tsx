import { getSession } from "@/lib/actions/authActions";
import { obterDadosAvaliacaoUsuario } from "@/lib/actions/orderRatingActions";
import { UserRatingsView } from "@/components/domain/UserRatingsView";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function UserRatingsPage() {
    const session = await getSession();

    if (!session) {
        redirect("/checkout");
    }

    const { avaliadas, pendentes } = await obterDadosAvaliacaoUsuario();

    return <UserRatingsView avaliadas={avaliadas} pendentes={pendentes} userProfile={session.profile} />;
}
