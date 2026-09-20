// frontend/src/features/admin/auditLogs/AuditLogsPage.tsx

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, Search, Filter, X } from 'lucide-react';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';

import { adminAuditLogsApi } from '@/api/admin/auditLogs';
import type { AuditStats } from '@/api/admin/auditLogs';
import type { AuditLog } from '@/types/admin';

// ============================================
// HELPERS
// ============================================

const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const describeAction = (action: string) => {
    const match = action.match(/^([A-Z]+)_(.+)$/);
    if (match && match[1] && match[1].length <= 7) {
        return { method: match[1], path: match[2] };
    }
    return { method: null, path: action.replace(/_/g, ' ') };
};

const methodBadgeClass = (method: string | null) => {
    switch (method) {
        case 'GET':
            return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'POST':
            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'PUT':
        case 'PATCH':
            return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'DELETE':
            return 'bg-red-50 text-red-700 border-red-200';
        default:
            return 'bg-slate-100 text-slate-700 border-slate-200';
    }
};

// ============================================
// COMPONENT
// ============================================

export const AuditLogsPage = () => {
    const { showToast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();

    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [action, setAction] = useState(searchParams.get('action') || '');
    const [entityType, setEntityType] = useState(
        searchParams.get('entity_type') || ''
    );
    const [startDate, setStartDate] = useState(
        searchParams.get('start_date') || ''
    );
    const [endDate, setEndDate] = useState(
        searchParams.get('end_date') || ''
    );

    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<AuditStats | null>(null);

    const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
    const [pageSize, setPageSize] = useState(20);

    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);

            const data = await adminAuditLogsApi.getLogs({
                search: search || undefined,
                action: action || undefined,
                entity_type: entityType || undefined,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
                page,
                page_size: pageSize,
                ordering: '-created_at',
            });

            const results = (data as any)?.results || [];
            const count = (data as any)?.count || 0;

            setLogs(results);
            setTotalCount(count);
        } catch (error: any) {
            showToast({
                type: 'error',
                title: 'Failed to load audit logs',
                message: error.message,
            });
            setLogs([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [
        search,
        action,
        entityType,
        startDate,
        endDate,
        page,
        pageSize,
        showToast,
    ]);

    const fetchStats = useCallback(async () => {
        try {
            const data = await adminAuditLogsApi.getStats();
            setStats(data);
        } catch (error) {
            console.warn('Failed to load audit stats');
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (action) params.action = action;
        if (entityType) params.entity_type = entityType;
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        if (page > 1) params.page = String(page);
        setSearchParams(params, { replace: true });
    }, [
        search,
        action,
        entityType,
        startDate,
        endDate,
        page,
        setSearchParams,
    ]);

    useEffect(() => {
        setPage(1);
    }, [search, action, entityType, startDate, endDate]);

    const handleRefresh = () => {
        fetchLogs();
        fetchStats();
    };

    const handleClearFilters = () => {
        setSearch('');
        setAction('');
        setEntityType('');
        setStartDate('');
        setEndDate('');
    };

    const hasActiveFilters =
        search || action || entityType || startDate || endDate;

    const totalPages = Math.ceil(totalCount / pageSize);

    const todayCount =
        stats?.daily_activity?.find(
            (d) => d.date === new Date().toISOString().slice(0, 10)
        )?.count ?? 0;

    return (
        <div>
            <AdminPageHeader
                breadcrumbs={[{ label: 'Audit Logs' }]}
                title="Audit Logs"
                description="Every admin and system action, in one place."
                actions={
                    <Button
                        variant="secondary"
                        icon={<RefreshCw size={16} />}
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                }
            />

            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        label="Total Actions"
                        value={stats.total_actions}
                        hint="Last 7 days"
                    />
                    <StatCard
                        label="Today"
                        value={todayCount}
                        hint="Actions today"
                    />
                    <StatCard
                        label="Active Users"
                        value={stats.top_users?.length ?? 0}
                        hint="In the last 7 days"
                    />
                    <StatCard
                        label="Top Action"
                        value={
                            stats.by_action?.[0]
                                ? String(stats.by_action[0].count)
                                : '—'
                        }
                        hint={stats.by_action?.[0]?.action}
                    />
                </div>
            )}

            <Card padding="md" className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className="relative lg:col-span-2">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-tertiary"
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by action, path, entity..."
                            className="w-full pl-9 pr-3 py-2 text-sm border border-admin-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary-500"
                        />
                    </div>

                    <input
                        type="text"
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        placeholder="Exact action"
                        className="w-full px-3 py-2 text-sm border border-admin-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary-500"
                    />

                    <select
                        value={entityType}
                        onChange={(e) => setEntityType(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-admin-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary-500"
                    >
                        <option value="">All entity types</option>
                        <option value="API_REQUEST">API Request</option>
                        <option value="USER">User</option>
                        <option value="JOB">Job</option>
                        <option value="APPLICATION">Application</option>
                        <option value="REVIEW">Review</option>
                        <option value="REPORT">Report</option>
                        <option value="IDENTITY_VERIFICATION">
                            Identity Verification
                        </option>
                    </select>

                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-admin-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary-500"
                            title="Start date"
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-admin-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary-500"
                            title="End date"
                        />
                    </div>
                </div>

                {hasActiveFilters && (
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-admin-text-secondary">
                            {totalCount} result
                            {totalCount === 1 ? '' : 's'}
                        </span>
                        <button
                            onClick={handleClearFilters}
                            className="text-xs text-admin-primary-600 hover:underline inline-flex items-center gap-1"
                        >
                            <X size={12} />
                            Clear filters
                        </button>
                    </div>
                )}
            </Card>

            <Card padding="none">
                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="w-8 h-8 border-4 border-admin-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <Filter
                            size={24}
                            className="text-admin-text-tertiary mb-2"
                        />
                        <p className="text-sm text-admin-text-secondary">
                            No audit logs match your filters.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-admin-bg-secondary text-left text-xs font-semibold text-admin-text-secondary uppercase">
                                <tr>
                                    <th className="px-4 py-3">
                                        Timestamp
                                    </th>
                                    <th className="px-4 py-3">User</th>
                                    <th className="px-4 py-3">Action</th>
                                    <th className="px-4 py-3">Entity</th>
                                    <th className="px-4 py-3">IP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-admin-border-light">
                                {logs.map((log) => {
                                    const { method, path } =
                                        describeAction(log.action);
                                    return (
                                        <tr
                                            key={log.id}
                                            onClick={() => setSelectedLog(log)}
                                            className="cursor-pointer hover:bg-admin-bg-secondary"
                                        >
                                            <td className="px-4 py-3 text-xs text-admin-text-tertiary whitespace-nowrap">
                                                {formatDateTime(
                                                    log.created_at
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-admin-text-primary">
                                                    {log.user_name ||
                                                        'Unknown User'}
                                                </div>
                                                {log.user_email && (
                                                    <div className="text-xs text-admin-text-tertiary">
                                                        {log.user_email}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {method ? (
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold border ${methodBadgeClass(
                                                                method
                                                            )}`}
                                                        >
                                                            {method}
                                                        </span>
                                                        <span className="text-xs text-admin-text-secondary font-mono truncate max-w-xs">
                                                            {path}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-admin-text-primary">
                                                        {path}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-admin-text-secondary whitespace-nowrap">
                                                {log.entity_type || '—'}
                                                {log.entity_id
                                                    ? ` #${log.entity_id}`
                                                    : ''}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-admin-text-tertiary font-mono">
                                                {log.ip_address || '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && logs.length > 0 && (
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        totalItems={totalCount}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setPage(1);
                        }}
                    />
                )}
            </Card>

            {selectedLog && (
                <LogDetailModal
                    log={selectedLog}
                    onClose={() => setSelectedLog(null)}
                />
            )}
        </div>
    );
};

// ============================================
// SUB COMPONENTS
// ============================================

const StatCard = ({
    label,
    value,
    hint,
}: {
    label: string;
    value: number | string;
    hint?: string;
}) => (
    <div className="bg-white rounded-lg border border-admin-border-light p-5">
        <p className="text-sm text-admin-text-secondary">{label}</p>
        <p className="text-2xl font-bold text-admin-text-primary mt-1">
            {value}
        </p>
        {hint && (
            <p className="text-xs text-admin-text-tertiary mt-1 truncate">
                {hint}
            </p>
        )}
    </div>
);

const LogDetailModal = ({
    log,
    onClose,
}: {
    log: AuditLog;
    onClose: () => void;
}) => {
    const { method, path } = describeAction(log.action);
    return (
        <div
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-admin-border-light sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-admin-text-primary">
                            Audit Log #{log.id}
                        </h2>
                        <p className="text-xs text-admin-text-secondary mt-0.5">
                            {formatDateTime(log.created_at)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-admin-bg-secondary rounded-full"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <DetailRow label="User" value={log.user_name} />
                    {log.user_email && (
                        <DetailRow label="Email" value={log.user_email} />
                    )}

                    <div className="flex items-start justify-between gap-4">
                        <span className="text-sm text-admin-text-secondary shrink-0">
                            Action
                        </span>
                        <span className="text-sm text-admin-text-primary text-right">
                            {method ? (
                                <span className="inline-flex items-center gap-2">
                                    <span
                                        className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold border ${methodBadgeClass(
                                            method
                                        )}`}
                                    >
                                        {method}
                                    </span>
                                    <span className="font-mono text-xs">
                                        {path}
                                    </span>
                                </span>
                            ) : (
                                log.action
                            )}
                        </span>
                    </div>

                    <DetailRow
                        label="Entity Type"
                        value={log.entity_type || '—'}
                    />
                    {log.entity_id && (
                        <DetailRow
                            label="Entity ID"
                            value={`#${log.entity_id}`}
                        />
                    )}
                    <DetailRow
                        label="IP Address"
                        value={log.ip_address || '—'}
                        mono
                    />
                    {log.user_agent && (
                        <DetailRow
                            label="User Agent"
                            value={log.user_agent}
                            mono
                        />
                    )}

                    {log.details && Object.keys(log.details).length > 0 && (
                        <div className="border-t border-admin-border-light pt-4">
                            <p className="text-xs font-semibold text-admin-text-secondary uppercase mb-2">
                                Details
                            </p>
                            <pre className="text-xs bg-admin-bg-secondary p-4 rounded-lg overflow-x-auto font-mono">
                                {JSON.stringify(log.details, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const DetailRow = ({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) => (
    <div className="flex items-start justify-between gap-4">
        <span className="text-sm text-admin-text-secondary shrink-0">
            {label}
        </span>
        <span
            className={`text-sm text-admin-text-primary text-right break-all ${
                mono ? 'font-mono text-xs' : ''
            }`}
        >
            {value}
        </span>
    </div>
);

export default AuditLogsPage;
