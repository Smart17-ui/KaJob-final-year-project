// frontend/src/components/ui/Select.tsx

import { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    hint?: string;
    options: SelectOption[];
    placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, hint, options, placeholder, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-admin-text-primary mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        className={`
                            w-full
                            px-3 py-2 pr-10
                            text-sm text-admin-text-primary
                            bg-white
                            border rounded-admin-button
                            appearance-none
                            transition-colors duration-150
                            focus:outline-none focus:ring-2 focus:ring-admin-primary-500 focus:border-admin-primary-500
                            disabled:bg-gray-50 disabled:text-gray-400
                            ${error 
                                ? 'border-admin-danger focus:ring-admin-danger focus:border-admin-danger' 
                                : 'border-admin-border-default'
                            }
                            ${className}
                        `}
                        {...props}
                    >
                        {placeholder && (
                            <option value="">{placeholder}</option>
                        )}
                        {options.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-text-muted pointer-events-none"
                    />
                </div>
                {error && (
                    <p className="mt-1.5 text-xs text-admin-danger">{error}</p>
                )}
                {hint && !error && (
                    <p className="mt-1.5 text-xs text-admin-text-muted">{hint}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';
