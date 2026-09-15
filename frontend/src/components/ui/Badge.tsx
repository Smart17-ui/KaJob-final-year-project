// frontend/src/components/ui/Badge.tsx

type BadgeVariant = 
    | 'success' 
    | 'warning' 
    | 'danger' 
    | 'info' 
    | 'neutral'
    | 'primary';

interface BadgeProps {
    variant?: BadgeVariant;
    children: React.ReactNode;
    dot?: boolean;
    className?: string;
}

const variants: Record<BadgeVariant, string> = {
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-gray-50 text-gray-700 border-gray-200',
    primary: 'bg-admin-primary-50 text-admin-primary-700 border-admin-primary-200',
};

const dotColors: Record<BadgeVariant, string> = {
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-gray-500',
    primary: 'bg-admin-primary-500',
};

export const Badge = ({ 
    variant = 'neutral', 
    children, 
    dot = false,
    className = '' 
}: BadgeProps) => {
    return (
        <span
            className={`
                inline-flex items-center gap-1.5
                px-2.5 py-1
                text-xs font-medium
                rounded-full border
                ${variants[variant]}
                ${className}
            `}
        >
            {dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
            )}
            {children}
        </span>
    );
};
