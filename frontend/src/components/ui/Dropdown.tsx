// frontend/src/components/ui/Dropdown.tsx

import { ReactNode, useEffect, useRef, useState } from 'react';

interface DropdownItem {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    danger?: boolean;
    disabled?: boolean;
}

interface DropdownProps {
    trigger: ReactNode;
    items: DropdownItem[];
    align?: 'left' | 'right';
    width?: string;
}

export const Dropdown = ({
    trigger,
    items,
    align = 'right',
    width = 'w-56',
}: DropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            {/* Trigger */}
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                {trigger}
            </div>

            {/* Dropdown menu */}
            {isOpen && (
                <div
                    className={`
                        absolute top-full mt-2 ${width}
                        bg-white border border-admin-border-light
                        rounded-admin-card shadow-admin-dropdown
                        py-1 z-50
                        ${align === 'right' ? 'right-0' : 'left-0'}
                        animate-in fade-in zoom-in-95 duration-150
                    `}
                >
                    {items.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                item.onClick();
                                setIsOpen(false);
                            }}
                            disabled={item.disabled}
                            className={`
                                flex items-center gap-2 w-full px-4 py-2
                                text-sm text-left
                                transition-colors duration-100
                                disabled:opacity-50 disabled:cursor-not-allowed
                                ${item.danger
                                    ? 'text-admin-danger hover:bg-red-50'
                                    : 'text-admin-text-primary hover:bg-admin-bg-hover'
                                }
                            `}
                        >
                            {item.icon && <span className="shrink-0">{item.icon}</span>}
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
