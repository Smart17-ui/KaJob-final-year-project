// frontend/src/features/admin/analytics/components/AnalyticsStats.tsx

import {
    Users,
    Briefcase,
    CheckCircle,
    XCircle,
    Star,
} from 'lucide-react';
import type { PlatformStats } from '@/types/admin';

interface Props {
    stats: PlatformStats | null;
    loading: boolean;
}

export const AnalyticsStats = ({ stats, loading }: Props) => {
    const cards = [
        {
            label: 'Total Users',
            value: stats?.users.total ?? 0,
            sub: `${stats?.users.new_users ?? 0} new this period`,
            icon: Users,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
        },
        {
            label: 'Jobs Created',
            value: stats?.jobs.created ?? 0,
            sub: `${stats?.jobs.total ?? 0} total in system`,
            icon: Briefcase,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            label: 'Jobs Completed',
            value: stats?.jobs.completed ?? 0,
            sub: `${stats?.jobs.completion_rate ?? 0}% completion rate`,
            icon: CheckCircle,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
        },
        {
            label: 'Jobs Cancelled',
            value: stats?.jobs.cancelled ?? 0,
            sub: 'In this period',
            icon: XCircle,
            color: 'text-red-600',
            bg: 'bg-red-50',
        },
        {
            label: 'Reviews',
            value: stats?.reviews.total ?? 0,
            sub: `Avg ${stats?.reviews.average_rating ?? 0} ★`,
            icon: Star,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <div
                        key={card.label}
                        className="bg-white rounded-lg border border-admin-border-light p-5"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <p className="text-sm text-admin-text-secondary">
                                {card.label}
                            </p>
                            <div className={`p-2 rounded-lg ${card.bg}`}>
                                <Icon size={16} className={card.color} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-admin-text-primary">
                            {loading ? '—' : card.value.toLocaleString()}
                        </p>
                        <p className="text-xs text-admin-text-tertiary mt-1">
                            {card.sub}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};

export default AnalyticsStats;
