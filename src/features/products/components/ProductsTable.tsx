import React from 'react';
import { ExternalLink, Star, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import type { Product } from "@/features/products/types";
import Link from 'next/link';
import { createClientClient } from '@/lib/supabaseClient';

interface ProductsTableProps {
  rows: Product[];
  onDelete: (id: string) => void;
  onEdit: (product: Product) => void;
}

export default function ProductsTable({ rows, onDelete, onEdit }: ProductsTableProps) {
  if (!rows || rows.length === 0) {
    return (
      <div className="bg-white dark:bg-[#121212] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">Tidak ada data untuk ditampilkan.</p>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getImageUrl = (url: string | null) => {
    if (!url) return 'https://placehold.co/100x100?text=No+Img';
    if (url.startsWith('http')) return url;
    // Simple check for Supabase storage path, similar to ProductCard logic but simplified for table
    // In a real app, you might want to share the image resolution logic
    const supabase = createClientClient();
    const { data } = supabase.storage.from('products').getPublicUrl(url);
    return data.publicUrl;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121212] shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="px-6 py-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">
                Image
              </th>
              <th className="px-6 py-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Product Name
              </th>
              <th className="px-6 py-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
                Featured
              </th>
              <th className="px-6 py-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((row) => (
              <tr
                key={row.id}
                className="group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-150"
              >
                <td className="px-6 py-4">
                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <img
                      src={getImageUrl(row.image_url)}
                      alt={row.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Err';
                      }}
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{row.name}</span>
                    {row.type_name && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">{row.type_name}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {row.category_name ? (
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                      {row.category_name}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs italic">Uncategorized</span>
                  )}
                </td>
                <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">
                  {formatPrice(row.price)}
                </td>
                <td className="px-6 py-4 text-center">
                  {row.featured && (
                    <div className="inline-flex justify-center items-center h-6 w-6 rounded-full bg-yellow-50 dark:bg-yellow-900/20">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(row)}
                      className="p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(row.id)}
                      className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
