// frontend/src/features/admin/jobs/components/JobsFilters.tsx

import { SearchInput } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface JobsFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    status: string;
    onStatusChange: (value: string) => void;
}

const statusOptions = [
    { value: 'OPEN', label: 'Open' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
];

export const JobsFilters = ({
    search,
    onSearchChange,
    status,
    onStatusChange,
}: JobsFiltersProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Search */}
            <SearchInput
                placeholder="Search jobs by title or description..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                onClear={() => onSearchChange('')}
            />

            {/* Status Filter */}
            <Select
                value={status}
                onChange={(e) => onStatusChange(e.target.value)}
                options={statusOptions}
                placeholder="All Statuses"
            />
        </div>
    );
};

export default JobsFilters;
