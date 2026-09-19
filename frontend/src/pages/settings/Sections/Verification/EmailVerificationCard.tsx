import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  CheckCircleIcon,
  EnvelopeIcon,
  PaperAirplaneIcon,
  PencilIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import type { VerificationStatusResponse } from "@/api/verification";

import {
  resendEmailVerification,
  updateEmailAddress,
} from "@/api/verification";

type EmailVerificationCardProps = {
  verification: VerificationStatusResponse;
  onVerificationUpdated?: () => Promise<void> | void;
};

const EmailVerificationCard = ({
  verification,
  onVerificationUpdated,
}: EmailVerificationCardProps) => {
  const [editingEmail, setEditingEmail] =
    useState(false);

  const [emailInput, setEmailInput] =
    useState(verification.email || "");

  const [savingEmail, setSavingEmail] =
    useState(false);

  const [sendingVerification, setSendingVerification] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isVerified =
    verification.email_verified;

  const email =
    verification.email || "";

  useEffect(() => {
    if (!editingEmail) {
      setEmailInput(
        verification.email || ""
      );
    }
  }, [
    verification.email,
    editingEmail,
  ]);

  const handleStartEditing = () => {
    setEmailInput(
      verification.email || ""
    );

    setEditingEmail(true);
    setError("");
    setSuccess("");
  };

  const handleCancelEditing = () => {
    setEmailInput(
      verification.email || ""
    );

    setEditingEmail(false);
    setError("");
    setSuccess("");
  };

  const handleSaveEmail = async () => {
    const trimmedEmail =
      emailInput.trim().toLowerCase();

    if (!trimmedEmail) {
      setError(
        "Please enter an email address."
      );
      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (
      trimmedEmail ===
      email.trim().toLowerCase()
    ) {
      setEditingEmail(false);
      setError("");
      setSuccess("");
      return;
    }

    setError("");
    setSuccess("");
    setSavingEmail(true);

    try {
      const response =
        await updateEmailAddress(
          trimmedEmail
        );

      setEditingEmail(false);

      setSuccess(
        response.message ||
          "Email address updated successfully. Please verify your new email address."
      );

      await onVerificationUpdated?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update email address."
      );
    } finally {
      setSavingEmail(false);
    }
  };

  const handleSendVerification = async (
    event?: FormEvent
  ) => {
    event?.preventDefault();

    setError("");
    setSuccess("");
    setSendingVerification(true);

    try {
      const response =
        await resendEmailVerification();

      setSuccess(
        response.message ||
          "A verification email has been sent to your email address."
      );

      await onVerificationUpdated?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send verification email."
      );
    } finally {
      setSendingVerification(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
          <EnvelopeIcon className="h-5 w-5 text-slate-600" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Email verification
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Manage your email address and verify it to keep your account secure.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {isVerified && (
                <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
              )}

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  isVerified
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {isVerified
                  ? "Verified"
                  : "Not verified"}
              </span>
            </div>
          </div>

          {editingEmail ? (
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <label
                htmlFor="email-address"
                className="block text-sm font-medium text-slate-700"
              >
                Email address
              </label>

              <p className="mt-1 text-xs text-slate-500">
                Enter the email address you want to use for your KaJob account.
              </p>

              <input
                id="email-address"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={emailInput}
                onChange={(event) => {
                  setEmailInput(
                    event.target.value
                  );
                  setError("");
                  setSuccess("");
                }}
                placeholder="you@example.com"
                disabled={savingEmail}
                className="mt-3 block w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              />

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    void handleSaveEmail()
                  }
                  disabled={
                    savingEmail ||
                    !emailInput.trim()
                  }
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingEmail
                    ? "Saving..."
                    : "Save email address"}
                </button>

                <button
                  type="button"
                  onClick={
                    handleCancelEditing
                  }
                  disabled={savingEmail}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <XMarkIcon className="h-4 w-4" />

                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Email address
                    </p>

                    <p className="mt-1 break-all text-sm font-medium text-slate-900">
                      {email ||
                        "No email address available"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleStartEditing
                    }
                    className="inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <PencilIcon className="h-4 w-4" />

                    Edit
                  </button>
                </div>
              </div>

              {isVerified ? (
                <div className="mt-4 flex items-center gap-2 text-xs text-emerald-700">
                  <CheckCircleIcon className="h-4 w-4" />

                  <span>
                    Your email address is verified and does not require further action.
                  </span>
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-800">
                        Your email address is not verified.
                      </p>

                      <p className="mt-1 text-xs text-amber-700">
                        Send a verification email to confirm that you own this email address.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void handleSendVerification()
                      }
                      disabled={
                        sendingVerification ||
                        !email
                      }
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <PaperAirplaneIcon className="h-4 w-4" />

                      {sendingVerification
                        ? "Sending..."
                        : "Send verification email"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {success && (
            <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationCard;