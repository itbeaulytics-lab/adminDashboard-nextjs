import React from 'react';
import { Package, AlertCircle } from 'lucide-react';
import { FormData } from "@/features/products/hooks/useProductForm";

import { BasicInfoSection } from "./form-sections/BasicInfoSection";
import { ProductDetailSection } from "./form-sections/ProductDetailSection";
import { ProductOptionsSection } from "./form-sections/ProductOptionsSection";
import { MarketplaceSection } from "./form-sections/MarketplaceSection";
import { CategoryModal } from "./form-sections/CategoryModal";

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

    const sanitize = (val: string) => val;
    const [showCategoryModal, setShowCategoryModal] = React.useState(false);
    const [newCategoryName, setNewCategoryName] = React.useState('');
    const [isAddingCategory, setIsAddingCategory] = React.useState(false);

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
                <BasicInfoSection
                    formData={formData}
                    setFormData={setFormData}
                    categoriesList={categoriesList}
                    productTypesList={productTypesList}
                    isEditMode={isEditMode}
                    handleSeedData={handleSeedData}
                    seeding={seeding}
                    setShowCategoryModal={setShowCategoryModal}
                />

                <ProductDetailSection
                    formData={formData}
                    setFormData={setFormData}
                    previewUrl={previewUrl}
                    existingImage={existingImage}
                    onImageSelect={onImageSelect}
                    onRemoveImage={onRemoveImage}
                >
                    <ProductOptionsSection
                        skinTypeOptions={skinTypeOptions}
                        concernOptions={concernOptions}
                        skinTypes={skinTypes}
                        setSkinTypes={setSkinTypes}
                        concerns={concerns}
                        setConcerns={setConcerns}
                    />
                </ProductDetailSection>

                <MarketplaceSection
                    formData={formData}
                    setFormData={setFormData}
                />

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

            <CategoryModal
                showCategoryModal={showCategoryModal}
                setShowCategoryModal={setShowCategoryModal}
                newCategoryName={newCategoryName}
                setNewCategoryName={setNewCategoryName}
                handleAddCategory={handleAddCategory}
                isAddingCategory={isAddingCategory}
            />
        </div>
    );
}
