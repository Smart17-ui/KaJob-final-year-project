// frontend/src/features/admin/jobs/JobsPage.tsx

import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { useDebounce } from '@/hooks/useDebounce';

import { adminJobsApi } from '@/api/admin/jobs';
import type { AdminJob } from '@/types/admin';

import { JobsStats } from './components/JobsStats';
import { JobsTable } from './components/JobsTable';
import { JobsFilters } from './components/JobsFilters';

// ============================================
// COMPONENT
// ============================================

export const JobsPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();

    // State
    const [jobs, setJobs] = useState<AdminJob[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [status, setStatus] = useState(searchParams.get('status') || '');

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        inProgress: 0,
        completed: 0,
    });

    // Pagination
    const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
    const [pageSize, setPageSize] = useState(20);

    // Debounce search
    const debouncedSearch = useDebounce(search, 400);

    // ============ FETCH ============
    const fetchJobs = useCallback(async () => {
        try {
            setLoading(true);

            const data = await adminJobsApi.getJobs({
                search: debouncedSearch || undefined,
                status: status || undefined,
                page,
                page_size: pageSize,
            });

            const results = (data as any)?.results || [];
            const count = (data as any)?.count || 0;

            setJobs(results);
            setTotalCount(count);

            // Calculate stats from current data (only on first page, no filters)
            if (page === 1 && !debouncedSearch && !status) {
                const openCount = results.filter(
                    (j: AdminJob) => j.status === 'OPEN'
                ).length;
                const inProgressCount = results.filter((j: AdminJob) =>
                    ['ASSIGNED', 'IN_PROGRESS'].includes(j.status)
                ).length;
                const completedCount = results.filter(
                    (j: AdminJob) => j.status === 'COMPLETED'
                ).length;

                setStats({
                    total: count,
                    open: openCount,
                    inProgress: inProgressCount,
                    completed: completedCount,
                });
            }
        } catch (error: any) {
            showToast({
                type: 'error',
                title: 'Failed to load jobs',
                message: error.message,
            });
            setJobs([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, status, page, pageSize, showToast]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    // Sync URL params
    useEffect(() => {
        const params: Record<string, string> = {};
        if (debouncedSearch) params.search = debouncedSearch;
        if (status) params.status = status;
        if (page > 1) params.page = String(page);

        setSearchParams(params, { replace: true });
    }, [debouncedSearch, status, page, setSearchParams]);

    // Reset page on filter change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, status]);

    // ============ HANDLERS ============
    const handleView = (job: AdminJob) => {
        navigate(`/admin/jobs/${job.id}`);
    };

    const handleRefresh = () => {
        fetchJobs();
    };

    // ============ RENDER ============
    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div>
            <AdminPageHeader
                breadcrumbs={[{ label: 'Jobs' }]}
                title="Jobs"
                description="Manage all jobs posted on KaJob."
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

            {/* Stats */}
            <JobsStats
                total={stats.total}
                open={stats.open}
                inProgress={stats.inProgress}
                completed={stats.completed}
                loading={loading}
            />

            {/* Filters */}
            <Card padding="md" className="mb-6">
                <JobsFilters
                    search={search}
                    onSearchChange={setSearch}
                    status={status}
                    onStatusChange={setStatus}
                />
            </Card>

            {/* Table */}
            <Card padding="none">
                <JobsTable
                    jobs={jobs}
                    loading={loading}
                    onView={handleView}
                />

                {!loading && jobs.length > 0 && (
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
        </div>
    );
};

export default JobsPage;
