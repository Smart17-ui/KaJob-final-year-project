import {
  useEffect,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

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

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        onClose();
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
        "bg-emerald-50 ring-8 ring-emerald-50/60",
      iconColor: "text-emerald-600",
      accent: "bg-emerald-500",
      button:
        "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500",
    },

    error: {
      icon: ExclamationCircleIcon,
      iconWrapper:
        "bg-red-50 ring-8 ring-red-50/60",
      iconColor: "text-red-600",
      accent: "bg-red-500",
      button:
        "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    },

    warning: {
      icon: ExclamationTriangleIcon,
      iconWrapper:
        "bg-amber-50 ring-8 ring-amber-50/60",
      iconColor: "text-amber-600",
      accent: "bg-amber-500",
      button:
        "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
    },

    info: {
      icon: InformationCircleIcon,
      iconWrapper:
        "bg-blue-50 ring-8 ring-blue-50/60",
      iconColor: "text-blue-600",
      accent: "bg-blue-500",
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
   * MODAL CONTENT
   * =========================
   */

  const modal = (
    <div
      className="
        fixed
        inset-0
        z-[99999]
        flex
        items-center
        justify-center
        bg-slate-950/45
        px-4
        py-6
        backdrop-blur-[3px]
      "
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
        className="
          relative
          w-full
          max-w-md
          overflow-hidden
          rounded-2xl
          border
          border-slate-200/80
          bg-white
          shadow-[0_24px_70px_rgba(15,23,42,0.22)]
          animate-[fadeIn_150ms_ease-out]
        "
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* Top accent */}

        <div
          className={`h-1 w-full ${currentConfig.accent}`}
        />

        {/* Close button */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="
            absolute
            right-4
            top-5
            rounded-lg
            p-2
            text-slate-400
            transition
            duration-150
            hover:bg-slate-100
            hover:text-slate-600
            focus:outline-none
            focus:ring-2
            focus:ring-slate-300
          "
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        {/* Content */}

        <div className="px-6 pb-6 pt-9 sm:px-8 sm:pb-8">
          {/* Icon */}

          <div
            className={`
              mx-auto
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              ${currentConfig.iconWrapper}
            `}
          >
            <Icon
              className={`
                h-9
                w-9
                ${currentConfig.iconColor}
              `}
            />
          </div>

          {/* Title */}

          <h2
            id="feedback-modal-title"
            className="
              mt-6
              text-center
              text-xl
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            {title}
          </h2>

          {/* Message */}

          <p
            className="
              mx-auto
              mt-3
              max-w-sm
              text-center
              text-sm
              leading-6
              text-slate-500
            "
          >
            {message}
          </p>

          {/* Extra content */}

          {children && (
            <div className="mt-5">
              {children}
            </div>
          )}

          {/* Actions */}

          {(primaryAction ||
            secondaryAction) && (
            <div
              className="
                mt-7
                flex
                flex-col-reverse
                gap-3
                sm:flex-row
                sm:justify-center
              "
            >
              {secondaryAction && (
                <button
                  type="button"
                  onClick={
                    secondaryAction.onClick
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-slate-700
                    shadow-sm
                    transition
                    duration-150
                    hover:border-slate-300
                    hover:bg-slate-50
                    focus:outline-none
                    focus:ring-2
                    focus:ring-slate-300
                    sm:w-auto
                  "
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
                  className={`
                    w-full
                    rounded-xl
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    duration-150
                    focus:outline-none
                    focus:ring-2
                    focus:ring-offset-2
                    sm:w-auto
                    ${currentConfig.button}
                  `}
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
                  className={`
                    w-full
                    rounded-xl
                    px-6
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    duration-150
                    focus:outline-none
                    focus:ring-2
                    focus:ring-offset-2
                    ${currentConfig.button}
                  `}
                >
                  Okay
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );

  /*
   * =========================
   * PORTAL
   * =========================
   *
   * Render directly under <body>
   * so this modal always appears
   * above other application modals.
   */

  return createPortal(
    modal,
    document.body
  );
};

export default FeedbackModal;