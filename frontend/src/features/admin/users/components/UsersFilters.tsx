// frontend/src/features/admin/users/components/UsersFilters.tsx

import { SearchInput } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface UsersFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    role: string;
    onRoleChange: (value: string) => void;
    status: string;
    onStatusChange: (value: string) => void;
    verified: string;
    onVerifiedChange: (value: string) => void;
}

const roleOptions = [
    { value: 'WORKER', label: 'Worker' },
    { value: 'CLIENT', label: 'Client' },
    { value: 'ADMIN', label: 'Admin' },
];

const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'SUSPENDED', label: 'Suspended' },
    { value: 'BANNED', label: 'Banned' },
    { value: 'DEACTIVATED', label: 'Deactivated' },
];

const verifiedOptions = [
    { value: 'true', label: 'Verified' },
    { value: 'false', label: 'Not Verified' },
];

export const UsersFilters = ({
    search,
    onSearchChange,
    role,
    onRoleChange,
    status,
    onStatusChange,
    verified,
    onVerifiedChange,
}: UsersFiltersProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="lg:col-span-1">
                <SearchInput
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onClear={() => onSearchChange('')}
                />
            </div>

            <Select
                value={role}
                onChange={(e) => onRoleChange(e.target.value)}
                options={roleOptions}
                placeholder="All Roles"
            />

            <Select
                value={status}
                onChange={(e) => onStatusChange(e.target.value)}
                options={statusOptions}
                placeholder="All Statuses"
            />

            <Select
                value={verified}
                onChange={(e) => onVerifiedChange(e.target.value)}
                options={verifiedOptions}
                placeholder="All Verification"
            />
        </div>
    );
};

export default UsersFilters;
