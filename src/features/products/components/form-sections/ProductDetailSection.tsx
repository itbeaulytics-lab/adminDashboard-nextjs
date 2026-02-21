import React from 'react';
import { FlaskConical } from 'lucide-react';
import ImageUploader from "@/shared/components/upload/ImageUploader";
import { FormData } from "@/features/products/hooks/useProductForm";

interface ProductDetailSectionProps {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    previewUrl: string | null;
    existingImage: string | null;
    onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: () => void;
    children?: React.ReactNode;
}

export function ProductDetailSection({
    formData,
    setFormData,
    previewUrl,
    existingImage,
    onImageSelect,
    onRemoveImage,
    children
}: ProductDetailSectionProps) {
    return (
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

                {children}
            </div>
        </section>
    );
}
