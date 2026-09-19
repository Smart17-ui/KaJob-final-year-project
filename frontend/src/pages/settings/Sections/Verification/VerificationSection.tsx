import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

import {
  getVerificationStatus,
  type VerificationStatusResponse,
} from "@/api/verification";

import VerificationStatusCard from "./VerificationStatusCard";
import EmailVerificationCard from "./EmailVerificationCard";
import PhoneVerificationCard from "./PhoneVerificationCard";
import IdentityVerificationCard from "./IdentityVerificationCard";

const VerificationSection = () => {
  const [verification, setVerification] =
    useState<VerificationStatusResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadVerificationStatus =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const data =
          await getVerificationStatus();

        setVerification(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load verification status."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadVerificationStatus();
  }, [loadVerificationStatus]);

  if (loading) {
    return (
      <section className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Verification
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage your account verification status.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />

            <p className="text-sm text-slate-600">
              Loading verification status...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !verification) {
    return (
      <section className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Verification
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage your account verification status.
          </p>
        </div>

        <div className="rounded-xl border border-red-100 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <ExclamationCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">
                Unable to load verification status
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error ||
                  "We could not retrieve your verification information."}
              </p>

              <button
                type="button"
                onClick={() => {
                  void loadVerificationStatus();
                }}
                className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Verification
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Verify your contact information and identity to keep your KaJob account secure.
        </p>
      </div>

      <VerificationStatusCard
        verification={verification}
      />

      <EmailVerificationCard
        verification={verification}
      />

      <PhoneVerificationCard
        verification={verification}
        onVerificationUpdated={
          loadVerificationStatus
        }
      />

      <IdentityVerificationCard
        verification={verification}
        onVerificationUpdated={
          loadVerificationStatus
        }
      />

      {verification.fully_verified && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Your account is fully verified
              </p>

              <p className="mt-1 text-sm text-emerald-700">
                Your email, phone number, and identity have all been verified.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default VerificationSection;