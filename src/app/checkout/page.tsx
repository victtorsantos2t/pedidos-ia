import { getSession } from "@/lib/actions/authActions";
import { getUserAddresses } from "@/lib/actions/profileActions";
import { CheckoutView } from "@/components/domain/CheckoutView";
import { obterConfiguracoesLoja } from "@/lib/actions/adminSettingsActions";

import { isStoreOpen as checkStoreOpen } from "@/lib/storeUtils";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
    const sessionData = await getSession();
    const addresses = sessionData?.user ? await getUserAddresses() : [];
    const storeSettings = await obterConfiguracoesLoja();
    const isStoreOpen = checkStoreOpen(storeSettings?.opening_hours);

    return (
        <main className="min-h-screen bg-background">
            <CheckoutView
                user={sessionData?.user || null}
                profile={sessionData?.profile || null}
                savedAddresses={addresses}
                storeSettings={storeSettings}
                isStoreOpen={isStoreOpen}
            />
        </main>
    );
}
