import { AdminMetrics } from "@/components/domain/AdminMetrics";
import { AdminRecentRatings } from "@/components/domain/AdminRecentRatings";
import { KitchenActionCard } from "@/components/domain/KitchenActionCard";
import { AdminInsights } from "@/components/domain/AdminInsights";
import {
    Bell, Search, ListIcon, ShoppingBag,
    Settings, ArrowRight, Star
} from "lucide-react";
import { obterConfiguracoesLoja } from "@/lib/actions/adminSettingsActions";
import { isStoreOpen as checkStoreOpen } from "@/lib/storeUtils";
import { getActiveOrders } from "@/lib/actions/adminActions";
import { getDashboardMetrics } from "@/lib/actions/adminMetricsActions";
import { StatusToggle } from "@/components/domain/StatusToggle";
import { UserButton } from "@/components/core/UserButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    // Fetch paralelo para performance máxima
    const [storeSettings, initialOrders, metrics] = await Promise.all([
        obterConfiguracoesLoja(),
        getActiveOrders(),
        getDashboardMetrics(),
    ]);

    const isStoreOpen = checkStoreOpen(storeSettings?.opening_hours);

    const now = new Date();
    const hourNum = parseInt(
        new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Cuiaba", hour: "numeric" }).format(now)
    );
    const greeting = hourNum < 12 ? "Bom dia" : hourNum < 18 ? "Boa tarde" : "Boa noite";
    const dateStr = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Cuiaba",
        weekday: "long",
        day: "2-digit",
        month: "long",
    }).format(now);

    return (
        <div className="flex flex-col min-h-full bg-[#f8f9fb] dark:bg-[#080808]">

            {/* ── Top Bar ─────────────────────────────────────────── */}
            <header className="sticky top-0 z-30 bg-white dark:bg-black/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-900 px-6 py-3.5 shadow-sm shadow-gray-100/50">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-6">

                    {/* Saudação */}
                    <div className="min-w-fit">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none capitalize">{dateStr}</p>
                        <h1 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight mt-0.5">
                            {greeting}, <span className="text-[#FA0000]">João</span>
                        </h1>
                    </div>

                    {/* Search placeholder */}
                    <div className="hidden md:flex flex-1 max-w-xs items-center gap-2.5 px-4 h-9 rounded-xl bg-gray-100 dark:bg-gray-900 border border-transparent text-xs text-gray-400 cursor-not-allowed select-none">
                        <Search className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">Em breve: busca global</span>
                    </div>

                    {/* Controles direita */}
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest leading-none">Loja</span>
                            <StatusToggle isStoreOpen={isStoreOpen} />
                        </div>
                        <div className="h-8 w-px bg-gray-100 dark:bg-gray-800" />
                        <div className="flex items-center gap-2">
                            <button className="relative h-9 w-9 rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-all">
                                <Bell className="h-4 w-4" />
                                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#FA0000] border border-white dark:border-black" />
                            </button>
                            <div className="h-9 w-9 rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden hover:ring-2 ring-gray-300 dark:ring-gray-700 transition-all">
                                <UserButton />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Main Content ─────────────────────────────────────── */}
            <main className="flex-1 p-5 lg:p-6 max-w-[1600px] w-full mx-auto space-y-6">

                {/* ── SEÇÃO 1: Operações em Tempo Real ─────────────── */}
                <section>
                    <SectionHeader label="Operação em Tempo Real" dot />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Kitchen card — col-span-2 */}
                        <div className="lg:col-span-2">
                            <KitchenActionCard initialOrders={initialOrders} />
                        </div>

                        {/* Cards secundários — col-span-1 */}
                        <div className="grid grid-cols-1 gap-4">
                            <SmallActionCard
                                href="/admin/menu"
                                label="Produtos & Categorias"
                                title="Cardápio"
                                description="Pratos, preços e disponibilidade"
                                icon={<ListIcon className="h-4.5 w-4.5" />}
                            />
                            <SmallActionCard
                                href="/admin/management"
                                label="Analytics"
                                title="Histórico"
                                description="Pedidos, cancelamentos e faturamento"
                                icon={<ShoppingBag className="h-4.5 w-4.5" />}
                            />
                        </div>
                    </div>
                </section>

                {/* ── SEÇÃO 2: Métricas do Dia ──────────────────────── */}
                <section>
                    <SectionHeader label="Métricas do Dia" />
                    <AdminMetrics />
                </section>

                {/* ── SEÇÃO 3: Voz do Cliente ───────────────────────── */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <SectionHeader label="Voz do Cliente" inline />
                        <a
                            href="/admin/ratings"
                            className="text-[11px] font-semibold text-gray-400 hover:text-[#FA0000] transition-colors flex items-center gap-1"
                        >
                            Ver todos
                            <ArrowRight className="h-3 w-3" />
                        </a>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                        {/* Ratings list */}
                        <div className="xl:col-span-2">
                            <AdminRecentRatings />
                        </div>
                        {/* Insights operacionais */}
                        <div>
                            <AdminInsights metrics={metrics} />
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}

// ── Componentes internos de layout ──────────────────────────────────

function SectionHeader({
    label,
    dot = false,
    inline = false,
}: {
    label: string;
    dot?: boolean;
    inline?: boolean;
}) {
    return (
        <div className={`flex items-center gap-3 ${inline ? "" : "mb-4"}`}>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest whitespace-nowrap">
                {label}
            </span>
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-800" />
            {dot && (
                <div className="flex items-center gap-1.5 shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        Ao Vivo
                    </span>
                </div>
            )}
        </div>
    );
}

function SmallActionCard({
    href,
    label,
    title,
    description,
    icon,
}: {
    href: string;
    label: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}) {
    return (
        <a
            href={href}
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-5 flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-md dark:hover:shadow-black/20 transition-all duration-200 hover:-translate-y-0.5"
        >
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white group-hover:bg-gray-200 dark:group-hover:bg-gray-800 transition-all shrink-0">
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-0.5">{label}</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{title}</p>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">{description}</p>
                </div>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-300 dark:text-gray-700 group-hover:text-gray-500 dark:group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all shrink-0" />
        </a>
    );
}
