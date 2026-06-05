import { ReactNode } from 'react';

interface TableProps {
  columns: TableColumn[];
  data: any[];
  onRowClick?: (row: any) => void;
}

interface TableColumn {
  key: string;
  label: string;
  render?: (value: any, row: any) => ReactNode;
  className?: string;
}

export function Table({ columns, data, onRowClick }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick?.(row)}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-6 py-4 text-sm text-gray-700 ${col.className || ''}`}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
