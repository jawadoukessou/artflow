import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Currency ─────────────────────────────────────────────────────────
export function formatCurrency(
  value: number | string,
  currency = 'EUR',
  compact = false
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '—';
  if (compact) {
    if (Math.abs(num) >= 1_000_000) return `${currency === 'EUR' ? '€' : '$'}${(num / 1_000_000).toFixed(1)}M`;
    if (Math.abs(num) >= 1_000) return `${currency === 'EUR' ? '€' : '$'}${(num / 1_000).toFixed(0)}k`;
  }
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(num);
}

// ── Dates ────────────────────────────────────────────────────────────
export function formatDate(date: string | Date | null, fmt = 'd MMM yy'): string {
  if (!date) return '—';
  return format(new Date(date), fmt);
}

export function formatRelative(date: string | Date | null): string {
  if (!date) return '—';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function daysOverdue(dueDate: string | Date): number {
  return Math.max(0, differenceInDays(new Date(), new Date(dueDate)));
}

export function daysUntilDue(dueDate: string | Date): number {
  return differenceInDays(new Date(dueDate), new Date());
}

// ── Risk ─────────────────────────────────────────────────────────────
export function getRiskLabel(level: string): string {
  const map: Record<string, string> = {
    LOW: 'B — Low', MEDIUM: 'C — Medium', HIGH: 'D — High', CRITICAL: 'E — Critical',
  };
  return map[level] || level;
}

export function getRiskColor(level: string): string {
  const map: Record<string, string> = {
    LOW: 'text-green-600', MEDIUM: 'text-warning', HIGH: 'text-orange-500', CRITICAL: 'text-danger',
  };
  return map[level] || 'text-muted-foreground';
}

export function getRiskBadgeClasses(level: string): string {
  const map: Record<string, string> = {
    LOW: 'bg-success-light text-success-dark',
    MEDIUM: 'bg-warning-light text-warning-dark',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-danger-light text-danger-dark',
  };
  return map[level] || 'bg-secondary text-secondary-foreground';
}

// ── Invoice status ───────────────────────────────────────────────────
export function getStatusBadgeClasses(status: string): string {
  const map: Record<string, string> = {
    PAID: 'pill-paid',
    OVERDUE: 'pill-overdue',
    PARTIALLY_PAID: 'pill-partial',
    DISPUTED: 'pill-disputed',
    PENDING: 'pill-pending',
    LEGAL: 'pill-legal',
    PROMISE_TO_PAY: 'pill-info',
    DRAFT: 'pill-pending',
    CANCELLED: 'pill-pending',
  };
  return `pill ${map[status] || 'pill-pending'}`;
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PAID: 'Paid', OVERDUE: 'Overdue', PARTIALLY_PAID: 'Partial',
    DISPUTED: 'Disputed', PENDING: 'Pending', LEGAL: 'Legal',
    PROMISE_TO_PAY: 'Promise', DRAFT: 'Draft', CANCELLED: 'Cancelled',
  };
  return map[status] || status;
}

// ── Numbers ──────────────────────────────────────────────────────────
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDays(days: number): string {
  if (days === 0) return 'On time';
  return days > 0 ? `+${days}d` : `${days}d`;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

// ── Pagination ───────────────────────────────────────────────────────
export function getPaginationRange(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
  if (currentPage >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

// ── Debounce ─────────────────────────────────────────────────────────
export function debounce<T extends (...args: any[]) => any>(fn: T, ms = 300): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

// ── Download ─────────────────────────────────────────────────────────
export function downloadCSV(data: any[], filename = 'export.csv') {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((r) => headers.map((h) => JSON.stringify(r[h] ?? '')).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
