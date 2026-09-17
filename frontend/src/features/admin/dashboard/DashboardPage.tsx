// frontend/src/features/admin/dashboard/DashboardPage.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Briefcase,
    CheckCircle,
    ShieldCheck,
    Flag,
    TrendingUp,
} from 'lucide-react';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/admin/StatCard';
import { useToast } from '@/components/ui/Toast';

import { adminAnalyticsApi } from '@/api/admin/analytics';
import type { PlatformStats } from '@/types/admin';

import { RecentActivity } from './components/RecentActivity';
import { JobStatusBreakdown } from './components/JobStatusBreakdown';

export const DashboardPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await adminAnalyticsApi.getPlatformStats();
            setStats(data);
        } catch (err: any) {
            const message = err.message || 'Failed to load dashboard';
            setError(message);
            showToast({
                type: 'error',
                title: 'Failed to load dashboard',
                message,
            });
        } finally {
            setLoading(false);
        }
    };

    // Error state
    if (error && !loading) {
        return (
            <div>
                <AdminPageHeader
                    breadcrumbs={[{ label: 'Administration' }]}
                    title="Dashboard"
                    description="Welcome back. Here's what's happening across the platform."
                />
                <Card padding="lg">
                    <div className="text-center py-8">
                        <p className="text-admin-text-secondary mb-4">
                            {error}
                        </p>
                        <Button variant="secondary" onClick={fetchStats}>
                            Try again
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div>
            {/* Page Header */}
            <AdminPageHeader
                breadcrumbs={[{ label: 'Administration' }]}
                title="Welcome back, Admin"
                description="Here's what's happening across the KaJob platform today."
                actions={
                    <Button
                        variant="secondary"
                        icon={<TrendingUp size={16} />}
                        onClick={() => navigate('/admin/analytics')}
                    >
                        View Analytics
                    </Button>
                }
            />

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Total Users"
                    value={stats?.users.total ?? 0}
                    icon={<Users size={20} />}
                    subtitle={`${stats?.users.workers ?? 0} workers, ${stats?.users.clients ?? 0} clients`}
                    trend={8.4}
                    loading={loading}
                />
                <StatCard
                    title="Total Jobs"
                    value={stats?.jobs.total ?? 0}
                    icon={<Briefcase size={20} />}
                    subtitle={`${stats?.jobs.completion_rate ?? 0}% completion rate`}
                    trend={12.5}
                    loading={loading}
                />
                <StatCard
                    title="Verified Users"
                    value={stats?.users.verified ?? 0}
                    icon={<CheckCircle size={20} />}
                    subtitle={`${stats?.users.active_today ?? 0} active today`}
                    trend={4.2}
                    loading={loading}
                />
                <StatCard
                    title="Pending Verifications"
                    value="—"
                    icon={<ShieldCheck size={20} />}
                    subtitle="Requires attention"
                    loading={loading}
                />
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT: Job Status Breakdown (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Job Status */}
                    <Card padding="lg">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-base font-semibold text-admin-text-primary">
                                    Job Status Overview
                                </h2>
                                <p className="text-sm text-admin-text-secondary mt-0.5">
                                    Breakdown of all jobs on the platform
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/admin/jobs')}
                            >
                                View all
                            </Button>
                        </div>

                        <JobStatusBreakdown
                            jobs={{
                                open: stats?.jobs.open ?? 0,
                                assigned: stats?.jobs.assigned ?? 0,
                                in_progress: stats?.jobs.in_progress ?? 0,
                                completed: stats?.jobs.completed ?? 0,
                                cancelled: stats?.jobs.cancelled ?? 0,
                                total: stats?.jobs.total ?? 0,
                            }}
                            loading={loading}
                        />
                    </Card>

                    {/* Reviews Summary */}
                    <Card padding="lg">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-base font-semibold text-admin-text-primary">
                                    Reviews Summary
                                </h2>
                                <p className="text-sm text-admin-text-secondary mt-0.5">
                                    Platform-wide rating distribution
                                </p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="h-32 bg-gray-100 rounded animate-pulse" />
                        ) : (
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-admin-text-secondary mb-1">
                                        Total Reviews
                                    </p>
                                    <p className="text-3xl font-bold text-admin-text-primary">
                                        {stats?.reviews.total ?? 0}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-admin-text-secondary mb-1">
                                        Average Rating
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-3xl font-bold text-admin-primary-600">
                                            {stats?.reviews.average_rating?.toFixed(1) ?? '0.0'}
                                        </p>
                                        <span className="text-sm text-admin-text-muted">/ 5.0</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* RIGHT: Recent Activity (1/3 width) */}
                <div>
                    <Card padding="lg">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-semibold text-admin-text-primary">
                                Recent Activity
                            </h2>
                        </div>

                        <RecentActivity
                            activities={[
                                {
                                    id: '1',
                                    type: 'user_registered',
                                    title: 'New user registered',
                                    description: 'John Banda joined as Worker',
                                    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
                                },
                                {
                                    id: '2',
                                    type: 'verification_approved',
                                    title: 'Verification approved',
                                    description: 'Worker #1034 verified',
                                    timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
                                },
                                {
                                    id: '3',
                                    type: 'job_posted',
                                    title: 'New job posted',
                                    description: 'Plumbing repair in Kamwala',
                                    timestamp: new Date(Date.now() - 31 * 60000).toISOString(),
                                },
                                {
                                    id: '4',
                                    type: 'report_created',
                                    title: 'Report submitted',
                                    description: 'Report #829 flagged',
                                    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
                                },
                                {
                                    id: '5',
                                    type: 'job_completed',
                                    title: 'Job completed',
                                    description: 'Electrical repair in Chilenje',
                                    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
                                },
                            ]}
                            loading={loading}
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
