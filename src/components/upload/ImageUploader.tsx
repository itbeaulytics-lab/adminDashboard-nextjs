import React, { useRef } from 'react';
import { Image as ImageIcon, Trash2, UploadCloud } from 'lucide-react';

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

    return (
        <div className="w-full">
            <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer group ${previewUrl ? 'border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => !previewUrl && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={onImageSelect}
                    className="hidden"
                />

                {previewUrl ? (
                    <div className="relative inline-block w-full max-w-sm mx-auto group-image">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-64 rounded-lg shadow-md object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center backdrop-blur-sm">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove();
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl shadow-lg transform hover:scale-110 transition-all flex items-center gap-2"
                            >
                                <Trash2 size={20} />
                                <span className="font-medium">Hapus Gambar</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 space-y-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <UploadCloud size={32} />
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">Klik untuk upload gambar</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">atau drag and drop file di sini</p>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">PNG, JPG, HEIC up to 5MB</p>
                    </div>
                )}
            </div>
        </div>
    );
}
