"use client";

import { useState, useRef } from "react";
import { StoreConfig, atualizarConfiguracoesLoja } from "@/lib/actions/adminSettingsActions";
import { OpeningHours } from "@/lib/storeUtils";
import { Button } from "@/components/core/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/Card";
import { Input, Label } from "@/components/core/Input";
import { Textarea } from "@/components/core/Textarea";
import {
    Store,
    Phone,
    MapPin,
    Truck,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Info,
    Smartphone,
    MapPinned,
    Image as ImageIcon,
    Upload,
    Save,
    LayoutGrid,
    Timer,
    CalendarDays
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AdminSettingsFormProps {
    initialConfig: StoreConfig;
}

type TabType = "identidade" | "logistica" | "horarios";

export function AdminSettingsForm({ initialConfig }: AdminSettingsFormProps) {
    const [config, setConfig] = useState<StoreConfig>(initialConfig);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>("identidade");
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialConfig.logo_url || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("store_name", config.store_name);
        formData.append("contact_phone", config.contact_phone);
        formData.append("pickup_address", config.pickup_address);
        formData.append("delivery_fee", String(config.delivery_fee));
        formData.append("delivery_radius", String(config.delivery_radius || 0));
        formData.append("min_order_value", String(config.min_order_value));
        formData.append("estimated_time", config.estimated_time);
        formData.append("pickup_estimated_time", config.pickup_estimated_time);
        formData.append("description", config.description || "");

        if (config.opening_hours) {
            formData.append("opening_hours", JSON.stringify(config.opening_hours));
        }

        if (fileInputRef.current?.files?.[0]) {
            formData.append("logo_file", fileInputRef.current.files[0]);
        }

        const res = await atualizarConfiguracoesLoja(formData);

        if (res.sucesso) {
            toast.success("Configurações salvas com sucesso!");
            setTimeout(() => window.location.reload(), 1000);
        } else {
            toast.error(res.error || 'Erro ao salvar configurações.');
        }
        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setConfig((prev: StoreConfig) => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const tabs = [
        { id: "identidade", label: "Identidade", icon: Store },
        { id: "logistica", label: "Logística & Taxas", icon: Truck },
        { id: "horarios", label: "Funcionamento", icon: CalendarDays },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-0 pb-20">
            {/* Standardized Tab Navigation - Elite Style */}
            <div className="sticky top-0 z-20 bg-white/80 dark:bg-black/94 backdrop-blur-2xl border-b border-gray-100 dark:border-gray-800 -mx-8 px-8 mb-10">
                <div className="flex items-center gap-10 overflow-x-auto no-scrollbar pt-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={cn(
                                "relative pb-5 flex items-center gap-2.5 text-[11px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap px-1",
                                activeTab === tab.id ? "text-[#FA0000]" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-[#FA0000]" : "text-gray-400")} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="admin-settings-tab-underline"
                                    className="absolute bottom-0 left-0 right-0 h-1 bg-[#FA0000] rounded-t-full shadow-[0_-2px_8px_rgba(250,0,0,0.3)]"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-2">
                <AnimatePresence mode="wait">
                    {/* ABA: IDENTIDADE */}
                    {activeTab === "identidade" && (
                        <motion.div
                            key="identidade"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-8"
                        >
                            <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-black overflow-hidden rounded-xl">
                                <CardHeader className="pb-8 border-b border-gray-50 dark:border-gray-900 mx-6 px-0 pt-8">
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="relative group">
                                            <div className="h-28 w-28 rounded-xl border-4 border-gray-50 dark:border-gray-900 bg-gray-50 dark:bg-gray-900 flex items-center justify-center overflow-hidden shadow-inner transition-all group-hover:border-[#FA0000]/20">
                                                {previewUrl ? (
                                                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="h-10 w-10 text-gray-200" />
                                                )}
                                                <div className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
                                                    <Upload className="h-6 w-6" />
                                                    <span className="text-[8px] font-black uppercase italic">Mudar Logo</span>
                                                </div>
                                            </div>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                        <div className="text-center space-y-1">
                                            <CardTitle className="text-xl font-black uppercase italic tracking-tighter text-[#2A2A2A] dark:text-white">Marca & Identidade</CardTitle>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60 italic">Como seu restaurante aparece para os clientes</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-10 space-y-8">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Nome Fantasia</Label>
                                        <Input
                                            name="store_name"
                                            value={config.store_name || ""}
                                            onChange={handleChange}
                                            className="h-14 rounded-xl text-base font-bold bg-gray-50/50 dark:bg-gray-900/50"
                                            leftIcon={<Store className="h-5 w-5 text-gray-400" />}
                                            placeholder="Ex: Pizzaria Napolitana"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">WhatsApp Oficial</Label>
                                        <Input
                                            name="contact_phone"
                                            value={config.contact_phone || ""}
                                            onChange={handleChange}
                                            className="h-14 rounded-xl text-base font-bold bg-gray-50/50 dark:bg-gray-900/50"
                                            leftIcon={<Phone className="h-5 w-5 text-gray-400" />}
                                            placeholder="Ex: 11 98765-4321"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Bio / Descrição Comercial</Label>
                                        <Textarea
                                            name="description"
                                            value={config.description || ""}
                                            onChange={handleChange}
                                            className="min-h-[140px] rounded-xl bg-gray-50/50 dark:bg-gray-900/50 p-6 text-sm italic font-medium leading-relaxed"
                                            placeholder="A melhor massa artesanal da região desde 1995..."
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* ABA: LOGÍSTICA */}
                    {activeTab === "logistica" && (
                        <motion.div
                            key="logistica"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-black p-8 rounded-xl space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#FA0000] italic flex items-center gap-3">
                                        <Timer className="h-4 w-4" /> Tempos Estimados
                                    </h3>
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Para Entrega</Label>
                                        <Input
                                            name="estimated_time"
                                            value={config.estimated_time || ""}
                                            onChange={handleChange}
                                            className="h-12 rounded-xl bg-gray-50/50 dark:bg-gray-900/50"
                                            placeholder="Ex: 40-60 min"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Para Retirada</Label>
                                        <Input
                                            name="pickup_estimated_time"
                                            value={config.pickup_estimated_time || ""}
                                            onChange={handleChange}
                                            className="h-12 rounded-xl bg-gray-50/50 dark:bg-gray-900/50"
                                            placeholder="Ex: 15-20 min"
                                        />
                                    </div>
                                </Card>

                                <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-black p-8 rounded-xl space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#FA0000] italic flex items-center gap-3">
                                        <Truck className="h-4 w-4" /> Taxas & Valores
                                    </h3>
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Taxa de Entrega Fixa</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            name="delivery_fee"
                                            value={config.delivery_fee ?? 0}
                                            onChange={handleChange}
                                            className="h-12 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 font-black tabular-nums"
                                            leftIcon={<span className="text-[10px] font-black text-gray-400 ml-1">R$</span>}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Pedido Mínimo</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            name="min_order_value"
                                            value={config.min_order_value ?? 0}
                                            onChange={handleChange}
                                            className="h-12 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 font-black tabular-nums"
                                            leftIcon={<span className="text-[10px] font-black text-gray-400 ml-1">R$</span>}
                                        />
                                    </div>
                                    <div className="space-y-4 pt-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[10px] font-black uppercase text-[#FA0000] tracking-widest pl-1">Raio de Entrega Máximo</Label>
                                            <span className="text-[9px] font-black text-gray-400 italic">KM</span>
                                        </div>
                                        <Input
                                            type="number"
                                            name="delivery_radius"
                                            value={config.delivery_radius ?? 0}
                                            onChange={handleChange}
                                            className="h-12 rounded-xl border-dashed border-red-200 dark:border-red-900/50 bg-red-500/[0.02] font-black tabular-nums"
                                            placeholder="Ex: 5"
                                        />
                                        <p className="text-[9px] text-gray-400 font-bold uppercase italic opacity-60 leading-tight">
                                            Pedidos fora deste raio serão bloqueados automaticamente no checkout. Use 0 para ilimitado.
                                        </p>
                                    </div>
                                </Card>
                            </div>

                            <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-black p-10 rounded-xl space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#FA0000] italic flex items-center gap-3">
                                    <MapPinned className="h-4 w-4" /> Endereço Físico
                                </h3>
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Localização para Retirada</Label>
                                    <Input
                                        name="pickup_address"
                                        value={config.pickup_address || ""}
                                        onChange={handleChange}
                                        className="h-14 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-base font-bold"
                                        leftIcon={<MapPin className="h-5 w-5 text-gray-400" />}
                                        placeholder="Ex: Av. Atlântica, 1500 - Bloco B"
                                    />
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest italic opacity-60">Este endereço ficará visível apenas após o fechamento do pedido</p>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* ABA: HORÃRIOS */}
                    {activeTab === "horarios" && (
                        <motion.div
                            key="horarios"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-black p-10 rounded-xl">
                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-[#2A2A2A] dark:text-white">Horários de Operação</h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60 italic">Defina as janelas de atendimento semanal</p>
                                    </div>
                                    <CalendarDays className="h-8 w-8 text-[#FA0000] opacity-20" />
                                </div>

                                <div className="space-y-3">
                                    {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((dia) => {
                                        const currentDay = config.opening_hours?.find(h => h.day === dia) || {
                                            day: dia,
                                            open: '18:00',
                                            close: '23:00',
                                            closed: false
                                        };

                                        const handleDayChange = (field: string, value: any) => {
                                            const newHours = [...(config.opening_hours || [])];
                                            const index = newHours.findIndex((h: OpeningHours) => h.day === dia);
                                            const updatedDay = { ...currentDay, [field]: value };
                                            if (index >= 0) newHours[index] = updatedDay;
                                            else newHours.push(updatedDay);
                                            setConfig((prev: StoreConfig) => ({ ...prev, opening_hours: newHours }));
                                        };

                                        return (
                                            <div key={dia} className={cn(
                                                "group flex flex-col sm:flex-row items-center justify-between p-5 rounded-xl transition-all border",
                                                currentDay.closed
                                                    ? "bg-red-50/10 border-red-100/20 opacity-60 grayscale"
                                                    : "bg-gray-50/40 dark:bg-gray-950/40 border-transparent hover:border-gray-100 dark:hover:border-gray-800"
                                            )}>
                                                <div className="flex items-center gap-4 w-40">
                                                    <span className="text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 italic">{dia}</span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-6 flex-1 justify-end w-full sm:w-auto">
                                                    <label className="flex items-center gap-3 cursor-pointer select-none">
                                                        <input
                                                            type="checkbox"
                                                            checked={currentDay.closed}
                                                            onChange={(e) => handleDayChange('closed', e.target.checked)}
                                                            className="hidden"
                                                        />
                                                        <div className={cn(
                                                            "h-6 w-11 rounded-full p-1 transition-all duration-300",
                                                            currentDay.closed ? "bg-[#FA0000]" : "bg-gray-200 dark:bg-gray-800"
                                                        )}>
                                                            <div className={cn(
                                                                "h-4 w-4 rounded-full bg-white transition-all shadow-sm",
                                                                currentDay.closed ? "translate-x-5" : "translate-x-0"
                                                            )} />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{currentDay.closed ? "Fechado" : "Aberto"}</span>
                                                    </label>

                                                    {!currentDay.closed && (
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="time"
                                                                value={currentDay.open}
                                                                onChange={(e) => handleDayChange('open', e.target.value)}
                                                                className="h-10 w-28 px-4 rounded-xl font-black text-xs text-center border-none bg-white dark:bg-black shadow-inner"
                                                            />
                                                            <span className="text-[9px] font-black text-gray-300 mx-1">âžœ</span>
                                                            <Input
                                                                type="time"
                                                                value={currentDay.close}
                                                                onChange={(e) => handleDayChange('close', e.target.value)}
                                                                className="h-10 w-28 px-4 rounded-xl font-black text-xs text-center border-none bg-white dark:bg-black shadow-inner"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* BARRA FIXA DE SALVAMENTO - ELITE */}
            <div className="fixed bottom-0 left-[280px] right-0 bg-white/60 dark:bg-black/80 backdrop-blur-3xl border-t border-gray-100 dark:border-gray-800/50 p-6 flex justify-center items-center z-40">
                <div className="max-w-4xl w-full flex items-center justify-between px-4">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Estado de Edição</span>
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#FA0000] animate-pulse" />
                            <span className="text-[10px] font-black uppercase text-[#2A2A2A] dark:text-white italic">Alterações não salvas</span>
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="h-14 px-12 rounded-xl bg-[#FA0000] hover:bg-red-600 text-white shadow-2xl shadow-red-500/30 font-black italic uppercase tracking-[0.1em] text-xs transition-all active:scale-95 flex items-center gap-3"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                            <>
                                <Save className="h-5 w-5" />
                                Atualizar Centro de Controle
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </form>
    );
}
