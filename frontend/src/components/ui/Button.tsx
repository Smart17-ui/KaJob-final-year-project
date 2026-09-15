// frontend/src/components/ui/Button.tsx

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    icon?: React.ReactNode;
}

const variants: Record<ButtonVariant, string> = {
    primary: `
        bg-admin-primary-500 text-white 
        hover:bg-admin-primary-600 
        active:bg-admin-primary-700
        disabled:bg-admin-primary-300
        focus:ring-2 focus:ring-admin-primary-500 focus:ring-offset-2
    `,
    secondary: `
        bg-white text-admin-text-primary 
        border border-admin-border-default
        hover:bg-admin-bg-hover 
        active:bg-admin-bg-active
        disabled:bg-gray-50 disabled:text-gray-400
        focus:ring-2 focus:ring-admin-primary-500 focus:ring-offset-2
    `,
    danger: `
        bg-admin-danger text-white 
        hover:bg-red-600 
        active:bg-red-700
        disabled:bg-red-300
        focus:ring-2 focus:ring-admin-danger focus:ring-offset-2
    `,
    ghost: `
        bg-transparent text-admin-text-secondary 
        hover:bg-admin-bg-hover hover:text-admin-text-primary
        active:bg-admin-bg-active
        focus:ring-2 focus:ring-admin-primary-500 focus:ring-offset-2
    `,
    outline: `
        bg-transparent text-admin-primary-600 
        border border-admin-primary-500
        hover:bg-admin-primary-50 
        active:bg-admin-primary-100
        focus:ring-2 focus:ring-admin-primary-500 focus:ring-offset-2
    `,
};

const sizes: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ 
        variant = 'primary', 
        size = 'md', 
        loading = false,
        icon,
        children,
        className = '',
        disabled,
        ...props 
    }, ref) => {
        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={`
                    inline-flex items-center justify-center gap-2
                    font-medium rounded-admin-button
                    transition-colors duration-150
                    disabled:cursor-not-allowed
                    focus:outline-none
                    ${variants[variant]}
                    ${sizes[size]}
                    ${className}
                `}
                {...props}
            >
                {loading ? (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Loading...</span>
                    </>
                ) : (
                    <>
                        {icon && <span className="shrink-0">{icon}</span>}
                        {children}
                    </>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';
