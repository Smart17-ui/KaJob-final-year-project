// frontend/src/features/admin/verifications/components/VerificationsTable.tsx

import { Eye } from 'lucide-react';
import { Table, Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import type { PendingVerification } from '@/types/admin';

interface VerificationsTableProps {
    verifications: PendingVerification[];
    loading: boolean;
    onReview: (v: PendingVerification) => void;
}

const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase();
};

const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getStatusVariant = (
    status?: string
): 'success' | 'warning' | 'danger' | 'neutral' => {
    switch (status) {
        case 'VERIFIED':
            return 'success';
        case 'PENDING':
        case 'UNDER_REVIEW':
            return 'warning';
        case 'REJECTED':
            return 'danger';
        default:
            return 'neutral';
    }
};

export const VerificationsTable = ({
    verifications,
    loading,
    onReview,
}: VerificationsTableProps) => {
    const columns: Column<PendingVerification>[] = [
        {
            key: 'applicant',
            header: 'Applicant',
            render: (v) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-admin-primary-500 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-semibold">
                            {getInitials(v.user?.full_name)}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-admin-text-primary truncate">
                            {v.user?.full_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-admin-text-secondary truncate">
                            {v.user?.email || 'No email'}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: 'document_type',
            header: 'Document',
            render: (v) => (
                <span className="text-sm text-admin-text-primary">
                    {v.document_type?.replace('_', ' ') || '—'}
                </span>
            ),
        },
        {
            key: 'document_number',
            header: 'Document #',
            render: (v) => (
                <span className="text-sm font-mono text-admin-text-secondary">
                    {v.document_number || '—'}
                </span>
            ),
        },
        {
            key: 'submitted_at',
            header: 'Submitted',
            render: (v) => (
                <span className="text-sm text-admin-text-secondary">
                    {formatDate(v.submitted_at)}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (v) => (
                <Badge
                    variant={getStatusVariant(
                        v.verification_status || v.status
                    )}
                    dot
                >
                    {v.status_display || v.status || v.verification_status || '—'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            render: (v) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onReview(v);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-admin-primary-600 hover:bg-admin-primary-50 rounded-md transition-colors"
                >
                    <Eye size={14} />
                    Review
                </button>
            ),
        },
    ];

    return (
        <Table
            data={verifications}
            columns={columns}
            loading={loading}
            keyExtractor={(v) => v.id}
            onRowClick={onReview}
            emptyState={
                <EmptyState
                    title="No verifications found"
                    description="All caught up! There are no verifications in this queue."
                />
            }
        />
    );
};

export default VerificationsTable;
