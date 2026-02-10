import React from 'react';
import { Package, FileText, FlaskConical, Link as LinkIcon, AlertCircle } from 'lucide-react';
import ImageUploader from '@/components/upload/ImageUploader';
import { FormData } from '@/hooks/useProductForm'; // Import interface

interface ProductFormProps {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;

    // Lists
    categoriesList: { id: string; name: string }[];
    productTypesList: { id: string; name: string }[];
    skinTypeOptions: string[];
    concernOptions: string[];

    // Selections
    skinTypes: string[];
    setSkinTypes: React.Dispatch<React.SetStateAction<string[]>>;
    concerns: string[];
    setConcerns: React.Dispatch<React.SetStateAction<string[]>>;

    // Image
    previewUrl: string | null;
    existingImage: string | null;
    onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: () => void;

    // Actions
    handleSubmit: (e: React.FormEvent) => void;
    handleSeedData?: () => void;

    // Status
    isLoading: boolean;
    seeding?: boolean;
    progress: number;
    error: string | null;
    success: string | null;
    isEditMode: boolean;
    onCancel: () => void;
}

export default function ProductForm({
    formData, setFormData,
    categoriesList, productTypesList,
    skinTypeOptions, concernOptions,
    skinTypes, setSkinTypes,
    concerns, setConcerns,
    previewUrl, existingImage, onImageSelect, onRemoveImage,
    handleSubmit, handleSeedData,
    isLoading, seeding, progress, error, success,
    isEditMode, onCancel
}: ProductFormProps) {

    const sanitize = (val: string) => val;

    return (
        <div className="container mx-auto max-w-5xl py-8">
            {/* Header */}
            <div className="text-center mb-10">
                <div className="mx-auto w-16 h-16 rounded-3xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                    <Package size={32} />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {isEditMode ? 'Edit Produk' : 'Upload Produk Kosmetik'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                    {isEditMode ? 'Perbarui informasi dan detail produk' : 'Tambahkan produk baru ke dalam katalog'}
                </p>

                {/* Progress Bar */}
                <div className="mt-8 h-1 w-full max-w-md mx-auto rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2 mb-6 animate-pulse">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Info Dasar */}
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
                            <div className="relative">
                                <select
                                    id="category"
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="">Pilih kategori produk</option>
                                    {categoriesList.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                            </div>
                            {!isEditMode && categoriesList.length === 0 && handleSeedData && (
                                <button type="button" onClick={handleSeedData} disabled={seeding} className="text-xs text-indigo-600 hover:text-indigo-500 font-medium">
                                    {seeding ? 'Mengisi data...' : 'Data kosong? Isi Default'}
                                </button>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="product_type">Tipe Produk <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select
                                    id="product_type"
                                    value={formData.product_type_id}
                                    onChange={(e) => setFormData({ ...formData, product_type_id: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="">Pilih tipe produk</option>
                                    {productTypesList.map((t) => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
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

                {/* Detail Produk */}
                <section className="bg-white dark:bg-[#121212] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                            <FlaskConical size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-gray-900 dark:text-white">Detail Produk</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Upload gambar dan deskripsi produk</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Gambar Produk</label>
                            <ImageUploader
                                previewUrl={previewUrl || existingImage}
                                onImageSelect={onImageSelect}
                                onRemove={onRemoveImage}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="description">Deskripsi Produk <span className="text-red-500">*</span></label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-y min-h-[100px]"
                                placeholder="Jelaskan detail produk secara lengkap..."
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ingredients (pisahkan dengan koma)</label>
                            <textarea
                                value={formData.ingredients}
                                onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-none"
                                placeholder="Ex: Aqua, Glycerin, Niacinamide..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cara Penggunaan</label>
                                <textarea
                                    value={formData.usage}
                                    onChange={(e) => setFormData({ ...formData, usage: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-none"
                                    placeholder="Ex: Aplikasikan pada wajah..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ukuran/Volume</label>
                                <input
                                    type="text"
                                    value={formData.size}
                                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                    placeholder="Ex: 50ml"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Jenis Kulit Yang Cocok</h3>
                                <div className="flex flex-wrap gap-2">
                                    {skinTypeOptions.map((opt) => (
                                        <label key={opt} className={`cursor-pointer px-4 py-2 rounded-full text-sm border transition-all ${skinTypes.includes(opt) ? 'bg-purple-600 border-purple-600 text-white shadow-md' : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-purple-300'}`}>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={skinTypes.includes(opt)}
                                                onChange={(e) => setSkinTypes((prev) => e.target.checked ? [...prev, opt] : prev.filter((x) => x !== opt))}
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Masalah Kulit Yang Ditangani</h3>
                                <div className="flex flex-wrap gap-2">
                                    {concernOptions.map((opt) => (
                                        <label key={opt} className={`cursor-pointer px-4 py-2 rounded-full text-sm border transition-all ${concerns.includes(opt) ? 'bg-purple-600 border-purple-600 text-white shadow-md' : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-purple-300'}`}>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={concerns.includes(opt)}
                                                onChange={(e) => setConcerns((prev) => e.target.checked ? [...prev, opt] : prev.filter((x) => x !== opt))}
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Marketplace Links */}
                <section className="bg-white dark:bg-[#121212] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                            <LinkIcon size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-gray-900 dark:text-white">Tautan Marketplace</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Masukkan URL produk (opsional)</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="tokopedia_url">Tokopedia URL</label>
                            <input
                                id="tokopedia_url"
                                type="url"
                                placeholder="https://www.tokopedia.com/..."
                                value={formData.tokopedia_url}
                                onChange={(e) => setFormData({ ...formData, tokopedia_url: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="shopee_url">Shopee URL</label>
                            <input
                                id="shopee_url"
                                type="url"
                                placeholder="https://shopee.co.id/..."
                                value={formData.shopee_url}
                                onChange={(e) => setFormData({ ...formData, shopee_url: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                            />
                        </div>
                    </div>
                </section>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
                    >
                        {isLoading ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Simpan Produk')}
                    </button>
                </div>
            </form>

            {success && (
                <div className="fixed bottom-10 right-10 bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-bounce flex items-center gap-3">
                    <div className="p-1 bg-white/20 rounded-full"><Package size={16} /></div>
                    <span className="font-medium">{success}</span>
                </div>
            )}
        </div>
    );
}
