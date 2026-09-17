// frontend/src/features/admin/analytics/components/RatingChart.tsx

import { Star } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import type { PlatformStats } from '@/types/admin';

interface Props {
    stats: PlatformStats | null;
    loading?: boolean;
}

export const RatingChart = ({ stats, loading }: Props) => {
    if (!stats) return null;

    // Hide the chart entirely when no reviews exist
    if (!loading && stats.reviews.total === 0) return null;

    const total = stats.reviews.total;
    const rows = [5, 4, 3, 2, 1].map((star) => {
        const count = stats.reviews.rating_distribution[String(star)] || 0;
        const pct = total > 0 ? (count / total) * 100 : 0;
        return { star, count, pct };
    });

    return (
        <Card padding="md">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-admin-text-primary">
                        Rating Distribution
                    </h3>
                    <p className="text-xs text-admin-text-secondary mt-0.5">
                        Based on {total} review{total === 1 ? '' : 's'} in this period
                    </p>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                    <Star size={16} fill="currentColor" />
                    <span className="text-sm font-semibold text-admin-text-primary">
                        {stats.reviews.average_rating.toFixed(1)}
                    </span>
                </div>
            </div>

            <div className="space-y-2.5">
                {rows.map(({ star, count, pct }) => (
                    <div key={star} className="flex items-center gap-3">
                        <span className="text-xs text-admin-text-secondary w-10">
                            {star} ★
                        </span>
                        <div className="flex-1 bg-admin-bg-secondary rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-amber-500 h-2 rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                        <span className="text-xs text-admin-text-tertiary w-10 text-right">
                            {count}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default RatingChart;
