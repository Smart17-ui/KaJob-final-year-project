// frontend/src/features/admin/jobs/components/JobsStats.tsx

import { Briefcase, Clock, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface JobsStatsProps {
    total: number;
    open: number;
    inProgress: number;
    completed: number;
    loading?: boolean;
}

export const JobsStats = ({
    total,
    open,
    inProgress,
    completed,
    loading,
}: JobsStatsProps) => {
    const stats = [
        {
            label: 'Total Jobs',
            value: total,
            icon: Briefcase,
            bg: 'bg-admin-primary-50',
            color: 'text-admin-primary-600',
        },
        {
            label: 'Open',
            value: open,
            icon: Clock,
            bg: 'bg-blue-50',
            color: 'text-blue-600',
        },
        {
            label: 'In Progress',
            value: inProgress,
            icon: Clock,
            bg: 'bg-amber-50',
            color: 'text-amber-600',
        },
        {
            label: 'Completed',
            value: completed,
            icon: CheckCircle,
            bg: 'bg-green-50',
            color: 'text-green-600',
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} padding="md">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse mb-3" />
                        <div className="h-4 w-20 bg-gray-100 rounded animate-pulse mb-2" />
                        <div className="h-6 w-12 bg-gray-100 rounded animate-pulse" />
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card key={stat.label} padding="md">
                        <div
                            className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}
                        >
                            <Icon size={20} />
                        </div>
                        <p className="text-sm text-admin-text-secondary">
                            {stat.label}
                        </p>
                        <p className="text-2xl font-bold text-admin-text-primary mt-1">
                            {stat.value}
                        </p>
                    </Card>
                );
            })}
        </div>
    );
};

export default JobsStats;
