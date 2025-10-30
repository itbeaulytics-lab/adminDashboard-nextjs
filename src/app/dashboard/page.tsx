'use client';

import { useEffect, useState } from 'react';
import { createClientClient } from '@/lib/supabaseClient';

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
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Dashboard</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Selamat Datang, Admin!</h2>
        <p className="text-gray-600 dark:text-gray-300">
          {user?.email}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Total Produk</h3>
          <p className="text-3xl font-bold text-indigo-600">{productCount}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Aksi Cepat</h3>
          <div className="space-y-2">
            <a 
              href="/dashboard/upload" 
              className="block w-full text-center py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Upload Produk Baru
            </a>
            <a 
              href="/dashboard/products" 
              className="block w-full text-center py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Lihat Semua Produk
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}