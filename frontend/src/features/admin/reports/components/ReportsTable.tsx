// frontend/src/features/admin/reports/components/ReportsTable.tsx

import { AlertCircle, Loader2 } from 'lucide-react';
import type { AdminReport } from '@/types/admin';

interface Props {
    reports: AdminReport[];
    loading: boolean;
    onView: (report: AdminReport) => void;
}

const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800',
    UNDER_INVESTIGATION: 'bg-blue-100 text-blue-800',
    AWAITING_USER_RESPONSE: 'bg-purple-100 text-purple-800',
    RESOLVED: 'bg-emerald-100 text-emerald-800',
    ESCALATED_TO_POLICE: 'bg-red-100 text-red-800',
    CLOSED: 'bg-gray-100 text-gray-700',
};

export const ReportsTable = ({ reports, loading, onView }: Props) => {
    // Guard against undefined (in case the parent passes undefined data)
    const safeReports = Array.isArray(reports) ? reports : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2
                    size={20}
                    className="animate-spin text-admin-text-tertiary"
                />
                <span className="ml-2 text-sm text-admin-text-secondary">
                    Loading reports...
                </span>
            </div>
        );
    }

    if (safeReports.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <AlertCircle
                    size={24}
                    className="text-admin-text-tertiary mb-2"
                />
                <p className="text-sm text-admin-text-secondary">
                    No reports found.
                </p>
            </div>
        );
    }

    return (
        <table className="w-full text-sm">
            <thead className="bg-admin-bg-secondary text-left text-xs font-semibold text-admin-text-secondary uppercase">
                <tr>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Reporter</th>
                    <th className="px-4 py-3">Reported</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Submitted</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-admin-border-light">
                {safeReports.map((r) => {
                    const isGeneralComplaint = !r.reported_user;

                    return (
                        <tr
                            key={r.id}
                            onClick={() => onView(r)}
                            className="cursor-pointer hover:bg-admin-bg-secondary"
                        >
                            <td className="px-4 py-3 font-mono text-xs text-admin-text-primary">
                                {r.reference_number ?? '—'}
                            </td>

                            {/* Reporter — always present, but defensive */}
                            <td className="px-4 py-3">
                                <div className="font-medium text-admin-text-primary">
                                    {r.reporter?.full_name ?? '—'}
                                </div>
                                <div className="text-xs text-admin-text-tertiary">
                                    {r.reporter?.email ?? ''}
                                </div>
                            </td>

                            {/* Reported — NULL for general complaints */}
                            <td className="px-4 py-3">
                                {isGeneralComplaint ? (
                                    <span className="inline-block px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                                        General complaint
                                    </span>
                                ) : (
                                    <>
                                        <div className="font-medium text-admin-text-primary">
                                            {r.reported_user?.full_name ?? '—'}
                                        </div>
                                        <div className="text-xs text-admin-text-tertiary">
                                            {r.reported_user?.email ?? ''}
                                        </div>
                                    </>
                                )}
                            </td>

                            <td className="px-4 py-3 text-admin-text-primary">
                                {r.category_display ?? '—'}
                            </td>

                            <td className="px-4 py-3">
                                <span
                                    className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                                        STATUS_COLORS[r.status] ||
                                        'bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    {r.status_display ?? r.status ?? '—'}
                                </span>
                            </td>

                            <td className="px-4 py-3 text-admin-text-tertiary text-xs">
                                {r.submitted_at
                                    ? new Date(r.submitted_at).toLocaleDateString()
                                    : '—'}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default ReportsTable;
