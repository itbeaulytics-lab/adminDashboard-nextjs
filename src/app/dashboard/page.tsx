'use client';

import { useEffect, useState } from 'react';
import { createClientClient } from '@/lib/supabaseClient';
import { Package, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClientClient();

      // Ambil data user
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Ambil jumlah produk
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      setProductCount(count || 0);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-500 mt-2">Selamat datang kembali, {user?.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Products Card */}
        <div className="relative overflow-hidden bg-white dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 group hover:shadow-md transition-all duration-200">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                <Package size={20} />
              </span>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Produk</h3>
            </div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{productCount}</p>
          </div>
          <Package className="absolute -bottom-4 -right-4 text-gray-50 dark:text-gray-800/50 opacity-10 group-hover:scale-110 transition-transform duration-300" size={120} />
        </div>

        {/* Dummy Stat: Total Sales/Views (Placeholder) */}
        <div className="relative overflow-hidden bg-white dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 group hover:shadow-md transition-all duration-200">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                <TrendingUp size={20} />
              </span>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Aktivitas</h3>
            </div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">-</p>
          </div>
          <TrendingUp className="absolute -bottom-4 -right-4 text-green-50 dark:text-green-900/20 opacity-10 group-hover:scale-110 transition-transform duration-300" size={120} />
        </div>

        {/* Quick Actions Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-sm text-white group hover:shadow-md transition-all duration-200">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={20} className="text-white/80" />
              <h3 className="text-sm font-medium text-white/90">Aksi Cepat</h3>
            </div>
            <div className="space-y-3">
              <Link
                href="/dashboard/upload"
                className="block w-full text-center py-2.5 px-4 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/30 transition-colors font-medium text-sm"
              >
                Upload Produk Baru
              </Link>
              <Link
                href="/dashboard/products"
                className="block w-full text-center py-2.5 px-4 bg-black/20 backdrop-blur-sm border border-black/10 text-white rounded-xl hover:bg-black/30 transition-colors font-medium text-sm"
              >
                Lihat Semua Produk
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}