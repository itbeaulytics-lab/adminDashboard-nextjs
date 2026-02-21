import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClientClient } from '@/lib/supabaseClient';
import { sanitizeText } from '@/lib/sanitize';

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

function toList(val: any): string[] {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(String);
    if (typeof val === "string") {
        return val.split(',').map(s => s.trim()).filter(Boolean);
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
    const [isInitialLoading, setIsInitialLoading] = useState(isEditMode); // Untuk mencegah error build Vercel
    
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
                        setSkinTypes(toList(p.skin_type));
                        setConcerns(toList(p.concerns));
                        // Menggunakan kolom 'image' sesuai skema SQL
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
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
                const fileExt = image.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const { error: upErr } = await supabase.storage.from('bucket1').upload(`products/${fileName}`, image);
                if (upErr) throw upErr;
                finalImageUrl = supabase.storage.from('bucket1').getPublicUrl(`products/${fileName}`).data.publicUrl;
            }

            const payload = {
                name: sanitizeText(formData.name),
                brand: sanitizeText(formData.brand),
                category_id: formData.category_id ? parseInt(formData.category_id) : null,
                product_type_id: formData.product_type_id ? parseInt(formData.product_type_id) : null,
                price: parseFloat(formData.price) || 0,
                description: sanitizeText(formData.description),
                featured: formData.featured,
                ingredients: toList(formData.ingredients),
                how_to_use: formData.usage,
                size: formData.size,
                skin_type: skinTypes,
                concerns: concerns,
                tokopedia_url: formData.tokopedia_url,
                shopee_url: formData.shopee_url,
                image: finalImageUrl // Menggunakan kunci 'image' agar sesuai tabel products
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