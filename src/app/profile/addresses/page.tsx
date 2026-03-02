import { getSession } from "@/lib/actions/authActions";
import { getUserAddresses } from "@/lib/actions/profileActions";
import { AddressManager } from "@/components/domain/AddressManager";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
    const session = await getSession();

    if (!session) {
        redirect("/checkout");
    }

    const addresses = await getUserAddresses();

    return <AddressManager initialAddresses={addresses} />;
}
