// frontend/src/features/admin/users/components/UserActionModal.tsx

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { AdminUser } from '@/types/admin';

type ActionType = 'suspend' | 'ban' | 'unban' | 'delete' | null;

interface UserActionModalProps {
    user: AdminUser | null;
    action: ActionType;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason?: string) => Promise<void>;
    loading: boolean;
}

// ============================================
// CONFIG
// ============================================

const actionConfig = {
    suspend: {
        title: 'Suspend User',
        description: 'This user will temporarily lose access to the platform.',
        confirmText: 'Suspend User',
        variant: 'secondary' as const,
        requiresReason: true,
        reasonLabel: 'Reason for suspension',
        reasonPlaceholder: 'e.g., Violation of terms of service',
    },
    ban: {
        title: 'Ban User',
        description: 'This user will be permanently banned from the platform.',
        confirmText: 'Ban User',
        variant: 'danger' as const,
        requiresReason: true,
        reasonLabel: 'Reason for ban',
        reasonPlaceholder: 'e.g., Repeated violations',
    },
    unban: {
        title: 'Reactivate User',
        description: 'This user will regain access to the platform.',
        confirmText: 'Reactivate',
        variant: 'primary' as const,
        requiresReason: false,
        reasonLabel: '',
        reasonPlaceholder: '',
    },
    delete: {
        title: 'Delete User',
        description: 'This action is permanent and cannot be undone.',
        confirmText: 'Delete User',
        variant: 'danger' as const,
        requiresReason: true,
        reasonLabel: 'Reason for deletion',
        reasonPlaceholder: 'e.g., User requested account deletion',
    },
};

// ============================================
// COMPONENT
// ============================================

export const UserActionModal = ({
    user,
    action,
    isOpen,
    onClose,
    onConfirm,
    loading,
}: UserActionModalProps) => {
    const [reason, setReason] = useState('');

    // Reset reason when action changes
    useEffect(() => {
        setReason('');
    }, [action, user]);

    if (!action || !user) return null;

    const config = actionConfig[action];

    const handleConfirm = async () => {
        await onConfirm(config.requiresReason ? reason : undefined);
        setReason('');
    };

    const isValid = !config.requiresReason || reason.trim().length > 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={config.title}
            description={config.description}
            footer={
                <>
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant={config.variant}
                        onClick={handleConfirm}
                        loading={loading}
                        disabled={!isValid}
                    >
                        {config.confirmText}
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                {/* User summary */}
                <div className="flex items-center gap-3 p-3 bg-admin-bg-hover rounded-admin-card">
                    <div className="w-10 h-10 bg-admin-primary-500 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-white text-sm font-semibold">
                            {user.first_name?.[0]}
                            {user.last_name?.[0]}
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

                {/* Reason input */}
                {config.requiresReason && (
                    <Input
                        label={config.reasonLabel}
                        placeholder={config.reasonPlaceholder}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                        autoFocus
                    />
                )}
            </div>
        </Modal>
    );
};

export default UserActionModal;
