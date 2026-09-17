import {
  useEffect,
  type ReactNode,
} from "react";

import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type FeedbackType =
  | "success"
  | "error"
  | "warning"
  | "info";

interface FeedbackModalProps {
  isOpen: boolean;
  type?: FeedbackType;
  title: string;
  message: string;
  onClose: () => void;

  primaryAction?: {
    label: string;
    onClick: () => void;
  };

  secondaryAction?: {
    label: string;
    onClick: () => void;
  };

  children?: ReactNode;
}

const FeedbackModal = ({
  isOpen,
  type = "info",
  title,
  message,
  onClose,
  primaryAction,
  secondaryAction,
  children,
}: FeedbackModalProps) => {
  /*
   * =========================
   * ESCAPE KEY
   * =========================
   */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        onClose();
      }
    }

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
  }, [isOpen, onClose]);

  /*
   * =========================
   * BODY SCROLL
   * =========================
   */

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

  /*
   * =========================
   * CLOSED
   * =========================
   */

  if (!isOpen) {
    return null;
  }

  /*
   * =========================
   * TYPE CONFIGURATION
   * =========================
   */

  const config = {
    success: {
      icon: CheckCircleIcon,
      iconWrapper:
        "bg-green-50",
      iconColor:
        "text-green-600",
      button:
        "bg-green-600 hover:bg-green-700 focus:ring-green-500",
    },

    error: {
      icon: ExclamationCircleIcon,
      iconWrapper:
        "bg-red-50",
      iconColor:
        "text-red-600",
      button:
        "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    },

    warning: {
      icon: ExclamationTriangleIcon,
      iconWrapper:
        "bg-amber-50",
      iconColor:
        "text-amber-600",
      button:
        "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
    },

    info: {
      icon: InformationCircleIcon,
      iconWrapper:
        "bg-blue-50",
      iconColor:
        "text-blue-600",
      button:
        "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    },
  };

  const currentConfig =
    config[type];

  const Icon =
    currentConfig.icon;

  /*
   * =========================
   * RENDER
   * =========================
   */

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* Close button */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        {/* Content */}

        <div className="px-6 pb-6 pt-8 text-center sm:px-8 sm:pb-8">
          {/* Icon */}

          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${currentConfig.iconWrapper}`}
          >
            <Icon
              className={`h-9 w-9 ${currentConfig.iconColor}`}
            />
          </div>

          {/* Title */}

          <h2
            id="feedback-modal-title"
            className="mt-5 text-xl font-bold text-slate-900"
          >
            {title}
          </h2>

          {/* Message */}

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
            {message}
          </p>

          {/* Extra content */}

          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}

          {/* Actions */}

          {(primaryAction ||
            secondaryAction) && (
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              {secondaryAction && (
                <button
                  type="button"
                  onClick={
                    secondaryAction.onClick
                  }
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
                >
                  {
                    secondaryAction.label
                  }
                </button>
              )}

              {primaryAction && (
                <button
                  type="button"
                  onClick={
                    primaryAction.onClick
                  }
                  className={`rounded-xl px-5 py-3 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 ${currentConfig.button}`}
                >
                  {
                    primaryAction.label
                  }
                </button>
              )}
            </div>
          )}

          {/* Default close button */}

          {!primaryAction &&
            !secondaryAction && (
              <div className="mt-7">
                <button
                  type="button"
                  onClick={onClose}
                  className={`rounded-xl px-6 py-3 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 ${currentConfig.button}`}
                >
                  Okay
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;