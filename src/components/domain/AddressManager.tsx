"use client";

import { useState } from "react";
import { createAddress, deleteAddress, setDefaultAddress, updateAddress } from "@/lib/actions/profileActions";
import { Input, Label } from "@/components/core/Input";
import { ArrowLeft, MapPin, Plus, Trash2, CheckCircle2, Loader2, Edit3, X, AlertTriangle, Hash, Landmark, Navigation2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Address {
    id: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    complement?: string;
    is_default: boolean;
    cep?: string;
}

export function AddressManager({ initialAddresses }: { initialAddresses: Address[] }) {
    const router = useRouter();
    const [isAdding, setIsAdding] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [pending, setPending] = useState<string | null>(null);
    const [cepLoading, setCepLoading] = useState(false);

    // Estados para auto-preechimento
    const [street, setStreet] = useState("");
    const [neighborhood, setNeighborhood] = useState("");
    const [city, setCity] = useState("");

    const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, "");
        if (cep.length === 8) {
            setCepLoading(true);
            try {
                const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await res.json();
                if (!data.erro) {
                    setStreet(data.logradouro);
                    setNeighborhood(data.bairro);
                    setCity(data.localidade);
                }
            } catch (err) {
                console.error("Erro ao buscar CEP:", err);
            } finally {
                setCepLoading(false);
            }
        }
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditingAddress(null);
        setStreet("");
        setNeighborhood("");
        setCity("");
    };

    const startEditing = (addr: Address) => {
        setEditingAddress(addr);
        setStreet(addr.street);
        setNeighborhood(addr.neighborhood);
        setCity(addr.city);
        setIsAdding(true);
    };

    async function handleSubmit(formData: FormData) {
        setPending("submit");
        const res = editingAddress
            ? await updateAddress(editingAddress.id, formData)
            : await createAddress(formData);

        setPending(null);
        if (res.success) {
            resetForm();
        } else {
            alert("Erro: " + res.error);
        }
    }

    async function handleConfirmDelete() {
        if (!confirmDeleteId) return;
        setPending(confirmDeleteId);
        await deleteAddress(confirmDeleteId);
        setPending(null);
        setConfirmDeleteId(null);
    }

    async function handleSetDefault(id: string) {
        setPending(id);
        await setDefaultAddress(id);
        setPending(null);
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <header className="sticky top-0 z-40 flex items-center bg-surface px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-4 border-b border-gray-100 dark:border-gray-800">
                <button
                    onClick={() => isAdding ? resetForm() : router.back()}
                    className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-90 shadow-sm"
                >
                    <ArrowLeft className="h-5 w-5 text-foreground" />
                </button>
                <h1 className="text-lg font-bold text-foreground">
                    {editingAddress ? "Editar endereço" : isAdding ? "Novo endereço" : "Meus endereços"}
                </h1>
            </header>

            <main className="max-w-lg mx-auto p-4">
                <AnimatePresence mode="wait">
                    {isAdding ? (
                        <motion.form
                            key="form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            action={handleSubmit}
                            className="space-y-4 pt-4"
                        >
                            <div className="space-y-1">
                                <Label>CEP</Label>
                                <Input
                                    name="cep"
                                    maxLength={8}
                                    onChange={handleCepChange}
                                    defaultValue={editingAddress?.cep || ""}
                                    placeholder="Ex: 00000000"
                                    leftIcon={<MapPin className="h-5 w-5" />}
                                    rightIcon={cepLoading ? <Loader2 className="h-4 w-4 animate-spin text-brand" /> : null}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-3 space-y-1">
                                    <Label>Rua / Avenida</Label>
                                    <Input
                                        name="street"
                                        value={street}
                                        onChange={(e) => setStreet(e.target.value)}
                                        placeholder="Ex: Av. Brasil"
                                        leftIcon={<Navigation2 className="h-5 w-5" />}
                                        required
                                    />
                                </div>
                                <div className="col-span-1 space-y-1">
                                    <Label>Nº</Label>
                                    <Input
                                        name="number"
                                        defaultValue={editingAddress?.number || ""}
                                        placeholder="123"
                                        leftIcon={<Hash className="h-4 w-4" />}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label>Bairro</Label>
                                <Input
                                    name="neighborhood"
                                    value={neighborhood}
                                    onChange={(e) => setNeighborhood(e.target.value)}
                                    placeholder="Ex: Centro"
                                    leftIcon={<Landmark className="h-5 w-5" />}
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>Complemento / Ponto de Ref.</Label>
                                <Input
                                    name="complement"
                                    defaultValue={editingAddress?.complement || ""}
                                    placeholder="Ex: Apto 10 ou Próximo ao mercado"
                                    leftIcon={<Edit3 className="h-5 w-5" />}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>Cidade</Label>
                                <Input
                                    name="city"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Ex: São Paulo"
                                    leftIcon={<MapPin className="h-5 w-5" />}
                                    required
                                />
                            </div>

                            <label className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-gray-100 dark:border-gray-800 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_default"
                                    defaultChecked={editingAddress?.is_default || false}
                                    className="w-5 h-5 rounded-md border-gray-300 text-brand focus:ring-brand outline-none"
                                />
                                <span className="text-sm font-semibold text-foreground">Definir como principal</span>
                            </label>

                            <button
                                type="submit"
                                disabled={pending === "submit"}
                                className="w-full h-14 mt-8 bg-brand text-white font-bold rounded-xl shadow-lg shadow-brand/20 flex items-center justify-center gap-2 hover:bg-brand-hover active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {pending === "submit" ? <Loader2 className="h-5 w-5 animate-spin" /> : editingAddress ? "Salvar alterações" : "Salvar endereço"}
                            </button>
                        </motion.form>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <button
                                onClick={() => setIsAdding(true)}
                                className="w-full h-14 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand/30 text-brand font-bold text-sm hover:border-brand hover:bg-brand/5 transition-all"
                            >
                                <Plus className="h-5 w-5" />
                                Adicionar novo endereço
                            </button>

                            <div className="space-y-3">
                                {initialAddresses.map((addr) => (
                                    <div
                                        key={addr.id}
                                        className={`p-4 bg-surface rounded-xl border transition-all ${addr.is_default ? "border-brand shadow-md" : "border-gray-100 dark:border-gray-800"}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-3">
                                                <div className={`mt-1 flex h-8 w-8 items-center justify-center rounded-lg ${addr.is_default ? "bg-brand text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
                                                    <MapPin className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-foreground">{addr.street}, {addr.number}</h4>
                                                    <p className="text-xs text-gray-500">{addr.neighborhood}, {addr.city}</p>
                                                    {addr.complement && <p className="text-xs italic text-gray-400 mt-1">{addr.complement}</p>}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => startEditing(addr)}
                                                    className="p-2 text-gray-400 hover:text-brand transition-colors"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDeleteId(addr.id)}
                                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {!addr.is_default && (
                                            <button
                                                onClick={() => handleSetDefault(addr.id)}
                                                disabled={!!pending}
                                                className="mt-4 w-full h-10 rounded-xl bg-gray-50 dark:bg-gray-900 text-xs font-bold text-gray-500 hover:text-brand transition-all flex items-center justify-center gap-2"
                                            >
                                                {pending === addr.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Tornar principal"}
                                            </button>
                                        )}

                                        {addr.is_default && (
                                            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-bold text-brand">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                Endereço Principal
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {initialAddresses.length === 0 && (
                                    <div className="py-12 text-center">
                                        <p className="text-gray-400 text-sm">Nenhum endereço cadastrado.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Modal de Confirmação de Exclusão */}
            <AnimatePresence>
                {confirmDeleteId && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-sm bg-surface rounded-xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="h-16 w-16 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mb-4">
                                    <AlertTriangle className="h-8 w-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">Excluir endereço?</h3>
                                <p className="text-sm text-gray-500 mb-8">
                                    Esta ação não pode ser desfeita. O endereço será removido permanentemente da sua conta.
                                </p>

                                <div className="grid grid-cols-2 gap-3 w-full">
                                    <button
                                        onClick={() => setConfirmDeleteId(null)}
                                        className="h-12 rounded-xl bg-gray-100 dark:bg-gray-800 font-bold text-gray-500 hover:bg-gray-200 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleConfirmDelete}
                                        disabled={!!pending}
                                        className="h-12 rounded-xl bg-red-500 font-bold text-white shadow-lg shadow-red-500/20 hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sim, excluir"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
