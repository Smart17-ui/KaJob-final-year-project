// frontend/src/components/admin/AdminRoute.tsx

import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface AdminRouteProps {
    children: ReactNode;
}

/**
 * AdminRoute - Auth guard for admin-only pages.
 * 
 * Redirects:
 * - Unauthenticated users → /login
 * - Non-admin users → /dashboard
 */
export const AdminRoute = ({ children }: AdminRouteProps) => {
    const { user, isLoggedIn } = useAuth();
    const location = useLocation();

    // Not logged in → redirect to login
    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Logged in but not admin → redirect to dashboard
    if (!user?.is_admin) {
        return <Navigate to="/dashboard" replace />;
    }

    // Authenticated admin → render children
    return <>{children}</>;
};

export default AdminRoute;
