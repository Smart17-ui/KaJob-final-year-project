// frontend/src/features/admin/reports/ReportsPage.tsx

import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useDebounce } from '@/hooks/useDebounce';

import { adminReportsApi } from '@/api/admin/reports';
import type { AdminReport, ReportStats } from '@/types/admin';

import { ReportsStats } from './components/ReportsStats';
import { ReportsTable } from './components/ReportsTable';
import { ReportsFilters } from './components/ReportsFilters';

// ============================================
// COMPONENT
// ============================================

export const ReportsPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();

    // State
    const [reports, setReports] = useState<AdminReport[]>([]);
    const [stats, setStats] = useState<ReportStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [status, setStatus] = useState(searchParams.get('status') || '');

    const debouncedSearch = useDebounce(search, 400);

    // ============ FETCH ============
    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);

            const [listData, statsData] = await Promise.all([
                adminReportsApi.getReports({
                    status: (status as any) || undefined,
                }),
                adminReportsApi.getStats(),
            ]);

            setReports(listData.results || []);
            setStats(statsData);
        } catch (error: any) {
            showToast({
                type: 'error',
                title: 'Failed to load reports',
                message: error.message,
            });
            setReports([]);
            setStats(null);
        } finally {
            setLoading(false);
        }
    }, [status, showToast]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    // Sync URL
    useEffect(() => {
        const params: Record<string, string> = {};
        if (debouncedSearch) params.search = debouncedSearch;
        if (status) params.status = status;
        setSearchParams(params, { replace: true });
    }, [debouncedSearch, status, setSearchParams]);

    // Client-side search filter
    // NOTE: use optional chaining — general complaints have
    // reported_user: null and job_title: null.
    const filteredReports = debouncedSearch
        ? reports.filter((r) => {
              const q = debouncedSearch.toLowerCase();
              return (
                  r.reference_number?.toLowerCase().includes(q) ||
                  r.reporter?.full_name?.toLowerCase().includes(q) ||
                  r.reported_user?.full_name?.toLowerCase().includes(q) ||
                  r.category_display?.toLowerCase().includes(q)
              );
          })
        : reports;

    // ============ HANDLERS ============
    const handleView = (report: AdminReport) => {
        navigate(`/admin/reports/${report.id}`);
    };

    const handleRefresh = () => {
        fetchReports();
    };

    // ============ RENDER ============
    return (
        <div>
            <AdminPageHeader
                breadcrumbs={[{ label: 'Reports' }]}
                title="Reports"
                description="Investigate reported users and take action."
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

            <ReportsStats
                total={stats?.total ?? 0}
                pending={stats?.pending ?? 0}
                investigating={stats?.under_investigation ?? 0}
                resolved={stats?.resolved ?? 0}
                escalated={stats?.escalated_to_police ?? 0}
                loading={loading}
            />

            <Card padding="md" className="mb-6">
                <ReportsFilters
                    search={search}
                    onSearchChange={setSearch}
                    status={status}
                    onStatusChange={setStatus}
                />
            </Card>

            <Card padding="none">
                <ReportsTable
                    reports={filteredReports}
                    loading={loading}
                    onView={handleView}
                />
            </Card>
        </div>
    );
};

export default ReportsPage;
