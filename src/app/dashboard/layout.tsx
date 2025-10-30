'use client';

import Navbar from '@/components/Navbar';
import Dock from '@/app/UI/dock';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const items = [
    {
      icon: <span className="text-white text-sm">🏠</span>,
      label: 'Dashboard',
      onClick: () => router.push('/dashboard')
    },
    {
      icon: <span className="text-white text-sm">📦</span>,
      label: 'Daftar Produk',
      onClick: () => router.push('/dashboard/products')
    },
    {
      icon: <span className="text-white text-sm">⬆️</span>,
      label: 'Upload Produk',
      onClick: () => router.push('/dashboard/upload')
    }
  ];
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="flex">
        <main className="flex-1 p-6 pb-24">
          {children}
        </main>
      </div>
      <Dock items={items} />
    </div>
  );
}