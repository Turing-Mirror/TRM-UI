import type { Key, ReactNode } from "react";

export type DataColumn<T> = {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  align?: "start" | "end";
  width?: string;
};

export type DataTableProps<T> = {
  rows: T[];
  columns: DataColumn<T>[];
  keyOf: (row: T) => Key;
  label: string;
  onRowClick?: (row: T) => void;
};

export function DataTable<T>({ rows, columns, keyOf, label, onRowClick }: DataTableProps<T>) {
  return (
    <div className="trm-table-scroll" role="region" aria-label={label} tabIndex={0}>
      <table className="trm-data-table" aria-label={label}>
        <thead>
          <tr>{columns.map((column) => (
            <th key={column.key} scope="col" style={{ textAlign: column.align, width: column.width }}>
              {column.label}
            </th>
          ))}</tr>
        </thead>
        <tbody>{rows.map((row) => (
          <tr
            key={keyOf(row)}
            tabIndex={onRowClick ? 0 : undefined}
            data-clickable={Boolean(onRowClick) || undefined}
            onClick={(e) => {
              // Cell controls own their actions; clicking them must not also open the row.
              const target = e.target as Element;
              if (target.closest("button, a, input, select, textarea, [role=button], [contenteditable=true]")) return;
              onRowClick?.(row);
            }}
            onKeyDown={(e) => {
              if (onRowClick && e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onRowClick(row);
              }
            }}
          >
            {columns.map((column) => (
              <td key={column.key} style={{ textAlign: column.align }}>{column.render(row)}</td>
            ))}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
