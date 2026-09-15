// frontend/src/components/admin/StatCard.tsx

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    subtitle?: string;
    trend?: number;             // percentage change
    trendPeriod?: string;       // e.g., "vs last month"
    invertTrend?: boolean;      // for things like "reports" (up = bad)
    loading?: boolean;
}

export const StatCard = ({
    title,
    value,
    icon,
    subtitle,
    trend,
    trendPeriod = 'vs last month',
    invertTrend = false,
    loading = false,
}: StatCardProps) => {
    // Loading state
    if (loading) {
        return (
            <div className="bg-white border border-admin-border-light rounded-admin-card shadow-admin-card p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse" />
                    <div className="w-16 h-4 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="h-4 w-24 bg-gray-100 rounded mb-2 animate-pulse" />
                <div className="h-8 w-32 bg-gray-100 rounded animate-pulse" />
            </div>
        );
    }

    const hasTrend = typeof trend === 'number' && !isNaN(trend);
    const isPositive = hasTrend && (invertTrend ? trend < 0 : trend > 0);
    const isNegative = hasTrend && (invertTrend ? trend > 0 : trend < 0);

    return (
        <div className="bg-white border border-admin-border-light rounded-admin-card shadow-admin-card p-6 hover:shadow-admin-card-hover transition-shadow">
            {/* Top row: Icon + Trend */}
            <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-lg bg-admin-primary-50 text-admin-primary-600">
                    {icon}
                </div>
                {hasTrend && (
                    <div
                        className={`
                            flex items-center gap-1 text-xs font-medium
                            ${isPositive ? 'text-green-600' : ''}
                            ${isNegative ? 'text-red-600' : ''}
                            ${!isPositive && !isNegative ? 'text-admin-text-muted' : ''}
                        `}
                    >
                        {trend > 0 ? (
                            <TrendingUp size={14} />
                        ) : trend < 0 ? (
                            <TrendingDown size={14} />
                        ) : null}
                        <span>{Math.abs(trend).toFixed(1)}%</span>
                    </div>
                )}
            </div>

            {/* Title */}
            <p className="text-sm font-medium text-admin-text-secondary mb-1">
                {title}
            </p>

            {/* Value */}
            <p className="text-2xl font-bold text-admin-text-primary">
                {value}
            </p>

            {/* Subtitle / Trend period */}
            {(subtitle || hasTrend) && (
                <p className="mt-1 text-xs text-admin-text-muted">
                    {subtitle || trendPeriod}
                </p>
            )}
        </div>
    );
};

export default StatCard;
