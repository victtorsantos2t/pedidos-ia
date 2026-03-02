"use client";

import { useState } from "react";
import { updateProfile } from "@/lib/actions/profileActions";
import { ArrowLeft, User, Phone, Save, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input, Label } from "@/components/core/Input";

export function PersonalDataForm({ initialData }: { initialData: { name: string, phone: string } }) {
    const router = useRouter();
    const [pending, setPending] = useState(false);

    async function handleSubmit(formData: FormData) {
        setPending(true);
        const res = await updateProfile(formData);
        setPending(false);
        if (res.success) {
            router.back();
        } else {
            alert("Erro: " + res.error);
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-40 flex items-center bg-surface px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-4 border-b border-gray-100 dark:border-gray-800">
                <button
                    onClick={() => router.back()}
                    className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-90 shadow-sm"
                >
                    <ArrowLeft className="h-5 w-5 text-foreground" />
                </button>
                <h1 className="text-lg font-bold text-foreground">Dados pessoais</h1>
            </header>

            <main className="max-w-lg mx-auto p-6">
                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-1">
                        <Label>Nome completo</Label>
                        <Input
                            name="name"
                            defaultValue={initialData.name}
                            placeholder="Seu nome"
                            leftIcon={<User className="h-5 w-5" />}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Telefone / WhatsApp</Label>
                        <Input
                            name="phone"
                            defaultValue={initialData.phone}
                            placeholder="(00) 00000-0000"
                            leftIcon={<Phone className="h-5 w-5" />}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={pending}
                        className="w-full h-14 mt-8 bg-brand text-white font-bold rounded-xl shadow-lg shadow-brand/20 hover:bg-brand-hover active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        Salvar alterações
                    </button>
                </form>
            </main>
        </div>
    );
}
