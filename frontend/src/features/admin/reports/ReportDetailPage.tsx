// frontend/src/features/admin/reports/ReportDetailPage.tsx

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

import { adminReportsApi } from '@/api/admin/reports';
import type { AdminReportDetail } from '@/types/admin';

import { DecisionPanel } from './components/DecisionPanel';

const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800',
    UNDER_INVESTIGATION: 'bg-blue-100 text-blue-800',
    AWAITING_USER_RESPONSE: 'bg-purple-100 text-purple-800',
    RESOLVED: 'bg-emerald-100 text-emerald-800',
    ESCALATED_TO_POLICE: 'bg-red-100 text-red-800',
    CLOSED: 'bg-gray-100 text-gray-700',
};

export const ReportDetailPage = () => {
    const { reportId } = useParams<{ reportId: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [report, setReport] = useState<AdminReportDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReport = useCallback(async () => {
        if (!reportId) return;
        try {
            setLoading(true);
            setError(null);
            const data = await adminReportsApi.getReport(Number(reportId));
            setReport(data.report);
        } catch (err: any) {
            setError(err.message || 'Failed to load report');
            showToast({
                type: 'error',
                title: 'Failed to load report',
                message: err.message,
            });
        } finally {
            setLoading(false);
        }
    }, [reportId, showToast]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2
                    size={20}
                    className="animate-spin text-admin-text-tertiary"
                />
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="text-center p-12">
                <AlertCircle
                    size={24}
                    className="mx-auto text-red-600 mb-2"
                />
                <p className="text-red-600">
                    {error || 'Report not found.'}
                </p>
            </div>
        );
    }

    return (
        <div>
            <AdminPageHeader
                breadcrumbs={[
                    { label: 'Reports', href: '/admin/reports' },
                    { label: report.reference_number },
                ]}
                title={report.reference_number}
                description={report.category_display}
                actions={
                    <Button
                        variant="secondary"
                        icon={<ArrowLeft size={16} />}
                        onClick={() => navigate('/admin/reports')}
                    >
                        Back
                    </Button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status + meta */}
                    <Card padding="md">
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span
                                className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                                    STATUS_COLORS[report.status] ||
                                    'bg-gray-100 text-gray-700'
                                }`}
                            >
                                {report.status_display}
                            </span>
                            <span className="text-admin-text-secondary">
                                Submitted:{' '}
                                {new Date(
                                    report.submitted_at
                                ).toLocaleString()}
                            </span>
                            {report.police_report_generated && (
                                <span className="px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700">
                                    Police report filed
                                </span>
                            )}
                        </div>
                    </Card>

                    {/* Parties */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <PartyCard
                            label="Reporter"
                            user={report.reporter}
                        />
                        <PartyCard
                            label="Reported User"
                            user={report.reported_user}
                            tone="red"
                        />
                    </div>

                    {/* Job */}
                    <Card padding="md">
                        <p className="text-xs font-semibold text-admin-text-secondary uppercase mb-2">
                            Job
                        </p>
                        <p className="text-sm font-medium text-admin-text-primary">
                            {report.job.title}
                        </p>
                        <p className="text-xs text-admin-text-tertiary mt-1">
                            #{report.job.id} · {report.job.status}
                            {report.job.budget
                                ? ` · K${report.job.budget}`
                                : ''}
                        </p>
                    </Card>

                    {/* Description */}
                    <Card padding="md">
                        <p className="text-xs font-semibold text-admin-text-secondary uppercase mb-2">
                            Description
                        </p>
                        <div className="text-sm text-admin-text-primary whitespace-pre-wrap">
                            {report.description}
                        </div>
                    </Card>

                    {/* Investigation summary (if completed) */}
                    {report.investigation?.completed_at && (
                        <Card padding="md">
                            <p className="text-xs font-semibold text-admin-text-secondary uppercase mb-2">
                                Investigation Result
                            </p>
                            <p className="text-sm text-admin-text-primary">
                                <strong>Decision:</strong>{' '}
                                {report.investigation.decision_display}
                            </p>
                            {report.investigation.decision_notes && (
                                <p className="text-xs text-admin-text-secondary mt-2 whitespace-pre-wrap">
                                    {report.investigation.decision_notes}
                                </p>
                            )}
                        </Card>
                    )}
                </div>

                {/* Right: action panel */}
                <div className="lg:col-span-1">
                    <DecisionPanel
                        report={report}
                        onUpdated={fetchReport}
                    />
                </div>
            </div>
        </div>
    );
};

/* ============================================================
   Party card
   ============================================================ */

function PartyCard({
    label,
    user,
    tone = 'slate',
}: {
    label: string;
    user: AdminReportDetail['reporter'];
    tone?: 'slate' | 'red';
}) {
    const toneClass =
        tone === 'red'
            ? 'border-red-100 bg-red-50'
            : 'border-admin-border-light bg-admin-bg-secondary';
    return (
        <div className={`rounded-lg border p-4 ${toneClass}`}>
            <p className="text-xs font-semibold text-admin-text-secondary uppercase mb-1">
                {label}
            </p>
            <p className="text-sm font-medium text-admin-text-primary">
                {user.full_name}
            </p>
            <p className="text-xs text-admin-text-secondary">
                {user.email}
            </p>
            <div className="flex gap-2 mt-2 text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-white border border-admin-border-light text-admin-text-secondary">
                    {user.account_status}
                </span>
                {user.is_verified && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        Verified
                    </span>
                )}
            </div>
        </div>
    );
}

export default ReportDetailPage;
