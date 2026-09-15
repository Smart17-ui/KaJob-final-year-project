// frontend/src/components/ui/Table.tsx

import { ReactNode } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface Column<T> {
    key: string;
    header: string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: (item: T, index: number) => ReactNode;
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    emptyState?: ReactNode;
    onSort?: (key: string) => void;
    sortKey?: string;
    sortDirection?: 'asc' | 'desc';
    onRowClick?: (item: T) => void;
    keyExtractor: (item: T) => string | number;
}

// ============================================
// TABLE COMPONENT
// ============================================

export function Table<T>({
    data,
    columns,
    loading = false,
    emptyState,
    onSort,
    sortKey,
    sortDirection,
    onRowClick,
    keyExtractor,
}: TableProps<T>) {
    // Loading state
    if (loading) {
        return <TableSkeleton columns={columns.length} />;
    }

    // Empty state
    if (!data.length) {
        return <>{emptyState}</>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-admin-border-light">
                <thead className="bg-admin-bg-hover">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={`
                                    px-4 py-3
                                    text-left text-xs font-semibold text-admin-text-secondary uppercase tracking-wider
                                    ${column.align === 'right' ? 'text-right' : ''}
                                    ${column.align === 'center' ? 'text-center' : ''}
                                    ${column.sortable ? 'cursor-pointer hover:bg-admin-bg-active select-none' : ''}
                                `}
                                style={{ width: column.width }}
                                onClick={() => column.sortable && onSort?.(column.key)}
                            >
                                <div className={`flex items-center gap-1 ${
                                    column.align === 'right' ? 'justify-end' : ''
                                }`}>
                                    {column.header}
                                    {column.sortable && sortKey === column.key && (
                                        sortDirection === 'asc' 
                                            ? <ChevronUp size={14} /> 
                                            : <ChevronDown size={14} />
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-admin-border-light">
                    {data.map((item, index) => (
                        <tr
                            key={keyExtractor(item)}
                            onClick={() => onRowClick?.(item)}
                            className={`
                                transition-colors duration-100
                                ${onRowClick ? 'cursor-pointer hover:bg-admin-bg-hover' : ''}
                            `}
                        >
                            {columns.map((column) => (
                                <td
                                    key={column.key}
                                    className={`
                                        px-4 py-3 text-sm text-admin-text-primary
                                        ${column.align === 'right' ? 'text-right' : ''}
                                        ${column.align === 'center' ? 'text-center' : ''}
                                    `}
                                >
                                    {column.render
                                        ? column.render(item, index)
                                        : (item as any)[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ============================================
// SKELETON
// ============================================

interface TableSkeletonProps {
    columns: number;
    rows?: number;
}

export const TableSkeleton = ({ columns, rows = 5 }: TableSkeletonProps) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-admin-border-light">
                <thead className="bg-admin-bg-hover">
                    <tr>
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i} className="px-4 py-3">
                                <div className="h-3 bg-gray-200 rounded animate-pulse" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-admin-border-light">
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <tr key={rowIndex}>
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <td key={colIndex} className="px-4 py-4">
                                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
