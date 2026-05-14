'use client';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: number;
  trendLabel?: string;
  color?: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'default';
  icon?: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
}

const colorMap = {
  blue: 'border-t-brand-500',
  green: 'border-t-success',
  red: 'border-t-danger',
  amber: 'border-t-warning',
  purple: 'border-t-purple-500',
  default: 'border-t-brand-500',
};

export function KpiCard({ label, value, sub, trend, trendLabel, color = 'blue', icon, onClick, loading }: KpiCardProps) {
  if (loading) {
    return (
      <div className={cn('kpi-card border-t-4', colorMap[color])}>
        <div className="h-2.5 w-20 bg-secondary rounded animate-pulse mb-3" />
        <div className="h-7 w-32 bg-secondary rounded animate-pulse mb-2" />
        <div className="h-2 w-24 bg-secondary rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className={cn('kpi-card border-t-4 transition-shadow', colorMap[color], onClick && 'cursor-pointer hover:shadow-card-hover')}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="text-2xs font-bold text-muted-foreground uppercase tracking-wide">{label}</div>
        {icon && <div className="text-muted-foreground/60">{icon}</div>}
      </div>
      <div className="text-xl font-bold text-foreground leading-tight">{value}</div>
      {(sub || trend !== undefined) && (
        <div className="flex items-center gap-1.5 mt-1">
          {trend !== undefined && (
            <span className={cn('flex items-center gap-0.5 text-2xs font-bold', trend > 0 ? 'text-danger' : 'text-success')}>
              {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
            </span>
          )}
          {sub && <span className="text-2xs text-muted-foreground">{sub}</span>}
          {trendLabel && <span className="text-2xs text-muted-foreground">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
