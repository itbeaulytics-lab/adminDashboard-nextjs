'use client';

import { useEffect, useState } from 'react';
import { createClientClient } from '@/lib/supabaseClient';
import type { Product } from '@/types/product';
import { Edit2, Trash2, Star, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
  onEdit: (product: Product) => void;
  variant?: 'grid' | 'row';
}

export default function ProductCard({ product, onDelete, onEdit, variant = 'grid' }: ProductCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const FALLBACK_IMG = 'https://placehold.co/600x400?text=No+Image';

  // --- HELPER 1: Get Image ---
  const getProductImage = (p: any): string | null => {
    const candidates = ['image_url', 'image', 'img', 'imageUrl', 'image_src', 'imageLink', 'image_link'];
    for (const k of candidates) {
      const v = p?.[k];
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
    return null;
  };

  const rawImage = getProductImage(product);
  const [imgSrc, setImgSrc] = useState<string>(rawImage || FALLBACK_IMG);

  // --- HELPER 2: Parse Bucket ---
  const parseBucketAndPath = (urlStr: string): { bucket: string | null; path: string | null } => {
    if (!/^https?:\/\//i.test(urlStr)) {
      const trimmed = urlStr.replace(/^\/+/, '');
      let bucket = 'products';
      let path = trimmed;
      if (trimmed.startsWith('products/')) path = trimmed.substring('products/'.length);
      else if (trimmed.startsWith('bucket1/')) { bucket = 'bucket1'; path = trimmed.substring('bucket1/'.length); }
      return { bucket, path };
    }
    try {
      const u = new URL(urlStr);
      const pathname = u.pathname;
      const prefixes = ['/storage/v1/object/public/', '/storage/v1/object/sign/'];
      for (const prefix of prefixes) {
        if (pathname.includes(prefix)) {
          const parts = pathname.substring(pathname.indexOf(prefix) + prefix.length).split('/').filter(Boolean);
          if (parts.length >= 2) return { bucket: parts[0], path: parts.slice(1).join('/') };
        }
      }
      return { bucket: null, path: null };
    } catch { return { bucket: null, path: null }; }
  };

  useEffect(() => {
    const resolveUrl = async () => {
      if (!rawImage || /^https?:\/\//i.test(rawImage)) {
        if (rawImage) setImgSrc(rawImage);
        return;
      }
      const { bucket, path } = parseBucketAndPath(rawImage);
      if (!bucket || !path) { setImgSrc(FALLBACK_IMG); return; }
      
      try {
        const supabase = createClientClient();
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        if (data?.publicUrl) setImgSrc(data.publicUrl);
        else setImgSrc(FALLBACK_IMG);
      } catch { setImgSrc(FALLBACK_IMG); }
    };
    resolveUrl();
  }, [rawImage]);

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    setImgSrc(FALLBACK_IMG);
  };

  // --- HANDLERS ---
  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(product);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    const supabase = createClientClient();
    try {
      if (rawImage) {
        const { bucket, path } = parseBucketAndPath(rawImage);
        if (bucket && path && !rawImage.includes('placehold.co')) {
           await supabase.storage.from(bucket).remove([path]);
        }
      }
      const { error: dbError } = await supabase.from('products').delete().eq('id', product.id);
      if (dbError) throw dbError;
      
      setShowDeleteModal(false);
      onDelete(product.id);
    } catch (error: any) {
      console.error('Error deleting:', error);
      alert(`Gagal menghapus: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Safe access for formatting price
  const priceFormatted = (product as any)?.price?.toLocaleString?.() ?? new Intl.NumberFormat('id-ID').format(Number((product as any)?.price || 0));

  // --- MODAL COMPONENT ---
  const DeleteConfirmationModal = () => (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-sm overflow-hidden p-6 text-center">
        <div className="mx-auto bg-red-50 dark:bg-red-900/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="text-red-500 w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Hapus Produk?</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          Anda akan menghapus <span className="font-semibold text-gray-800 dark:text-gray-200">"{product.name}"</span>. 
          <br/>Data yang dihapus tidak bisa dikembalikan.
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={() => setShowDeleteModal(false)} disabled={isDeleting} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Batal</button>
          <button type="button" onClick={confirmDelete} disabled={isDeleting} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30 flex items-center justify-center gap-2">
            {isDeleting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/><span>Proses...</span></> : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  );

  // --- RENDER ---
  if (variant === 'row') {
    return (
      <>
        <div className="group relative bg-white dark:bg-[#121212] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
            <img src={imgSrc} onError={handleImgError} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{product.name}</h3>
            <p className="text-sm text-gray-500 truncate">Rp {priceFormatted}</p>
          </div>
          {/* FIX: Pakai (product as any) untuk featured dan rating agar tidak error build */}
          {product.featured && <Star size={16} className="text-yellow-500 fill-yellow-500" />}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button type="button" onClick={handleEditClick} className="p-2 text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
            <button type="button" onClick={handleDeleteClick} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
          </div>
        </div>
        {showDeleteModal && <DeleteConfirmationModal />}
      </>
    );
  }

  // Grid Variant (Default)
  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#121212] shadow-sm border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
          <img src={imgSrc} onError={handleImgError} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
          
          {product.featured && (
            <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm p-1.5 rounded-full shadow-sm z-10">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
            </div>
          )}

          {/* FIX: Cast category_name to any */}
          {(product as any).category_name && (
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider text-white z-10">
              {(product as any).category_name}
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex justify-center gap-3">
            <button type="button" onClick={handleEditClick} className="p-2 bg-white text-gray-900 rounded-full shadow-lg hover:bg-gray-100 transition-colors transform hover:scale-105"><Edit2 size={18} /></button>
            <button type="button" onClick={handleDeleteClick} className="p-2 bg-white text-red-600 rounded-full shadow-lg hover:bg-gray-100 transition-colors transform hover:scale-105"><Trash2 size={18} /></button>
          </div>
        </div>

        <div className="flex flex-col flex-1 p-5">
          <div className="mb-2">
            {/* FIX: Cast type_name to any */}
            {(product as any).type_name && <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1 block">{(product as any).type_name}</span>}
            <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight line-clamp-1" title={product.name}>{product.name}</h3>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">{product.description || 'No description available.'}</p>

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
            <span className="font-bold text-lg text-gray-900 dark:text-white">Rp {priceFormatted}</span>
            
            {/* FIX: DISINI ERRORNYA KEMARIN, SAYA TAMBAH (product as any) */}
            {(product as any).rating !== undefined && (product as any).rating > 0 && (
              <div className="flex items-center text-yellow-500 text-sm font-medium">
                <Star size={14} className="fill-current mr-1" />
                {(product as any).rating}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showDeleteModal && <DeleteConfirmationModal />}
    </>
  );
}