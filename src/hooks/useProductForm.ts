"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClientClient } from '@/lib/supabaseClient';
import { sanitizeText } from '@/lib/sanitize';

// --- INTERFACES ---
export interface FormData {
    name: string;
    brand: string;
    category_id: string;
    product_type_id: string;
    price: string;
    featured: boolean;
    description: string;
    ingredients: string;
    usage: string;
    size: string;
    tokopedia_url: string;
    shopee_url: string;
}

// --- HELPER BARU: DYNAMIC IMPORT IMAGE COMPRESSION ---
// Sesuai request: menggunakan dynamic import agar library diload saat dibutuhkan saja
export const compressImage = async (file: File) => {
    const imageCompression = (await import('browser-image-compression')).default;

    const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
    };

    const compressedFile = await imageCompression(file, options);

    return compressedFile;
};

// --- HELPER UNTUK MEMBERSIHKAN DATA JSON YANG RUSAK/BERLAPIS ---
function parseSupabaseData(val: any): string[] {
    if (!val) return [];

    try {
        // Case 1: Jika sudah berbentuk Array
        if (Array.isArray(val)) {
            // Cek apakah ini array yang berisi JSON string kotor? Contoh: ["[\"Normal\"]"]
            if (val.length > 0 && typeof val[0] === 'string' && (val[0].startsWith('[') || val[0].startsWith('"['))) {
                try {
                    // Coba parse isi array index ke-0
                    const parsedInner = JSON.parse(val[0]);
                    // Rekursif: Panggil fungsi ini lagi untuk hasil parsing tersebut
                    return parseSupabaseData(parsedInner);
                } catch (e) {
                    // Jika gagal parse, kembalikan apa adanya
                    return val.map(String);
                }
            }
            // Jika array normal ['Normal', 'Oily']
            return val.map(String);
        }

        // Case 2: Jika berbentuk String
        if (typeof val === "string") {
            const trimmed = val.trim();
            // Jika terlihat seperti JSON array "[...]"
            if (trimmed.startsWith('[')) {
                try {
                    const parsed = JSON.parse(trimmed);
                    return parseSupabaseData(parsed); // Rekursif
                } catch (e) {
                    // Fallback jika JSON invalid
                }
            }
            // Fallback: Pisahkan berdasarkan koma biasa "A, B, C"
            return trimmed.split(',').map(s => s.trim()).filter(Boolean);
        }
    } catch (error) {
        console.error("Gagal parsing data:", val, error);
    }

    return [];
}

export function useProductForm({ productId }: { productId?: string | null } = {}) {
    const router = useRouter();
    const isEditMode = !!productId;

    const [formData, setFormData] = useState<FormData>({
        name: '', brand: '', category_id: '', product_type_id: '',
        price: '', featured: false, description: '', ingredients: '',
        usage: '', size: '', tokopedia_url: '', shopee_url: '',
    });

    const [categoriesList, setCategoriesList] = useState<{ id: string; name: string }[]>([]);
    const [productTypesList, setProductTypesList] = useState<{ id: string; name: string; category_id: string }[]>([]);
    const [skinTypes, setSkinTypes] = useState<string[]>([]);
    const [concerns, setConcerns] = useState<string[]>([]);
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [existingImage, setExistingImage] = useState<string | null>(null);
    
    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(isEditMode); 
    
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const skinTypeOptions = useMemo(() => ['Normal', 'Combination', 'Dry', 'Sensitive', 'Oily', 'Acne-prone'], []);
    const concernOptions = useMemo(() => ['Acne', 'Dullness', 'Large Pores', 'Wrinkles', 'Aging', 'Fine Lines', 'Dark Spots', 'Hyperpigmentation', 'Redness', 'Uneven Skin Tone'], []);

    // Load Data Kategori & Tipe
    useEffect(() => {
        const loadInitialData = async () => {
            const supabase = createClientClient();
            const [catRes, typeRes] = await Promise.all([
                supabase.from('categories').select('id, name').order('name'),
                supabase.from('product_types').select('id, name, category_id').order('name')
            ]);
            if (catRes.data) setCategoriesList(catRes.data);
            if (typeRes.data) setProductTypesList(typeRes.data as any);
        };
        loadInitialData();
    }, []);

    // Load Data Produk jika Edit Mode
    useEffect(() => {
        if (isEditMode && productId) {
            const fetchProduct = async () => {
                setIsInitialLoading(true);
                try {
                    const supabase = createClientClient();
                    const { data: p, error: fetchErr } = await supabase
                        .from('products')
                        .select('*')
                        .eq('id', productId)
                        .single();

                    if (p && !fetchErr) {
                        setFormData({
                            name: p.name || '',
                            brand: p.brand || '',
                            category_id: String(p.category_id || ''),
                            product_type_id: String(p.product_type_id || ''),
                            price: String(p.price || ''),
                            featured: !!p.featured,
                            description: p.description || '',
                            ingredients: Array.isArray(p.ingredients) ? p.ingredients.join(', ') : (p.ingredients || ''),
                            usage: p.how_to_use || '',
                            size: p.size || '',
                            tokopedia_url: p.tokopedia_url || '',
                            shopee_url: p.shopee_url || '',
                        });

                        // Gunakan helper parseSupabaseData untuk menangani JSON kotor
                        setSkinTypes(parseSupabaseData(p.skin_type));
                        setConcerns(parseSupabaseData(p.concerns));
                        
                        setExistingImage(p.image || null);
                    }
                } catch (err) {
                    console.error("Error fetching product:", err);
                } finally {
                    setIsInitialLoading(false);
                }
            };
            fetchProduct();
        } else {
            setIsInitialLoading(false);
        }
    }, [productId, isEditMode]);

    // Hitung Progress Form
    useEffect(() => {
        const requiredFields = [formData.name, formData.brand, formData.category_id, formData.price, formData.description];
        const filled = requiredFields.filter(Boolean).length + (image || existingImage ? 1 : 0);
        setProgress(Math.round((filled / (requiredFields.length + 1)) * 100));
    }, [formData, image, existingImage]);

    // --- LOGIKA IMAGE CHANGE YANG DIPERBARUI MENGGUNAKAN HELPER BARU ---
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validasi tipe file
            if (!file.type.startsWith('image/')) {
                alert('File harus berupa gambar');
                return;
            }

            try {
                console.log(`[Check] Ukuran asli: ${(file.size / 1024).toFixed(2)} KB`);
                
                // Panggil fungsi compressImage yang baru dibuat
                const compressedFile = await compressImage(file);
                
                console.log(`[Check] Hasil kompresi: ${(compressedFile.size / 1024).toFixed(2)} KB`);
                
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setImage(compressedFile);
                setPreviewUrl(URL.createObjectURL(compressedFile));
            } catch (error) {
                console.error("Gagal melakukan kompresi gambar, pakai file asli:", error);
                // Fallback ke file asli jika error
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setImage(file);
                setPreviewUrl(URL.createObjectURL(file));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const supabase = createClientClient();
            let finalImageUrl = existingImage;

            if (image) {
                // Penanganan Ekstensi File
                let fileExt = image.name.split('.').pop();
                
                // Jika tipe filenya JPEG (hasil kompresi biasanya jadi blob/jpeg), pastikan ekstensi sesuai
                if (image.type === 'image/jpeg' || image.type === 'image/jpg') {
                     // Jika aslinya png tapi dikompres jadi jpeg, kita prefer simpan sbg jpg
                     if (fileExt !== 'jpg' && fileExt !== 'jpeg') {
                        fileExt = 'jpg';
                     }
                }
                
                const fileName = `${Date.now()}_product.${fileExt}`;
                
                const { error: upErr } = await supabase.storage.from('bucket1').upload(`products/${fileName}`, image, {
                    contentType: image.type, 
                    cacheControl: '3600',
                    upsert: false
                });

                if (upErr) throw upErr;
                finalImageUrl = supabase.storage.from('bucket1').getPublicUrl(`products/${fileName}`).data.publicUrl;
            }

            // Pastikan data ingredients menjadi array bersih
            const ingredientsList = typeof formData.ingredients === 'string' 
                ? formData.ingredients.split(',').map(i => i.trim()).filter(Boolean)
                : [];

            const payload = {
                name: sanitizeText(formData.name),
                brand: sanitizeText(formData.brand),
                category_id: formData.category_id ? parseInt(formData.category_id) : null,
                product_type_id: formData.product_type_id ? parseInt(formData.product_type_id) : null,
                price: parseFloat(formData.price) || 0,
                description: sanitizeText(formData.description),
                featured: formData.featured,
                ingredients: ingredientsList, 
                how_to_use: formData.usage,
                size: formData.size,
                skin_type: skinTypes, // Kirim array murni, Supabase client akan handle formatnya
                concerns: concerns,   // Kirim array murni
                tokopedia_url: formData.tokopedia_url,
                shopee_url: formData.shopee_url,
                image: finalImageUrl
            };

            const { error: saveErr } = isEditMode 
                ? await supabase.from('products').update(payload).eq('id', productId)
                : await supabase.from('products').insert([payload]);

            if (saveErr) throw saveErr;

            setSuccess(isEditMode ? 'Produk berhasil diperbarui!' : 'Produk berhasil dibuat!');
            setTimeout(() => router.push('/dashboard/products'), 1500);
        } catch (err: any) {
            setError(err.message || 'Gagal menyimpan data');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        formData, setFormData, categoriesList, productTypesList,
        skinTypes, setSkinTypes, concerns, setConcerns,
        isLoading, isInitialLoading, previewUrl, existingImage, 
        onImageSelect: handleImageChange,
        onRemoveImage: () => { setImage(null); setPreviewUrl(null); setExistingImage(null); },
        handleSubmit, progress, error, success,
        skinTypeOptions, concernOptions, isEditMode,
        addNewCategory: async (name: string) => {
            const supabase = createClientClient();
            const { data, error } = await supabase.from('categories').insert({ name }).select().single();
            if (error) throw error;
            setCategoriesList(prev => [...prev, data]);
            return data;
        }
    };
}