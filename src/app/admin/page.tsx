import { AdminMetrics } from "@/components/domain/AdminMetrics";
import { AdminRecentRatings } from "@/components/domain/AdminRecentRatings";
import { TrendingUp, Calendar, Clock, AlertCircle, Star, Bell, ChefHat, List as ListIcon, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/Card";
import { obterConfiguracoesLoja } from "@/lib/actions/adminSettingsActions";
import { isStoreOpen as checkStoreOpen } from "@/lib/storeUtils";
import { cn } from "@/lib/utils";
import { StatusToggle } from "@/components/domain/StatusToggle";
import { UserButton } from "@/components/core/UserButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    const storeSettings = await obterConfiguracoesLoja();
    const isStoreOpen = checkStoreOpen(storeSettings?.opening_hours);

    // Pegar o horário de hoje para exibir usando a mesma lógica do isStoreOpen
    const todayFormatter = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Cuiaba',
        weekday: 'long'
    });
    const currentDayName = todayFormatter.format(new Date()).toLowerCase().replace('-feira', '');

    const todaySchedule = storeSettings?.opening_hours?.find(h =>
        h.day.toLowerCase().replace('-feira', '') === currentDayName
    );

    return (
        <div className="flex flex-col min-h-full">
            {/* Elite Top Bar — Control Center */}
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-black/94 backdrop-blur-2xl border-b border-gray-100 dark:border-gray-800 px-6 py-4">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-8">
                    {/* Welcome & Search */}
                    <div className="flex items-center gap-12 flex-1">
                        <div className="flex flex-col min-w-fit">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 opacity-60">Status do Sistema</span>
                            <h1 className="text-xl font-black text-[#2A2A2A] dark:text-white tracking-tighter uppercase italic leading-none">
                                Bem-vindo <span className="text-[#FA0000]">de volta, João</span>
                            </h1>
                        </div>

                        {/* Search Bar - Elite Focus */}
                        <div className="hidden md:flex flex-1 max-w-md relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FA0000] transition-colors">
                                <Search className="h-4 w-4" />
                            </div>
                            <input
                                type="text"
                                placeholder="Pesquisar análises, pedidos ou produtos..."
                                className="w-full h-11 pl-12 pr-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-[#FA0000] focus:ring-4 focus:ring-red-500/10 outline-none text-xs font-bold transition-all placeholder:text-gray-400 placeholder:italic"
                            />
                        </div>
                    </div>

                    {/* Operational KPIs & Profile */}
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 opacity-60">Status da Loja</span>
                            <StatusToggle isStoreOpen={isStoreOpen} />
                        </div>

                        <div className="h-10 w-px bg-gray-100 dark:bg-gray-800 hidden sm:block" />

                        <div className="flex items-center gap-3">
                            <button className="relative h-11 w-11 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 hover:text-[#FA0000] transition-all hover:scale-105 active:scale-95 group">
                                <Bell className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[#FA0000] border-2 border-white dark:border-gray-900 shadow-sm shadow-red-500/50" />
                            </button>
                            <div className="sm:flex h-11 w-11 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 items-center justify-center overflow-hidden hover:border-[#FA0000] transition-all">
                                <UserButton />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 lg:p-6 max-w-[1600px] w-full mx-auto space-y-10">
                {/* Dashboard Stats */}
                <div className="space-y-8">
                    <div className="flex items-end justify-between border-l-4 border-[#FA0000] pl-6">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-[#2A2A2A] dark:text-white tracking-tighter italic uppercase flex items-center gap-3 leading-none">
                                Desempenho <span className="text-[#FA0000]">Financeiro</span>
                            </h2>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest italic opacity-60">Resultados da operação em tempo real</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <TrendingUp className="h-5 w-5 text-[#FA0000]" />
                            <span className="text-xs font-black text-[#FA0000] uppercase tracking-widest italic animate-pulse">Live</span>
                        </div>
                    </div>
                    <AdminMetrics />
                </div>

                {/* Painel de Gestão Operacional */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                    <Card className="border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden relative group hover:border-[#FA0000]/30 transition-all duration-300 hover:-translate-y-1 rounded-xl bg-white dark:bg-black">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-gray-400 uppercase text-[10px] font-black tracking-widest opacity-50">Canal de Preparo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 relative z-10 px-6 pb-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase text-[#2A2A2A] dark:text-white">Cozinha</h3>
                                <div className="h-12 w-12 rounded-xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-[#FA0000] shadow-inner">
                                    <ChefHat className="h-7 w-7" />
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm leading-snug font-medium">Painel Kanban em tempo real para gerenciar o preparo e as entregas.</p>
                            <a href="/admin/orders" className="flex h-12 items-center justify-center rounded-[8px] bg-[#FA0000] text-white text-[11px] font-black uppercase italic tracking-widest shadow-lg shadow-red-500/20 active:scale-95 hover:bg-[#D00000] transition-all">
                                Acessar Pedidos
                            </a>
                        </CardContent>
                    </Card>

                    <Card className="border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden relative group hover:border-[#2A2A2A] dark:hover:border-white transition-all duration-300 hover:-translate-y-1 rounded-xl bg-white dark:bg-black">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-gray-400 uppercase text-[10px] font-black tracking-widest opacity-50">Produtos & Categorias</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 relative z-10 px-6 pb-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase text-[#2A2A2A] dark:text-white">Cardápio</h3>
                                <div className="h-12 w-12 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-500 shadow-inner">
                                    <ListIcon className="h-7 w-7" />
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm leading-snug font-medium">Cadastre novos pratos e organize os melhores preços para o restaurante.</p>
                            <a href="/admin/menu" className="flex h-12 items-center justify-center border border-gray-200 dark:border-gray-800 rounded-[8px] bg-white dark:bg-black text-[#2A2A2A] dark:text-white text-[11px] font-black uppercase italic tracking-widest active:scale-95 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all">
                                Gerenciar Menu
                            </a>
                        </CardContent>
                    </Card>

                    {/* Informações da Loja */}
                    <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-gray-50/20 dark:bg-gray-900/10 rounded-xl overflow-hidden">
                        <CardHeader className="pb-4 bg-white/50 dark:bg-black/50 border-b border-gray-100 dark:border-gray-800">
                            <CardTitle className="text-gray-400 uppercase text-[10px] font-black tracking-widest opacity-50">Monitor de Sistema</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-6">
                            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800/50">
                                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                    <Calendar className="h-4 w-4" /> Data
                                </div>
                                <span className="text-xs font-black tabular-nums">{new Date().toLocaleDateString('pt-BR')}</span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800/50">
                                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                    <Clock className="h-4 w-4" /> Horário
                                </div>
                                <span className="text-xs font-black tabular-nums">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                    <AlertCircle className="h-4 w-4" /> Hoje
                                </div>
                                <span className="text-xs font-black text-[#FA0000] italic uppercase">{new Date().toLocaleDateString('pt-BR', { weekday: 'long' }).replace('-feira', '')}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Feedbacks Recentes */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                        <div className="flex items-center gap-3">
                            <Star className="h-6 w-6 text-gray-300 fill-gray-100" />
                            <h2 className="text-xl font-black text-[#2A2A2A] dark:text-white tracking-tighter italic uppercase">Voz do Cliente</h2>
                        </div>
                        <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <AdminRecentRatings />
                        </div>
                        <div className="bg-white dark:bg-gray-900/50 rounded-xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center group transition-all duration-500 hover:border-brand/30">
                            <div className="h-16 w-16 rounded-full bg-red-50 dark:bg-red-950/20 text-[#FA0000] flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                                <Star className="h-8 w-8 fill-[#FA0000]/20" />
                            </div>
                            <h4 className="font-black text-lg mb-2 uppercase italic tracking-tighter text-[#2A2A2A] dark:text-white">Foco na Excelência</h4>
                            <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-[220px]">Responda aos novos feedbacks em menos de 2 horas para maximizar o NPS.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

