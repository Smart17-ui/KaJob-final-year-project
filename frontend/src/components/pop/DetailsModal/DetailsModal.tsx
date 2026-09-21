import {
  useEffect,
  type MouseEvent,
  type ReactNode,
} from "react";

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

  const handleModalClick = (
    event: MouseEvent<HTMLDivElement>
  ) => {
    event.stopPropagation();
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-slate-900/55
        px-4
        py-6
        backdrop-blur-sm
      "
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className={`
          flex
          max-h-[90vh]
          w-full
          ${widthClasses[width]}
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-slate-200/80
          bg-white
          shadow-[0_24px_70px_-20px_rgba(15,23,42,0.35)]
        `}
        onClick={handleModalClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-modal-title"
      >
        {/* Header */}
        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            border-b
            border-slate-100
            bg-white
            px-5
            py-4
            sm:px-6
          "
        >
          <div className="min-w-0 pr-4">
            <h2
              id="details-modal-title"
              className="
                truncate
                text-lg
                font-bold
                tracking-tight
                text-slate-900
              "
            >
              {title}
            </h2>
          </div>

          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-transparent
                text-slate-400
                transition-all
                duration-200
                hover:border-slate-200
                hover:bg-slate-50
                hover:text-slate-700
                focus:outline-none
                focus:ring-2
                focus:ring-slate-300
                focus:ring-offset-1
              "
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            bg-white
            px-5
            py-5
            sm:px-6
            sm:py-6
          "
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="
              shrink-0
              border-t
              border-slate-100
              bg-slate-50/80
              px-5
              py-4
              sm:px-6
            "
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}