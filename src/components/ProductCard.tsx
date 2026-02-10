import { useEffect, useState } from 'react';
import { createClientClient } from '@/lib/supabaseClient';
import type { Product } from '@/types/product';
import { Edit2, Trash2, Star } from 'lucide-react';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
  onEdit: (product: Product) => void;
  variant?: 'grid' | 'row';
}

export default function ProductCard({ product, onDelete, onEdit, variant = 'grid' }: ProductCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const FALLBACK_IMG = 'https://placehold.co/600x400?text=No+Image';

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
      if (/^https?:\/\//i.test(rawImage)) {
        setImgSrc(rawImage);
        return;
      }
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
      const pathname = u.pathname;
      const prefixes = ['/storage/v1/object/public/', '/storage/v1/object/sign/'];
      for (const prefix of prefixes) {
        const idx = pathname.indexOf(prefix);
        if (idx >= 0) {
          const after = pathname.substring(idx + prefix.length);
          const parts = after.split('/').filter(Boolean);
          if (parts.length >= 2) {
            const bucket = parts[0];
            const path = parts.slice(1).join('/');
            return { bucket, path };
          }
        }
      }
      const markers = ['/products/', '/product-images/'];
      for (const m of markers) {
        const i = urlStr.indexOf(m);
        if (i >= 0) {
          const bucket = m.replace(/\//g, '').replace(/s$/, 's');
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
        .createSignedUrl(path, 60 * 60);
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
        if (rawImage) {
          const { bucket, path } = parseBucketAndPath(rawImage);
          if (bucket && path) {
            await supabase.storage.from(bucket).remove([path]);
          }
        }
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', product.id);

        if (error) throw error;
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

  if (variant === 'row') {
    // Keep row variant minimal as fallback or for specific view
    return (
      <div className="group relative bg-white dark:bg-[#121212] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-4 transition-all hover:shadow-md">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
          <img src={imgSrc} onError={handleImgError} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{product.name}</h3>
          <p className="text-sm text-gray-500 truncate">Rp {priceFormatted}</p>
        </div>
        {product.featured && <Star size={16} className="text-yellow-500 fill-yellow-500" />}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(product)} className="p-2 text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
          <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
        </div>
      </div>
    );
  }

  // Modern Grid Variant
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#121212] shadow-sm border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Image Container */}
      <div className="aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
        <img
          src={imgSrc}
          onError={handleImgError}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm p-1.5 rounded-full shadow-sm z-10">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
          </div>
        )}

        {/* Category Badge */}
        {product.category_name && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider text-white z-10">
            {product.category_name}
          </div>
        )}

        {/* Actions Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex justify-center gap-3">
          <button
            onClick={() => onEdit(product)}
            className="p-2 bg-white text-gray-900 rounded-full shadow-lg hover:bg-gray-100 transition-colors transform hover:scale-105"
            title="Edit"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 bg-white text-red-600 rounded-full shadow-lg hover:bg-gray-100 transition-colors transform hover:scale-105"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="mb-2">
          {product.type_name && (
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1 block">
              {product.type_name}
            </span>
          )}
          <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight line-clamp-1" title={product.name}>
            {product.name}
          </h3>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
          {product.description || 'No description available.'}
        </p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            Rp {priceFormatted}
          </span>
        </div>
      </div>
    </div>
  );
}