// frontend/src/features/admin/dashboard/components/JobStatusBreakdown.tsx

interface JobStatusBreakdownProps {
    jobs: {
        open: number;
        assigned: number;
        in_progress: number;
        completed: number;
        cancelled: number;
        total: number;
    };
    loading?: boolean;
}

const statuses = [
    { key: 'open', label: 'Open', color: 'bg-blue-500' },
    { key: 'assigned', label: 'Assigned', color: 'bg-amber-500' },
    { key: 'in_progress', label: 'In Progress', color: 'bg-orange-500' },
    { key: 'completed', label: 'Completed', color: 'bg-admin-primary-500' },
    { key: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
] as const;

export const JobStatusBreakdown = ({ jobs, loading }: JobStatusBreakdownProps) => {
    if (loading) {
        return (
            <div className="space-y-4">
                {statuses.map((s) => (
                    <div key={s.key}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                            <div className="h-3 w-8 bg-gray-100 rounded animate-pulse" />
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full animate-pulse" />
                    </div>
                ))}
            </div>
        );
    }

    const total = jobs.total || 1; // prevent division by zero

    return (
        <div className="space-y-4">
            {statuses.map((status) => {
                const count = jobs[status.key as keyof typeof jobs] as number;
                const percentage = (count / total) * 100;

                return (
                    <div key={status.key}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-admin-text-secondary">
                                {status.label}
                            </span>
                            <span className="text-sm font-semibold text-admin-text-primary">
                                {count}
                            </span>
                        </div>
                        <div className="h-2 bg-admin-bg-hover rounded-full overflow-hidden">
                            <div
                                className={`h-full ${status.color} rounded-full transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default JobStatusBreakdown;
