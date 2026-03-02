import { getSession } from "@/lib/actions/authActions";
import { getMyOrders } from "@/lib/actions/myOrdersActions";
import { MyOrdersList } from "@/components/domain/MyOrdersList";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfileOrdersPage() {
    const session = await getSession();

    if (!session?.user) {
        redirect("/checkout");
    }

    const orders = await getMyOrders();

    return <MyOrdersList orders={orders} />;
}
