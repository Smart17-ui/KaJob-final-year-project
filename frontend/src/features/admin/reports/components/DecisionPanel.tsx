// frontend/src/features/admin/reports/components/DecisionPanel.tsx

import { useState } from 'react';
import {
    AlertCircle,
    Ban,
    Flag,
    Loader2,
    Shield,
    UserX,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

import { adminReportsApi } from '@/api/admin/reports';
import type {
    AdminReportDetail,
    ReportDecision,
} from '@/types/admin';

interface Props {
    report: AdminReportDetail;
    onUpdated: () => void;
}

const DECISION_POLICY: Record<string, ReportDecision[]> = {
    FRAUD: ['DISMISSED', 'BANNED'],
    VIOLENCE: ['DISMISSED', 'BANNED', 'ESCALATED'],
    HARASSMENT: ['DISMISSED', 'WARNED', 'SUSPENDED', 'BANNED'],
    THEFT: ['DISMISSED', 'SUSPENDED', 'BANNED', 'ESCALATED'],
    NO_SHOW: ['DISMISSED', 'WARNED', 'SUSPENDED'],
    POOR_CONDUCT: ['DISMISSED', 'WARNED', 'SUSPENDED', 'BANNED'],
    PROPERTY_DAMAGE: ['DISMISSED', 'WARNED', 'SUSPENDED', 'BANNED'],
    OTHER: ['DISMISSED', 'WARNED', 'SUSPENDED', 'BANNED', 'ESCALATED'],
};

const DECISION_LABELS: Record<ReportDecision, string> = {
    DISMISSED: 'Dismiss — no action',
    WARNED: 'Warn — notify user',
    SUSPENDED: 'Suspend — 14 days',
    BANNED: 'Ban — permanent',
    ESCALATED: 'Escalate — police referral',
};

const DECISION_ICONS: Record<ReportDecision, typeof Flag> = {
    DISMISSED: Flag,
    WARNED: AlertCircle,
    SUSPENDED: UserX,
    BANNED: Ban,
    ESCALATED: Shield,
};

export const DecisionPanel = ({ report, onUpdated }: Props) => {
    const { showToast } = useToast();

    const [internalNotes, setInternalNotes] = useState(
        report.investigation?.internal_notes || ''
    );
    const [decision, setDecision] = useState<ReportDecision | ''>(
        report.investigation?.decision || ''
    );
    const [decisionNotes, setDecisionNotes] = useState(
        report.investigation?.decision_notes || ''
    );
    const [busy, setBusy] = useState(false);

    const allowed = DECISION_POLICY[report.category] || [];
    const investigation = report.investigation;
    const canStartInvestigation =
        ['PENDING', 'AWAITING_USER_RESPONSE'].includes(report.status) &&
        !investigation;
    const canResolve =
        report.status === 'UNDER_INVESTIGATION' &&
        investigation &&
        !investigation.completed_at;

    const handleInvestigate = async () => {
        setBusy(true);
        try {
            await adminReportsApi.investigateReport(report.id, {
                internal_notes: internalNotes,
            });
            showToast({
                type: 'success',
                title: 'Investigation started',
            });
            onUpdated();
        } catch (err: any) {
            showToast({
                type: 'error',
                title: 'Failed',
                message: err.message,
            });
        } finally {
            setBusy(false);
        }
    };

    const handleResolve = async () => {
        if (!decision) {
            showToast({
                type: 'error',
                title: 'Pick a decision first',
            });
            return;
        }
        if (decision !== 'DISMISSED' && !decisionNotes.trim()) {
            showToast({
                type: 'error',
                title: 'Notes are required',
                message: 'Please explain the reasoning.',
            });
            return;
        }

        const confirmMsg = `Apply "${DECISION_LABELS[decision]}"? This will affect the reported user's account.`;
        if (!window.confirm(confirmMsg)) return;

        setBusy(true);
        try {
            await adminReportsApi.resolveReport(report.id, {
                decision: decision as ReportDecision,
                decision_notes: decisionNotes,
            });
            showToast({
                type: 'success',
                title: 'Report resolved',
            });
            onUpdated();
        } catch (err: any) {
            showToast({
                type: 'error',
                title: 'Failed',
                message: err.message,
            });
        } finally {
            setBusy(false);
        }
    };

    // No investigation yet
    if (canStartInvestigation) {
        return (
            <Card padding="md">
                <p className="text-sm font-semibold text-admin-text-primary mb-3">
                    Start Investigation
                </p>
                <textarea
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Optional internal notes..."
                    rows={3}
                    className="w-full rounded-lg border border-admin-border-light p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-admin-primary-500"
                />
                <Button
                    variant="primary"
                    className="w-full mt-3"
                    onClick={handleInvestigate}
                    disabled={busy}
                >
                    {busy ? 'Starting...' : 'Start Investigation'}
                </Button>
            </Card>
        );
    }

    // Investigation in progress — decision form
    if (canResolve) {
        return (
            <Card padding="md">
                <p className="text-sm font-semibold text-admin-text-primary mb-3">
                    Decision
                </p>

                <div className="space-y-2 mb-4">
                    {allowed.map((d) => {
                        const Icon = DECISION_ICONS[d];
                        const active = decision === d;
                        return (
                            <label
                                key={d}
                                className={`
                                    flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition
                                    ${
                                        active
                                            ? 'border-admin-primary-500 bg-admin-primary-50 ring-1 ring-admin-primary-500'
                                            : 'border-admin-border-light hover:border-admin-border-medium'
                                    }
                                `}
                            >
                                <input
                                    type="radio"
                                    name="decision"
                                    value={d}
                                    checked={active}
                                    onChange={() => setDecision(d)}
                                    className="mt-1"
                                />
                                <Icon
                                    size={18}
                                    className={`
                                        mt-0.5 flex-shrink-0
                                        ${
                                            d === 'BANNED' || d === 'ESCALATED'
                                                ? 'text-red-600'
                                                : d === 'SUSPENDED'
                                                ? 'text-amber-600'
                                                : d === 'WARNED'
                                                ? 'text-blue-600'
                                                : 'text-admin-text-tertiary'
                                        }
                                    `}
                                />
                                <div className="text-sm text-admin-text-primary">
                                    {DECISION_LABELS[d]}
                                </div>
                            </label>
                        );
                    })}
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-semibold text-admin-text-primary mb-1.5">
                        Decision Notes{' '}
                        {decision !== 'DISMISSED' && (
                            <span className="text-red-600">*</span>
                        )}
                    </label>
                    <textarea
                        value={decisionNotes}
                        onChange={(e) => setDecisionNotes(e.target.value)}
                        placeholder="Explain the reasoning — this is shown to the affected user."
                        rows={4}
                        className="w-full rounded-lg border border-admin-border-light p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-admin-primary-500"
                    />
                </div>

                <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleResolve}
                    disabled={busy || !decision}
                >
                    {busy ? 'Applying...' : 'Resolve Report'}
                </Button>
            </Card>
        );
    }

    // Already resolved
    if (investigation?.completed_at) {
        return (
            <Card padding="md">
                <p className="text-sm font-semibold text-admin-text-primary mb-3">
                    Resolved
                </p>
                <p className="text-sm text-admin-text-primary">
                    <strong>Decision:</strong>{' '}
                    {investigation.decision_display}
                </p>
                {investigation.decision_notes && (
                    <p className="text-xs text-admin-text-secondary mt-2 whitespace-pre-wrap">
                        {investigation.decision_notes}
                    </p>
                )}
            </Card>
        );
    }

    return null;
};

export default DecisionPanel;
