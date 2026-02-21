import React, { useMemo } from 'react';
import { FileText, Plus } from 'lucide-react';
import { FormData } from "@/features/products/hooks/useProductForm";
import { SearchableSelect } from "@/shared/components/SearchableSelect";

interface BasicInfoSectionProps {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    categoriesList: { id: string; name: string }[];
    productTypesList: { id: string; name: string; category_id?: string | number }[];
    isEditMode: boolean;
    handleSeedData?: () => void;
    seeding?: boolean;
    setShowCategoryModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export function BasicInfoSection({
    formData,
    setFormData,
    categoriesList,
    productTypesList,
    isEditMode,
    handleSeedData,
    seeding,
    setShowCategoryModal
}: BasicInfoSectionProps) {
    const availableProductTypes = useMemo(() => {
        if (!formData.category_id) return [];
        return productTypesList.filter(
            (type: any) => String(type.category_id) === String(formData.category_id)
        );
    }, [formData.category_id, productTypesList]);

    return (
        <section className="bg-white dark:bg-[#121212] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <FileText size={20} />
                </div>
                <div>
                    <h2 className="font-bold text-xl text-gray-900 dark:text-white">Info Dasar Produk</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nama, brand, kategori, dan harga produk</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="name">Nama Produk <span className="text-red-500">*</span></label>
                    <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                        placeholder="Ex: Facial Wash"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="brand">Brand <span className="text-red-500">*</span></label>
                    <input
                        id="brand"
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                        placeholder="Ex: Wardah"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="category">Kategori <span className="text-red-500">*</span></label>
                    <div className="flex gap-2 items-center">
                        <div className="flex-1">
                            <SearchableSelect
                                id="category"
                                options={categoriesList}
                                value={formData.category_id}
                                onChange={(val) => setFormData({ ...formData, category_id: val, product_type_id: '' })}
                                placeholder="Pilih kategori produk"
                                required
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowCategoryModal(true)}
                            className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors shrink-0"
                            title="Tambah Kategori Baru"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>
                {!isEditMode && categoriesList.length === 0 && handleSeedData && (
                    <button type="button" onClick={handleSeedData} disabled={seeding} className="text-xs text-indigo-600 hover:text-indigo-500 font-medium mt-1">
                        {seeding ? 'Mengisi data...' : 'Data kosong? Isi Default'}
                    </button>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="product_type">Tipe Produk <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <SearchableSelect
                            id="product_type"
                            options={availableProductTypes}
                            value={formData.product_type_id}
                            onChange={(val) => setFormData({ ...formData, product_type_id: val })}
                            placeholder={formData.category_id ? "Pilih tipe produk" : "Pilih kategori dahulu"}
                            disabled={!formData.category_id}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="price">Harga (Rp) <span className="text-red-500">*</span></label>
                    <input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        min="0"
                        step="1"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                        placeholder="Ex: 50000"
                        required
                    />
                </div>
            </div>

            <div className="mt-6 flex items-center">
                <label className="relative inline-flex items-center cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-900 rounded-full dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    <span className="ms-3 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Jadikan produk unggulan (featured)</span>
                </label>
            </div>
        </section>
    );
}
