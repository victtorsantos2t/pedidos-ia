"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { StoreConfig, atualizarConfiguracoesLoja } from "@/lib/actions/adminSettingsActions";
import { salvarZonaEntrega } from "@/lib/actions/deliveryActions";
import { DeliveryZone } from "@/modules/delivery/delivery.types";
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
    Loader2,
    Info,
    MapPinned,
    Image as ImageIcon,
    Upload,
    Save,
    Timer,
    CalendarDays,
    Check,
    X,
    Pencil,
    Navigation,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AdminSettingsFormProps {
    initialConfig: StoreConfig;
}

type TabType = "identidade" | "logistica" | "horarios";

const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

// ─── Componente principal ─────────────────────────────────────────────────────
export function AdminSettingsForm({ initialConfig }: AdminSettingsFormProps) {
    const [config, setConfig] = useState<StoreConfig>(initialConfig);
    const [loading, setLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false); // #7 — controla exibição da barra de salvar
    const [activeTab, setActiveTab] = useState<TabType>("identidade");
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialConfig.logo_url || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ─── CEP state ───────────────────────────────────────────────────────────
    const [cep, setCep] = useState("");
    const [cepLoading, setCepLoading] = useState(false);
    const [cepError, setCepError] = useState<string | null>(null);
    const [cepFound, setCepFound] = useState<string | null>(null);
    const [cepPrecision, setCepPrecision] = useState<1 | 2 | 3 | null>(null);

    const queryNominatim = useCallback(async (query: string): Promise<{ lat: number; lng: number } | null> => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=br&accept-language=pt-BR`,
                { headers: { "User-Agent": "rdos-restaurante-app/1.0" } }
            );
            const data = await res.json();
            if (!data || data.length === 0) return null;
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        } catch { return null; }
    }, []);

    const fetchCoordsFromCep = useCallback(async (rawCep: string) => {
        const digits = rawCep.replace(/\D/g, "");
        if (digits.length !== 8) return;

        setCepLoading(true);
        setCepError(null);
        setCepFound(null);

        try {
            const viaRes = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
            const viaData = await viaRes.json();

            if (viaData.erro) {
                setCepError("CEP não encontrado.");
                return;
            }

            const { logradouro, bairro, localidade, uf } = viaData;
            const addressString = [logradouro, bairro, `${localidade} - ${uf}`].filter(Boolean).join(", ");

            // Atualiza o endereço de retirada automaticamente
            setConfig(prev => ({ ...prev, pickup_address: addressString }));
            setCepFound(addressString);

            // Busca coordenadas para o restaurante
            const coords = await queryNominatim(`${addressString}, Brasil`);
            if (coords) {
                setConfig(prev => ({ ...prev, lat: coords.lat, lng: coords.lng }));
                setCepPrecision(1);
            }
        } catch {
            setCepError("Erro ao buscar CEP.");
        } finally {
            setCepLoading(false);
        }
    }, [queryNominatim]);

    const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, "").slice(0, 8);
        const formatted = raw.length > 5 ? raw.replace(/(\d{5})(\d{1,3})/, "$1-$2") : raw;
        setCep(formatted);
        if (raw.length === 8) fetchCoordsFromCep(raw);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const parsed = type === "number" ? parseFloat(value) : value;
        setConfig((prev: StoreConfig) => ({ ...prev, [name]: parsed }));
        setIsDirty(true); // #7 — marca como alterado
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPreviewUrl(URL.createObjectURL(file));
    };

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
        formData.append("lat", String(config.lat || 0));
        formData.append("lng", String(config.lng || 0));
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
            setIsDirty(false); // #7 — limpa estado dirty
            setTimeout(() => window.location.reload(), 1000);
        } else {
            toast.error(res.error || "Erro ao salvar configurações.");
        }
        setLoading(false);
    };

    const tabs = [
        { id: "identidade", label: "Identidade", icon: Store },
        { id: "logistica", label: "Logística & Taxas", icon: Truck },
        { id: "horarios", label: "Funcionamento", icon: CalendarDays },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-0 pb-20">
            {/* Tab Navigation */}
            <div className="sticky top-0 z-20 bg-white/80 dark:bg-black/94 backdrop-blur-2xl border-b border-gray-200 dark:border-gray-800 -mx-8 px-8 mb-10">
                <div className="flex items-center gap-10 overflow-x-auto no-scrollbar pt-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={cn(
                                "relative pb-5 flex items-center gap-2.5 text-[11px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap px-1",
                                activeTab === tab.id
                                    ? "text-[#FA0000]"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                            )}
                        >
                            <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-[#FA0000]" : "text-gray-500 dark:text-gray-400")} />
                            {tab.label}
                            {/* #14 — dot quando aba tem campo incompleto */}
                            {isDirty && tab.id === "logistica" && (!config.delivery_fee || !config.min_order_value) && (
                                <span className="ml-1 h-1.5 w-1.5 rounded-full bg-red-500 inline-block flex-shrink-0" />
                            )}
                            {isDirty && tab.id === "identidade" && !config.store_name && (
                                <span className="ml-1 h-1.5 w-1.5 rounded-full bg-red-500 inline-block flex-shrink-0" />
                            )}
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
                    {/* ── ABA: IDENTIDADE ───────────────────────────────── */}
                    {activeTab === "identidade" && (
                        <motion.div
                            key="identidade"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-8"
                        >
                            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-black overflow-hidden rounded-xl">
                                <CardHeader className="pb-8 border-b border-gray-100 dark:border-gray-900 mx-6 px-0 pt-8">
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="relative group">
                                            <div className="h-28 w-28 rounded-xl border-4 border-gray-100 dark:border-gray-900 bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden shadow-inner transition-all group-hover:border-[#FA0000]/20">
                                                {previewUrl ? (
                                                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="h-10 w-10 text-gray-300 dark:text-gray-600" />
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
                                            <CardTitle className="text-xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">
                                                Marca & Identidade
                                            </CardTitle>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-500 font-bold uppercase tracking-widest italic">
                                                Como seu restaurante aparece para os clientes
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-10 space-y-8">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-gray-600 dark:text-gray-500 tracking-widest pl-1">
                                            Nome Fantasia
                                        </Label>
                                        <Input
                                            name="store_name"
                                            value={config.store_name || ""}
                                            onChange={handleChange}
                                            className="h-14 rounded-xl text-base font-bold bg-gray-50/50 border border-gray-200 shadow-sm focus:bg-white focus:ring-2 focus:ring-brand/20 dark:bg-gray-900/50 dark:border-gray-800"
                                            leftIcon={<Store className="h-5 w-5 text-gray-500" />}
                                            placeholder="Ex: Pizzaria Napolitana"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-gray-600 dark:text-gray-500 tracking-widest pl-1">
                                            WhatsApp Oficial
                                        </Label>
                                        <Input
                                            name="contact_phone"
                                            value={config.contact_phone || ""}
                                            onChange={handleChange}
                                            className="h-14 rounded-xl text-base font-bold bg-gray-50/50 border border-gray-200 shadow-sm focus:bg-white focus:ring-2 focus:ring-brand/20 dark:bg-gray-900/50 dark:border-gray-800"
                                            leftIcon={<Phone className="h-5 w-5 text-gray-500" />}
                                            placeholder="Ex: 11 98765-4321"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-gray-600 dark:text-gray-500 tracking-widest pl-1">
                                            Bio / Descrição Comercial
                                        </Label>
                                        <Textarea
                                            name="description"
                                            value={config.description || ""}
                                            onChange={handleChange}
                                            className="min-h-[140px] rounded-xl bg-gray-50/50 border border-gray-200 shadow-sm focus:bg-white focus:ring-2 focus:ring-brand/20 dark:bg-gray-900/50 dark:border-gray-800 p-6 text-sm italic font-medium leading-relaxed"
                                            placeholder="A melhor massa artesanal da região desde 1995..."
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* ── ABA: LOGÍSTICA ────────────────────────────────── */}
                    {activeTab === "logistica" && (
                        <motion.div
                            key="logistica"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-8"
                        >
                            {/* Grid: Tempos + Regras de Entrega */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Tempos */}
                                <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-black p-8 rounded-xl space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#FA0000] italic flex items-center gap-3">
                                        <Timer className="h-4 w-4" /> Tempos Estimados
                                    </h3>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-gray-600 dark:text-gray-500 tracking-widest pl-1">
                                            Para Entrega
                                        </Label>
                                        <Input
                                            name="estimated_time"
                                            value={config.estimated_time || ""}
                                            onChange={handleChange}
                                            className="h-12 rounded-xl bg-gray-50/50 border border-gray-200 shadow-sm focus:bg-white focus:ring-2 focus:ring-brand/20 dark:bg-gray-900/50 dark:border-gray-800"
                                            placeholder="Ex: 40-60 min"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-gray-600 dark:text-gray-500 tracking-widest pl-1">
                                            Para Retirada
                                        </Label>
                                        <Input
                                            name="pickup_estimated_time"
                                            value={config.pickup_estimated_time || ""}
                                            onChange={handleChange}
                                            className="h-12 rounded-xl bg-gray-50/50 border border-gray-200 shadow-sm focus:bg-white focus:ring-2 focus:ring-brand/20 dark:bg-gray-900/50 dark:border-gray-800"
                                            placeholder="Ex: 15-20 min"
                                        />
                                    </div>
                                </Card>

                                {/* Regras de Entrega (Preço Fixo) */}
                                <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-black p-8 rounded-xl space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#FA0000] italic flex items-center gap-3">
                                        <Truck className="h-4 w-4" /> Regras de Frete Fixo
                                    </h3>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-gray-600 dark:text-gray-500 tracking-widest pl-1">
                                            Taxa de Entrega (R$)
                                        </Label>
                                        <Input
                                            type="number"
                                            name="delivery_fee"
                                            step="0.01"
                                            value={config.delivery_fee}
                                            onChange={handleChange}
                                            className="h-12 rounded-xl bg-gray-50/50 border border-gray-200 shadow-sm focus:bg-white focus:ring-2 focus:ring-brand/20 dark:bg-gray-900/50 dark:border-gray-800 font-bold"
                                            placeholder="5.00"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-gray-600 dark:text-gray-500 tracking-widest pl-1">
                                            Pedido Mínimo (R$)
                                        </Label>
                                        <Input
                                            type="number"
                                            name="min_order_value"
                                            step="0.01"
                                            value={config.min_order_value}
                                            onChange={handleChange}
                                            className="h-12 rounded-xl bg-gray-50/50 border border-gray-200 shadow-sm focus:bg-white focus:ring-2 focus:ring-brand/20 dark:bg-gray-900/50 dark:border-gray-800 font-bold"
                                            placeholder="20.00"
                                        />
                                    </div>
                                </Card>
                            </div>



                            {/* Endereço de Retirada */}
                            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-black p-10 rounded-xl space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#FA0000] italic flex items-center gap-3">
                                    <MapPinned className="h-4 w-4" /> Localização do Restaurante
                                </h3>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-gray-600 dark:text-gray-500 tracking-widest pl-1">
                                        Buscar por CEP
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            value={cep}
                                            onChange={handleCepChange}
                                            className={cn(
                                                "h-14 rounded-xl font-black tracking-widest text-base pl-12",
                                                cepError ? "border-red-500 bg-red-50" : cepFound ? "border-emerald-500 bg-emerald-50" : ""
                                            )}
                                            placeholder="00000-000"
                                            maxLength={9}
                                        />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                            {cepLoading ? <Loader2 className="h-5 w-5 animate-spin text-brand" /> : <MapPin className="h-5 w-5 text-gray-500" />}
                                        </div>
                                    </div>
                                    {cepError && <p className="text-[10px] font-bold text-red-500 px-2 italic">{cepError}</p>}
                                    {cepFound && <p className="text-[10px] font-bold text-emerald-600 px-2 italic">Endereço identificado com sucesso!</p>}
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-gray-600 dark:text-gray-500 tracking-widest pl-1">
                                        Endereço Físico Completo
                                    </Label>
                                    <Input
                                        name="pickup_address"
                                        value={config.pickup_address || ""}
                                        onChange={handleChange}
                                        className="h-14 rounded-xl bg-gray-50/50 border border-gray-200 shadow-sm focus:bg-white focus:ring-2 focus:ring-brand/20 dark:bg-gray-900/50 dark:border-gray-800 text-base font-bold"
                                        leftIcon={<MapPin className="h-5 w-5 text-gray-500" />}
                                        placeholder="Ex: Av. Atlântica, 1500"
                                    />
                                    <p className="text-[10px] text-gray-500 dark:text-gray-500 font-semibold uppercase tracking-widest italic">
                                        Este endereço é preenchido automaticamente ao buscar o CEP acima.
                                    </p>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* ── ABA: HORÁRIOS ─────────────────────────────────── */}
                    {activeTab === "horarios" && (
                        <motion.div
                            key="horarios"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-black p-10 rounded-xl">
                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">
                                            Horários de Operação
                                        </h3>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-500 font-bold uppercase tracking-widest italic">
                                            Defina as janelas de atendimento semanal
                                        </p>
                                    </div>
                                    <CalendarDays className="h-8 w-8 text-[#FA0000] opacity-20" />
                                </div>

                                <div className="space-y-3">
                                    {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map((dia) => {
                                        const currentDay = config.opening_hours?.find((h) => h.day === dia) || {
                                            day: dia,
                                            open: "18:00",
                                            close: "23:00",
                                            closed: false,
                                        };

                                        const handleDayChange = (field: string, value: unknown) => {
                                            const newHours = [...(config.opening_hours || [])];
                                            const index = newHours.findIndex((h: OpeningHours) => h.day === dia);
                                            const updatedDay = { ...currentDay, [field]: value };
                                            if (index >= 0) newHours[index] = updatedDay;
                                            else newHours.push(updatedDay);
                                            setConfig((prev: StoreConfig) => ({ ...prev, opening_hours: newHours }));
                                        };

                                        return (
                                            <div
                                                key={dia}
                                                className={cn(
                                                    "group flex flex-col sm:flex-row items-center justify-between p-5 rounded-xl transition-all border",
                                                    currentDay.closed
                                                        ? "bg-red-50/10 border-red-100/20 opacity-60 grayscale"
                                                        : "bg-gray-50/40 dark:bg-gray-950/40 border-transparent hover:border-gray-200 dark:hover:border-gray-800"
                                                )}
                                            >
                                                <div className="flex items-center gap-4 w-40">
                                                    <span className="text-xs font-black uppercase tracking-widest text-gray-800 dark:text-gray-200 italic">
                                                        {dia}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-6 flex-1 justify-end w-full sm:w-auto">
                                                    <label className="flex items-center gap-3 cursor-pointer select-none">
                                                        <input
                                                            type="checkbox"
                                                            checked={currentDay.closed}
                                                            onChange={(e) => handleDayChange("closed", e.target.checked)}
                                                            className="hidden"
                                                        />
                                                        <div className={cn(
                                                            "h-6 w-11 rounded-full p-1 transition-all duration-300",
                                                            currentDay.closed ? "bg-[#FA0000]" : "bg-gray-200 dark:bg-gray-700"
                                                        )}>
                                                            <div className={cn(
                                                                "h-4 w-4 rounded-full bg-white transition-all shadow-sm",
                                                                currentDay.closed ? "translate-x-5" : "translate-x-0"
                                                            )} />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase text-gray-600 dark:text-gray-400 tracking-widest">
                                                            {currentDay.closed ? "Fechado" : "Aberto"}
                                                        </span>
                                                    </label>

                                                    {!currentDay.closed && (
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="time"
                                                                value={currentDay.open}
                                                                onChange={(e) => handleDayChange("open", e.target.value)}
                                                                className="h-10 w-28 px-4 rounded-xl font-black text-xs text-center border-none bg-white dark:bg-gray-900 shadow-inner"
                                                            />
                                                            <span className="text-[9px] font-black text-gray-400 mx-1">➜</span>
                                                            <Input
                                                                type="time"
                                                                value={currentDay.close}
                                                                onChange={(e) => handleDayChange("close", e.target.value)}
                                                                className="h-10 w-28 px-4 rounded-xl font-black text-xs text-center border-none bg-white dark:bg-gray-900 shadow-inner"
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

            {/* #7 — Barra de salvamento CONDICIONAL: só aparece quando há alterações */}
            {isDirty && (
                <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-black/95 backdrop-blur-3xl border-t border-gray-200 dark:border-gray-800/50 py-3 px-6 flex justify-center items-center z-50">
                    <div className="max-w-4xl w-full flex items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">Alterações não salvas</span>
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-10 px-8 rounded-lg bg-[#FA0000] hover:bg-red-600 text-white shadow-lg shadow-red-500/30 font-bold uppercase tracking-wide text-[11px] transition-all active:scale-95 flex items-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Salvar
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </form>
    );
}
