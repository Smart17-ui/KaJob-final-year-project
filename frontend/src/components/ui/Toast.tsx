// frontend/src/components/ui/Toast.tsx

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// ============================================
// TYPES
// ============================================

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextValue {
    toasts: Toast[];
    showToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

// ============================================
// CONTEXT
// ============================================

const ToastContext = createContext<ToastContextValue | null>(null);

// ============================================
// PROVIDER
// ============================================

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback(
        (toast: Omit<Toast, 'id'>) => {
            const id = Math.random().toString(36).substring(2, 9);
            const newToast = { ...toast, id };
            setToasts((prev) => [...prev, newToast]);

            // Auto remove after duration
            const duration = toast.duration ?? 5000;
            if (duration > 0) {
                setTimeout(() => removeToast(id), duration);
            }
        },
        [removeToast]
    );

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

// ============================================
// HOOK
// ============================================

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

// ============================================
// TOAST CONTAINER
// ============================================

interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-md w-full pointer-events-none">
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onRemove={() => onRemove(toast.id)}
                />
            ))}
        </div>
    );
};

// ============================================
// TOAST ITEM
// ============================================

interface ToastItemProps {
    toast: Toast;
    onRemove: () => void;
}

const ToastItem = ({ toast, onRemove }: ToastItemProps) => {
    const { type, title, message } = toast;

    const config = {
        success: {
            icon: CheckCircle,
            bgColor: 'bg-white',
            iconColor: 'text-green-600',
            borderColor: 'border-l-green-500',
        },
        error: {
            icon: XCircle,
            bgColor: 'bg-white',
            iconColor: 'text-red-600',
            borderColor: 'border-l-red-500',
        },
        warning: {
            icon: AlertCircle,
            bgColor: 'bg-white',
            iconColor: 'text-amber-600',
            borderColor: 'border-l-amber-500',
        },
        info: {
            icon: Info,
            bgColor: 'bg-white',
            iconColor: 'text-blue-600',
            borderColor: 'border-l-blue-500',
        },
    };

    const { icon: Icon, iconColor, borderColor } = config[type];

    return (
        <div
            className={`
                pointer-events-auto
                flex items-start gap-3
                p-4
                bg-white
                border border-admin-border-light border-l-4 ${borderColor}
                rounded-admin-card shadow-lg
                animate-in slide-in-from-right duration-300
            `}
            role="alert"
        >
            <Icon size={20} className={`${iconColor} shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-admin-text-primary">
                    {title}
                </p>
                {message && (
                    <p className="mt-1 text-sm text-admin-text-secondary">
                        {message}
                    </p>
                )}
            </div>
            <button
                onClick={onRemove}
                className="shrink-0 p-1 text-admin-text-muted hover:text-admin-text-primary rounded-md hover:bg-admin-bg-hover transition-colors"
                aria-label="Dismiss"
            >
                <X size={16} />
            </button>
        </div>
    );
};
