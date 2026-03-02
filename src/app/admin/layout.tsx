import { getSession } from "@/lib/actions/authActions";
import { AdminSidebar } from "@/components/domain/AdminSidebar";
import { redirect } from "next/navigation";
import { getActiveOrders } from "@/lib/actions/adminActions";
import { obterConfiguracoesLoja } from "@/lib/actions/adminSettingsActions";
import { AdminRealtimeProvider } from "@/components/domain/AdminRealtimeProvider";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const sessionData = await getSession();

    // Proteção centralizada para todas as rotas de admin
    if (!sessionData?.profile?.is_admin) {
        return (
            <div className="flex h-screen items-center justify-center p-6 text-center flex-col bg-background">
                <div className="h-16 w-16 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-6 shadow-xl shadow-red-500/10">
                    <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-black bg-red-100 text-red-600 p-4 rounded-xl tracking-tighter uppercase italic">NEGADO: VOCÊ NÃO É ADMIN</h1>
                <p className="mt-4 text-gray-500 max-w-md font-medium">Esta área é restrita ao proprietário. Verifique seu nível de acesso no painel do Supabase antes de continuar.</p>
            </div>
        );
    }

    const orders = await getActiveOrders();
    const settings = await obterConfiguracoesLoja();

    return (
        <AdminRealtimeProvider initialOrders={orders as any} storeSettings={settings}>
            <div className="flex min-h-screen bg-gray-50/50 dark:bg-background overflow-hidden">
                <AdminSidebar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto h-screen relative no-scrollbar">
                    {children}
                </main>
            </div>
        </AdminRealtimeProvider>
    );
}
