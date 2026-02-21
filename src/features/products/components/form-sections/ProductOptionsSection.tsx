import React from 'react';

interface ProductOptionsSectionProps {
    skinTypeOptions: string[];
    concernOptions: string[];
    skinTypes: string[];
    setSkinTypes: React.Dispatch<React.SetStateAction<string[]>>;
    concerns: string[];
    setConcerns: React.Dispatch<React.SetStateAction<string[]>>;
}

export function ProductOptionsSection({
    skinTypeOptions,
    concernOptions,
    skinTypes,
    setSkinTypes,
    concerns,
    setConcerns
}: ProductOptionsSectionProps) {
    return (
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
    );
}
