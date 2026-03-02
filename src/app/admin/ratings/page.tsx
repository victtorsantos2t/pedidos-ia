import { AdminRatingsManager } from "@/components/domain/AdminRatingsManager";

export const dynamic = "force-dynamic";

export default function AdminRatingsPage() {
    return (
        <div className="p-6 lg:p-10 max-w-5xl mx-auto min-h-full">
            <AdminRatingsManager />
        </div>
    );
}
