// frontend/src/features/admin/users/UserDetailPage.tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, UserX } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

import { adminUsersApi } from '@/api/admin/users';
import type { AdminUserDetail } from '@/types/admin';

import { UserDetailTabs } from './components/UserDetailTabs';
import { UserActionModal } from './components/UserActionModal';

import { PersonalInfoTab } from './components/tabs/PersonalInfoTab';
import { AccountInfoTab } from './components/tabs/AccountInfoTab';
import { VerificationTab } from './components/tabs/VerificationTab';
import { JobsTab } from './components/tabs/JobsTab';
import { ReportsTab } from './components/tabs/ReportsTab';

// ============================================
// CONSTANTS
// ============================================

const TABS = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'account', label: 'Account' },
    { id: 'verification', label: 'Verification' },
    { id: 'jobs', label: 'Jobs' },
    { id: 'reports', label: 'Reports' },
];

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'ACTIVE':
            return 'success';
        case 'SUSPENDED':
            return 'warning';
        case 'BANNED':
            return 'danger';
        default:
            return 'neutral';
    }
};

// ============================================
// COMPONENT
// ============================================

export const UserDetailPage = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [user, setUser] = useState<AdminUserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');

    // Modal
    const [showActionModal, setShowActionModal] = useState(false);
    const [actionType, setActionType] = useState<'suspend' | 'ban' | 'unban' | 'delete' | null>(null);

    useEffect(() => {
        fetchUser();
    }, [userId]);

    const fetchUser = async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const data = await adminUsersApi.getUser(Number(userId));
            setUser(data);
        } catch (error: any) {
            showToast({
                type: 'error',
                title: 'Failed to load user',
                message: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmAction = async (reason?: string) => {
        if (!user || !actionType) return;

        try {
            setActionLoading(true);

            switch (actionType) {
                case 'suspend':
                    await adminUsersApi.suspendUser(user.id, {
                        reason: reason || 'No reason provided',
                    });
                    showToast({
                        type: 'success',
                        title: 'User suspended',
                        message: `${user.full_name} has been suspended.`,
                    });
                    break;

                case 'ban':
                    await adminUsersApi.banUser(user.id, {
                        reason: reason || 'No reason provided',
                    });
                    showToast({
                        type: 'success',
                        title: 'User banned',
                        message: `${user.full_name} has been banned.`,
                    });
                    break;

                case 'unban':
                    await adminUsersApi.unbanUser(user.id);
                    showToast({
                        type: 'success',
                        title: 'User reactivated',
                        message: `${user.full_name} has been reactivated.`,
                    });
                    break;

                case 'delete':
                    await adminUsersApi.deleteUser(user.id);
                    showToast({
                        type: 'success',
                        title: 'User deleted',
                        message: `${user.full_name} has been deleted.`,
                    });
                    navigate('/admin/users');
                    return;
            }

            await fetchUser();
            setShowActionModal(false);
            setActionType(null);
        } catch (error: any) {
            showToast({
                type: 'error',
                title: `Failed to ${actionType}`,
                message: error.message,
            });
        } finally {
            setActionLoading(false);
        }
    };

    const getInitials = () => {
        if (!user) return '?';
        return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
    };

    // Loading
    if (loading) {
        return (
            <div>
                <div className="h-8 w-32 bg-gray-100 rounded mb-6 animate-pulse" />
                <Card padding="lg">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-100 animate-pulse" />
                        <div className="flex-1">
                            <div className="h-6 w-48 bg-gray-100 rounded mb-2 animate-pulse" />
                            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    // Not found
    if (!user) {
        return (
            <div className="text-center py-16">
                <p className="text-admin-text-secondary">User not found</p>
                <Button
                    variant="secondary"
                    onClick={() => navigate('/admin/users')}
                    className="mt-4"
                >
                    Back to Users
                </Button>
            </div>
        );
    }

    return (
        <div>
            {/* Back button */}
            <button
                onClick={() => navigate('/admin/users')}
                className="flex items-center gap-2 text-sm text-admin-text-secondary hover:text-admin-text-primary mb-4 transition-colors"
            >
                <ArrowLeft size={16} />
                Back to Users
            </button>

            {/* Profile Header */}
            <Card padding="lg" className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    {/* Avatar */}
                    <div className="w-16 h-16 bg-admin-primary-500 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-white text-xl font-semibold">
                            {getInitials()}
                        </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-xl font-bold text-admin-text-primary">
                                {user.full_name}
                            </h1>
                            <Badge variant={getStatusVariant(user.account_status)} dot>
                                {user.account_status}
                            </Badge>
                            {/* FIXED: defensive rendering */}
                            {(user.roles || []).map((role) => (
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

                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-admin-text-secondary">
                            <span className="flex items-center gap-1.5">
                                <Mail size={14} />
                                {user.email}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Phone size={14} />
                                {user.phone_number}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        {user.account_status === 'ACTIVE' ? (
                            <>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setActionType('suspend');
                                        setShowActionModal(true);
                                    }}
                                >
                                    Suspend
                                </Button>
                                <Button
                                    variant="danger"
                                    icon={<UserX size={16} />}
                                    onClick={() => {
                                        setActionType('ban');
                                        setShowActionModal(true);
                                    }}
                                >
                                    Ban
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={() => {
                                    setActionType('unban');
                                    setShowActionModal(true);
                                }}
                            >
                                Reactivate
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Tabs */}
            <div className="mb-6">
                <UserDetailTabs
                    tabs={TABS}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                />
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'personal' && <PersonalInfoTab user={user} />}
                {activeTab === 'account' && <AccountInfoTab user={user} />}
                {activeTab === 'verification' && <VerificationTab user={user} />}
                {activeTab === 'jobs' && <JobsTab user={user} />}
                {activeTab === 'reports' && <ReportsTab user={user} />}
            </div>

            {/* Action Modal */}
            <UserActionModal
                user={user as any}
                action={actionType}
                isOpen={showActionModal}
                onClose={() => {
                    setShowActionModal(false);
                    setActionType(null);
                }}
                onConfirm={handleConfirmAction}
                loading={actionLoading}
            />
        </div>
    );
};

export default UserDetailPage;
