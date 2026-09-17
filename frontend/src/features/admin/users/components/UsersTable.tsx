// frontend/src/features/admin/users/components/UsersTable.tsx

import { Eye, MoreVertical, UserX, UserCheck, Trash2 } from 'lucide-react';
import { Table, Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Dropdown } from '@/components/ui/Dropdown';
import { EmptyState } from '@/components/ui/EmptyState';
import type { AdminUser } from '@/types/admin';

// ============================================
// PROPS
// ============================================

interface UsersTableProps {
    users: AdminUser[];
    loading: boolean;
    onView: (user: AdminUser) => void;
    onSuspend: (user: AdminUser) => void;
    onBan: (user: AdminUser) => void;
    onUnban: (user: AdminUser) => void;
    onDelete: (user: AdminUser) => void;
}

// ============================================
// HELPERS
// ============================================

const getInitials = (user: AdminUser) => {
    const first = user.first_name?.[0] || '';
    const last = user.last_name?.[0] || '';
    return `${first}${last}`.toUpperCase();
};

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const getStatusVariant = (
    status: string
): 'success' | 'warning' | 'danger' | 'neutral' => {
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

export const UsersTable = ({
    users,
    loading,
    onView,
    onSuspend,
    onBan,
    onUnban,
    onDelete,
}: UsersTableProps) => {
    const columns: Column<AdminUser>[] = [
        {
            key: 'user',
            header: 'User',
            render: (user) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-admin-primary-500 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-semibold">
                            {getInitials(user)}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-admin-text-primary truncate">
                            {user.full_name}
                        </p>
                        <p className="text-xs text-admin-text-secondary truncate">
                            {user.email}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: 'roles',
            header: 'Role',
            render: (user) => (
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
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (user) => (
                <Badge variant={getStatusVariant(user.account_status)} dot>
                    {user.account_status}
                </Badge>
            ),
        },
        {
            key: 'verification',
            header: 'Verification',
            render: (user) =>
                user.is_verified ? (
                    <Badge variant="success">Verified</Badge>
                ) : (
                    <span className="text-xs text-admin-text-muted">
                        Not verified
                    </span>
                ),
        },
        {
            key: 'created_at',
            header: 'Joined',
            render: (user) => (
                <span className="text-sm text-admin-text-secondary">
                    {formatDate(user.created_at)}
                </span>
            ),
        },
        {
            key: 'last_login',
            header: 'Last Active',
            render: (user) => (
                <span className="text-sm text-admin-text-secondary">
                    {user.last_login ? formatDate(user.last_login) : 'Never'}
                </span>
            ),
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            render: (user) => (
                <div className="flex items-center justify-end gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onView(user);
                        }}
                        className="p-2 text-admin-text-muted hover:text-admin-primary-600 hover:bg-admin-primary-50 rounded-md transition-colors"
                        title="View details"
                    >
                        <Eye size={16} />
                    </button>

                    <Dropdown
                        trigger={
                            <button className="p-2 text-admin-text-muted hover:text-admin-text-primary hover:bg-admin-bg-hover rounded-md transition-colors">
                                <MoreVertical size={16} />
                            </button>
                        }
                        items={[
                            ...(user.account_status === 'ACTIVE'
                                ? [
                                      {
                                          label: 'Suspend User',
                                          icon: <UserX size={14} />,
                                          onClick: () => onSuspend(user),
                                      },
                                      {
                                          label: 'Ban User',
                                          icon: <UserX size={14} />,
                                          danger: true,
                                          onClick: () => onBan(user),
                                      },
                                  ]
                                : user.account_status === 'SUSPENDED'
                                ? [
                                      {
                                          label: 'Reactivate',
                                          icon: <UserCheck size={14} />,
                                          onClick: () => onUnban(user),
                                      },
                                      {
                                          label: 'Ban User',
                                          icon: <UserX size={14} />,
                                          danger: true,
                                          onClick: () => onBan(user),
                                      },
                                  ]
                                : [
                                      {
                                          label: 'Unban User',
                                          icon: <UserCheck size={14} />,
                                          onClick: () => onUnban(user),
                                      },
                                  ]),
                            {
                                label: 'Delete User',
                                icon: <Trash2 size={14} />,
                                danger: true,
                                onClick: () => onDelete(user),
                            },
                        ]}
                    />
                </div>
            ),
        },
    ];

    return (
        <Table
            data={users}
            columns={columns}
            loading={loading}
            keyExtractor={(user) => user.id}
            onRowClick={onView}
            emptyState={
                <EmptyState
                    title="No users found"
                    description="Try adjusting your search or filters."
                />
            }
        />
    );
};

export default UsersTable;
