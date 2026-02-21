import Link from 'next/link';
import { createClientClient } from '@/lib/supabaseClient';

export default function Navbar() {
  const handleLogout = async () => {
    const supabase = createClientClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/60 backdrop-blur-md dark:border-gray-800 dark:bg-[#121212]/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-lg font-bold text-gray-900 dark:text-white">
              Beaulytics
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Online
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}