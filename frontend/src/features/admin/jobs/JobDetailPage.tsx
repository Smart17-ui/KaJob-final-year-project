// frontend/src/features/admin/jobs/JobDetailPage.tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Clock,
    DollarSign,
    Briefcase,
    User,
    AlertCircle,
    XCircle,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

import { adminJobsApi } from '@/api/admin/jobs';
import type { AdminJob } from '@/types/admin';

// ============================================
// HELPERS
// ============================================

const getStatusVariant = (
    status: string
): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
    switch (status) {
        case 'OPEN':
            return 'info';
        case 'ASSIGNED':
        case 'IN_PROGRESS':
            return 'warning';
        case 'COMPLETED':
            return 'success';
        case 'CANCELLED':
            return 'danger';
        default:
            return 'neutral';
    }
};

const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
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

const formatBudget = (budget: string) => {
    const num = parseFloat(budget);
    if (isNaN(num)) return 'K0';
    return `K${num.toLocaleString('en-ZM', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

// 🆕 Helper to safely extract client fields
const getClientField = (
    client: any,
    field: 'full_name' | 'email' | 'phone_number'
): string | null => {
    if (!client || typeof client === 'number') return null;
    return client[field] || null;
};

const getWorkerField = (
    worker: any,
    field: 'full_name' | 'email'
): string | null => {
    if (!worker || typeof worker === 'number') return null;
    return worker[field] || null;
};

// ============================================
// COMPONENT
// ============================================

export const JobDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [job, setJob] = useState<AdminJob | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Modals
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    useEffect(() => {
        fetchJob();
    }, [id]);

    const fetchJob = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await adminJobsApi.getJob(Number(id));
            setJob(data);
        } catch (error: any) {
            showToast({
                type: 'error',
                title: 'Failed to load job',
                message: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!id || !cancelReason.trim()) {
            showToast({
                type: 'warning',
                title: 'Reason required',
                message: 'Please provide a reason for cancelling this job.',
            });
            return;
        }

        try {
            setActionLoading(true);
            await adminJobsApi.cancelJob(Number(id), { reason: cancelReason });
            showToast({
                type: 'success',
                title: 'Job cancelled',
                message: 'The job has been cancelled and applicants notified.',
            });
            await fetchJob();
            setShowCancelModal(false);
            setCancelReason('');
        } catch (error: any) {
            showToast({
                type: 'error',
                title: 'Failed to cancel',
                message: error.message,
            });
        } finally {
            setActionLoading(false);
        }
    };

    // Loading
    if (loading) {
        return (
            <div>
                <div className="h-8 w-32 bg-gray-100 rounded mb-6 animate-pulse" />
                <Card padding="lg">
                    <div className="h-8 w-64 bg-gray-100 rounded mb-2 animate-pulse" />
                    <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
                </Card>
            </div>
        );
    }

    // Not found
    if (!job) {
        return (
            <div className="text-center py-16">
                <p className="text-admin-text-secondary">Job not found</p>
                <Button
                    variant="secondary"
                    onClick={() => navigate('/admin/jobs')}
                    className="mt-4"
                >
                    Back to Jobs
                </Button>
            </div>
        );
    }

    const canCancel = ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(job.status);

    // 🆕 Safe extraction
    const clientEmail = getClientField(job.client, 'email');
    const clientPhone = getClientField(job.client, 'phone_number');
    const workerName =
        getWorkerField(job.assigned_worker, 'full_name') ||
        job.assigned_worker_name;
    const workerEmail = getWorkerField(job.assigned_worker, 'email');

    return (
        <div>
            {/* Back button */}
            <button
                onClick={() => navigate('/admin/jobs')}
                className="flex items-center gap-2 text-sm text-admin-text-secondary hover:text-admin-text-primary mb-4 transition-colors"
            >
                <ArrowLeft size={16} />
                Back to Jobs
            </button>

            {/* Page header */}
            <div className="mb-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                            <h1 className="text-2xl font-bold text-admin-text-primary">
                                {job.title}
                            </h1>
                            <Badge variant={getStatusVariant(job.status)} dot>
                                {job.status_display || job.status}
                            </Badge>
                            {job.is_urgent && (
                                <Badge variant="danger">Urgent</Badge>
                            )}
                        </div>
                        <p className="text-sm text-admin-text-secondary">
                            Posted {formatDate(job.posted_at || job.created_at)} by{' '}
                            <span className="font-medium text-admin-text-primary">
                                {job.client_name || 'Unknown'}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT: Job info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <Card padding="lg">
                        <h2 className="text-base font-semibold text-admin-text-primary mb-4 flex items-center gap-2">
                            <Briefcase size={18} />
                            Job Description
                        </h2>
                        <p className="text-sm text-admin-text-secondary whitespace-pre-wrap">
                            {job.description}
                        </p>
                    </Card>

                    {/* Job Details */}
                    <Card padding="lg">
                        <h2 className="text-base font-semibold text-admin-text-primary mb-4">
                            Job Details
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DetailItem
                                icon={<DollarSign size={16} />}
                                label="Budget"
                                value={formatBudget(job.budget)}
                                highlight
                            />
                            <DetailItem
                                icon={<Briefcase size={16} />}
                                label="Category"
                                value={job.category_name || '—'}
                            />
                            <DetailItem
                                icon={<AlertCircle size={16} />}
                                label="Urgency"
                                value={
                                    job.urgency_display ||
                                    job.urgency ||
                                    'Normal'
                                }
                            />
                            <DetailItem
                                icon={<Clock size={16} />}
                                label="Duration"
                                value={
                                    job.duration_hours
                                        ? `${job.duration_hours} hours`
                                        : 'Not specified'
                                }
                            />
                            <DetailItem
                                icon={<Calendar size={16} />}
                                label="Scheduled Date"
                                value={formatDate(job.job_date)}
                            />
                            <DetailItem
                                icon={<Clock size={16} />}
                                label="Timeframe"
                                value={
                                    job.timeframe_display ||
                                    job.timeframe ||
                                    'Any time'
                                }
                            />
                        </div>
                    </Card>

                    {/* Location */}
                    <Card padding="lg">
                        <h2 className="text-base font-semibold text-admin-text-primary mb-4 flex items-center gap-2">
                            <MapPin size={18} />
                            Location
                        </h2>
                        <div className="space-y-3">
                            <DetailItem
                                label="General Area"
                                value={job.general_location || '—'}
                            />
                            {job.exact_location && (
                                <DetailItem
                                    label="Exact Location"
                                    value={job.exact_location}
                                />
                            )}
                            {job.latitude && job.longitude && (
                                <DetailItem
                                    label="GPS Coordinates"
                                    value={`${job.latitude}, ${job.longitude}`}
                                />
                            )}
                            {job.map_url && (
                                <a
                                    href={job.map_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm text-admin-primary-600 hover:underline"
                                >
                                    <MapPin size={14} />
                                    Open in Google Maps
                                </a>
                            )}
                        </div>
                    </Card>

                    {/* Danger Zone */}
                    {canCancel && (
                        <Card padding="lg" className="border-red-200">
                            <h2 className="text-base font-semibold text-admin-danger mb-2 flex items-center gap-2">
                                <XCircle size={18} />
                                Danger Zone
                            </h2>
                            <p className="text-sm text-admin-text-secondary mb-4">
                                Cancelling this job will notify all applicants
                                and remove it from the platform.
                            </p>
                            <Button
                                variant="danger"
                                onClick={() => setShowCancelModal(true)}
                            >
                                Cancel Job
                            </Button>
                        </Card>
                    )}
                </div>

                {/* RIGHT: Client, Worker, Timeline */}
                <div className="space-y-6">
                    {/* Client */}
                    <Card padding="lg">
                        <h2 className="text-base font-semibold text-admin-text-primary mb-4">
                            Client
                        </h2>
                        <div className="space-y-3">
                            <DetailItem
                                icon={<User size={16} />}
                                label="Name"
                                value={job.client_name || '—'}
                            />
                            <DetailItem
                                icon={<Mail size={16} />}
                                label="Email"
                                value={clientEmail || '—'}
                            />
                            <DetailItem
                                icon={<Phone size={16} />}
                                label="Phone"
                                value={clientPhone || '—'}
                            />
                        </div>
                    </Card>

                    {/* Assigned Worker */}
                    <Card padding="lg">
                        <h2 className="text-base font-semibold text-admin-text-primary mb-4">
                            Assigned Worker
                        </h2>
                        {workerName ? (
                            <div className="space-y-3">
                                <DetailItem
                                    icon={<User size={16} />}
                                    label="Name"
                                    value={workerName}
                                />
                                {workerEmail && (
                                    <DetailItem
                                        icon={<Mail size={16} />}
                                        label="Email"
                                        value={workerEmail}
                                    />
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-admin-text-muted">
                                No worker assigned yet
                            </p>
                        )}
                    </Card>

                    {/* Timeline */}
                    <Card padding="lg">
                        <h2 className="text-base font-semibold text-admin-text-primary mb-4">
                            Timeline
                        </h2>
                        <div className="space-y-4">
                            <TimelineItem
                                label="Posted"
                                value={formatDateTime(
                                    job.posted_at || job.created_at
                                )}
                                active
                            />
                            {job.completed_at && (
                                <TimelineItem
                                    label="Completed"
                                    value={formatDateTime(job.completed_at)}
                                    active
                                    success
                                />
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Cancel Modal */}
            <Modal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                title="Cancel Job?"
                description="This action cannot be undone. The job will be cancelled and applicants notified."
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setShowCancelModal(false)}
                            disabled={actionLoading}
                        >
                            Keep Job
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleCancel}
                            loading={actionLoading}
                        >
                            Cancel Job
                        </Button>
                    </>
                }
            >
                <Input
                    label="Reason for cancellation"
                    placeholder="e.g., Client requested cancellation"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    required
                    autoFocus
                />
            </Modal>
        </div>
    );
};

// ============================================
// SUB COMPONENTS
// ============================================

const DetailItem = ({
    icon,
    label,
    value,
    highlight,
}: {
    icon?: React.ReactNode;
    label: string;
    value: string;
    highlight?: boolean;
}) => (
    <div>
        <div className="flex items-center gap-1.5 text-xs text-admin-text-secondary mb-1">
            {icon}
            <span>{label}</span>
        </div>
        <p
            className={`text-sm ${
                highlight
                    ? 'font-semibold text-admin-primary-600'
                    : 'font-medium text-admin-text-primary'
            }`}
        >
            {value}
        </p>
    </div>
);

const TimelineItem = ({
    label,
    value,
    active,
    success,
}: {
    label: string;
    value: string;
    active?: boolean;
    success?: boolean;
}) => (
    <div className="flex items-start gap-3">
        <div
            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                success
                    ? 'bg-green-500'
                    : active
                    ? 'bg-admin-primary-500'
                    : 'bg-gray-300'
            }`}
        />
        <div>
            <p className="text-sm font-medium text-admin-text-primary">
                {label}
            </p>
            <p className="text-xs text-admin-text-secondary">{value}</p>
        </div>
    </div>
);

export default JobDetailPage;
