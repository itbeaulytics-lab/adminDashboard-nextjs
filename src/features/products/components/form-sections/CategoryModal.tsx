import React from 'react';
import { X } from 'lucide-react';

interface CategoryModalProps {
    showCategoryModal: boolean;
    setShowCategoryModal: React.Dispatch<React.SetStateAction<boolean>>;
    newCategoryName: string;
    setNewCategoryName: React.Dispatch<React.SetStateAction<string>>;
    handleAddCategory: () => Promise<void>;
    isAddingCategory: boolean;
}

export function CategoryModal({
    showCategoryModal,
    setShowCategoryModal,
    newCategoryName,
    setNewCategoryName,
    handleAddCategory,
    isAddingCategory
}: CategoryModalProps) {
    if (!showCategoryModal) return null;

    return (
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
    );
}
