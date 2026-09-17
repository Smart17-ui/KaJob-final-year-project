// frontend/src/features/admin/verifications/components/VerificationStats.tsx

import { ShieldCheck, Clock, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface VerificationStatsProps {
    pending: number;
    verified: number;
    rejected: number;
    loading?: boolean;
}

export const VerificationStats = ({
    pending,
    verified,
    rejected,
    loading,
}: VerificationStatsProps) => {
    const stats = [
        {
            label: 'Pending',
            value: pending,
            icon: Clock,
            bg: 'bg-amber-50',
            color: 'text-amber-600',
        },
        {
            label: 'Verified',
            value: verified,
            icon: ShieldCheck,
            bg: 'bg-green-50',
            color: 'text-green-600',
        },
        {
            label: 'Rejected',
            value: rejected,
            icon: XCircle,
            bg: 'bg-red-50',
            color: 'text-red-600',
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[...Array(3)].map((_, i) => (
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card key={stat.label} padding="md">
                        <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
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

export default VerificationStats;
