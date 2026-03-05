"use client";

import { useState } from "react";
import { createCategory, createProduct, toggleProductAvailability, createExtra, deleteExtra, updateCategory, deleteCategory, updateProduct, updateCategoryOrder } from "@/lib/actions/adminMenuActions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/core/Card";
import { Button } from "@/components/core/Button";
import { Input, Label } from "@/components/core/Input";
import { Eye, EyeOff, Plus, Trash2, ChevronDown, ChevronUp, Pencil, X, Check, Tag, Utensils, AlignLeft, Banknote, Coins, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface Category {
    id: string;
    name: string;
    station?: string;
    sort_order?: number;
    is_active?: boolean;
    [key: string]: unknown;
}

export interface ProductExtra {
    id: string;
    name: string;
    price: number | string;
    [key: string]: unknown;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number | string;
    category_id: string;
    image_url: string;
    is_available: boolean;
    product_extras?: ProductExtra[];
    [key: string]: unknown;
}

export function MenuManager({ categories, products }: { categories: Category[], products: Product[] }) {
    const [loading, setLoading] = useState(false);
    const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editCategoryName, setEditCategoryName] = useState("");
    const [editCategoryStation, setEditCategoryStation] = useState("MAIN");
    const [catError, setCatError] = useState<string | null>(null);
    const [prodError, setProdError] = useState<string | null>(null);
    const [filterCategory, setFilterCategory] = useState("all");
    const [editingProduct, setEditingProduct] = useState<string | null>(null);
    const [editProductData, setEditProductData] = useState({
        name: "", description: "", price: "", category_id: "", image_url: ""
    });
    const [editProductFile, setEditProductFile] = useState<File | null>(null);

    const filteredProducts = filterCategory === "all"
        ? products
        : products.filter((p: Product) => p.category_id === filterCategory);

    const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        await createCategory(formData);
        setLoading(false);
        (e.target as HTMLFormElement).reset();
    };

    const handleCreateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setProdError(null);
        const formData = new FormData(e.currentTarget);
        const res = await createProduct(formData);

        if (res?.error) {
            setProdError(res.error);
        } else {
            (e.target as HTMLFormElement).reset();
        }
        setLoading(false);
    };

    const handleToggle = async (productId: string, currentValue: boolean) => {
        await toggleProductAvailability(productId, currentValue);
    };

    const handleCreateExtra = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        await createExtra(formData);
        setLoading(false);
        (e.target as HTMLFormElement).reset();
    };

    const handleDeleteExtra = async (extraId: string) => {
        await deleteExtra(extraId);
    };

    const handleStartEdit = (cat: Category) => {
        setEditingCategory(cat.id);
        setEditCategoryName(cat.name);
        setEditCategoryStation(cat.station || "MAIN");
        setCatError(null);
    };

    const handleCancelEdit = () => {
        setEditingCategory(null);
        setEditCategoryName("");
        setCatError(null);
    };

    const handleSaveEdit = async (categoryId: string) => {
        if (!editCategoryName.trim()) return;
        setLoading(true);
        setCatError(null);
        const res = await updateCategory(categoryId, editCategoryName.trim(), editCategoryStation);
        if (res?.error) setCatError(res.error);
        else handleCancelEdit();
        setLoading(false);
    };

    const handleSaveProduct = async (productId: string) => {
        if (!editProductData.name.trim()) return;
        setLoading(true);

        const formData = new FormData();
        formData.append("name", editProductData.name.trim());
        formData.append("description", editProductData.description);
        formData.append("price", editProductData.price.replace(",", "."));
        formData.append("category_id", editProductData.category_id);
        formData.append("image_url", editProductData.image_url);
        if (editProductFile) {
            formData.append("image_file", editProductFile);
        }

        const res = await updateProduct(productId, formData);
        if (res?.error) {
            setProdError(res.error);
        } else {
            setEditingProduct(null);
            setEditProductFile(null);
        }
        setLoading(false);
    };

    const handleDeleteCategory = async (categoryId: string) => {
        setCatError(null);
        const res = await deleteCategory(categoryId);
        if (res?.error) setCatError(res.error);
    };

    const handleReorder = async (categoryId: string, direction: 'up' | 'down') => {
        setLoading(true);
        await updateCategoryOrder(categoryId, direction);
        setLoading(false);
    };

    return (
        <div className="space-y-0">

            <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-2">
                {/* Coluna 1: Categorias */}
                <div className="space-y-6">
                    <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-950 rounded-xl">
                        <CardHeader className="pb-4 border-b border-gray-50 dark:border-gray-900 mx-4 px-0">
                            <CardTitle className="text-xs font-black uppercase italic tracking-tighter flex items-center gap-2 text-[#2A2A2A] dark:text-white">
                                <Plus className="h-4 w-4 text-[#FA0000]" />
                                Nova Categoria
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 px-6 pb-6">
                            <form onSubmit={handleCreateCategory} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="cat_name" className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Nome</Label>
                                        <Input
                                            id="cat_name"
                                            name="name"
                                            required
                                            placeholder="Ex: Lanches, Bebidas..."
                                            className="h-11 rounded-xl text-sm font-medium focus:ring-4 ring-red-500/5 bg-gray-50/50 dark:bg-gray-900/50"
                                            leftIcon={<Tag className="h-4 w-4 text-gray-400" />}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="cat_station" className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Produção (Cozinha)</Label>
                                        <select
                                            name="station"
                                            id="cat_station"
                                            className="w-full h-11 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 px-4 text-[11px] font-black uppercase tracking-tight focus:border-[#FA0000] focus:ring-4 focus:ring-red-500/5 outline-none appearance-none"
                                        >
                                            <option value="MAIN">Montagem (Padrão)</option>
                                            <option value="GRILL">Chapa / Grill</option>
                                            <option value="DRINKS">Bar / Bebidas</option>
                                            <option value="FRY">Fritadeira</option>
                                        </select>
                                    </div>
                                </div>
                                <Button type="submit" disabled={loading} className="w-full bg-[#FA0000] hover:bg-red-600 text-white rounded-xl h-11 text-[10px] font-black uppercase tracking-[0.2em] italic shadow-lg shadow-red-500/10">
                                    {loading ? "Salvando..." : "Adicionar Categoria"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 p-8 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                            <Layers className="h-4 w-4" />
                            Categorias Atuais
                        </h3>

                        {catError && (
                            <div className="mb-6 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 text-[10px] font-black uppercase tracking-widest text-[#FA0000] italic">
                                {catError}
                            </div>
                        )}

                        {categories.length === 0 ? (
                            <div className="py-12 text-center opacity-40">
                                <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Vazio</p>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {categories.map((c: Category) => {
                                    const linkedCount = products.filter((p: Product) => p.category_id === c.id).length;
                                    const isEditing = editingCategory === c.id;

                                    return (
                                        <li key={c.id} className="group relative">
                                            <div className={cn(
                                                "p-4 rounded-xl flex items-center gap-4 transition-all border",
                                                isEditing ? "border-[#FA0000] bg-red-50/5 dark:bg-red-950/5" : "bg-gray-50/50 dark:bg-gray-900/50 border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                                            )}>
                                                {isEditing ? (
                                                    <div className="flex flex-col gap-2 w-full animate-in fade-in slide-in-from-left-2 duration-300">
                                                        <div className="flex items-center gap-3">
                                                            <Input
                                                                type="text"
                                                                value={editCategoryName}
                                                                onChange={(e) => setEditCategoryName(e.target.value)}
                                                                className="flex-1 h-10 rounded-lg text-xs font-bold uppercase tracking-tight"
                                                                autoFocus
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter") handleSaveEdit(c.id);
                                                                    if (e.key === "Escape") handleCancelEdit();
                                                                }}
                                                            />
                                                            <div className="flex gap-1">
                                                                <button onClick={() => handleSaveEdit(c.id)} className="h-9 w-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
                                                                    <Check className="h-4 w-4" />
                                                                </button>
                                                                <button onClick={handleCancelEdit} className="h-9 w-9 rounded-lg bg-gray-500 text-white flex items-center justify-center hover:bg-gray-600 transition-colors">
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <select
                                                            value={editCategoryStation}
                                                            onChange={(e) => setEditCategoryStation(e.target.value)}
                                                            className="w-full h-10 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 text-[10px] font-black uppercase focus:border-[#FA0000] outline-none"
                                                        >
                                                            <option value="MAIN">Montagem (Padrão)</option>
                                                            <option value="GRILL">Chapa / Grill</option>
                                                            <option value="DRINKS">Bar / Bebidas</option>
                                                            <option value="FRY">Fritadeira</option>
                                                        </select>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex flex-col gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => handleReorder(c.id, 'up')} disabled={loading} className="p-0.5 text-gray-400 hover:text-[#FA0000] disabled:opacity-20"><ChevronUp className="h-4 w-4" /></button>
                                                            <button onClick={() => handleReorder(c.id, 'down')} disabled={loading} className="p-0.5 text-gray-400 hover:text-[#FA0000] disabled:opacity-20"><ChevronDown className="h-4 w-4" /></button>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-sm font-black text-[#2A2A2A] dark:text-gray-100 uppercase tracking-tighter block truncate italic">{c.name}</span>
                                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">
                                                                {linkedCount} {linkedCount === 1 ? "item" : "itens"} • Estação <span className="text-[#FA0000]">{c.station || "MAIN"}</span>
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                                            <button onClick={() => handleStartEdit(c)} className="h-9 w-9 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"><Pencil className="h-4 w-4" /></button>
                                                            <button onClick={() => handleDeleteCategory(c.id)} className="h-9 w-9 rounded-lg text-gray-400 hover:bg-red-50 hover:text-[#FA0000] dark:hover:bg-red-950/20 flex items-center justify-center transition-colors"><Trash2 className="h-4 w-4" /></button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Coluna 2: Produtos */}
                <div className="space-y-6">
                    <Card className={cn(
                        "border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-950 rounded-xl transition-opacity",
                        categories.length === 0 ? "opacity-40 grayscale pointer-events-none" : ""
                    )}>
                        <CardHeader className="pb-4 border-b border-gray-50 dark:border-gray-900 mx-4 px-0">
                            <CardTitle className="text-xs font-black uppercase italic tracking-tighter flex items-center justify-between w-full text-[#2A2A2A] dark:text-white">
                                <div className="flex items-center gap-2">
                                    <Utensils className="h-4 w-4 text-[#FA0000]" />
                                    Novo Produto
                                </div>
                                {categories.length === 0 && <span className="text-[8px] font-black text-[#FA0000] italic uppercase opacity-60">Crie uma categoria primeiro</span>}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 px-6 pb-6">
                            <form onSubmit={handleCreateProduct} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="category_id" className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Categoria Principal</Label>
                                        <select
                                            name="category_id"
                                            id="category_id"
                                            required
                                            className="w-full h-11 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 px-4 text-[11px] font-black uppercase tracking-tight focus:border-[#FA0000] focus:ring-4 focus:ring-red-500/5 transition-all outline-none appearance-none"
                                        >
                                            <option value="">Selecione...</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="prod_name" className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Nome do Item</Label>
                                        <Input
                                            id="prod_name"
                                            name="name"
                                            required
                                            placeholder="Ex: X-Burger"
                                            className="h-11 rounded-xl text-[11px] font-medium focus:ring-4 focus:ring-red-500/5 bg-gray-50/50 dark:bg-gray-900/50"
                                            leftIcon={<Utensils className="h-4 w-4 text-gray-400" />}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="description" className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Descrição Comercial</Label>
                                    <Input
                                        id="description"
                                        name="description"
                                        placeholder="Ingredientes e detalhes..."
                                        className="h-11 rounded-xl text-[11px] font-medium focus:ring-4 focus:ring-red-500/5 bg-gray-50/50 dark:bg-gray-900/50 italic"
                                        leftIcon={<AlignLeft className="h-4 w-4 text-gray-400" />}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="price" className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Preço (R$)</Label>
                                        <Input
                                            id="price"
                                            name="price"
                                            required
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="25.90"
                                            className="h-11 rounded-xl text-[11px] font-black tabular-nums focus:ring-4 ring-blue-500/5 bg-gray-50/50 dark:bg-gray-900/50"
                                            leftIcon={<Banknote className="h-4 w-4 text-gray-400" />}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="image_file" className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Foto Real</Label>
                                        <div className="relative h-11">
                                            <input
                                                type="file"
                                                id="image_file"
                                                name="image_file"
                                                accept="image/*"
                                                className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                                            />
                                            <div className="flex items-center gap-3 h-full px-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 group-hover:bg-blue-50 transition-colors">
                                                <Plus className="h-4 w-4 text-gray-400" />
                                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Selecionar Foto</span>
                                            </div>
                                        </div>
                                        <input type="hidden" name="image_url" value="" />
                                    </div>
                                </div>

                                <Button type="submit" disabled={loading} className="w-full bg-[#FA0000] hover:bg-red-600 text-white rounded-xl h-11 text-[9px] font-black uppercase tracking-[0.2em] italic shadow-lg shadow-red-500/10 transition-all active:scale-95">
                                    {loading ? "Processando..." : "Subir Produto para Cardápio"}
                                </Button>
                                {prodError && <p className="text-[10px] font-black text-[#FA0000] uppercase text-center italic tracking-widest bg-red-50 dark:bg-red-950/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30">{prodError}</p>}
                            </form>
                        </CardContent>
                    </Card>

                    {/* Lista de Produtos com design system Elite */}
                    <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 shadow-sm">
                        <div className="flex flex-col gap-4 mb-6">
                            <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                <Utensils className="h-3.5 w-3.5" />
                                Itens Filtrados ({filteredProducts.length})
                            </h3>

                            {/* Filtros em Abas Contextuais */}
                            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar border-b border-gray-50 dark:border-gray-900">
                                <button
                                    onClick={() => setFilterCategory("all")}
                                    className={cn(
                                        "relative pb-3 text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap px-1",
                                        filterCategory === "all" ? "text-[#FA0000]" : "text-gray-400 hover:text-gray-600"
                                    )}
                                >
                                    Todos
                                    {filterCategory === "all" && (
                                        <motion.div
                                            layoutId="admin-menu-tab-underline"
                                            className="absolute bottom-0 left-0 right-0 h-1 bg-[#FA0000] rounded-t-full"
                                        />
                                    )}
                                </button>
                                {categories.map((c: Category) => (
                                    <button
                                        key={c.id}
                                        onClick={() => setFilterCategory(c.id)}
                                        className={cn(
                                            "relative pb-3 text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap px-1",
                                            filterCategory === c.id ? "text-[#FA0000]" : "text-gray-400 hover:text-gray-600"
                                        )}
                                    >
                                        {c.name}
                                        {filterCategory === c.id && (
                                            <motion.div
                                                layoutId="admin-menu-tab-underline"
                                                className="absolute bottom-0 left-0 right-0 h-1 bg-[#FA0000] rounded-t-full"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <AnimatePresence mode="popLayout">
                                {filteredProducts.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="py-16 text-center opacity-40 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl"
                                    >
                                        <Utensils className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p className="text-[10px] font-black uppercase tracking-widest italic">Sem correspondência</p>
                                    </motion.div>
                                ) : (
                                    filteredProducts.map((p: Product) => {
                                        const isExpanded = expandedProduct === p.id;
                                        const isEditingThis = editingProduct === p.id;
                                        const extras = p.product_extras || [];
                                        const catName = categories.find((c: Category) => c.id === p.category_id)?.name || "Geral";

                                        return (
                                            <motion.div
                                                layout
                                                key={p.id}
                                                className={cn(
                                                    "group relative flex flex-col rounded-xl border transition-all duration-500 overflow-hidden",
                                                    p.is_available
                                                        ? "bg-white dark:bg-black border-gray-100 dark:border-gray-800 hover:border-[#FA0000]/20 hover:shadow-2xl hover:shadow-red-500/5"
                                                        : "bg-red-50/20 dark:bg-red-950/5 border-red-100 dark:border-red-900/20 opacity-80"
                                                )}
                                            >
                                                {/* Top Part: Image + Info (Horizontal Layout) */}
                                                <div className="flex flex-col sm:flex-row sm:items-center">
                                                    {/* Image Wrapper */}
                                                    <div className="p-3 sm:pl-5 sm:pr-4 sm:py-4 sm:shrink-0">
                                                        <div className="aspect-square w-16 sm:w-20 rounded-xl sm:rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 relative group">
                                                            {p.image_url ? (
                                                                <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-700" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center">
                                                                    <Utensils className="h-6 w-6 text-gray-200" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Details Context */}
                                                    <div className="px-3 pb-3 sm:py-0 sm:pl-0 sm:pr-6 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                        <div className="flex-1 min-w-0 py-1 sm:py-3">
                                                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                                <h4 className="text-[13px] font-black text-[#2A2A2A] dark:text-white uppercase tracking-tighter truncate italic leading-tight">{p.name}</h4>
                                                                <div className="flex items-center gap-1.5 shrink-0">
                                                                    {!p.is_available && <span className="text-[7.5px] bg-[#FA0000] text-white px-1.2 py-0.4 rounded-lg font-black uppercase tracking-widest italic leading-none">Oculto</span>}
                                                                </div>
                                                            </div>
                                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest opacity-60 truncate">
                                                                {catName}
                                                            </p>
                                                        </div>

                                                        {/* Price & Actions Row */}
                                                        <div className="flex items-center justify-between sm:justify-end gap-5 sm:gap-6 py-3 sm:py-0 border-t sm:border-0 border-gray-50 dark:border-gray-900/50">
                                                            <div className="flex flex-col sm:items-end">
                                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5 opacity-60 italic whitespace-nowrap">Valor Sugerido</span>
                                                                <span className="text-lg font-black text-[#2A2A2A] dark:text-[#FA0000] italic tracking-tighter leading-none">
                                                                    R$ {Number(p.price).toFixed(2)}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                <button
                                                                    onClick={() => {
                                                                        if (isEditingThis) setEditingProduct(null);
                                                                        else {
                                                                            setEditingProduct(p.id);
                                                                            setEditProductData({
                                                                                name: p.name, description: p.description || "", price: String(p.price), category_id: p.category_id, image_url: p.image_url || "",
                                                                            });
                                                                        }
                                                                    }}
                                                                    className={cn(
                                                                        "h-9 px-4 flex items-center gap-2 rounded-xl border transition-all font-black text-[9px] uppercase tracking-widest italic active:scale-95",
                                                                        isEditingThis ? "bg-[#2A2A2A] text-white border-transparent" : "bg-transparent text-gray-500 border-gray-200 hover:border-[#FA0000] hover:text-[#FA0000] dark:border-gray-700 dark:text-gray-400 dark:hover:text-[#FA0000]"
                                                                    )}
                                                                >
                                                                    {isEditingThis ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                                                                    <span>{isEditingThis ? "Pronto" : "Editar"}</span>
                                                                </button>

                                                                <button
                                                                    onClick={() => setExpandedProduct(isExpanded ? null : p.id)}
                                                                    className={cn(
                                                                        "h-9 w-9 flex items-center justify-center rounded-xl transition-all border active:scale-95",
                                                                        isExpanded ? "bg-gray-100 border-gray-200 text-[#2A2A2A]" : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100 hover:text-[#FA0000]"
                                                                    )}
                                                                >
                                                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Expanded Panels (Edit / Extras) */}
                                                <AnimatePresence>
                                                    {isEditingThis && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden bg-gray-50/80 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800"
                                                        >
                                                            <div className="p-6 space-y-5 pb-8">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <h4 className="text-[10px] font-black text-[#FA0000] uppercase tracking-widest italic">Edição Técnica do Item</h4>
                                                                    <button onClick={() => setEditingProduct(null)} className="text-[9px] font-black uppercase text-gray-400 hover:text-[#FA0000] transition-colors">Cancelar</button>
                                                                </div>

                                                                <div className="grid gap-5">
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                                        <Input
                                                                            value={editProductData.name}
                                                                            onChange={(e) => setEditProductData({ ...editProductData, name: e.target.value })}
                                                                            placeholder="Nome do Produto"
                                                                            className="h-12 text-xs font-bold"
                                                                            leftIcon={<Utensils className="h-4 w-4" />}
                                                                        />
                                                                        <select
                                                                            value={editProductData.category_id}
                                                                            onChange={(e) => setEditProductData({ ...editProductData, category_id: e.target.value })}
                                                                            className="w-full h-12 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 text-[10px] font-black uppercase focus:ring-4 ring-red-500/5 transition-all outline-none"
                                                                        >
                                                                            {categories.map((c: Category) => (
                                                                                <option key={c.id} value={c.id}>{c.name}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>

                                                                    <Input
                                                                        value={editProductData.description}
                                                                        onChange={(e) => setEditProductData({ ...editProductData, description: e.target.value })}
                                                                        placeholder="Descrição detalhada (ingredientes, peso...)"
                                                                        className="h-12 text-xs italic"
                                                                        leftIcon={<AlignLeft className="h-4 w-4" />}
                                                                    />

                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                                        <Input
                                                                            value={editProductData.price}
                                                                            onChange={(e) => setEditProductData({ ...editProductData, price: e.target.value })}
                                                                            placeholder="Preço (R$)"
                                                                            type="number"
                                                                            step="0.01"
                                                                            className="h-12 text-xs font-black tabular-nums"
                                                                            leftIcon={<Banknote className="h-4 w-4" />}
                                                                        />
                                                                        <div className="relative h-12">
                                                                            <input
                                                                                type="file"
                                                                                accept="image/*"
                                                                                onChange={(e) => setEditProductFile(e.target.files?.[0] || null)}
                                                                                className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                                                                            />
                                                                            <div className="flex items-center gap-3 h-full px-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                                                                                <Plus className="h-4 w-4 text-gray-400" />
                                                                                <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest truncate">{editProductFile ? editProductFile.name : "Substituir Imagem"}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-col sm:flex-row gap-3">
                                                                    <button
                                                                        onClick={() => handleToggle(p.id, p.is_available)}
                                                                        className={cn(
                                                                            "flex-1 h-12 flex items-center justify-center gap-2 rounded-xl transition-all border font-black text-[10px] uppercase tracking-widest italic active:scale-95",
                                                                            p.is_available
                                                                                ? "bg-white text-emerald-500 border-emerald-100 hover:bg-emerald-50/50"
                                                                                : "bg-red-50 text-[#FA0000] border-red-200 hover:bg-red-100"
                                                                        )}
                                                                    >
                                                                        {p.is_available ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                                        {p.is_available ? "Item Visível" : "Item Oculto"}
                                                                    </button>

                                                                    <button
                                                                        onClick={() => handleSaveProduct(p.id)}
                                                                        disabled={loading}
                                                                        className="flex-[2] h-12 rounded-xl bg-[#FA0000] text-white text-[11px] font-black uppercase tracking-widest italic hover:bg-red-600 disabled:opacity-50 shadow-xl shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                                                                    >
                                                                        {loading ? (
                                                                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                        ) : (
                                                                            <Check className="h-5 w-5" />
                                                                        )}
                                                                        {loading ? "Sincronizando..." : "Confirmar Alterações"}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}

                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-gray-800"
                                                        >
                                                            <div className="p-6 space-y-6">
                                                                <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                                    <Plus className="h-3 w-3" />
                                                                    Personalização e Adicionais (Extras)
                                                                </h4>

                                                                {extras.length > 0 ? (
                                                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                        {extras.map((ex: ProductExtra) => (
                                                                            <li key={ex.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-50 dark:border-gray-800 shadow-sm hover:border-[#FA0000]/20 transition-all group">
                                                                                <span className="text-[11px] font-bold text-[#2A2A2A] dark:text-gray-200 uppercase tracking-tight">{ex.name}</span>
                                                                                <div className="flex items-center gap-4">
                                                                                    <span className="text-[11px] font-black text-[#FA0000] tabular-nums italic">+ R$ {Number(ex.price).toFixed(2)}</span>
                                                                                    <button
                                                                                        onClick={() => handleDeleteExtra(ex.id)}
                                                                                        className="text-gray-300 hover:text-[#FA0000] p-1.5 transition-all hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"
                                                                                    >
                                                                                        <Trash2 className="h-4 w-4" />
                                                                                    </button>
                                                                                </div>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                ) : (
                                                                    <div className="py-10 text-center border-2 border-dotted border-gray-100 dark:border-gray-800 rounded-xl opacity-40">
                                                                        <p className="text-[9px] font-black uppercase tracking-widest italic">Sem acompanhamentos vinculados</p>
                                                                    </div>
                                                                )}

                                                                <form onSubmit={handleCreateExtra} className="flex items-center gap-3 pt-4 border-t border-gray-50 dark:border-gray-900/50">
                                                                    <input type="hidden" name="product_id" value={p.id} />
                                                                    <div className="flex-[2]">
                                                                        <Input
                                                                            name="extra_name"
                                                                            required
                                                                            placeholder="Ex: Bacon Extra"
                                                                            className="h-11 text-[10px] font-black uppercase"
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <Input
                                                                            name="extra_price"
                                                                            required
                                                                            type="number"
                                                                            step="0.01"
                                                                            min="0"
                                                                            placeholder="Valor"
                                                                            className="h-11 text-[10px] font-black tabular-nums"
                                                                        />
                                                                    </div>
                                                                    <button
                                                                        type="submit"
                                                                        className="h-11 w-11 flex items-center justify-center rounded-xl bg-[#FA0000] text-white hover:bg-red-600 shadow-xl shadow-red-500/10 transition-all active:scale-90"
                                                                    >
                                                                        <Plus className="h-5 w-5" />
                                                                    </button>
                                                                </form>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </AnimatePresence>
                        </div>
                    </div >
                </div >
            </div >
        </div >
    );
}
