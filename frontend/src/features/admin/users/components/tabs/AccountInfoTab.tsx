// frontend/src/features/admin/users/components/tabs/AccountInfoTab.tsx

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { AdminUserDetail } from '@/types/admin';

interface AccountInfoTabProps {
    user: AdminUserDetail;
}

const InfoRow = ({
    label,
    value,
    children,
}: {
    label: string;
    value?: string | null;
    children?: React.ReactNode;
}) => (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-admin-border-light last:border-b-0">
        <span className="text-sm text-admin-text-secondary sm:w-48 shrink-0">
            {label}
        </span>
        <div className="mt-1 sm:mt-0">
            {children || (
                <span className="text-sm font-medium text-admin-text-primary">
                    {value || '—'}
                </span>
            )}
        </div>
    </div>
);

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'ACTIVE':
            return 'success';
        case 'SUSPENDED':
            return 'warning';
        case 'BANNED':
            return 'danger';
        case 'DEACTIVATED':
            return 'neutral';
        default:
            return 'neutral';
    }
};

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const AccountInfoTab = ({ user }: AccountInfoTabProps) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Account Status */}
            <Card padding="lg">
                <h3 className="text-base font-semibold text-admin-text-primary mb-4">
                    Account Status
                </h3>
                <div>
                    <InfoRow label="Status">
                        <Badge variant={getStatusVariant(user.account_status)} dot>
                            {user.account_status}
                        </Badge>
                    </InfoRow>
                    <InfoRow label="Roles">
                        <div className="flex flex-wrap gap-1">
                            {user.roles.map((role) => (
                                <Badge
                                    key={role}
                                    variant={
                                        role === 'ADMIN'
                                            ? 'primary'
                                            : role === 'WORKER'
                                            ? 'info'
                                            : 'success'
                                    }
                                >
                                    {role}
                                </Badge>
                            ))}
                        </div>
                    </InfoRow>
                    <InfoRow label="Verification">
                        {user.is_verified ? (
                            <Badge variant="success">Verified</Badge>
                        ) : (
                            <Badge variant="neutral">Not Verified</Badge>
                        )}
                    </InfoRow>
                </div>
            </Card>

            {/* Activity Timeline */}
            <Card padding="lg">
                <h3 className="text-base font-semibold text-admin-text-primary mb-4">
                    Activity
                </h3>
                <div>
                    <InfoRow label="Account Created" value={formatDate(user.created_at)} />
                    <InfoRow label="Last Login" value={formatDate(user.last_login)} />
                </div>
            </Card>
        </div>
    );
};

export default AccountInfoTab;
