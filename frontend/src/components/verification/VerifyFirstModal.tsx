// frontend/src/components/verification/VerifyFirstModal.tsx

import { useNavigate } from "react-router-dom";
import {
  ExclamationTriangleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

type VerifyFirstModalProps = {
  open: boolean;
  role: "CLIENT" | "WORKER";
  actionLabel?: string;
  onClose: () => void;
};

const VerifyFirstModal = ({
  open,
  role,
  actionLabel = "do this",
  onClose,
}: VerifyFirstModalProps) => {
  const navigate = useNavigate();

  if (!open) return null;

  const verificationPath = `/${role.toLowerCase()}/dashboard/settings/verification`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
          <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
        </div>

        <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-900">
          Verification required
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          You need to verify your identity before you can {actionLabel} on
          KaJob. It only takes a few minutes, and once approved you'll have
          full access.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Not now
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(verificationPath);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <ShieldCheckIcon className="h-4 w-4" />
            Go to verification
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyFirstModal;
