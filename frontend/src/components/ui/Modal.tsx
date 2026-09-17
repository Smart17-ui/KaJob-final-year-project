// frontend/src/components/ui/Modal.tsx

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    closeOnBackdrop?: boolean;
}

const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
};

export const Modal = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md',
    closeOnBackdrop = true,
}: ModalProps) => {
    // Handle Escape key + prevent body scroll
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleBackdropClick = () => {
        if (closeOnBackdrop) onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={handleBackdropClick}
            />

            {/* Modal content */}
            <div
                className={`
                    relative w-full ${sizes[size]}
                    bg-white rounded-admin-modal
                    shadow-xl
                    max-h-[90vh] flex flex-col
                    animate-in fade-in zoom-in-95 duration-200
                `}
            >
                {/* Header */}
                {(title || description) && (
                    <div className="flex items-start justify-between p-6 pb-4 shrink-0">
                        <div className="flex-1">
                            {title && (
                                <h2
                                    id="modal-title"
                                    className="text-lg font-semibold text-admin-text-primary"
                                >
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p className="mt-1 text-sm text-admin-text-secondary">
                                    {description}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="ml-4 p-1 text-admin-text-muted hover:text-admin-text-primary rounded-md hover:bg-admin-bg-hover transition-colors"
                            aria-label="Close modal"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="px-6 py-2 overflow-y-auto flex-1">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-admin-border-light shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};
