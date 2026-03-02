import { getSession } from "@/lib/actions/authActions";
import { PersonalDataForm } from "@/components/domain/PersonalDataForm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PersonalDataPage() {
    const session = await getSession();

    if (!session) {
        redirect("/checkout");
    }

    const initialData = {
        name: session.profile?.name || "",
        phone: session.profile?.phone || ""
    };

    return <PersonalDataForm initialData={initialData} />;
}
