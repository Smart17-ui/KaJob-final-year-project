// frontend/src/features/admin/users/components/tabs/VerificationTab.tsx

import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { AdminUserDetail } from '@/types/admin';

interface VerificationTabProps {
    user: AdminUserDetail;
}

export const VerificationTab = ({ user }: VerificationTabProps) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            {/* Verification Status Card */}
            <Card padding="lg">
                <div className="flex items-start gap-4">
                    <div
                        className={`
                            p-3 rounded-lg shrink-0
                            ${user.is_verified
                                ? 'bg-green-50 text-green-600'
                                : 'bg-amber-50 text-amber-600'
                            }
                        `}
                    >
                        {user.is_verified ? (
                            <ShieldCheck size={24} />
                        ) : (
                            <ShieldAlert size={24} />
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-semibold text-admin-text-primary">
                            {user.is_verified
                                ? 'Account Verified'
                                : 'Verification Required'}
                        </h3>
                        <p className="text-sm text-admin-text-secondary mt-1">
                            {user.is_verified
                                ? 'This user has completed identity verification and can access all platform features.'
                                : 'This user has not completed identity verification yet.'}
                        </p>

                        {user.is_verified && (
                            <div className="mt-4">
                                <Badge variant="success" dot>
                                    Verified
                                </Badge>
                            </div>
                        )}

                        {!user.is_verified && (
                            <div className="mt-4">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => navigate('/admin/verifications')}
                                >
                                    View Verification Queue
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Verification Details */}
            <Card padding="lg">
                <h3 className="text-base font-semibold text-admin-text-primary mb-4">
                    Verification Details
                </h3>
                {user.is_verified ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-admin-text-secondary mb-1">
                                    Verification Status
                                </p>
                                <Badge variant="success">Verified</Badge>
                            </div>
                            <div>
                                <p className="text-xs text-admin-text-secondary mb-1">
                                    Verified On
                                </p>
                                <p className="text-sm text-admin-text-primary">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-admin-text-secondary text-center py-8">
                        No verification details available
                    </p>
                )}
            </Card>
        </div>
    );
};

export default VerificationTab;
