import Link from 'next/link';
import { createClientClient } from '@/lib/supabaseClient';

export default function Navbar() {
  const handleLogout = async () => {
    const supabase = createClientClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-md supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-800 dark:text-white">
                Admin Panel | Beaulytics
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}