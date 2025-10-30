'use client';

 import { useEffect, useMemo, useState } from 'react';
 import { useRouter } from 'next/navigation';

export default function UploadProductPage() {
  const router = useRouter();
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
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [success, setSuccess] = useState<string | null>(null);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Progress bar: hitung persentase field yang terisi
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
      !!image, // gambar dipilih
    ];
    const filled = checks.filter(Boolean).length;
    const total = checks.length;
    setProgress(Math.round((filled / total) * 100));
  }, [formData, skinTypes, concerns, image]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setProgress(0);
    setSuccess(null);

    const errors: string[] = [];
    const priceNum = Number(formData.price);
    const isValidUrl = (v: string) => {
      if (!v) return true;
      try { new URL(v); return true; } catch { return false; }
    };
    if (!formData.name.trim()) errors.push('Nama wajib diisi');
    if (!formData.brand.trim()) errors.push('Brand wajib diisi');
    if (!formData.category.trim()) errors.push('Kategori wajib diisi');
    if (!formData.description.trim()) errors.push('Deskripsi wajib diisi');
    if (!Number.isFinite(priceNum) || priceNum <= 0) errors.push('Harga harus angka > 0');
    if (!isValidUrl(formData.tokopedia_url)) errors.push('Tokopedia URL tidak valid');
    if (!isValidUrl(formData.shopee_url)) errors.push('Shopee URL tidak valid');

    if (errors.length) {
      setError(errors.join(' • '));
      setLoading(false);
      return;
    }

    try {
      const body = new FormData();
      body.append('name', formData.name);
      body.append('brand', formData.brand);
      body.append('category', formData.category);
      body.append('description', formData.description);
      body.append('price', String(priceNum));
      body.append('featured', String(!!formData.featured));
      body.append('ingredients', formData.ingredients || '');
      body.append('usage', formData.usage || '');
      body.append('size', formData.size || '');
      body.append('skin_types', JSON.stringify(skinTypes || []));
      body.append('concerns', JSON.stringify(concerns || []));
      body.append('tokopedia_url', formData.tokopedia_url || '');
      body.append('shopee_url', formData.shopee_url || '');
      if (image) body.append('image', image);

      // Debug: lihat pasangan key/value yang akan dikirim (untuk File hanya tampil meta)
      try {
        // eslint-disable-next-line no-console
        console.log(
          'Submitting FormData:',
          Array.from(body.entries()).map(([k, v]) => [k, v instanceof File ? { name: v.name, type: v.type, size: v.size } : v])
        );
      } catch {}

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
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="text-center mt-4 mb-6">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl">📦</div>
        <h1 className="text-3xl font-extrabold mt-3 text-gray-900 dark:text-white">Upload Produk Kosmetik</h1>
        <p className="text-gray-500 dark:text-gray-400">Tambahkan produk baru ke dalam katalog</p>
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Nama, brand, kategori, dan harga produk (wajib diisi)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="name">Nama Produk *</label>
              <input id="name" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="brand">Brand *</label>
              <input id="brand" type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="category">Kategori *</label>
              <select id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                <option value="">Pilih kategori produk</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="price">Harga (Rp) *</label>
              <input id="price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} min="0" step="1" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
          </div>
          <label className="mt-3 inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="h-4 w-4" />
            Jadikan produk unggulan (featured)
          </label>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-purple-500">🖼️</span> Detail Produk
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Upload gambar dan deskripsi produk</p>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2" htmlFor="image">Gambar Produk</label>
            <div className="border-3 border-dashed rounded-xl p-10 text-center text-sm text-gray-500 dark:text-gray-400">
              <input id="image" type="file" accept="image/*" onChange={handleImageChange} className="mx-auto" />
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
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2" htmlFor="description">Deskripsi Produk</label>
            <textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Deskripsi singkat tentang produk ini..." required />
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-emerald-500">🧪</span> Spesifikasi Produk
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Ingredients, jenis kulit, dan masalah kulit yang ditangani</p>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Ingredients (pisahkan dengan koma)</label>
            <input type="text" value={formData.ingredients} onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Aqua, Glycerin, Niacinamide, ..." />
          </div>
          <div className='mb-4'>
              <p className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-1">
                 Jenis Kulit Yang Cocok
              </p>
            </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {skinTypeOptions.map((opt) => (
              <label key={opt} className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={skinTypes.includes(opt)} onChange={(e) => setSkinTypes((prev) => e.target.checked ? [...prev, opt] : prev.filter((x) => x !== opt))} />
                {opt}
              </label>
            ))}
          </div>
          <div>
              <p className="mt-4 font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-1">
                 Masalah Kulit Yang di Tangani
              </p>
            </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {concernOptions.map((opt) => (
              <label key={opt} className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={concerns.includes(opt)} onChange={(e) => setConcerns((prev) => e.target.checked ? [...prev, opt] : prev.filter((x) => x !== opt))} />
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
            <textarea value={formData.usage} onChange={(e) => setFormData({ ...formData, usage: e.target.value })} rows={3} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Aplikasikan pada wajah yang sudah dibersihkan..." />
          </div>
          <div className="grid grid-cols-1 gap-3 items-end">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Ukuran/Volume</label>
              <input type="text" value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="50ml, 100ml, 236ml, dll" />
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-blue-500">🛍️</span> Tautan Marketplace
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Masukkan URL produk di Tokopedia dan Shopee (opsional)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="tokopedia_url">Tokopedia URL</label>
              <input id="tokopedia_url" type="url" placeholder="https://www.tokopedia.com/..." value={formData.tokopedia_url} onChange={(e) => setFormData({ ...formData, tokopedia_url: e.target.value })} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="shopee_url">Shopee URL</label>
              <input id="shopee_url" type="url" placeholder="https://shopee.co.id/..." value={formData.shopee_url} onChange={(e) => setFormData({ ...formData, shopee_url: e.target.value })} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={() => router.push('/dashboard/products')} className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline">
            Reset Formulir
          </button>
          <button type="submit" disabled={loading} className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50">
            {loading ? 'Menyimpan...' : 'Simpan Produk'}
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

