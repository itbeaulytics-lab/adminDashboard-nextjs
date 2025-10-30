import React from 'react';

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
  if (v === null || v === undefined) return <span className="text-gray-400">-</span>;
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (Array.isArray(v)) return (
    <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(v, null, 2)}</pre>
  );
  if (typeof v === 'object') return (
    <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(v, null, 2)}</pre>
  );
  if (typeof v === 'string') {
    if (isUrl(v)) {
      return (
        <a href={v} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-words">
          {v}
        </a>
      );
    }
    return <span className="break-words">{v}</span>;
  }
  return String(v);
}

export default function ProductsTable({ rows }: { rows: Row[] }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center text-gray-600 dark:text-gray-300">
        Tidak ada data.
      </div>
    );
  }

  // Ambil daftar kolom secara dinamis dari semua baris agar kolom tidak hilang
  const columns = Array.from(
    rows.reduce<Set<string>>((set, r) => {
      Object.keys(r || {}).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );

  return (
    <div className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
          {rows.map((row, i) => (
            <tr key={row.id ?? i} className="align-top">
              {columns.map((col) => (
                <td key={col} className="px-3 py-2 text-gray-800 dark:text-gray-100 max-w-[28rem]">
                  {formatValue(row?.[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
