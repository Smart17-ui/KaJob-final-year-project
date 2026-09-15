// frontend/src/features/admin/analytics/AnalyticsPage.tsx

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Card } from '@/components/ui/Card';

export const AnalyticsPage = () => {
    return (
        <div>
            <AdminPageHeader
                breadcrumbs={[{ label: 'Analytics' }]}
                title="Analytics"
                description="Platform statistics and trends."
            />
            <Card padding="lg">
                <p className="text-center text-admin-text-secondary py-12">
                    This page is coming soon
                </p>
            </Card>
        </div>
    );
};

export default AnalyticsPage;
