import React from 'react';
import { ExternalLink } from 'lucide-react';

type Row = Record<string, any>;

function isUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function formatValue(v: any): React.ReactNode {
  if (v === null || v === undefined) return <span className="text-gray-300 dark:text-gray-600">-</span>;
  if (typeof v === 'boolean') return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${v ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
      {v ? 'TRUE' : 'FALSE'}
    </span>
  );
  if (Array.isArray(v) || typeof v === 'object') return (
    <div className="relative group cursor-help">
      <span className="text-xs text-gray-500 underline decoration-dotted">Object/Array</span>
      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg overflow-hidden">
        <pre className="whitespace-pre-wrap break-words">{JSON.stringify(v, null, 2)}</pre>
      </div>
    </div>
  );
  if (typeof v === 'string') {
    if (isUrl(v)) {
      return (
        <a href={v} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
          Link <ExternalLink size={12} />
        </a>
      );
    }
    return <span className="text-gray-700 dark:text-gray-300 text-sm">{v}</span>;
  }
  return <span className="text-gray-700 dark:text-gray-300 text-sm">{String(v)}</span>;
}

export default function ProductsTable({ rows }: { rows: Row[] }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="bg-white dark:bg-[#121212] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">Tidak ada data untuk ditampilkan.</p>
      </div>
    );
  }

  // Ambil daftar kolom secara dinamis
  const columns = Array.from(
    rows.reduce<Set<string>>((set, r) => {
      Object.keys(r || {}).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121212] shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-6 py-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {col.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((row, i) => (
              <tr
                key={row.id ?? i}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-150"
              >
                {columns.map((col) => (
                  <td key={col} className="px-6 py-4">
                    {formatValue(row?.[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
