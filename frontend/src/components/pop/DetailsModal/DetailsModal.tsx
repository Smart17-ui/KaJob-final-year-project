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
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-2xl",
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
      if (event.key === "Escape") onClose();
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

  const handleOverlayClick = () => onClose();

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
        items-end
        justify-center
        bg-slate-900/55
        backdrop-blur-sm
        sm:items-center
        sm:px-4
        sm:py-6
      "
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className={`
          flex
          max-h-[92vh]
          w-full
          flex-col
          overflow-hidden
          rounded-t-3xl
          border
          border-slate-200/80
          bg-white
          shadow-[0_24px_70px_-20px_rgba(15,23,42,0.35)]
          sm:rounded-2xl
          sm:max-h-[90vh]
          ${widthClasses[width]}
        `}
        onClick={handleModalClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-modal-title"
      >
        {/* DRAG HANDLE (mobile only) */}

        <div className="flex justify-center pt-2 sm:hidden">
          <div className="h-1.5 w-10 rounded-full bg-slate-200" />
        </div>

        {/* HEADER */}

        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            border-b
            border-slate-100
            bg-white
            px-4
            py-3
            sm:px-6
            sm:py-4
          "
        >
          <div className="min-w-0 pr-4">
            <h2
              id="details-modal-title"
              className="
                truncate
                text-base
                font-bold
                tracking-tight
                text-slate-900
                sm:text-lg
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
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-transparent
                text-slate-400
                transition
                hover:border-slate-200
                hover:bg-slate-50
                hover:text-slate-700
                sm:h-9
                sm:w-9
              "
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* CONTENT */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            bg-white
            px-4
            py-4
            sm:px-6
            sm:py-6
          "
        >
          {children}
        </div>

        {/* FOOTER */}

        {footer && (
          <div
            className="
              shrink-0
              border-t
              border-slate-100
              bg-slate-50/80
              px-4
              py-3
              pb-[calc(env(safe-area-inset-bottom)+12px)]
              sm:px-6
              sm:py-4
              sm:pb-4
            "
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
