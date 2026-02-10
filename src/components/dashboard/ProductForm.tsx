import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Package, FileText, FlaskConical, Link as LinkIcon, AlertCircle, Plus, X, ChevronDown, Check, Search } from 'lucide-react';
import ImageUploader from '@/components/upload/ImageUploader';
import { FormData } from '@/hooks/useProductForm';

// --- KOMPONEN DROPDOWN KEREN (INTERNAL) ---
interface SearchableSelectProps {
    label: string;
    options: { id: string | number; name: string }[];
    value: string | number;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    onAddNew?: () => void; // Tombol plus
}

const SearchableSelect = ({ label, options, value, onChange, placeholder, disabled, required, onAddNew }: SearchableSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // Cari nama item yang sedang dipilih untuk ditampilkan di tombol
    const selectedItem = options.find(opt => String(opt.id) === String(value));

    // Filter list berdasarkan search
    const filteredOptions = options.filter(opt =>
        opt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Tutup dropdown kalau klik di luar
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="space-y-2 relative" ref={containerRef}>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            
            {/* TRIGGER BUTTON (Tampilan Input) */}
            <div className="flex gap-2">
                <div 
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={`
                        relative w-full px-4 py-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all
                        ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60' : 'bg-gray-50 dark:bg-[#0a0a0a] hover:bg-white dark:hover:bg-black'}
                        ${isOpen ? 'ring-2 ring-indigo-500 border-transparent' : 'border-gray-200 dark:border-gray-800'}
                    `}
                >
                    <span className={`block truncate ${!selectedItem ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                        {selectedItem ? selectedItem.name : placeholder}
                    </span>
                    <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Tombol Plus (Opsional untuk Kategori) */}
                {onAddNew && (
                    <button
                        type="button"
                        onClick={onAddNew}
                        className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors flex-shrink-0"
                        title="Tambah Baru"
                    >
                        <Plus size={20} />
                    </button>
                )}
            </div>

            {/* DROPDOWN MENU (Muncul saat diklik) */}
            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#1e1e1e] rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    
                    {/* Search Bar Sticky */}
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-[#1e1e1e]">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Cari..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* List Items */}
                    <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.id}
                                    onClick={() => {
                                        onChange(String(option.id));
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className={`
                                        flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors
                                        ${String(value) === String(option.id) 
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium' 
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}
                                    `}
                                >
                                    <span>{option.name}</span>
                                    {String(value) === String(option.id) && <Check size={14} />}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                Tidak ditemukan "{searchTerm}"
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- MAIN COMPONENT ---

interface ProductFormProps {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;

    // Lists
    categoriesList: { id: string | number; name: string }[];
    productTypesList: { id: string | number; name: string; category_id: string | number }[]; // Note: category_id included
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
    addNewCategory?: (name: string) => Promise<any>;

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
    handleSubmit, handleSeedData, addNewCategory,
    isLoading, seeding, progress, error, success,
    isEditMode, onCancel
}: ProductFormProps) {

    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);

    // Filter Tipe Produk sesuai Kategori yang dipilih
    const availableProductTypes = useMemo(() => {
        if (!formData.category_id) return [];
        return productTypesList.filter((type) => {
            const typeCatId = String(type.category_id);
            const selectedCatId = String(formData.category_id);
            return typeCatId === selectedCatId;
        });
    }, [formData.category_id, productTypesList]);

    const handleAddCategory = async () => {
        if (!newCategoryName.trim() || !addNewCategory) return;
        setIsAddingCategory(true);
        try {
            await addNewCategory(newCategoryName);
            setShowCategoryModal(false);
            setNewCategoryName('');
        } catch (error) {
            console.error(error);
            alert('Gagal menambah kategori');
        } finally {
            setIsAddingCategory(false);
        }
    };

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

                        {/* --- KATEGORI (CUSTOM DROPDOWN) --- */}
                        <SearchableSelect
                            label="Kategori"
                            required
                            options={categoriesList}
                            value={formData.category_id}
                            onChange={(val) => {
                                setFormData({ 
                                    ...formData, 
                                    category_id: val,
                                    product_type_id: '' // Reset tipe saat kategori berubah
                                });
                            }}
                            placeholder="Pilih kategori produk"
                            onAddNew={() => setShowCategoryModal(true)}
                        />

                        {/* --- TIPE PRODUK (CUSTOM DROPDOWN) --- */}
                        <SearchableSelect
                            label="Tipe Produk"
                            required
                            options={availableProductTypes}
                            value={formData.product_type_id}
                            onChange={(val) => setFormData({ ...formData, product_type_id: val })}
                            placeholder={formData.category_id ? "Pilih tipe produk" : "Pilih kategori terlebih dahulu"}
                            disabled={!formData.category_id}
                        />

                        {/* Harga */}
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

                    {/* Checkbox Featured */}
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

                    {!isEditMode && categoriesList.length === 0 && handleSeedData && (
                        <div className="mt-4">
                            <button type="button" onClick={handleSeedData} disabled={seeding} className="text-xs text-indigo-600 hover:text-indigo-500 font-medium">
                                {seeding ? 'Mengisi data...' : 'Data kosong? Isi Default'}
                            </button>
                        </div>
                    )}
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

                        {/* Options Skin & Concerns */}
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

                {/* Footer Buttons */}
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
            
            {/* Quick Add Category Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tambah Kategori Baru</h3>
                            <button
                                onClick={() => setShowCategoryModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nama Kategori
                                </label>
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Contoh: Serum"
                                    className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCategoryModal(false)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddCategory}
                                    disabled={isAddingCategory || !newCategoryName.trim()}
                                    className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isAddingCategory ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}