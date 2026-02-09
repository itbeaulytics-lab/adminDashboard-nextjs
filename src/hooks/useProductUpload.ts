import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClientClient } from '@/lib/supabaseClient';
import { sanitizeText, sanitizeUrl, sanitizeStringArray } from '@/lib/sanitize';

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

export function useProductUpload() {
    const router = useRouter();

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

    // Loading states
    const [isLoading, setIsLoading] = useState(false);
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

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const supabase = createClientClient();

                const { data: categoriesData, error: catError } = await supabase
                    .from('categories')
                    .select('id, name')
                    .order('name');

                if (catError) console.error('Error fetching categories:', catError);
                if (categoriesData && categoriesData.length > 0) {
                    setCategoriesList(categoriesData);
                }

                const { data: typesData, error: typeError } = await supabase
                    .from('product_types')
                    .select('id, name')
                    .order('name');

                if (typeError) console.error('Error fetching types:', typeError);
                if (typesData && typesData.length > 0) {
                    setProductTypesList(typesData);
                }
            } catch (e) {
                console.error('Error fetching dropdown data:', e);
                setError('Gagal mengambil data. Cek koneksi internet atau database.');
            }
        };
        fetchData();
    }, []);

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
            !!image,
        ];
        const filled = checks.filter(Boolean).length;
        const total = checks.length;
        setProgress(Math.round((filled / total) * 100));
    }, [formData, skinTypes, concerns, image]);

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

    const onRemove = () => {
        setImage(null);
        setPreviewUrl(null);
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
        setProgress(0);
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
        if (!formData.product_type_id) errors.push('Tipe Produk wajib diisi');
        if (!sanitizeText(formData.description).trim()) errors.push('Deskripsi wajib diisi');
        if (!Number.isFinite(priceNum) || priceNum <= 0) errors.push('Harga harus angka > 0');

        if (errors.length) {
            setError(errors.join(' • '));
            setIsLoading(false);
            return;
        }

        try {
            const body = new FormData();
            body.append('name', sanitizeText(formData.name));
            body.append('brand', sanitizeText(formData.brand));
            body.append('category_id', formData.category_id);
            body.append('product_type_id', formData.product_type_id);
            body.append('description', sanitizeText(formData.description));
            body.append('price', String(priceNum));
            body.append('featured', String(!!formData.featured));
            body.append('ingredients', sanitizeText(formData.ingredients) || '');
            body.append('usage', sanitizeText(formData.usage) || '');
            body.append('size', sanitizeText(formData.size) || '');
            body.append('skin_types', JSON.stringify(sanitizeStringArray(skinTypes || [])));
            body.append('concerns', JSON.stringify(sanitizeStringArray(concerns || [])));
            body.append('tokopedia_url', sanitizeUrl(formData.tokopedia_url) || '');
            body.append('shopee_url', sanitizeUrl(formData.shopee_url) || '');
            if (image) body.append('image', image);

            const res = await fetch('/api/products', { method: 'POST', body });

            if (!res.ok) {
                const payload = await res.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(payload.error || 'Gagal menambahkan produk');
            }

            setSuccess('Produk berhasil disimpan');
            setTimeout(() => {
                router.push('/dashboard/products');
                router.refresh();
            }, 1200);
        } catch (err: any) {
            setError(err?.message || 'Gagal menambahkan produk');
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
        previewUrl,
        onImageSelect: handleImageChange,
        onRemove,
        handleSubmit,
        handleSeedData,
        seeding,
        progress,
        error,
        success,
        skinTypeOptions,
        concernOptions
    };
}
