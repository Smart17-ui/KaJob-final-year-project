// frontend/src/features/admin/reports/components/ReportsStats.tsx

import { AlertCircle, Clock, ShieldCheck, Flag } from 'lucide-react';

interface Props {
    total: number;
    pending: number;
    investigating: number;
    resolved: number;
    escalated: number;
    loading?: boolean;
}

export const ReportsStats = ({
    total,
    pending,
    investigating,
    resolved,
    escalated,
    loading,
}: Props) => {
    const cards = [
        {
            label: 'Pending',
            value: pending,
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
        },
        {
            label: 'Investigating',
            value: investigating,
            icon: AlertCircle,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            label: 'Resolved',
            value: resolved,
            icon: ShieldCheck,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
        },
        {
            label: 'Escalated',
            value: escalated,
            icon: Flag,
            color: 'text-red-600',
            bg: 'bg-red-50',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <div
                        key={card.label}
                        className="bg-white rounded-lg border border-admin-border-light p-5"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-admin-text-secondary">
                                    {card.label}
                                </p>
                                <p className="text-2xl font-bold text-admin-text-primary mt-1">
                                    {loading ? '—' : card.value}
                                </p>
                            </div>
                            <div className={`p-3 rounded-lg ${card.bg}`}>
                                <Icon size={20} className={card.color} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
