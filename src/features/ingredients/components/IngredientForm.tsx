"use client";

import { Ingredient } from "@/features/ingredients/types";
import { Beaker, Save, X, RefreshCw, CheckCircle2 } from "lucide-react";
import { useIngredientForm } from "../hooks/useIngredientForm";

export default function IngredientForm({ initialData }: { initialData?: Ingredient }) {
    const {
        formData,
        setFormData,
        loading,
        successMsg,
        handleNameChange,
        handleSubmit,
        isEdit,
        router,
    } = useIngredientForm(initialData);

    return (
        <div className="mx-auto max-w-7xl pt-4 pb-20 px-0 md:px-8">
            <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 relative items-start">

                {/* --- MAIN COLUMN (Editor) --- */}
                <div className="flex-1 w-full space-y-10 min-w-0 bg-white dark:bg-[#121212] p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">

                    {/* Title Area */}
                    <div>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={handleNameChange}
                            className="w-full text-4xl md:text-6xl font-black text-gray-900 dark:text-white bg-transparent outline-none placeholder:text-gray-300 dark:placeholder:text-gray-800 tracking-tight leading-tight"
                            placeholder="Nama Kandungan..."
                            required
                        />
                    </div>

                    {/* Deskripsi Area */}
                    <div className="prose dark:prose-invert max-w-none w-full">
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full text-xl text-gray-700 dark:text-gray-300 leading-relaxed bg-transparent outline-none placeholder:text-gray-300 dark:placeholder:text-gray-800 resize-none min-h-[250px]"
                            placeholder="Mulai menulis detail lengkap tentang kandungan ini (fungsi utama, efek, dsb)..."
                            required
                        />
                    </div>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Manfaat Area */}
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-sm font-bold tracking-widest text-blue-600 uppercase">
                            <Beaker size={18} /> Manfaat Spesifik
                        </label>
                        <textarea
                            value={formData.benefits}
                            onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                            rows={5}
                            className="w-full text-lg text-gray-700 dark:text-gray-300 bg-blue-50/30 dark:bg-blue-900/10 p-6 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 border border-blue-100 dark:border-blue-900/30 resize-none transition-all placeholder:text-gray-400"
                            placeholder="Sebutkan berbagai manfaat kulit dari kandungan ini (misal: mencerahkan, melembapkan, anti-aging)..."
                            required
                        />
                    </div>
                </div>

                {/* --- SIDEBAR --- */}
                <div className="w-full lg:w-[360px] flex flex-col gap-6 shrink-0 lg:sticky lg:top-24">

                    {/* Publishing Action */}
                    <div className="bg-white dark:bg-[#121212] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 animate-in slide-in-from-bottom-4 duration-500">
                        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center justify-between">
                            Publishing
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                {isEdit ? 'Editing' : 'Draft'}
                            </span>
                        </h3>

                        <div className="flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 px-4 text-sm font-bold tracking-wide rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                                {loading ? 'Menyimpan...' : (isEdit ? 'Update Kandungan' : 'Simpan Kandungan')}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push("/dashboard/ingredients")}
                                className="w-full py-3 px-4 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <X size={18} /> Batal
                            </button>
                        </div>
                    </div>

                    {/* Metadata Settings */}
                    <div className="bg-white dark:bg-[#121212] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
                        <h3 className="font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800">
                            Pengaturan Metadata
                        </h3>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                                Tingkat Keamanan
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.safety_level}
                                    onChange={(e) => setFormData({ ...formData, safety_level: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-medium appearance-none cursor-pointer"
                                >
                                    <option value="Aman">🟢 Aman</option>
                                    <option value="Hati-hati untuk Kulit Sensitif">🟡 Hati-hati (Sensitif)</option>
                                    <option value="Perlu Resep Dokter">🔴 Perlu Resep Dokter</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    ▼
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                                Slug URL
                            </label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => isEdit && setFormData({ ...formData, slug: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-gray-600 dark:text-gray-400 font-mono text-sm"
                                readOnly={!isEdit}
                                required
                            />
                            {!isEdit && <p className="text-[11px] font-medium text-gray-400 mt-1">✓ Terisi otomatis (Auto-generated)</p>}
                        </div>
                    </div>
                </div>
            </form>

            {/* Success Toast */}
            {successMsg && (
                <div className="fixed bottom-10 right-10 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-bottom-5 flex items-center gap-3">
                    <CheckCircle2 size={24} />
                    <span className="font-bold">{successMsg}</span>
                </div>
            )}
        </div>
    );
}
