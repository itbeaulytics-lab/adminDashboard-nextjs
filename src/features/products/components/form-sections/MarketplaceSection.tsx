import React from 'react';
import { Link as LinkIcon } from 'lucide-react';
import { FormData } from "@/features/products/hooks/useProductForm";

interface MarketplaceSectionProps {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export function MarketplaceSection({
    formData,
    setFormData
}: MarketplaceSectionProps) {
    return (
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
    );
}
