// frontend/src/features/admin/analytics/components/AnalyticsPeriodSelector.tsx

import type { AnalyticsPeriod } from '@/types/admin';

interface Props {
    value: AnalyticsPeriod;
    onChange: (period: AnalyticsPeriod) => void;
}

const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_week', label: 'This Week' },
    { value: 'last_week', label: 'Last Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_year', label: 'This Year' },
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'all_time', label: 'All Time' },
];

export const AnalyticsPeriodSelector = ({ value, onChange }: Props) => {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value as AnalyticsPeriod)}
            className="
                px-3 py-2 text-sm
                border border-admin-border-light rounded-lg
                bg-white text-admin-text-primary
                focus:outline-none focus:ring-2 focus:ring-admin-primary-500
            "
        >
            {PERIODS.map((p) => (
                <option key={p.value} value={p.value}>
                    {p.label}
                </option>
            ))}
        </select>
    );
};

export default AnalyticsPeriodSelector;
