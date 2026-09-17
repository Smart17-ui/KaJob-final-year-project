// frontend/src/features/admin/users/components/tabs/PersonalInfoTab.tsx

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { AdminUserDetail } from '@/types/admin';

interface PersonalInfoTabProps {
    user: AdminUserDetail;
}

const InfoRow = ({
    label,
    value,
    fallback = '—',
}: {
    label: string;
    value?: string | null;
    fallback?: string;
}) => (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-admin-border-light last:border-b-0">
        <span className="text-sm text-admin-text-secondary sm:w-48 shrink-0">
            {label}
        </span>
        <span className="text-sm font-medium text-admin-text-primary mt-1 sm:mt-0">
            {value || fallback}
        </span>
    </div>
);

export const PersonalInfoTab = ({ user }: PersonalInfoTabProps) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card padding="lg">
                <h3 className="text-base font-semibold text-admin-text-primary mb-4">
                    Personal Information
                </h3>
                <div>
                    <InfoRow label="First Name" value={user.first_name} />
                    <InfoRow label="Last Name" value={user.last_name} />
                    <InfoRow label="Email" value={user.email} />
                    <InfoRow label="Phone Number" value={user.phone_number} />
                    <InfoRow label="User ID" value={String(user.id)} />
                </div>
            </Card>

            {/* Profile Details */}
            <Card padding="lg">
                <h3 className="text-base font-semibold text-admin-text-primary mb-4">
                    Profile Details
                </h3>
                {user.profile ? (
                    <div>
                        <InfoRow label="Bio" value={user.profile.bio} fallback="No bio provided" />
                        <InfoRow label="Address" value={user.profile.address} fallback="No address" />
                        <InfoRow label="Province" value={user.profile.province} />
                        <InfoRow label="District" value={user.profile.district} />
                        <InfoRow
                            label="Location"
                            value={
                                user.profile.latitude && user.profile.longitude
                                    ? `${user.profile.latitude}, ${user.profile.longitude}`
                                    : null
                            }
                            fallback="Not set"
                        />
                    </div>
                ) : (
                    <p className="text-sm text-admin-text-secondary text-center py-8">
                        No profile information available
                    </p>
                )}
            </Card>
        </div>
    );
};

export default PersonalInfoTab;
