import { useEffect } from "react";

import {
  ExclamationTriangleIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type ConfirmationModalProps = {
  isOpen: boolean;
  title: string;
  message: string;

  confirmLabel?: string;
  cancelLabel?: string;

  onConfirm: () => void;
  onCancel: () => void;

  isLoading?: boolean;

  variant?: "danger" | "warning";
};

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
  variant = "warning",
}: ConfirmationModalProps) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoading) {
        onCancel();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isOpen, isLoading, onCancel]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const isDanger = variant === "danger";

  const iconWrapperClass = isDanger
    ? "bg-red-50"
    : "bg-amber-50";

  const iconClass = isDanger
    ? "text-red-600"
    : "text-amber-600";

  const confirmButtonClass = isDanger
    ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
    : "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500";

  const Icon = isDanger
    ? TrashIcon
    : ExclamationTriangleIcon;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          if (!isLoading) {
            onCancel();
          }
        }
      }}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* CLOSE BUTTON */}

        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        {/* CONTENT */}

        <div className="px-6 pb-6 pt-8 sm:px-8 sm:pb-8">
          {/* ICON */}

          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full ${iconWrapperClass}`}
          >
            <Icon
              className={`h-7 w-7 ${iconClass}`}
            />
          </div>

          {/* TITLE */}

          <h2
            id="confirmation-modal-title"
            className="mt-5 text-xl font-bold text-slate-900"
          >
            {title}
          </h2>

          {/* MESSAGE */}

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {message}
          </p>

          {/* ACTIONS */}

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancelLabel}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${confirmButtonClass}`}
            >
              {isLoading && (
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />

                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              )}

              {isLoading
                ? "Please wait..."
                : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;