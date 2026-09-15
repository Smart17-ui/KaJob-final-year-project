// frontend/src/features/admin/verifications/VerificationDetailPage.tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowRight,
    ShieldCheck,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

import { adminVerificationsApi } from '@/api/admin/verifications';
import type { PendingVerification } from '@/types/admin';

import { DocumentViewer } from './components/DocumentViewer';

// ============================================
// HELPERS
// ============================================

const getStatusVariant = (
    status?: string
): 'success' | 'warning' | 'danger' | 'neutral' => {
    switch (status) {
        case 'VERIFIED':
            return 'success';
        case 'PENDING':
        case 'UNDER_REVIEW':
            return 'warning';
        case 'REJECTED':
            return 'danger';
        default:
            return 'neutral';
    }
};

const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// ============================================
// COMPONENT
// ============================================

export const VerificationDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [verification, setVerification] = useState<PendingVerification | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Modals
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchVerification();
    }, [id]);

    const fetchVerification = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await adminVerificationsApi.getVerification(
                Number(id)
            );
            const unwrapped = (data as any)?.verification || data;
            setVerification(unwrapped);
        } catch (error: any) {
            showToast({
                type: 'error',
                title: 'Failed to load verification',
                message: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!id) return;
        try {
            setActionLoading(true);
            await adminVerificationsApi.approveVerification(Number(id));
            showToast({
                type: 'success',
                title: 'Verification approved',
                message: 'The user has been verified successfully.',
            });
            navigate('/admin/verifications');
        } catch (error: any) {
            showToast({
                type: 'error',
                title: 'Failed to approve',
                message: error.message,
            });
        } finally {
            setActionLoading(false);
            setShowApproveModal(false);
        }
    };

    const handleReject = async () => {
        if (!id || !rejectionReason.trim()) {
            showToast({
                type: 'warning',
                title: 'Reason required',
                message: 'Please provide a reason for rejection.',
            });
            return;
        }

        try {
            setActionLoading(true);
            await adminVerificationsApi.rejectVerification(
                Number(id),
                rejectionReason
            );
            showToast({
                type: 'success',
                title: 'Verification rejected',
                message: 'The user has been notified.',
            });
            navigate('/admin/verifications');
        } catch (error: any) {
            showToast({
                type: 'error',
                title: 'Failed to reject',
                message: error.message,
            });
        } finally {
            setActionLoading(false);
            setShowRejectModal(false);
        }
    };

    // Loading
    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-admin-primary-500 border-t-transparent" />
            </div>
        );
    }

    // Not found
    if (!verification) {
        return (
            <div className="text-center py-16">
                <p className="text-admin-text-secondary">
                    Verification not found
                </p>
                <Button
                    variant="secondary"
                    onClick={() => navigate('/admin/verifications')}
                    className="mt-4"
                >
                    Back to Verifications
                </Button>
            </div>
        );
    }

    const verificationStatus =
        verification.verification_status || verification.status || '';
    const isPending = ['PENDING', 'UNDER_REVIEW'].includes(verificationStatus);
    const isVerified = verificationStatus === 'VERIFIED';
    const isRejected = verificationStatus === 'REJECTED';

    const documents = (verification as any).documents || [];

    return (
        <div>
            {/* Back button */}
            <button
                onClick={() => navigate('/admin/verifications')}
                className="flex items-center gap-2 text-sm text-admin-text-secondary hover:text-admin-text-primary mb-4 transition-colors"
            >
                <ArrowLeft size={16} />
                Back to Verifications
            </button>

            {/* Page header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-admin-text-primary">
                    Verification Review
                </h1>
                <p className="text-sm text-admin-text-secondary mt-1">
                    Review the documents submitted by{' '}
                    <span className="font-medium text-admin-text-primary">
                        {verification.user?.full_name || 'Unknown'}
                    </span>
                </p>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT: Document viewer */}
                <div className="lg:col-span-2 space-y-6">
                    <Card padding="lg">
                        <h2 className="text-base font-semibold text-admin-text-primary mb-4">
                            Submitted Documents
                        </h2>
                        <DocumentViewer
                            documents={documents}
                            userName={verification.user?.full_name || 'User'}
                        />
                    </Card>
                </div>

                {/* RIGHT: Info + Actions + Summary */}
                <div className="space-y-6">
                    {/* Applicant info */}
                    <Card padding="lg">
                        <h2 className="text-base font-semibold text-admin-text-primary mb-4">
                            Applicant Information
                        </h2>
                        <div className="space-y-3">
                            <InfoRow
                                label="Name"
                                value={verification.user?.full_name}
                            />
                            <InfoRow
                                label="Email"
                                value={verification.user?.email}
                            />
                            <InfoRow
                                label="Phone"
                                value={verification.user?.phone_number}
                            />
                            <InfoRow
                                label="Document Type"
                                value={verification.document_type?.replace(
                                    /_/g,
                                    ' '
                                )}
                            />
                            <InfoRow
                                label="Document Number"
                                value={verification.document_number}
                            />
                            <InfoRow
                                label="Submitted"
                                value={formatDateTime(
                                    verification.submitted_at
                                )}
                            />
                            <div className="flex items-center justify-between py-2 border-t border-admin-border-light">
                                <span className="text-sm text-admin-text-secondary">
                                    Status
                                </span>
                                <Badge
                                    variant={getStatusVariant(
                                        verificationStatus
                                    )}
                                    dot
                                >
                                    {verification.status_display ||
                                        verificationStatus ||
                                        '—'}
                                </Badge>
                            </div>
                        </div>
                    </Card>

                    {/* Verification Summary — verified/rejected */}
                    {(isVerified || isRejected) && (
                        <Card padding="lg">
                            <h2 className="text-base font-semibold text-admin-text-primary mb-4 flex items-center gap-2">
                                {isVerified ? (
                                    <ShieldCheck
                                        size={18}
                                        className="text-green-600"
                                    />
                                ) : (
                                    <XCircle
                                        size={18}
                                        className="text-red-600"
                                    />
                                )}
                                Verification Summary
                            </h2>

                            <div className="space-y-3">
                                <div
                                    className={`flex items-center gap-3 p-3 rounded-lg ${
                                        isVerified
                                            ? 'bg-green-50'
                                            : 'bg-red-50'
                                    }`}
                                >
                                    {isVerified ? (
                                        <CheckCircle
                                            size={20}
                                            className="text-green-600 shrink-0"
                                        />
                                    ) : (
                                        <XCircle
                                            size={20}
                                            className="text-red-600 shrink-0"
                                        />
                                    )}
                                    <div>
                                        <p
                                            className={`text-sm font-medium ${
                                                isVerified
                                                    ? 'text-green-900'
                                                    : 'text-red-900'
                                            }`}
                                        >
                                            {isVerified
                                                ? 'Approved'
                                                : 'Rejected'}
                                        </p>
                                        <p
                                            className={`text-xs ${
                                                isVerified
                                                    ? 'text-green-700'
                                                    : 'text-red-700'
                                            }`}
                                        >
                                            {isVerified
                                                ? 'User is now verified'
                                                : 'User was not verified'}
                                        </p>
                                    </div>
                                </div>

                                {(verification as any).reviewed_at && (
                                    <InfoRow
                                        label="Reviewed on"
                                        value={formatDateTime(
                                            (verification as any).reviewed_at
                                        )}
                                    />
                                )}

                                {isRejected &&
                                    (verification as any).rejection_reason && (
                                        <div className="pt-3 border-t border-admin-border-light">
                                            <p className="text-xs text-admin-text-secondary mb-1">
                                                Rejection Reason
                                            </p>
                                            <p className="text-sm text-admin-text-primary">
                                                {
                                                    (verification as any)
                                                        .rejection_reason
                                                }
                                            </p>
                                        </div>
                                    )}
                            </div>
                        </Card>
                    )}

                    {/* Actions */}
                    {isPending && (
                        <Card padding="lg">
                            <h2 className="text-base font-semibold text-admin-text-primary mb-4">
                                Review Decision
                            </h2>

                            <div className="space-y-2">
                                <button
                                    onClick={() => setShowApproveModal(true)}
                                    className="w-full flex items-center justify-between p-3 rounded-lg border border-admin-border-light hover:border-admin-primary-500 hover:bg-admin-primary-50 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-100 transition-colors shrink-0">
                                            <CheckCircle size={18} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-admin-text-primary">
                                                Approve
                                            </p>
                                            <p className="text-xs text-admin-text-secondary">
                                                Verify this user's identity
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowRight
                                        size={16}
                                        className="text-admin-text-muted group-hover:text-admin-primary-600 transition-colors shrink-0"
                                    />
                                </button>

                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    className="w-full flex items-center justify-between p-3 rounded-lg border border-admin-border-light hover:border-admin-danger hover:bg-red-50 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-100 transition-colors shrink-0">
                                            <XCircle size={18} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-admin-text-primary">
                                                Reject
                                            </p>
                                            <p className="text-xs text-admin-text-secondary">
                                                Require a reason and notify user
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowRight
                                        size={16}
                                        className="text-admin-text-muted group-hover:text-admin-danger transition-colors shrink-0"
                                    />
                                </button>
                            </div>
                        </Card>
                    )}

                    {/* Review guidelines */}
                    <Card padding="lg">
                        <h3 className="text-sm font-semibold text-admin-text-primary mb-3 flex items-center gap-2">
                            <AlertCircle size={16} />
                            Review Guidelines
                        </h3>
                        <ul className="text-xs text-admin-text-secondary space-y-2 list-disc list-inside">
                            <li>Check that the document photo is clear</li>
                            <li>Verify the document number matches</li>
                            <li>Ensure the selfie matches the document</li>
                            <li>Check for signs of tampering</li>
                        </ul>
                    </Card>
                </div>
            </div>

            {/* Approve Modal */}
            <Modal
                isOpen={showApproveModal}
                onClose={() => setShowApproveModal(false)}
                title="Approve Verification?"
                description={`Approve verification for ${
                    verification.user?.full_name || 'this user'
                }?`}
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setShowApproveModal(false)}
                            disabled={actionLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleApprove}
                            loading={actionLoading}
                        >
                            Approve
                        </Button>
                    </>
                }
            >
                <p className="text-sm text-admin-text-secondary">
                    The user will be marked as verified and can access all
                    platform features.
                </p>
            </Modal>

            {/* Reject Modal */}
            <Modal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                title="Reject Verification?"
                description="Please provide a reason for rejection. The user will be notified."
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setShowRejectModal(false)}
                            disabled={actionLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleReject}
                            loading={actionLoading}
                        >
                            Reject
                        </Button>
                    </>
                }
            >
                <div className="space-y-3">
                    <Input
                        label="Reason for rejection"
                        placeholder="e.g., Document photo is not clear"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        required
                    />
                </div>
            </Modal>
        </div>
    );
};

// ============================================
// SUB COMPONENTS
// ============================================

const InfoRow = ({
    label,
    value,
    fallback = '—',
}: {
    label: string;
    value?: string | null;
    fallback?: string;
}) => (
    <div className="flex items-start justify-between py-2">
        <span className="text-sm text-admin-text-secondary shrink-0">
            {label}
        </span>
        <span className="text-sm font-medium text-admin-text-primary text-right max-w-[60%]">
            {value || fallback}
        </span>
    </div>
);

export default VerificationDetailPage;
