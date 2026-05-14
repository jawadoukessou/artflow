'use client';
import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn, getPaginationRange } from '@/lib/utils';

export interface Column<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onSort?: (key: string, dir: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  loading?: boolean;
  emptyMessage?: string;
  rowClassName?: (row: T) => string;
}

export function DataTable<T extends { id?: string }>({
  columns, data, total = 0, page = 1, pageSize = 20,
  onPageChange, onSort, sortKey, sortDir, selectable, onSelectionChange,
  loading, emptyMessage = 'No data found', rowClassName,
}: DataTableProps<T>) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const totalPages = Math.ceil(total / pageSize);
  const paginationRange = getPaginationRange(page, totalPages);

  const toggleRow = (id: string, row: T) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
    onSelectionChange?.(data.filter((r) => next.has((r as any).id)));
  };

  const toggleAll = () => {
    if (selected.size === data.length) {
      setSelected(new Set());
      onSelectionChange?.([]);
    } else {
      const ids = data.map((r) => (r as any).id).filter(Boolean);
      setSelected(new Set(ids));
      onSelectionChange?.(data);
    }
  };

  const handleSort = (col: Column) => {
    if (!col.sortable || !onSort) return;
    const newDir = sortKey === col.key && sortDir === 'asc' ? 'desc' : 'asc';
    onSort(col.key, newDir);
  };

  const SortIcon = ({ col }: { col: Column }) => {
    if (!col.sortable) return null;
    if (sortKey !== col.key) return <ChevronsUpDown className="w-3 h-3 ml-1 text-muted-foreground/50" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 ml-1 text-brand-500" />
      : <ChevronDown className="w-3 h-3 ml-1 text-brand-500" />;
  };

  if (loading) {
    return (
      <div className="panel">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex gap-4 px-3 py-2.5 border-b border-border/60">
            {columns.map((_, j) => (
              <div key={j} className="h-3 bg-secondary rounded animate-pulse flex-1" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse data-table">
          <thead>
            <tr>
              {selectable && (
                <th className="w-8">
                  <input
                    type="checkbox"
                    checked={selected.size === data.length && data.length > 0}
                    onChange={toggleAll}
                    className="accent-brand-500 cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(col.className, col.sortable && 'cursor-pointer select-none')}
                  onClick={() => handleSort(col)}
                >
                  <span className="flex items-center">
                    {col.label}
                    <SortIcon col={col} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="text-center py-12 text-muted-foreground text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => {
                const id = (row as any).id || String(i);
                return (
                  <tr key={id} className={cn(rowClassName?.(row))}>
                    {selectable && (
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.has(id)}
                          onChange={() => toggleRow(id, row)}
                          className="accent-brand-500 cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={col.className}>
                        {col.render ? col.render((row as any)[col.key], row) : (row as any)[col.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 bg-secondary/30 border-t border-border text-xs text-muted-foreground">
          <span>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total.toLocaleString()}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page === 1}
              className="px-2 py-1 border border-border rounded hover:border-brand-500 hover:text-brand-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            {paginationRange.map((p, i) =>
              p === '...' ? (
                <span key={`e${i}`} className="px-1">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange?.(p as number)}
                  className={cn(
                    'px-2 py-1 border rounded min-w-[28px]',
                    p === page
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'border-border hover:border-brand-500 hover:text-brand-500'
                  )}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page === totalPages}
              className="px-2 py-1 border border-border rounded hover:border-brand-500 hover:text-brand-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
