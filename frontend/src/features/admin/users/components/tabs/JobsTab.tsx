// frontend/src/features/admin/users/components/tabs/JobsTab.tsx

import { Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import type { AdminUserDetail } from '@/types/admin';

interface JobsTabProps {
    user: AdminUserDetail;
    loading?: boolean;
}

export const JobsTab = ({ user, loading }: JobsTabProps) => {
    const isWorker = user.is_worker;
    const isClient = user.is_client;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card padding="md">
                    <p className="text-sm text-admin-text-secondary">
                        {isClient ? 'Jobs Posted' : 'Jobs Completed'}
                    </p>
                    <p className="text-2xl font-bold text-admin-text-primary mt-1">
                        {isClient
                            ? user.stats?.total_jobs_posted ?? 0
                            : user.stats?.total_jobs_completed ?? 0}
                    </p>
                </Card>

                {isClient && (
                    <Card padding="md">
                        <p className="text-sm text-admin-text-secondary">
                            Total Spent
                        </p>
                        <p className="text-2xl font-bold text-admin-text-primary mt-1">
                            K{user.stats?.total_spent ?? 0}
                        </p>
                    </Card>
                )}

                {isWorker && (
                    <>
                        <Card padding="md">
                            <p className="text-sm text-admin-text-secondary">
                                Total Earnings
                            </p>
                            <p className="text-2xl font-bold text-admin-text-primary mt-1">
                                K{user.stats?.total_earnings ?? 0}
                            </p>
                        </Card>
                        <Card padding="md">
                            <p className="text-sm text-admin-text-secondary">
                                Average Rating
                            </p>
                            <p className="text-2xl font-bold text-admin-text-primary mt-1">
                                {user.worker_profile?.average_rating?.toFixed(1) ?? '—'}
                            </p>
                        </Card>
                    </>
                )}
            </div>

            {/* Jobs List */}
            <Card padding="lg">
                <h3 className="text-base font-semibold text-admin-text-primary mb-4">
                    {isClient ? 'Posted Jobs' : 'Job History'}
                </h3>

                {loading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="h-16 bg-gray-100 rounded animate-pulse"
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={<Briefcase size={32} />}
                        title="No jobs to display"
                        description="This user has no job history yet."
                    />
                )}
            </Card>
        </div>
    );
};

export default JobsTab;
