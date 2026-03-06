import { AdminRatingsManager } from "@/components/domain/AdminRatingsManager";

export const dynamic = "force-dynamic";

export default function AdminRatingsPage() {
    return (
        <div className="p-5 lg:p-6 max-w-[1200px] mx-auto min-h-full">
            <AdminRatingsManager />
        </div>
    );
}
