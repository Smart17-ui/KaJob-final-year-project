// frontend/src/features/admin/analytics/AnalyticsPage.tsx

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

import { adminAnalyticsApi } from '@/api/admin/analytics';
import type { PlatformStats, AnalyticsPeriod } from '@/types/admin';

import { AnalyticsPeriodSelector } from './components/AnalyticsPeriodSelector';
import { AnalyticsStats } from './components/AnalyticsStats';
import { ActivityChart } from './components/ActivityChart';
import { JobsStatusChart } from './components/JobsStatusChart';
import { RatingChart } from './components/RatingChart';

// ============================================
// COMPONENT
// ============================================

export const AnalyticsPage = () => {
    const { showToast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();

    const initialPeriod =
        (searchParams.get('period') as AnalyticsPeriod) || 'this_month';

    const [period, setPeriod] = useState<AnalyticsPeriod>(initialPeriod);
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [loading, setLoading] = useState(true);

    // ============ FETCH ============
    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            const data = await adminAnalyticsApi.getPlatformStats({ period });
            setStats(data);
        } catch (err: any) {
            showToast({
                type: 'error',
                title: 'Failed to load analytics',
                message: err.message,
            });
            setStats(null);
        } finally {
            setLoading(false);
        }
    }, [period, showToast]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Sync URL
    useEffect(() => {
        const params: Record<string, string> = {};
        if (period) params.period = period;
        setSearchParams(params, { replace: true });
    }, [period, setSearchParams]);

    // ============ RENDER ============
    return (
        <div>
            <AdminPageHeader
                breadcrumbs={[{ label: 'Analytics' }]}
                title="Analytics"
                description="Platform metrics, period-scoped."
                actions={
                    <div className="flex items-center gap-3">
                        <AnalyticsPeriodSelector
                            value={period}
                            onChange={setPeriod}
                        />
                        <Button
                            variant="secondary"
                            icon={<RefreshCw size={16} />}
                            onClick={fetchStats}
                            disabled={loading}
                        >
                            Refresh
                        </Button>
                    </div>
                }
            />

            {/* Period label */}
            {stats && (
                <p className="text-sm text-admin-text-secondary mb-4">
                    Showing: <strong>{stats.period.label}</strong>
                </p>
            )}

            {/* Stat cards */}
            <AnalyticsStats stats={stats} loading={loading} />

            {/* Charts row — 2 columns on desktop, stacked on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
                <ActivityChart
                    data={stats?.daily_summary || []}
                    loading={loading}
                />
                <JobsStatusChart stats={stats} loading={loading} />
            </div>

            {/* Rating distribution — full width, hides when no reviews */}
            {stats && stats.reviews.total > 0 && (
                <div className="mt-6">
                    <RatingChart stats={stats} loading={loading} />
                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;
