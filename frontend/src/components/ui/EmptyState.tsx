// frontend/src/components/ui/EmptyState.tsx

import { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
}

export const EmptyState = ({
    icon,
    title,
    description,
    action,
}: EmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            {/* Icon */}
            <div className="mb-4 p-4 bg-admin-bg-hover rounded-full text-admin-text-muted">
                {icon || <Inbox size={32} />}
            </div>

            {/* Title */}
            <h3 className="text-base font-semibold text-admin-text-primary mb-1">
                {title}
            </h3>

            {/* Description */}
            {description && (
                <p className="text-sm text-admin-text-secondary text-center max-w-md mb-6">
                    {description}
                </p>
            )}

            {/* Action */}
            {action && <div>{action}</div>}
        </div>
    );
};
