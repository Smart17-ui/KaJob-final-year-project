// frontend/src/components/ui/Pagination.tsx

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: number[];
}

export const Pagination = ({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50, 100],
}: PaginationProps) => {
    // Calculate range
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    // Generate page numbers to display
    const getPageNumbers = (): (number | 'ellipsis')[] => {
        const pages: (number | 'ellipsis')[] = [];
        const maxVisible = 5;
        const half = Math.floor(maxVisible / 2);

        if (totalPages <= maxVisible) {
            // Show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show first page
            pages.push(1);

            if (currentPage > half + 2) {
                pages.push('ellipsis');
            }

            // Show middle pages
            const start = Math.max(2, currentPage - half);
            const end = Math.min(totalPages - 1, currentPage + half);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - half - 1) {
                pages.push('ellipsis');
            }

            // Show last page
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }

        return pages;
    };

    if (totalItems === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-admin-border-light">
            {/* Left: Range info */}
            <div className="text-sm text-admin-text-secondary">
                Showing <span className="font-medium text-admin-text-primary">{startItem}</span>
                {' - '}
                <span className="font-medium text-admin-text-primary">{endItem}</span>
                {' of '}
                <span className="font-medium text-admin-text-primary">{totalItems}</span>
            </div>

            {/* Right: Pagination + Page size */}
            <div className="flex items-center gap-4">
                {/* Page size selector */}
                {onPageSizeChange && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-admin-text-secondary">Show</span>
                        <select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className="px-2 py-1 text-sm border border-admin-border-default rounded-admin-button focus:outline-none focus:ring-2 focus:ring-admin-primary-500"
                        >
                            {pageSizeOptions.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Pagination buttons */}
                <nav className="flex items-center gap-1">
                    {/* Previous */}
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 text-admin-text-secondary hover:text-admin-text-primary hover:bg-admin-bg-hover rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Previous page"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    {/* Page numbers */}
                    {getPageNumbers().map((page, index) => {
                        if (page === 'ellipsis') {
                            return (
                                <span
                                    key={`ellipsis-${index}`}
                                    className="px-2 text-admin-text-muted"
                                >
                                    <MoreHorizontal size={16} />
                                </span>
                            );
                        }

                        return (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`
                                    min-w-[32px] h-8 px-2 text-sm font-medium rounded-md
                                    transition-colors duration-100
                                    ${page === currentPage
                                        ? 'bg-admin-primary-500 text-white'
                                        : 'text-admin-text-secondary hover:text-admin-text-primary hover:bg-admin-bg-hover'
                                    }
                                `}
                            >
                                {page}
                            </button>
                        );
                    })}

                    {/* Next */}
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 text-admin-text-secondary hover:text-admin-text-primary hover:bg-admin-bg-hover rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Next page"
                    >
                        <ChevronRight size={16} />
                    </button>
                </nav>
            </div>
        </div>
    );
};
