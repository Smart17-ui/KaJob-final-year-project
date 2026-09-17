// frontend/src/features/admin/dashboard/components/RecentActivity.tsx

import { UserPlus, CheckCircle, Flag, Briefcase, Clock } from 'lucide-react';

interface ActivityItem {
    id: string;
    type: 'user_registered' | 'verification_approved' | 'report_created' | 'job_completed' | 'job_posted';
    title: string;
    description?: string;
    timestamp: string;
}

interface RecentActivityProps {
    activities: ActivityItem[];
    loading?: boolean;
}

// ============================================
// CONFIG
// ============================================

const activityConfig = {
    user_registered: {
        icon: UserPlus,
        bg: 'bg-blue-50',
        color: 'text-blue-600',
    },
    verification_approved: {
        icon: CheckCircle,
        bg: 'bg-green-50',
        color: 'text-green-600',
    },
    report_created: {
        icon: Flag,
        bg: 'bg-red-50',
        color: 'text-red-600',
    },
    job_completed: {
        icon: CheckCircle,
        bg: 'bg-admin-primary-50',
        color: 'text-admin-primary-600',
    },
    job_posted: {
        icon: Briefcase,
        bg: 'bg-amber-50',
        color: 'text-amber-600',
    },
};

// ============================================
// HELPERS
// ============================================

const timeAgo = (timestamp: string): string => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
};

// ============================================
// COMPONENT
// ============================================

export const RecentActivity = ({ activities, loading = false }: RecentActivityProps) => {
    // Loading
    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3 p-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse shrink-0" />
                        <div className="flex-1">
                            <div className="h-3 w-40 bg-gray-100 rounded mb-2 animate-pulse" />
                            <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Empty
    if (!activities || activities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock size={32} className="text-admin-text-muted mb-3" />
                <p className="text-sm text-admin-text-secondary">
                    No recent activity
                </p>
            </div>
        );
    }

    return (
        <ul className="divide-y divide-admin-border-light">
            {activities.map((activity) => {
                const config = activityConfig[activity.type] || activityConfig.job_posted;
                const Icon = config.icon;

                return (
                    <li key={activity.id} className="flex items-start gap-3 py-3">
                        <div className={`p-2 rounded-lg ${config.bg} ${config.color} shrink-0`}>
                            <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-admin-text-primary">
                                {activity.title}
                            </p>
                            {activity.description && (
                                <p className="text-xs text-admin-text-secondary truncate">
                                    {activity.description}
                                </p>
                            )}
                        </div>
                        <span className="text-xs text-admin-text-muted whitespace-nowrap shrink-0">
                            {timeAgo(activity.timestamp)}
                        </span>
                    </li>
                );
            })}
        </ul>
    );
};

export default RecentActivity;
