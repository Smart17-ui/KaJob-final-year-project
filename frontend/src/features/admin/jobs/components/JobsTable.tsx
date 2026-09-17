// frontend/src/features/admin/jobs/components/JobsTable.tsx

import { Eye } from 'lucide-react';
import { Table, Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import type { AdminJob } from '@/types/admin';

interface JobsTableProps {
    jobs: AdminJob[];
    loading: boolean;
    onView: (job: AdminJob) => void;
}

const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const formatBudget = (budget: string) => {
    const num = parseFloat(budget);
    if (isNaN(num)) return 'K0';
    return `K${num.toLocaleString('en-ZM', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

const getStatusVariant = (
    status: string
): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
    switch (status) {
        case 'OPEN':
            return 'info';
        case 'ASSIGNED':
            return 'warning';
        case 'IN_PROGRESS':
            return 'warning';
        case 'COMPLETED':
            return 'success';
        case 'CANCELLED':
            return 'danger';
        default:
            return 'neutral';
    }
};

export const JobsTable = ({ jobs, loading, onView }: JobsTableProps) => {
    const columns: Column<AdminJob>[] = [
        {
            key: 'job',
            header: 'Job',
            render: (job) => (
                <div className="min-w-0 max-w-md">
                    <p className="text-sm font-medium text-admin-text-primary truncate">
                        {job.title}
                    </p>
                    <p className="text-xs text-admin-text-secondary truncate">
                        {job.category_name || '—'}
                    </p>
                </div>
            ),
        },
        {
            key: 'client_name',
            header: 'Client',
            render: (job) => (
                <span className="text-sm text-admin-text-primary">
                    {job.client_name || '—'}
                </span>
            ),
        },
        {
            key: 'worker',
            header: 'Worker',
            render: (job) => {
                const workerName =
                    job.assigned_worker?.full_name ||
                    job.assigned_worker_name;
                return (
                    <span
                        className={`text-sm ${
                            workerName
                                ? 'text-admin-text-primary'
                                : 'text-admin-text-muted'
                        }`}
                    >
                        {workerName || 'Unassigned'}
                    </span>
                );
            },
        },
        {
            key: 'budget',
            header: 'Budget',
            render: (job) => (
                <span className="text-sm font-medium text-admin-text-primary">
                    {formatBudget(job.budget)}
                </span>
            ),
        },
        {
            key: 'location',
            header: 'Location',
            render: (job) => (
                <span className="text-sm text-admin-text-secondary truncate max-w-[150px] inline-block">
                    {job.general_location || '—'}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (job) => (
                <Badge variant={getStatusVariant(job.status)} dot>
                    {job.status_display || job.status}
                </Badge>
            ),
        },
        {
            key: 'posted_at',
            header: 'Posted',
            render: (job) => (
                <span className="text-sm text-admin-text-secondary">
                    {formatDate(job.posted_at || job.created_at)}
                </span>
            ),
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            render: (job) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onView(job);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-admin-primary-600 hover:bg-admin-primary-50 rounded-md transition-colors"
                >
                    <Eye size={14} />
                    View
                </button>
            ),
        },
    ];

    return (
        <Table
            data={jobs}
            columns={columns}
            loading={loading}
            keyExtractor={(job) => job.id}
            onRowClick={onView}
            emptyState={
                <EmptyState
                    title="No jobs found"
                    description="Try adjusting your search or filters."
                />
            }
        />
    );
};

export default JobsTable;
