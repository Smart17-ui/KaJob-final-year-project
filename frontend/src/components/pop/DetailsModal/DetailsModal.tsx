import { useEffect, type ReactNode } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface DetailsModalProps {
  title: string;
  children: ReactNode;

  onClose: () => void;

  width?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;

  footer?: ReactNode;
}

const widthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export default function DetailsModal({
  title,
  children,
  onClose,
  width = "lg",
  showCloseButton = true,
  footer,
}: DetailsModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleOverlayClick = () => {
    onClose();
  };

  const handleModalClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className={`flex max-h-[90vh] w-full ${widthClasses[width]} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl`}
        onClick={handleModalClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-modal-title"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2
            id="details-modal-title"
            className="text-lg font-semibold text-gray-900"
          >
            {title}
          </h2>

          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="shrink-0 border-t border-gray-100 bg-gray-50 px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}