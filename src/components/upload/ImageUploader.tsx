import React, { useRef } from 'react';
import { Image as ImageIcon, Trash2, UploadCloud, RefreshCw } from 'lucide-react';

interface ImageUploaderProps {
    previewUrl: string | null;
    onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
}

export default function ImageUploader({ previewUrl, onImageSelect, onRemove }: ImageUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            if (fileInputRef.current) {
                const files = e.dataTransfer.files;
                fileInputRef.current.files = files;

                // Synthetic event
                const syntheticEvent = {
                    target: { files: files },
                } as unknown as React.ChangeEvent<HTMLInputElement>;

                onImageSelect(syntheticEvent);
            }
        }
    };

    const triggerFileSelect = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="w-full">
            <input
                ref={fileInputRef}
                id="image"
                type="file"
                accept="image/*"
                onChange={onImageSelect}
                className="hidden"
            />

            {previewUrl ? (
                <div className="relative w-full aspect-square rounded-xl overflow-hidden group bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                        <button
                            type="button"
                            onClick={triggerFileSelect}
                            className="flex items-center gap-2 px-4 py-2 bg-white/90 text-gray-900 rounded-lg hover:bg-white transition-colors shadow-lg font-medium text-sm"
                        >
                            <RefreshCw size={16} />
                            Ganti
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg font-medium text-sm"
                        >
                            <Trash2 size={16} />
                            Hapus
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    className="relative w-full aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-gray-50 dark:bg-gray-800/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center p-6 group"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={triggerFileSelect}
                >
                    <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-gray-400 group-hover:text-indigo-500 group-hover:scale-110 transition-all duration-300 mb-4 border border-gray-100 dark:border-gray-700">
                        <UploadCloud size={32} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            Klik untuk upload gambar
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            atau drag and drop file di sini
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
