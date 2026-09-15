// frontend/src/components/ui/Input.tsx

import { InputHTMLAttributes, forwardRef } from 'react';
import { Search, X } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, icon, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-admin-text-primary mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-muted">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
                            w-full
                            px-3 py-2
                            text-sm text-admin-text-primary
                            bg-white
                            border rounded-admin-button
                            transition-colors duration-150
                            placeholder:text-admin-text-muted
                            focus:outline-none focus:ring-2 focus:ring-admin-primary-500 focus:border-admin-primary-500
                            disabled:bg-gray-50 disabled:text-gray-400
                            ${icon ? 'pl-10' : ''}
                            ${error 
                                ? 'border-admin-danger focus:ring-admin-danger focus:border-admin-danger' 
                                : 'border-admin-border-default'
                            }
                            ${className}
                        `}
                        {...props}
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

Input.displayName = 'Input';

// Search Input
interface SearchInputProps extends Omit<InputProps, 'icon'> {
    onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
    ({ value, onClear, className = '', ...props }, ref) => {
        return (
            <div className="relative w-full">
                <Search 
                    size={18} 
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-muted" 
                />
                <input
                    ref={ref}
                    value={value}
                    className={`
                        w-full
                        pl-10 pr-10 py-2
                        text-sm text-admin-text-primary
                        bg-white
                        border border-admin-border-default rounded-admin-button
                        transition-colors duration-150
                        placeholder:text-admin-text-muted
                        focus:outline-none focus:ring-2 focus:ring-admin-primary-500 focus:border-admin-primary-500
                        ${className}
                    `}
                    {...props}
                />
                {value && onClear && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-text-muted hover:text-admin-text-primary"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
        );
    }
);

SearchInput.displayName = 'SearchInput';
