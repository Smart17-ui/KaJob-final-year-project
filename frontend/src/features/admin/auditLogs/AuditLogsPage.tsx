// frontend/src/features/admin/auditLogs/AuditLogsPage.tsx

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Card } from '@/components/ui/Card';

export const AuditLogsPage = () => {
    return (
        <div>
            <AdminPageHeader
                breadcrumbs={[{ label: 'Audit Logs' }]}
                title="Audit Logs"
                description="Track all administrative actions."
            />
            <Card padding="lg">
                <p className="text-center text-admin-text-secondary py-12">
                    This page is coming soon
                </p>
            </Card>
        </div>
    );
};

export default AuditLogsPage;
