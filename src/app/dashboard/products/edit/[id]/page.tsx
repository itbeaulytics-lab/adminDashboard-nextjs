'use client';

 import { useEffect, useMemo, useState } from 'react';
 import { useRouter, useParams } from 'next/navigation';
 import { createClientClient } from '@/lib/supabaseClient';
 

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    price: '',
    featured: false,
    description: '',
    ingredients: '',
    usage: '',
    size: '',
    tokopedia_url: '',
    shopee_url: '',
  });
  const [skinTypes, setSkinTypes] = useState<string[]>([]);
  const [concerns, setConcerns] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const categories = useMemo(
    () => ['serum', 'cleanser', 'toner', 'moisturizer', 'sunscreen', 'mask', 'essence', 'tonic'],
    []
  );
  const skinTypeOptions = useMemo(
    () => ['Normal', 'Combination', 'Dry', 'Sensitive', 'Oily', 'Acne-prone'],
    []
  );
  const concernOptions = useMemo(
    () => [
      'Acne',
      'Dullness',
      'Large Pores',
      'Wrinkles',
      'Aging',
      'Fine Lines',
      'Dark Spots',
      'Hyperpigmentation',
      'Redness',
      'Uneven Skin Tone',
    ],
    []
  );

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return; // wait until param is available
      try {
        const supabase = createClientClient();
        // Support numeric IDs and string IDs
        const idValue: any = /^\d+$/.test(String(id)) ? Number(id) : id;
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', idValue)
          .single();

        if (error) throw error;
        if (data) {
          setProduct(data);
          setFormData({
            name: data.name || '',
            brand: data.brand || '',
            category: data.category || '',
            price: (data.price ?? '').toString(),
            featured: Boolean(data.featured),
            description: data.description || '',
            ingredients: Array.isArray(data.ingredients) ? (data.ingredients as string[]).join(', ') : (data.ingredients || ''),
            usage: data.how_to_use || '',
            size: data.size || '',
            tokopedia_url: data.tokopedia_url || '',
            shopee_url: data.shopee_url || '',
          });
          setSkinTypes(Array.isArray(data.skin_type) ? data.skin_type as string[] : (typeof data.skin_type === 'string' && data.skin_type ? data.skin_type.split(',').map((s:string)=>s.trim()).filter(Boolean) : []));
          setConcerns(Array.isArray(data.concerns) ? data.concerns as string[] : (typeof data.concerns === 'string' && data.concerns ? data.concerns.split(',').map((s:string)=>s.trim()).filter(Boolean) : []));
          setImagePreview(data.image || null);
        }
      } catch (error) {
        try {
          const msg = (error as any)?.message || JSON.stringify(error);
          console.error('Error fetching product:', msg);
        } catch {
          console.error('Error fetching product:', error);
        }
        setError('Produk tidak ditemukan');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const checks: boolean[] = [
      !!formData.name.trim(),
      !!formData.brand.trim(),
      !!formData.category.trim(),
      !!formData.price.trim(),
      !!formData.description.trim(),
      !!formData.ingredients.trim(),
      skinTypes.length > 0,
      concerns.length > 0,
      !!formData.usage.trim(),
      !!formData.size.trim(),
      !!formData.tokopedia_url.trim(),
      !!formData.shopee_url.trim(),
      Boolean(imagePreview || image),
    ];
    const filled = checks.filter(Boolean).length;
    setProgress(Math.round((filled / checks.length) * 100));
  }, [formData, skinTypes, concerns, image, imagePreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClientClient();
      let imageUrl: string | null = product?.image || null;

      // Upload gambar baru jika ada
      if (image) {
        // Hapus gambar lama jika ada (dan diketahui bucket/path)
        const oldUrl: string | undefined = product?.image || undefined;
        if (oldUrl) {
          const m = oldUrl.match(/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
          if (m && m[1] && m[2]) {
            try { await supabase.storage.from(m[1]).remove([m[2]]); } catch {}
          }
        }

        // Upload gambar baru
        const fileExt = image.name.split('.').pop() || 'jpg';
        const fileName = `${id}-${Date.now()}-${Math.random().toString(36).slice(2,8)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('bucket1')
          .upload(filePath, image, { contentType: image.type });

        if (uploadError) throw uploadError;

        // Dapatkan URL publik
        const { data: urlData } = supabase.storage
          .from('bucket1')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      // Build payload sesuai schema
      const priceNum = Number(formData.price);
      const ingredientsArr = formData.ingredients
        ? formData.ingredients.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const payload: any = {
        name: formData.name,
        brand: formData.brand || null,
        category: formData.category || null,
        description: formData.description,
        price: Number.isFinite(priceNum) ? priceNum : 0,
        featured: !!formData.featured,
        ingredients: ingredientsArr,
        how_to_use: formData.usage || null,
        size: formData.size || null,
        skin_type: skinTypes,
        concerns: concerns,
        image: imageUrl,
        tokopedia_url: formData.tokopedia_url || null,
        shopee_url: formData.shopee_url || null,
      };

      const idValue: any = /^\d+$/.test(String(id)) ? Number(id) : id;
      const { error: updateError } = await supabase
        .from('products')
        .update(payload)
        .eq('id', idValue);

      if (updateError) throw updateError;

      setSuccess('Perubahan berhasil disimpan');
      setTimeout(() => {
        router.push('/dashboard/products');
        router.refresh();
      }, 1200);
    } catch (error: any) {
      console.error('Error updating product:', error);
      setError(error.message || 'Gagal mengupdate produk');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
        <div className="mt-4">
          <button
            onClick={() => router.push('/dashboard/products')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Kembali ke Daftar Produk
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="text-center mt-4 mb-6">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl">✏️</div>
        <h1 className="text-3xl font-extrabold mt-3 text-gray-900 dark:text-white">Edit Produk Kosmetik</h1>
        <p className="text-gray-500 dark:text-gray-400">Perbarui data produk di katalog</p>
        <div className="mt-4 h-2 w-full rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div className="h-full bg-indigo-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-indigo-500">📘</span> Info Dasar Produk
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Nama, brand, kategori, dan harga</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">Nama Produk *</label>
              <input type="text" value={formData.name} onChange={(e)=>setFormData({...formData,name:e.target.value})} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">Brand *</label>
              <input type="text" value={formData.brand} onChange={(e)=>setFormData({...formData,brand:e.target.value})} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">Kategori *</label>
              <select value={formData.category} onChange={(e)=>setFormData({...formData,category:e.target.value})} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                <option value="">Pilih kategori produk</option>
                {categories.map(c=> <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">Harga (Rp) *</label>
              <input type="number" value={formData.price} onChange={(e)=>setFormData({...formData,price:e.target.value})} min="0" step="1" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
          </div>
          <label className="mt-3 inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={formData.featured} onChange={(e)=>setFormData({...formData,featured:e.target.checked})} className="h-4 w-4" />
            Jadikan produk unggulan (featured)
          </label>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-purple-500">🖼️</span> Detail Produk
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Upload gambar dan deskripsi produk</p>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Gambar Produk</label>
            <div className="border-2 border-dashed rounded-xl p-6 text-center text-sm text-gray-500 dark:text-gray-400">
              <input type="file" accept="image/*" onChange={handleImageChange} className="mx-auto" />
              <p className="mt-2">Klik untuk pilih gambar atau drag and drop</p>
              <p className="text-xs">PNG, JPG, HEIC (max. 5MB)</p>
            </div>
            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt="Preview" className="max-h-48 rounded" />
              </div>
            )}
          </div>
          <div className="mt-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Deskripsi Produk</label>
            <textarea value={formData.description} onChange={(e)=>setFormData({...formData,description:e.target.value})} rows={4} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Deskripsi singkat tentang produk ini..." required />
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-emerald-500">🧪</span> Spesifikasi Produk
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Ingredients, jenis kulit, dan masalah kulit yang ditangani</p>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Ingredients (pisahkan dengan koma)</label>
            <input type="text" value={formData.ingredients} onChange={(e)=>setFormData({...formData,ingredients:e.target.value})} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Aqua, Glycerin, Niacinamide, ..." />
          </div>
          <div className="mb-2">
            <p className="font-semibold text-lg text-gray-900 dark:text-white">Jenis Kulit Yang Cocok</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {skinTypeOptions.map(opt => (
              <label key={opt} className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={skinTypes.includes(opt)} onChange={(e)=> setSkinTypes(prev => e.target.checked ? [...prev, opt] : prev.filter(x=>x!==opt))} />
                {opt}
              </label>
            ))}
          </div>
          <div className="mt-4">
            <p className="font-semibold text-lg text-gray-900 dark:text-white">Masalah Kulit Yang di Tangani</p>
          </div>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {concernOptions.map(opt => (
              <label key={opt} className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={concerns.includes(opt)} onChange={(e)=> setConcerns(prev => e.target.checked ? [...prev, opt] : prev.filter(x=>x!==opt))} />
                {opt}
              </label>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-amber-500">📄</span> Info Tambahan
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Cara penggunaan dan ukuran produk</p>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Cara Penggunaan</label>
            <textarea value={formData.usage} onChange={(e)=>setFormData({...formData,usage:e.target.value})} rows={3} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Aplikasikan pada wajah yang sudah dibersihkan..." />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Ukuran/Volume</label>
            <input type="text" value={formData.size} onChange={(e)=>setFormData({...formData,size:e.target.value})} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="50ml, 100ml, 236ml, dll" />
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-blue-500">🛍️</span> Tautan Marketplace
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Masukkan URL produk di Tokopedia dan Shopee (opsional)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">Tokopedia URL</label>
              <input type="url" placeholder="https://www.tokopedia.com/..." value={formData.tokopedia_url} onChange={(e)=>setFormData({...formData,tokopedia_url:e.target.value})} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">Shopee URL</label>
              <input type="url" placeholder="https://shopee.co.id/..." value={formData.shopee_url} onChange={(e)=>setFormData({...formData,shopee_url:e.target.value})} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={() => router.push('/dashboard/products')} className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline">
            Batal
          </button>
          <button type="submit" disabled={loading} className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50">
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>

      {success && (
        <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {success}
        </div>
      )}
    </div>
  );
}