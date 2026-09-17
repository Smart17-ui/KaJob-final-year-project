// frontend/src/components/ui/Skeleton.tsx

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
}

export const Skeleton = ({
    className = '',
    variant = 'rectangular',
    width,
    height,
}: SkeletonProps) => {
    const baseClasses = 'bg-gray-200 animate-pulse';

    const variantClasses = {
        text: 'rounded h-4',
        circular: 'rounded-full',
        rectangular: 'rounded-md',
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={{ width, height }}
        />
    );
};

// ============================================
// PREDEFINED SKELETONS
// ============================================

export const CardSkeleton = () => (
    <div className="bg-white rounded-admin-card border border-admin-border-light p-6">
        <Skeleton className="h-4 w-24 mb-4" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
    </div>
);

export const TableRowSkeleton = ({ columns = 5 }: { columns?: number }) => (
    <tr>
        {Array.from({ length: columns }).map((_, i) => (
            <td key={i} className="px-4 py-4">
                <Skeleton className="h-4 w-full" />
            </td>
        ))}
    </tr>
);

export const ListItemSkeleton = () => (
    <div className="flex items-center gap-4 p-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-48" />
        </div>
    </div>
);
