// frontend/src/features/admin/users/UsersPage.tsx

import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Download, RefreshCw } from 'lucide-react';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { useDebounce } from '@/hooks/useDebounce';

import { adminUsersApi } from '@/api/admin/users';
import type { AdminUser } from '@/types/admin';

import { UsersTable } from './components/UsersTable';
import { UsersFilters } from './components/UsersFilters';
import { UserActionModal } from './components/UserActionModal';

export const UsersPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();

    // ============ STATE ============
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Filters
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [role, setRole] = useState(searchParams.get('role') || '');
    const [status, setStatus] = useState(searchParams.get('status') || '');
    const [verified, setVerified] = useState(searchParams.get('verified') || '');

    // Pagination
    const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
    const [pageSize, setPageSize] = useState(20);

    // Modal
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [actionType, setActionType] = useState<'suspend' | 'ban' | 'unban' | 'delete' | null>(null);
    const [showActionModal, setShowActionModal] = useState(false);

    // Debounce search input
    const debouncedSearch = useDebounce(search, 400);

    // ============ DATA FETCHING ============
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);

            const data = await adminUsersApi.getUsers({
                search: debouncedSearch || undefined,
                role: role || undefined,
                status: status || undefined,
                is_verified: verified ? verified === 'true' : undefined,
                page,
                page_size: pageSize,
            });

            setUsers(data.results || []);
            setTotalCount(data.count || 0);
        } catch (error: any) {
            showToast({
                type: 'error',
                title: 'Failed to load users',
                message: error.message,
            });
            setUsers([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, role, status, verified, page, pageSize, showToast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Sync URL params
    useEffect(() => {
        const params: Record<string, string> = {};
        if (debouncedSearch) params.search = debouncedSearch;
        if (role) params.role = role;
        if (status) params.status = status;
        if (verified) params.verified = verified;
        if (page > 1) params.page = String(page);

        setSearchParams(params, { replace: true });
    }, [debouncedSearch, role, status, verified, page, setSearchParams]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, role, status, verified]);

    // ============ HANDLERS ============
    const handleView = (user: AdminUser) => {
        navigate(`/admin/users/${user.id}`);
    };

    const handleAction = (
        user: AdminUser,
        action: 'suspend' | 'ban' | 'unban' | 'delete'
    ) => {
        setSelectedUser(user);
        setActionType(action);
        setShowActionModal(true);
    };

    const handleConfirmAction = async (reason?: string) => {
        if (!selectedUser || !actionType) return;

        try {
            setActionLoading(true);

            switch (actionType) {
                case 'suspend':
                    await adminUsersApi.suspendUser(selectedUser.id, {
                        reason: reason || 'No reason provided',
                    });
                    showToast({
                        type: 'success',
                        title: 'User suspended',
                        message: `${selectedUser.full_name} has been suspended.`,
                    });
                    break;

                case 'ban':
                    await adminUsersApi.banUser(selectedUser.id, {
                        reason: reason || 'No reason provided',
                    });
                    showToast({
                        type: 'success',
                        title: 'User banned',
                        message: `${selectedUser.full_name} has been banned.`,
                    });
                    break;

                case 'unban':
                    await adminUsersApi.unbanUser(selectedUser.id);
                    showToast({
                        type: 'success',
                        title: 'User reactivated',
                        message: `${selectedUser.full_name} has been reactivated.`,
                    });
                    break;

                case 'delete':
                    await adminUsersApi.deleteUser(selectedUser.id);
                    showToast({
                        type: 'success',
                        title: 'User deleted',
                        message: `${selectedUser.full_name} has been deleted.`,
                    });
                    break;
            }

            await fetchUsers();

            setShowActionModal(false);
            setSelectedUser(null);
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

    const handleRefresh = () => {
        fetchUsers();
    };

    // ============ RENDER ============
    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div>
            <AdminPageHeader
                breadcrumbs={[{ label: 'Users' }]}
                title="Users"
                description="Manage workers and clients registered on KaJob."
                actions={
                    <>
                        <Button
                            variant="secondary"
                            icon={<RefreshCw size={16} />}
                            onClick={handleRefresh}
                            disabled={loading}
                        >
                            Refresh
                        </Button>
                        <Button variant="secondary" icon={<Download size={16} />}>
                            Export
                        </Button>
                    </>
                }
            />

            <Card padding="md" className="mb-6">
                <UsersFilters
                    search={search}
                    onSearchChange={setSearch}
                    role={role}
                    onRoleChange={setRole}
                    status={status}
                    onStatusChange={setStatus}
                    verified={verified}
                    onVerifiedChange={setVerified}
                />
            </Card>

            <Card padding="none">
                <UsersTable
                    users={users}
                    loading={loading}
                    onView={handleView}
                    onSuspend={(u) => handleAction(u, 'suspend')}
                    onBan={(u) => handleAction(u, 'ban')}
                    onUnban={(u) => handleAction(u, 'unban')}
                    onDelete={(u) => handleAction(u, 'delete')}
                />

                {!loading && users.length > 0 && (
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        totalItems={totalCount}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setPage(1);
                        }}
                    />
                )}
            </Card>

            <UserActionModal
                user={selectedUser}
                action={actionType}
                isOpen={showActionModal}
                onClose={() => {
                    setShowActionModal(false);
                    setSelectedUser(null);
                    setActionType(null);
                }}
                onConfirm={handleConfirmAction}
                loading={actionLoading}
            />
        </div>
    );
};

export default UsersPage;
