import { useEffect, useState } from 'react';
import { createClientClient } from '@/lib/supabaseClient';
import type { Product } from '@/types/product';
import { Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
  onEdit: (product: Product) => void;
  variant?: 'grid' | 'row';
}

export default function ProductCard({ product, onDelete, onEdit, variant = 'grid' }: ProductCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const FALLBACK_IMG = 'https://placehold.co/600x400?text=No+Image'; // Consider using a local placeholder or keeping this

  const getProductImage = (p: any): string | null => {
    const candidates = [
      'image_url',
      'image',
      'img',
      'imageUrl',
      'image_src',
      'imageLink',
      'image_link',
    ];
    for (const k of candidates) {
      const v = p?.[k];
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
    return null;
  };
  const rawImage = getProductImage(product as any);
  const [imgSrc, setImgSrc] = useState<string>(rawImage || FALLBACK_IMG);

  const toList = (val: any): string[] => {
    if (!val && val !== 0) return [];
    if (Array.isArray(val)) return val.map((x) => String(x)).filter(Boolean);
    if (typeof val === 'string') {
      const s = val.trim();
      if (!s) return [];
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed.map((x: any) => String(x));
      } catch { }
      return s
        .replace(/[\[\]\{\}"]+/g, '')
        .split(/[,;]|\s{2,}/)
        .map((x) => x.trim())
        .filter(Boolean);
    }
    return [String(val)];
  };

  useEffect(() => {
    const resolveUrl = async () => {
      if (!rawImage) {
        setImgSrc(FALLBACK_IMG);
        return;
      }
      // If it already looks like a full URL, try it as-is first
      if (/^https?:\/\//i.test(rawImage)) {
        setImgSrc(rawImage);
        return;
      }
      // Treat as object path within a known bucket (default to 'products')
      const trimmed = rawImage.replace(/^\/+/, '');
      let bucket = 'products';
      let path = trimmed;
      if (trimmed.startsWith('products/')) {
        path = trimmed.substring('products/'.length);
      } else if (trimmed.startsWith('bucket1/')) {
        bucket = 'bucket1';
        path = trimmed.substring('bucket1/'.length);
      }
      try {
        const supabase = createClientClient();
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        if (data?.publicUrl) {
          setImgSrc(data.publicUrl);
          return;
        }
        const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
        if (signed?.signedUrl) {
          setImgSrc(signed.signedUrl);
          return;
        }
        setImgSrc(FALLBACK_IMG);
      } catch {
        setImgSrc(FALLBACK_IMG);
      }
    };
    resolveUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawImage]);

  const parseBucketAndPath = (urlStr: string): { bucket: string | null; path: string | null } => {
    // If it's a direct storage path without protocol
    if (!/^https?:\/\//i.test(urlStr)) {
      const trimmed = urlStr.replace(/^\/+/, '');
      let bucket = 'products';
      let path = trimmed;
      if (trimmed.startsWith('products/')) {
        path = trimmed.substring('products/'.length);
      } else if (trimmed.startsWith('bucket1/')) {
        bucket = 'bucket1';
        path = trimmed.substring('bucket1/'.length);
      }
      return { bucket, path };
    }
    try {
      const u = new URL(urlStr);
      const pathname = u.pathname; // e.g. /storage/v1/object/public/products/abc/def.jpg
      const prefixes = ['/storage/v1/object/public/', '/storage/v1/object/sign/'];
      for (const prefix of prefixes) {
        const idx = pathname.indexOf(prefix);
        if (idx >= 0) {
          const after = pathname.substring(idx + prefix.length); // products/abc/def.jpg
          const parts = after.split('/').filter(Boolean);
          if (parts.length >= 2) {
            const bucket = parts[0];
            const path = parts.slice(1).join('/');
            return { bucket, path };
          }
        }
      }
      // Fallback: try markers for known buckets
      const markers = ['/products/', '/product-images/'];
      for (const m of markers) {
        const i = urlStr.indexOf(m);
        if (i >= 0) {
          const bucket = m.replace(/\//g, '').replace(/s$/, 's'); // crude keep name
          const path = urlStr.substring(i + m.length).split('?')[0];
          return { bucket, path };
        }
      }
      return { bucket: null, path: null };
    } catch {
      return { bucket: null, path: null };
    }
  };

  const handleImgError = async (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Prevent infinite loop
    e.currentTarget.onerror = null;
    try {
      if (!rawImage) {
        setImgSrc(FALLBACK_IMG);
        return;
      }
      const { bucket, path } = parseBucketAndPath(rawImage);
      if (!bucket || !path) {
        setImgSrc(FALLBACK_IMG);
        return;
      }
      const supabase = createClientClient();
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 60 * 60); // 1 hour
      if (error || !data?.signedUrl) {
        setImgSrc(FALLBACK_IMG);
        return;
      }
      setImgSrc(data.signedUrl);
    } catch {
      setImgSrc(FALLBACK_IMG);
    }
  };

  const handleDelete = async () => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      setIsDeleting(true);
      try {
        const supabase = createClientClient();

        // Hapus gambar dari storage jika ada
        if (rawImage) {
          const { bucket, path } = parseBucketAndPath(rawImage);
          if (bucket && path) {
            const { error: storageError } = await supabase
              .storage
              .from(bucket)
              .remove([path]);

            if (storageError) {
              console.error('Error deleting image:', storageError);
            }
          }
        }

        // Hapus data produk dari database
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', product.id);

        if (error) throw error;

        // Panggil callback onDelete
        onDelete(product.id);
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Gagal menghapus produk');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const priceFormatted = (product as any)?.price?.toLocaleString?.() ?? new Intl.NumberFormat('id-ID').format(Number((product as any)?.price || 0));

  // Row Variant (if needed in future, optimized for list view)
  if (variant === 'row') {
    return (
      <div className="group relative bg-white dark:bg-[#121212] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-4 transition-all hover:shadow-md">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
          <img src={imgSrc} onError={handleImgError} alt={(product as any)?.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{(product as any)?.name}</h3>
          <p className="text-sm text-gray-500 truncate">Rp {priceFormatted}</p>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/dashboard/products/edit/${(product as any).id}`}
            className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <Edit2 size={16} />
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Grid Variant (Default)
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#121212] shadow-sm border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Image Container */}
      <div className="aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
        <img
          src={imgSrc}
          onError={handleImgError}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Actions Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex justify-end gap-2">
          <Link
            href={`/dashboard/products/edit/${product.id}`}
            className="p-2 bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-lg text-gray-900 dark:text-white shadow-lg hover:bg-blue-500 hover:text-white transition-colors"
            title="Edit Produk"
          >
            <Edit2 size={18} />
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-lg text-red-600 shadow-lg hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
            title="Hapus Produk"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight line-clamp-2" title={(product as any)?.name}>
            {(product as any)?.name}
          </h3>
          <span className="font-bold text-lg text-blue-600 dark:text-blue-400 whitespace-nowrap">
            Rp {priceFormatted}
          </span>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
          {(product as any)?.description || 'Tidak ada deskripsi.'}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {toList((product as any)?.ingredients).slice(0, 3).map((it, idx) => (
            <span key={`ing-${idx}`} className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md">
              {it}
            </span>
          ))}
          {(toList((product as any)?.ingredients).length > 3) && (
            <span className="px-2 py-1 text-[10px] font-medium bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 rounded-md">
              +{toList((product as any)?.ingredients).length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}