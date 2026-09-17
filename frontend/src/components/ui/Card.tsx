// frontend/src/components/ui/Card.tsx

import { ReactNode } from 'react';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
    children: ReactNode;
    className?: string;
    padding?: CardPadding;
    hover?: boolean;
}

const paddings: Record<CardPadding, string> = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

export const Card = ({
    children,
    className = '',
    padding = 'md',
    hover = false,
}: CardProps) => {
    return (
        <div
            className={`
                bg-admin-bg-card
                border border-admin-border-light
                rounded-admin-card
                shadow-admin-card
                ${hover ? 'hover:shadow-admin-card-hover transition-shadow duration-200' : ''}
                ${paddings[padding]}
                ${className}
            `}
        >
            {children}
        </div>
    );
};

export default Card;
