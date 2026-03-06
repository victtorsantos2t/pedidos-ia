import { AdminMetrics } from "@/components/domain/AdminMetrics";
import { AdminRecentRatings } from "@/components/domain/AdminRecentRatings";
import {
    TrendingUp, Bell, ChefHat, ListIcon, Search,
    ArrowRight, ShoppingBag, Settings, Zap,
    Clock, BarChart3, Star
} from "lucide-react";
import { obterConfiguracoesLoja } from "@/lib/actions/adminSettingsActions";
import { isStoreOpen as checkStoreOpen } from "@/lib/storeUtils";
import { StatusToggle } from "@/components/domain/StatusToggle";
import { UserButton } from "@/components/core/UserButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    const storeSettings = await obterConfiguracoesLoja();
    const isStoreOpen = checkStoreOpen(storeSettings?.opening_hours);

    const now = new Date();
    const hour = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Cuiaba", hour: "numeric"
    }).format(now);
    const hourNum = parseInt(hour);
    const greeting = hourNum < 12 ? "Bom dia" : hourNum < 18 ? "Boa tarde" : "Boa noite";

    const dayName = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Cuiaba", weekday: "long"
    }).format(now);

    const dateStr = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Cuiaba", day: "2-digit", month: "long"
    }).format(now);

    return (
        <div className="flex flex-col min-h-full bg-gray-50/40 dark:bg-[#0a0a0a]">

            {/* ── Top Bar ─────────────────────────────────────────────── */}
            <div className="sticky top-0 z-30 bg-white/90 dark:bg-black/90 backdrop-blur-2xl border-b border-gray-100 dark:border-gray-900 px-6 py-3.5">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none">{dayName} · {dateStr}</p>
                            <h1 className="text-base font-black text-gray-900 dark:text-white tracking-tight leading-tight mt-0.5">
                                {greeting}, <span className="text-[#FA0000]">João</span>
                            </h1>
                        </div>
                    </div>

                    <div className="hidden md:flex flex-1 max-w-xs items-center gap-2.5 px-4 h-10 rounded-xl bg-gray-100 dark:bg-gray-900 text-xs text-gray-400 cursor-not-allowed">
                        <Search className="h-3.5 w-3.5 shrink-0" />
                        <span>Em breve: busca global</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest leading-none">Loja</span>
                            <StatusToggle isStoreOpen={isStoreOpen} />
                        </div>
                        <div className="h-8 w-px bg-gray-100 dark:bg-gray-800" />
                        <div className="flex items-center gap-2">
                            <button className="relative h-9 w-9 rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-400 hover:text-[#FA0000] transition-colors">
                                <Bell className="h-4 w-4" />
                                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#FA0000] border border-white dark:border-black" />
                            </button>
                            <div className="h-9 w-9 rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                                <UserButton />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-5 lg:p-8 max-w-[1600px] w-full mx-auto space-y-8">

                {/* ── Métricas ─────────────────────────────────────────── */}
                <section>
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-[#FA0000]" />
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Desempenho de Hoje</h2>
                        </div>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                        <div className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Ao Vivo</span>
                        </div>
                    </div>
                    <AdminMetrics />
                </section>

                {/* ── Atalhos Operacionais ─────────────────────────────── */}
                <section>
                    <div className="flex items-center gap-3 mb-5">
                        <Zap className="h-4 w-4 text-[#FA0000]" />
                        <h2 className="text-sm font-bold text-gray-900 dark:text-white">Atalhos Rápidos</h2>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                        {/* Card Cozinha — destaque full */}
                        <a
                            href="/admin/orders"
                            className="group xl:col-span-2 relative overflow-hidden rounded-2xl bg-gray-900 dark:bg-black border border-gray-800 p-6 flex flex-col justify-between min-h-[160px] hover:border-[#FA0000]/60 transition-all duration-300 hover:shadow-2xl hover:shadow-[#FA0000]/10 hover:-translate-y-0.5"
                        >
                            {/* Background glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#FA0000]/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10 flex items-start justify-between">
                                <div>
                                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Canal de Preparo</span>
                                    <h3 className="text-2xl font-black text-white tracking-tight mt-1">Cozinha</h3>
                                    <p className="text-sm text-gray-400 mt-2 leading-snug max-w-[220px]">Kanban em tempo real para gerenciar pedidos e entregas</p>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-[#FA0000]/10 border border-[#FA0000]/20 flex items-center justify-center text-[#FA0000] shrink-0 group-hover:bg-[#FA0000] group-hover:text-white group-hover:scale-110 transition-all duration-300">
                                    <ChefHat className="h-6 w-6" />
                                </div>
                            </div>
                            <div className="relative z-10 flex items-center gap-2 mt-4">
                                <span className="text-xs font-semibold text-gray-400 group-hover:text-white transition-colors">Acessar Pedidos</span>
                                <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-[#FA0000] group-hover:translate-x-1 transition-all" />
                            </div>
                        </a>

                        {/* Card Cardápio */}
                        <a
                            href="/admin/menu"
                            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between min-h-[160px] hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Produtos & Categorias</span>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mt-1">Cardápio</h3>
                                    <p className="text-xs text-gray-400 mt-2 leading-snug">Cadastre pratos e organize os preços</p>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                    <ListIcon className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                                <span className="text-xs font-semibold text-gray-400">Gerenciar Menu</span>
                                <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all" />
                            </div>
                        </a>

                        {/* Card Histórico */}
                        <a
                            href="/admin/management"
                            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between min-h-[160px] hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Analytics</span>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mt-1">Histórico</h3>
                                    <p className="text-xs text-gray-400 mt-2 leading-snug">Análise de pedidos e cancelamentos</p>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                    <ShoppingBag className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                                <span className="text-xs font-semibold text-gray-400">Ver Histórico</span>
                                <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all" />
                            </div>
                        </a>

                    </div>
                </section>

                {/* ── Feedbacks Recentes ────────────────────────────────── */}
                <section>
                    <div className="flex items-center gap-3 mb-5">
                        <Star className="h-4 w-4 text-[#FA0000]" />
                        <h2 className="text-sm font-bold text-gray-900 dark:text-white">Voz do Cliente</h2>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                        <a
                            href="/admin/ratings"
                            className="text-[11px] font-semibold text-gray-400 hover:text-[#FA0000] transition-colors flex items-center gap-1.5"
                        >
                            Ver todos
                            <ArrowRight className="h-3 w-3" />
                        </a>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Ratings list — col-span-2 */}
                        <div className="xl:col-span-2">
                            <AdminRecentRatings />
                        </div>

                        {/* Side info — col-span-1 */}
                        <div className="space-y-4">
                            {/* NPS Card */}
                            <div className="rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="h-4 w-4 text-[#FA0000]" />
                                    <span className="text-xs font-bold text-gray-900 dark:text-white">Meta de Reputação</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">Responder em &lt;2h</span>
                                        <span className="font-bold text-emerald-600">Meta</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full w-3/4 bg-gradient-to-r from-[#FA0000] to-orange-400 rounded-full" />
                                    </div>
                                    <p className="text-[10px] text-gray-400 leading-relaxed">
                                        Responder feedbacks rapidamente melhora seu NPS e fideliza clientes.
                                    </p>
                                </div>
                            </div>

                            {/* Dica operacional */}
                            <div className="rounded-2xl bg-[#FA0000]/5 dark:bg-[#FA0000]/10 border border-[#FA0000]/15 p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Zap className="h-4 w-4 text-[#FA0000]" />
                                    <span className="text-xs font-bold text-[#FA0000]">Dica do dia</span>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Etiquete pedidos com observações especiais antes de enviá-los para a cozinha para evitar retrabalho.
                                </p>
                            </div>

                            {/* Acesso rápido configurações */}
                            <a
                                href="/admin/settings"
                                className="group flex items-center justify-between rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-400 dark:hover:border-gray-600 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                        <Settings className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white">Configurações</p>
                                        <p className="text-[10px] text-gray-400">Horários, taxas e dados da loja</p>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-600 dark:group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all" />
                            </a>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
