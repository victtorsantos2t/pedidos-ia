import { getSession } from "@/lib/actions/authActions";
import { ProfileView } from "@/components/domain/ProfileView";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
    const session = await getSession();

    if (!session) {
        redirect("/checkout"); // Ou para login se preferir
    }

    const userData = {
        name: session.profile?.name || session.user?.email || "Usuário",
        email: session.user?.email
    };

    return <ProfileView user={userData} />;
}
