// frontend/src/components/admin/AdminPageHeader.tsx

import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface AdminPageHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
    title: string;
    description?: string;
    actions?: ReactNode;
}

export const AdminPageHeader = ({
    breadcrumbs = [],
    title,
    description,
    actions,
}: AdminPageHeaderProps) => {
    return (
        <div className="mb-6">
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-1.5 mb-2 text-sm text-admin-text-muted">
                    <Link
                        to="/admin/dashboard"
                        className="hover:text-admin-text-secondary transition-colors"
                    >
                        KaJob
                    </Link>
                    {breadcrumbs.map((item, index) => (
                        <span key={index} className="flex items-center gap-1.5">
                            <ChevronRight size={14} />
                            {item.href ? (
                                <Link
                                    to={item.href}
                                    className="hover:text-admin-text-secondary transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-admin-text-secondary">
                                    {item.label}
                                </span>
                            )}
                        </span>
                    ))}
                </nav>
            )}

            {/* Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-admin-text-primary">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-1 text-sm text-admin-text-secondary">
                            {description}
                        </p>
                    )}
                </div>
                {actions && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPageHeader;
