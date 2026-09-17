// frontend/src/features/admin/reports/ReportsPage.tsx

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Card } from '@/components/ui/Card';

export const ReportsPage = () => {
    return (
        <div>
            <AdminPageHeader
                breadcrumbs={[{ label: 'Reports' }]}
                title="Reports"
                description="Investigate reported users and content."
            />
            <Card padding="lg">
                <p className="text-center text-admin-text-secondary py-12">
                    This page is coming soon
                </p>
            </Card>
        </div>
    );
};

export default ReportsPage;
