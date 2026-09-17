// frontend/src/features/admin/users/components/tabs/ReportsTab.tsx

import { Flag } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import type { AdminUserDetail } from '@/types/admin';

interface ReportsTabProps {
    user: AdminUserDetail;
    loading?: boolean;
}

export const ReportsTab = ({ user, loading }: ReportsTabProps) => {
    return (
        <div className="space-y-6">
            {/* Summary Card */}
            <Card padding="md">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-red-50 text-red-600">
                        <Flag size={20} />
                    </div>
                    <div>
                        <p className="text-sm text-admin-text-secondary">
                            Total Reports
                        </p>
                        <p className="text-2xl font-bold text-admin-text-primary">
                            {user.stats?.total_reports ?? 0}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Reports List */}
            <Card padding="lg">
                <h3 className="text-base font-semibold text-admin-text-primary mb-4">
                    Reports History
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
                        icon={<Flag size={32} />}
                        title="No reports"
                        description="This user has no reports against them."
                    />
                )}
            </Card>
        </div>
    );
};

export default ReportsTab;
