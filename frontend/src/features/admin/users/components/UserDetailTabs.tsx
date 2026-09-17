// frontend/src/features/admin/users/components/UserDetailTabs.tsx

interface Tab {
    id: string;
    label: string;
    count?: number;
}

interface UserDetailTabsProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (tabId: string) => void;
}

export const UserDetailTabs = ({ tabs, activeTab, onChange }: UserDetailTabsProps) => {
    return (
        <div className="border-b border-admin-border-light">
            <nav className="flex items-center gap-1 overflow-x-auto">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onChange(tab.id)}
                            className={`
                                relative flex items-center gap-2 px-4 py-3
                                text-sm font-medium whitespace-nowrap
                                transition-colors duration-150
                                ${isActive
                                    ? 'text-admin-primary-600'
                                    : 'text-admin-text-secondary hover:text-admin-text-primary'
                                }
                            `}
                        >
                            {tab.label}
                            {typeof tab.count === 'number' && (
                                <span
                                    className={`
                                        px-2 py-0.5 text-xs font-medium rounded-full
                                        ${isActive
                                            ? 'bg-admin-primary-100 text-admin-primary-700'
                                            : 'bg-admin-bg-hover text-admin-text-secondary'
                                        }
                                    `}
                                >
                                    {tab.count}
                                </span>
                            )}
                            {isActive && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-admin-primary-500" />
                            )}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default UserDetailTabs;
