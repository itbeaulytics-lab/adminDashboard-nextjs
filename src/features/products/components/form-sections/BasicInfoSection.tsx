import React, { useMemo, useState } from 'react';
import { FileText, ChevronDown } from 'lucide-react';
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
}

export function BasicInfoSection({
    formData,
    setFormData,
    categoriesList,
    productTypesList,
    isEditMode,
    handleSeedData,
    seeding
}: BasicInfoSectionProps) {
    const availableProductTypes = useMemo(() => {
        if (!formData.category_id) return [];
        return productTypesList.filter(
            (type: any) => String(type.category_id) === String(formData.category_id)
        );
    }, [formData.category_id, productTypesList]);

    // State untuk custom dropdown "Tambah category"
    const [isCustomCategoryOpen, setIsCustomCategoryOpen] = useState(false);
    const defaultCategories = ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen', 'Sunblock'];
    
    // Filter opsi berdasarkan teks yang diketik user
    const filteredCategories = defaultCategories.filter(c => 
        c.toLowerCase().includes((formData.category || '').toLowerCase())
    );

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

            {/* Grid Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Baris 1 */}
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

                {/* Baris 2 */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="category">Kategori <span className="text-red-500">*</span></label>
                    <SearchableSelect
                        id="category"
                        options={categoriesList}
                        value={formData.category_id}
                        onChange={(val) => setFormData({ ...formData, category_id: val, product_type_id: '' })}
                        placeholder="Pilih kategori produk"
                        required
                    />
                    {!isEditMode && categoriesList.length === 0 && handleSeedData && (
                        <button type="button" onClick={handleSeedData} disabled={seeding} className="text-xs text-indigo-600 hover:text-indigo-500 font-medium mt-1 block">
                            {seeding ? 'Mengisi data...' : 'Data kosong? Isi Default'}
                        </button>
                    )}
                </div>

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

                {/* Baris 3 */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="price">Harga (Rp) <span className="text-red-500">*</span></label>
                    <div className="relative">
                        {/* Teks "Rp" nempel di dalam input */}
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-gray-500 dark:text-gray-400 font-medium sm:text-sm">Rp</span>
                        </div>
                        <input
                            id="price"
                            type="text" 
                            inputMode="numeric" // Membuka numpad di HP
                            value={formData.price ? new Intl.NumberFormat('id-ID').format(parseInt(formData.price, 10)) : ''}
                            onChange={(e) => {
                                // Hapus semua karakter selain angka biar state cuma nyimpen string angka murni
                                const rawValue = e.target.value.replace(/\D/g, '');
                                setFormData({ ...formData, price: rawValue });
                            }}
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                            placeholder="50.000"
                            required
                        />
                    </div>
                </div>

                {/* Sub Kategori / Tambah Category (Sebelah kanan Harga) */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="sub_category">Tambah Category <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <div className="relative flex items-center">
                            <input
                                id="sub_category"
                                type="text"
                                value={formData.category || ''}
                                onChange={(e) => {
                                    setFormData({ ...formData, category: e.target.value });
                                    setIsCustomCategoryOpen(true);
                                }}
                                onFocus={() => setIsCustomCategoryOpen(true)}
                                onBlur={() => setTimeout(() => setIsCustomCategoryOpen(false), 200)}
                                placeholder="Pilih dari list atau ketik baru..."
                                required
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 pr-10"
                            />
                            <ChevronDown size={20} className="absolute right-3 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Dropdown Menu */}
                        {isCustomCategoryOpen && (
                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg max-h-48 overflow-y-auto py-1 animate-in fade-in zoom-in-95 duration-100">
                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50">
                                    Rekomendasi
                                </div>
                                {filteredCategories.length > 0 ? (
                                    filteredCategories.map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => {
                                                setFormData({ ...formData, category: cat });
                                                setIsCustomCategoryOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                        >
                                            {cat}
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                        Akan ditambahkan: <span className="font-semibold text-indigo-600 dark:text-indigo-400">"{formData.category}"</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
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