// frontend/src/features/admin/reports/components/ReportsFilters.tsx

import { Search } from 'lucide-react';

interface Props {
    search: string;
    onSearchChange: (v: string) => void;
    status: string;
    onStatusChange: (v: string) => void;
}

const STATUS_TABS = [
    { value: '', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'UNDER_INVESTIGATION', label: 'Investigating' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'ESCALATED_TO_POLICE', label: 'Escalated' },
];

export const ReportsFilters = ({
    search,
    onSearchChange,
    status,
    onStatusChange,
}: Props) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Status tabs */}
            <div className="flex flex-wrap items-center gap-1">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => onStatusChange(tab.value)}
                        className={`
                            px-3 py-1.5 text-sm font-medium rounded-lg transition
                            ${
                                status === tab.value
                                    ? 'bg-admin-primary-50 text-admin-primary-700'
                                    : 'text-admin-text-secondary hover:bg-admin-bg-secondary'
                            }
                        `}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-tertiary"
                />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search reports..."
                    className="
                        pl-9 pr-3 py-2 text-sm
                        border border-admin-border-light rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-admin-primary-500
                        w-full sm:w-64
                    "
                />
            </div>
        </div>
    );
};
