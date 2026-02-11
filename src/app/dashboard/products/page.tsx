'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientClient } from '@/lib/supabaseClient';
import ProductCard from '@/components/ProductCard';
import ProductsTable from '@/components/ProductsTable';
import type { Product } from '@/types/product';
import { Loader2, Search, LayoutGrid, List, Plus } from 'lucide-react';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const supabase = createClientClient();
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name), product_types(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedData = (data || []).map((item: any) => ({
        ...item,
        category_name: item.categories?.name,
        type_name: item.product_types?.name,
      }));

      setProducts(mappedData);
    } catch (error) {
      console.error('Error fetching products:', (error as any)?.message || error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEditProduct = (product: Product) => {
    router.push(`/dashboard/products/edit/${product.id}`);
  };

  // --- PERBAIKAN DISINI ---
  const handleDeleteProduct = (id: string) => {
    // KITA HAPUS SEMUA LOGIC CONFIRM & DELETE DATABASE DISINI.
    // Karena ProductCard.tsx sudah melakukan penghapusan data & storage.
    // Tugas Parent hanya update UI state biar itemnya hilang dari layar.
    
    setProducts((prevProducts) => prevProducts.filter((p) => p.id !== id));
  };
  // ------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Products</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your product catalog, inventory, and pricing.
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/upload')}
          className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* View Toggle & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-[#121212] p-2 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-lg text-sm focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 transition-all outline-none"
          />
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <Search className="h-full w-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No products found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchQuery ? `No results for "${searchQuery}"` : "Get started by creating a new product."}
          </p>
          {!searchQuery && (
            <button
              onClick={() => router.push('/dashboard/upload')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Product
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={handleDeleteProduct} // Sekarang aman, cuma update state
              onEdit={handleEditProduct}
              variant="grid"
            />
          ))}
        </div>
      ) : (
        <ProductsTable
          rows={filteredProducts}
          onDelete={handleDeleteProduct}
          onEdit={handleEditProduct}
        />
      )}
    </div>
  );
}