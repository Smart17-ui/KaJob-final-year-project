// frontend/src/features/admin/routes.tsx

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminRoute } from '@/components/admin/AdminRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ToastProvider } from '@/components/ui/Toast';

// ============================================
// LAZY-LOADED PAGES
// ============================================

const DashboardPage = lazy(() => import('./dashboard/DashboardPage'));
const UsersPage = lazy(() => import('./users/UsersPage'));
const UserDetailPage = lazy(() => import('./users/UserDetailPage'));

const VerificationsPage = lazy(
    () => import('./verifications/VerificationsPage')
);
const VerificationDetailPage = lazy(
    () => import('./verifications/VerificationDetailPage')
);

const JobsPage = lazy(() => import('./jobs/JobsPage'));
const JobDetailPage = lazy(() => import('./jobs/JobDetailPage'));

const ReportsPage = lazy(() => import('./reports/ReportsPage'));
const ReportDetailPage = lazy(
    () => import('./reports/ReportDetailPage')
);

const AnalyticsPage = lazy(() => import('./analytics/AnalyticsPage'));
const AuditLogsPage = lazy(() => import('./auditLogs/AuditLogsPage'));

// ============================================
// LOADING FALLBACK
// ============================================

const PageLoader = () => (
    <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-admin-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-admin-text-secondary">Loading...</p>
        </div>
    </div>
);

// ============================================
// ADMIN ROUTES COMPONENT
// ============================================

/**
 * AdminRoutes - All admin panel routes.
 */
export const AdminRoutes = () => {
    return (
        <AdminRoute>
            <ToastProvider>
                <AdminLayout>
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                            {/* Default redirect */}
                            <Route
                                index
                                element={
                                    <Navigate to="/admin/dashboard" replace />
                                }
                            />

                            {/* Dashboard */}
                            <Route
                                path="dashboard"
                                element={<DashboardPage />}
                            />

                            {/* Users */}
                            <Route
                                path="users"
                                element={<UsersPage />}
                            />
                            <Route
                                path="users/:userId"
                                element={<UserDetailPage />}
                            />

                            {/* Verifications */}
                            <Route
                                path="verifications"
                                element={<VerificationsPage />}
                            />
                            <Route
                                path="verifications/:id"
                                element={<VerificationDetailPage />}
                            />

                            {/* Jobs */}
                            <Route
                                path="jobs"
                                element={<JobsPage />}
                            />
                            <Route
                                path="jobs/:id"
                                element={<JobDetailPage />}
                            />

                            {/* Reports */}
                            <Route
                                path="reports"
                                element={<ReportsPage />}
                            />
                            <Route
                                path="reports/:reportId"
                                element={<ReportDetailPage />}
                            />

                            {/* Analytics */}
                            <Route
                                path="analytics"
                                element={<AnalyticsPage />}
                            />

                            {/* Audit Logs */}
                            <Route
                                path="audit-logs"
                                element={<AuditLogsPage />}
                            />
                        </Routes>
                    </Suspense>
                </AdminLayout>
            </ToastProvider>
        </AdminRoute>
    );
};

export default AdminRoutes;
