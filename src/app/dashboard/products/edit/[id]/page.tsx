"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClientClient } from "@/lib/supabaseClient";
import { sanitizeText, sanitizeUrl, sanitizeStringArray } from "@/lib/sanitize";
import { FaBoxOpen, FaBook, FaImage, FaFlask, FaFileAlt } from "react-icons/fa";

function toList(val: any): string[] {
  if (!val && val !== 0) return [];
  if (Array.isArray(val)) return val.map((x) => String(x)).filter(Boolean);
  if (typeof val === "string") {
    const s = val.trim();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed.map((x: any) => String(x));
    } catch {}
    return s
      .replace(/[\[\]\{\}"]+/g, "")
      .split(/[,;]|\s{2,}/)
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [String(val)];
}

function listFromTextInput(text: string): string[] {
  const s = sanitizeText(text || "");
  if (!s) return [];
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams() as { id?: string };
  const productId = String(params?.id ?? "");

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    featured: false,
    description: "",
    ingredients: "",
    usage: "",
    size: "",
    tokopedia_url: "",
    shopee_url: "",
  });
  const [skinTypes, setSkinTypes] = useState<string[]>([]);
  const [concerns, setConcerns] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [success, setSuccess] = useState<string | null>(null);

  const categories = useMemo(
    () => [
      "serum",
      "cleanser",
      "toner",
      "moisturizer",
      "sunscreen",
      "mask",
      "essence",
      "tonic",
    ],
    []
  );
  const skinTypeOptions = useMemo(
    () => ["Normal", "Combination", "Dry", "Sensitive", "Oily", "Acne-prone"],
    []
  );
  const concernOptions = useMemo(
    () => [
      "Acne",
      "Dullness",
      "Large Pores",
      "Wrinkles",
      "Aging",
      "Fine Lines",
      "Dark Spots",
      "Hyperpigmentation",
      "Redness",
      "Uneven Skin Tone",
    ],
    []
  );

  useEffect(() => {
    const run = async () => {
      if (!productId) return;
      setInitialLoading(true);
      setError(null);
      try {
        const supabase = createClientClient();
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single();
        if (error) throw error;
        const p: any = data || {};
        setFormData({
          name: sanitizeText(p.name || ""),
          brand: sanitizeText(p.brand || ""),
          category: sanitizeText(p.category || ""),
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
        const img = getProductImage(p);
        setExistingImage(img);
        setImagePreview(img);
      } catch (err: any) {
        setError(err?.message || "Gagal memuat produk");
      } finally {
        setInitialLoading(false);
      }
    };
    run();
  }, [productId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

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
    ];
    const filled = checks.filter(Boolean).length;
    const total = checks.length;
    setProgress(Math.round((filled / total) * 100));
  }, [formData, skinTypes, concerns]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    const errors: string[] = [];
    const priceNum = Number(sanitizeText(formData.price));
    const isValidUrl = (v: string) => {
      if (!v) return true;
      try {
        new URL(v);
        return true;
      } catch {
        return false;
      }
    };
    if (!sanitizeText(formData.name).trim()) errors.push("Nama wajib diisi");
    if (!sanitizeText(formData.brand).trim()) errors.push("Brand wajib diisi");
    if (!sanitizeText(formData.category).trim()) errors.push("Kategori wajib diisi");
    if (!sanitizeText(formData.description).trim()) errors.push("Deskripsi wajib diisi");
    if (!Number.isFinite(priceNum) || priceNum <= 0) errors.push("Harga harus angka > 0");
    if (!isValidUrl(sanitizeUrl(formData.tokopedia_url))) errors.push("Tokopedia URL tidak valid");
    if (!isValidUrl(sanitizeUrl(formData.shopee_url))) errors.push("Shopee URL tidak valid");

    if (errors.length) {
      setError(errors.join(" • "));
      setLoading(false);
      return;
    }

    try {
      const supabase = createClientClient();

      let newImageUrl: string | null = null;
      if (image) {
        const fileExt = image.name.split(".").pop() || "jpg";
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
        const filePath = `products/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("bucket1")
          .upload(filePath, image, { contentType: image.type });
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = await supabase.storage
          .from("bucket1")
          .getPublicUrl(filePath);
        newImageUrl = publicUrlData.publicUrl || null;
      }

      const updatePayload: Record<string, any> = {
        name: sanitizeText(formData.name),
        brand: sanitizeText(formData.brand) || null,
        category: sanitizeText(formData.category) || null,
        description: sanitizeText(formData.description),
        price: priceNum,
        featured: !!formData.featured,
        ingredients: listFromTextInput(formData.ingredients),
        how_to_use: sanitizeText(formData.usage) || null,
        size: sanitizeText(formData.size) || null,
        skin_type: sanitizeStringArray(skinTypes || []),
        concerns: sanitizeStringArray(concerns || []),
        tokopedia_url: sanitizeUrl(formData.tokopedia_url) || null,
        shopee_url: sanitizeUrl(formData.shopee_url) || null,
      };
      if (newImageUrl) updatePayload.image = newImageUrl;

      const { error: updateError } = await supabase
        .from("products")
        .update(updatePayload)
        .eq("id", productId);
      if (updateError) throw updateError;

      setSuccess("Produk berhasil diperbarui");
      setTimeout(() => {
        router.push("/dashboard/products");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err?.message || "Gagal memperbarui produk");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mt-12 text-gray-600 dark:text-gray-300">Memuat data produk...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="text-center mt-4 mb-6">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl">
          <FaBoxOpen size={24} />
        </div>
        <h1 className="text-3xl font-extrabold mt-3 text-gray-900 dark:text-white">Edit Produk</h1>
        <p className="text-gray-500 dark:text-gray-400">Perbarui detail produk</p>
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
            <span className="text-indigo-500"><FaBook size={16} /></span> Info Dasar Produk
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Nama, brand, kategori, dan harga produk</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="name">Nama Produk *</label>
              <input id="name" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: sanitizeText(e.target.value) })} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="brand">Brand *</label>
              <input id="brand" type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: sanitizeText(e.target.value) })} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="category">Kategori *</label>
              <select id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: sanitizeText(e.target.value) })} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                <option value="">Pilih kategori produk</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="price">Harga (Rp) *</label>
              <input id="price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: sanitizeText(e.target.value) })} min="0" step="1" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
          </div>
          <label className="mt-3 inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="h-4 w-4" />
            Jadikan produk unggulan (featured)
          </label>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-purple-500"><FaImage size={16} /></span> Detail Produk
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Upload gambar dan deskripsi produk</p>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2" htmlFor="image">Gambar Produk</label>
            <div className="border-3 border-dashed rounded-xl p-10 text-center text-sm text-gray-500 dark:text-gray-400">
              <input id="image" type="file" accept="image/*" onChange={handleImageChange} className="mx-auto" />
              <p className="mt-2">Klik untuk pilih gambar atau drag and drop</p>
              <p className="text-xs">PNG, JPG, HEIC (max. 5MB)</p>
            </div>
            {(imagePreview || existingImage) && (
              <div className="mt-2">
                <img src={imagePreview || existingImage || ""} alt="Preview" className="max-h-48 rounded" />
              </div>
            )}
          </div>
          <div className="mt-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2" htmlFor="description">Deskripsi Produk</label>
            <textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: sanitizeText(e.target.value) })} rows={4} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Deskripsi singkat tentang produk ini..." required />
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-emerald-500"><FaFlask size={16} /></span> Spesifikasi Produk
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Ingredients, jenis kulit, dan masalah kulit yang ditangani</p>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Ingredients (pisahkan dengan koma)</label>
            <input type="text" value={formData.ingredients} onChange={(e) => setFormData({ ...formData, ingredients: sanitizeText(e.target.value) })} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Aqua, Glycerin, Niacinamide, ..." />
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
            <span className="text-amber-500"><FaFileAlt size={16} /></span> Info Tambahan
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Cara penggunaan dan ukuran produk</p>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Cara Penggunaan</label>
            <textarea value={formData.usage} onChange={(e) => setFormData({ ...formData, usage: sanitizeText(e.target.value) })} rows={3} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Aplikasikan pada wajah yang sudah dibersihkan..." />
          </div>
          <div className="grid grid-cols-1 gap-3 items-end">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Ukuran/Volume</label>
              <input type="text" value={formData.size} onChange={(e) => setFormData({ ...formData, size: sanitizeText(e.target.value) })} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="50ml, 100ml, 236ml, dll" />
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
              <input id="tokopedia_url" type="url" placeholder="https://www.tokopedia.com/..." value={formData.tokopedia_url} onChange={(e) => setFormData({ ...formData, tokopedia_url: sanitizeUrl(e.target.value) })} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="shopee_url">Shopee URL</label>
              <input id="shopee_url" type="url" placeholder="https://shopee.co.id/..." value={formData.shopee_url} onChange={(e) => setFormData({ ...formData, shopee_url: sanitizeUrl(e.target.value) })} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={() => router.push("/dashboard/products")} className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline">
            Kembali
          </button>
          <button type="submit" disabled={loading} className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50">
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
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
