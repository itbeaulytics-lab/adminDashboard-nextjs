import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClientClient } from '@/lib/supabaseClient';
import { sanitizeText, sanitizeUrl, sanitizeStringArray } from '@/lib/sanitize';

export interface FormData {
    name: string;
    brand: string;
    category_id: string; // Used for insert/update (mapped from category name if needed, but better to use ID)
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

// Helper to parse array strings from DB
function toList(val: any): string[] {
    if (!val && val !== 0) return [];
    if (Array.isArray(val)) return val.map((x) => String(x)).filter(Boolean);
    if (typeof val === "string") {
        const s = val.trim();
        if (!s) return [];
        try {
            const parsed = JSON.parse(s);
            if (Array.isArray(parsed)) return parsed.map((x: any) => String(x));
        } catch { }
        return s
            .replace(/[\[\]\{\}"]+/g, "")
            .split(/[,;]|\s{2,}/)
            .map((x) => x.trim())
            .filter(Boolean);
    }
    return [String(val)];
}

function getProductImage(p: any): string | null {
    const candidates = [
        "image_url",
        "image",
        "img",
        "imageUrl",
        "image_src",
        "imageLink",
        "image_link",
    ];
    for (const k of candidates) {
        const v = p?.[k];
        if (typeof v === "string" && v.trim()) return v.trim();
    }
    return null;
}

interface UseProductFormProps {
    productId?: string | null;
}

export function useProductForm({ productId }: UseProductFormProps = {}) {
    const router = useRouter();
    const isEditMode = !!productId;

    // State
    const [formData, setFormData] = useState<FormData>({
        name: '',
        brand: '',
        category_id: '',
        product_type_id: '',
        price: '',
        featured: false,
        description: '',
        ingredients: '',
        usage: '',
        size: '',
        tokopedia_url: '',
        shopee_url: '',
    });

    const [categoriesList, setCategoriesList] = useState<{ id: string; name: string }[]>([]);
    const [productTypesList, setProductTypesList] = useState<{ id: string; name: string }[]>([]);
    const [skinTypes, setSkinTypes] = useState<string[]>([]);
    const [concerns, setConcerns] = useState<string[]>([]);
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [existingImage, setExistingImage] = useState<string | null>(null);

    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(false);
    const [seeding, setSeeding] = useState(false);

    // UI Functionality states
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [progress, setProgress] = useState<number>(0);

    // Constants
    const skinTypeOptions = useMemo(
        () => ['Normal', 'Combination', 'Dry', 'Sensitive', 'Oily', 'Acne-prone'],
        []
    );

    const concernOptions = useMemo(
        () => [
            'Acne', 'Dullness', 'Large Pores', 'Wrinkles', 'Aging',
            'Fine Lines', 'Dark Spots', 'Hyperpigmentation', 'Redness', 'Uneven Skin Tone',
        ],
        []
    );

    // Fetch Dropdown Data & Initial Product Data
    useEffect(() => {
        const init = async () => {
            setIsInitialLoading(true);
            try {
                const supabase = createClientClient();

                // 1. Fetch Categories & Types (Parallel)
                const [catRes, typeRes] = await Promise.all([
                    supabase.from('categories').select('id, name').order('name'),
                    supabase.from('product_types').select('id, name').order('name')
                ]);

                if (catRes.error) console.error('Error fetching categories:', catRes.error);
                if (typeRes.error) console.error('Error fetching types:', typeRes.error);

                const cats = catRes.data || [];
                const types = typeRes.data || [];

                setCategoriesList(cats);
                setProductTypesList(types);

                // 2. If Edit Mode, Fetch Product
                if (isEditMode && productId) {
                    const { data, error } = await supabase
                        .from('products')
                        .select('*')
                        .eq('id', productId)
                        .single();

                    if (error) throw error;

                    const p: any = data || {};

                    let catId = p.category_id || '';
                    if (!catId && p.category) {
                        // Try to find by name if ID is missing (legacy support)
                        const found = cats.find(c => c.name.toLowerCase() === p.category.toLowerCase());
                        if (found) catId = found.id;
                    }

                    let typeId = p.product_type_id || '';
                    if (!typeId && p.product_type) { // Assuming product_type column exists or similar
                        const found = types.find(t => t.name.toLowerCase() === (p.product_type || '').toLowerCase());
                        if (found) typeId = found.id;
                    }

                    setFormData({
                        name: sanitizeText(p.name || ""),
                        brand: sanitizeText(p.brand || ""),
                        category_id: catId,
                        product_type_id: typeId,
                        price: String(p.price ?? ""),
                        featured: !!p.featured,
                        description: sanitizeText(p.description || ""),
                        ingredients: Array.isArray(p.ingredients)
                            ? (p.ingredients as any[]).map((x) => String(x)).join(", ")
                            : sanitizeText(p.ingredients || ""),
                        usage: sanitizeText(p.how_to_use || ""),
                        size: sanitizeText(p.size || ""),
                        tokopedia_url: sanitizeUrl(p.tokopedia_url || ""),
                        shopee_url: sanitizeUrl(p.shopee_url || ""),
                    });

                    setSkinTypes(toList(p.skin_type));
                    setConcerns(toList(p.concerns));
                    setExistingImage(getProductImage(p));
                }

            } catch (e: any) {
                console.error('Error initializing form:', e);
                setError(e.message || 'Gagal memuat data.');
            } finally {
                setIsInitialLoading(false);
            }
        };

        if (isEditMode && productId) {
            init();
        } else {
            // Just fetch dropdowns
            const fetchDropdowns = async () => {
                const supabase = createClientClient();
                const [catRes, typeRes] = await Promise.all([
                    supabase.from('categories').select('id, name').order('name'),
                    supabase.from('product_types').select('id, name').order('name')
                ]);
                if (catRes.data) setCategoriesList(catRes.data);
                if (typeRes.data) setProductTypesList(typeRes.data);
            }
            fetchDropdowns();
        }
    }, [productId, isEditMode]);


    // Progress Calculation
    useEffect(() => {
        const checks: boolean[] = [
            !!formData.name.trim(),
            !!formData.brand.trim(),
            !!formData.category_id,
            !!formData.product_type_id,
            !!formData.price.trim(),
            !!formData.description.trim(),
            !!formData.ingredients.trim(),
            skinTypes.length > 0,
            concerns.length > 0,
            !!formData.usage.trim(),
            !!formData.size.trim(),
            !!formData.tokopedia_url.trim(),
            !!formData.shopee_url.trim(),
            (!!image || !!existingImage),
        ];
        const filled = checks.filter(Boolean).length;
        const total = checks.length;
        setProgress(Math.round((filled / total) * 100));
    }, [formData, skinTypes, concerns, image, existingImage]);

    // Handlers
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setImage(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setPreviewUrl(null);
        }
    };

    const onRemoveImage = () => {
        setImage(null);
        setPreviewUrl(null);
        setExistingImage(null);
    };

    const handleSeedData = async () => {
        if (!confirm('Ini akan mengisi database dengan data kategori default. Lanjutkan?')) return;
        setSeeding(true);
        try {
            const res = await fetch('/api/seed');
            const data = await res.json();
            if (data.success) {
                alert('Berhasil mengisi data default! Halaman akan dimuat ulang.');
                window.location.reload();
            } else {
                throw new Error(data.error || 'Gagal seeding');
            }
        } catch (err: any) {
            alert('Gagal mengisi data: ' + err.message);
        } finally {
            setSeeding(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        const errors: string[] = [];
        const priceNum = Number(sanitizeText(formData.price));
        const isValidUrl = (v: string) => {
            if (!v) return true;
            try { new URL(v); return true; } catch { return false; }
        };

        if (!sanitizeText(formData.name).trim()) errors.push('Nama wajib diisi');
        if (!sanitizeText(formData.brand).trim()) errors.push('Brand wajib diisi');
        if (!formData.category_id) errors.push('Kategori wajib diisi');
        // if (!formData.product_type_id) errors.push('Tipe Produk wajib diisi'); // Optional validation? Upload page had it required.

        if (!sanitizeText(formData.description).trim()) errors.push('Deskripsi wajib diisi');
        if (!Number.isFinite(priceNum) || priceNum <= 0) errors.push('Harga harus angka > 0');

        if (errors.length) {
            setError(errors.join(' • '));
            setIsLoading(false);
            return;
        }

        try {
            const supabase = createClientClient();

            // Image Upload
            let newImageUrl: string | null = null;
            if (image) {
                const fileExt = image.name.split('.').pop() || 'jpg';
                const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
                const filePath = `products/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('bucket1')
                    .upload(filePath, image, { contentType: image.type });

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = await supabase.storage
                    .from('bucket1')
                    .getPublicUrl(filePath);

                newImageUrl = publicUrlData.publicUrl;
            }

            // Prepare Payload
            const payload: any = {
                name: sanitizeText(formData.name),
                brand: sanitizeText(formData.brand),
                category_id: formData.category_id,
                product_type_id: formData.product_type_id || null,
                description: sanitizeText(formData.description),
                price: priceNum,
                featured: !!formData.featured,
                ingredients: toList(formData.ingredients),

                how_to_use: sanitizeText(formData.usage) || null,
                size: sanitizeText(formData.size) || null,
                skin_type: sanitizeStringArray(skinTypes || []),
                concerns: sanitizeStringArray(concerns || []),
                tokopedia_url: sanitizeUrl(formData.tokopedia_url) || null,
                shopee_url: sanitizeUrl(formData.shopee_url) || null,
            };

            if (isEditMode) {
                if (newImageUrl) payload.image = newImageUrl;
                const ingArray = sanitizeText(formData.ingredients).split(',').map(x => x.trim()).filter(Boolean);
                payload.ingredients = ingArray;

                const { error: updateError } = await supabase
                    .from('products')
                    .update(payload)
                    .eq('id', productId);

                if (updateError) throw updateError;
                setSuccess('Produk berhasil diperbarui');
            } else {
                const body = new FormData();
                Object.keys(formData).forEach(key => {
                    // @ts-ignore
                    const val = formData[key];
                    if (key === 'skinTypes' || key === 'concerns') return;
                    body.append(key, String(val));
                });

                body.append('skin_types', JSON.stringify(skinTypes));
                body.append('concerns', JSON.stringify(concerns));

                if (image) body.append('image', image);

                body.append('ingredients', formData.ingredients);
                body.append('usage', formData.usage);

                const res = await fetch('/api/products', { method: 'POST', body });
                if (!res.ok) {
                    const d = await res.json();
                    throw new Error(d.error || 'Gagal membuat produk');
                }
                setSuccess('Produk berhasil dibuat');
            }

            setTimeout(() => {
                router.push('/dashboard/products');
                router.refresh();
            }, 1200);

        } catch (err: any) {
            console.error(err);
            setError(err?.message || 'Terjadi kesalahan saat menyimpan produk.');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        formData,
        setFormData,
        categoriesList,
        productTypesList,
        skinTypes,
        setSkinTypes,
        concerns,
        setConcerns,
        isLoading,
        isInitialLoading,
        previewUrl,
        existingImage,
        onImageSelect: handleImageChange,
        onRemoveImage,
        handleSubmit,
        handleSeedData,
        addNewCategory: async (name: string) => {
            try {
                const supabase = createClientClient();
                const { data, error } = await supabase
                    .from('categories')
                    .insert({ name })
                    .select()
                    .single();

                if (error) throw error;
                if (data) {
                    setCategoriesList((prev) => [...prev, data]);
                    setFormData((prev) => ({ ...prev, category_id: data.id })); // Auto select
                    return data;
                }
            } catch (err: any) {
                console.error('Error adding category:', err);
                throw err;
            }
        },
        seeding,
        progress,
        error,
        success,
        skinTypeOptions,
        concernOptions,
        isEditMode
    };
}
