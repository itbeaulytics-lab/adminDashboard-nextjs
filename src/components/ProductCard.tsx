import { useEffect, useState } from 'react';
import { createClientClient } from '@/lib/supabaseClient';
import type { Product } from '@/types/product';

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
      } catch {}
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
  if (variant === 'row') {
    return (
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-4 pb-16 flex flex-row items-start gap-4">
        <div className="w-[180px] md:w-[220px] flex-shrink-0">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden h-40 md:h-48 lg:h-52">
            <img src={imgSrc} onError={handleImgError} alt={(product as any)?.name} className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">{(product as any)?.name}</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">{(product as any)?.description}</p>
            </div>
            <div className="text-right text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white whitespace-nowrap">
              Rp {priceFormatted}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 max-w-xl">
            {toList((product as any)?.ingredients).slice(0, 9).map((it, idx) => (
              <span key={`ing-row-${idx}`} className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-[12px] truncate">
                {it}
              </span>
            ))}
          </div>
          <div className="absolute bottom-4 right-4 flex items-center justify-end gap-3">
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-6 py-2 rounded-full text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </button>
            <a 
              href={`/dashboard/products/edit/${(product as any).id}`}
              className="px-6 py-2 rounded-full text-sm font-semibold text-black bg-yellow-400 hover:bg-yellow-500"
            >
              Edit
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden flex flex-col pb-16">
      <div className="w-full overflow-hidden p-3">
        <img 
          src={imgSrc}
          onError={handleImgError}
          alt={product.name} 
          className="w-full h-60 object-cover rounded-2xl border border-sky-500"
        />
      </div>
      <div className="px-4 pb-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight">{(product as any)?.name}</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">{(product as any)?.description}</p>
          </div>
          <div className="text-right text-xl font-extrabold text-gray-900 dark:text-white whitespace-nowrap">
            Rp {(product as any)?.price?.toLocaleString?.() ?? new Intl.NumberFormat('id-ID').format(Number((product as any)?.price || 0))}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1">
          {toList((product as any)?.ingredients).slice(0, 9).map((it, idx) => (
            <span key={`ing-${idx}`} className="px-2 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-[11px] truncate">
              {it}
            </span>
          ))}
          {toList((product as any)?.skin_type).slice(0, 9).map((it, idx) => (
            <span key={`skin-${idx}`} className="px-2 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-[11px] truncate">
              {it}
            </span>
          ))}
        </div>

        <div className="absolute bottom-4 right-4 flex items-center justify-end gap-3">
          <a 
            href={`/dashboard/products/edit/${product.id}`}
            className="px-6 py-2 rounded-full text-sm font-semibold text-black bg-yellow-400 hover:bg-yellow-500"
          >
            Edit
          </a>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-6 py-2 rounded-full text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}