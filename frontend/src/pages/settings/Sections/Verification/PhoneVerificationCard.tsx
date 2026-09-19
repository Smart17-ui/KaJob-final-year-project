import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  CheckCircleIcon,
  DevicePhoneMobileIcon,
  PaperAirplaneIcon,
  PencilIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import type { VerificationStatusResponse } from "@/api/verification";

import {
  sendPhoneOTP,
  updatePhoneNumber,
  verifyPhoneOTP,
} from "@/api/verification";

type PhoneVerificationCardProps = {
  verification: VerificationStatusResponse;
  onVerificationUpdated?: () => Promise<void> | void;
};

const PhoneVerificationCard = ({
  verification,
  onVerificationUpdated,
}: PhoneVerificationCardProps) => {
  const [editingPhone, setEditingPhone] =
    useState(false);

  const [phoneInput, setPhoneInput] =
    useState(verification.phone_number || "");

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [savingPhone, setSavingPhone] =
    useState(false);

  const [sendingOtp, setSendingOtp] =
    useState(false);

  const [verifyingOtp, setVerifyingOtp] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isVerified =
    verification.phone_verified;

  const phoneNumber =
    verification.phone_number;

  useEffect(() => {
    if (!editingPhone) {
      setPhoneInput(
        verification.phone_number || ""
      );
    }
  }, [
    verification.phone_number,
    editingPhone,
  ]);

  const handleStartEditing = () => {
    setPhoneInput(
      verification.phone_number || ""
    );

    setEditingPhone(true);
    setError("");
    setSuccess("");
    setOtp("");
    setOtpSent(false);
  };

  const handleCancelEditing = () => {
    setPhoneInput(
      verification.phone_number || ""
    );

    setEditingPhone(false);
    setError("");
    setSuccess("");
  };

  const handleSavePhone = async () => {
    const trimmedPhone =
      phoneInput.trim();

    if (!trimmedPhone) {
      setError(
        "Please enter a phone number."
      );
      return;
    }

    setError("");
    setSuccess("");
    setSavingPhone(true);

    try {
      const response =
        await updatePhoneNumber(
          trimmedPhone
        );

      setEditingPhone(false);
      setOtp("");
      setOtpSent(false);

      setSuccess(
        response.message ||
          "Phone number updated successfully. Please verify your new number."
      );

      await onVerificationUpdated?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update phone number."
      );
    } finally {
      setSavingPhone(false);
    }
  };

  const handleSendOTP = async () => {
    setError("");
    setSuccess("");
    setSendingOtp(true);

    try {
      const response =
        await sendPhoneOTP();

      setOtpSent(true);

      setSuccess(
        response.message ||
          "A verification code has been sent to your phone."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send verification code."
      );
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedOtp =
      otp.trim();

    if (!trimmedOtp) {
      setError(
        "Please enter the verification code."
      );
      return;
    }

    if (!/^\d{6}$/.test(trimmedOtp)) {
      setError(
        "Please enter the 6-digit verification code."
      );
      return;
    }

    setError("");
    setSuccess("");
    setVerifyingOtp(true);

    try {
      const response =
        await verifyPhoneOTP(
          trimmedOtp
        );

      setSuccess(
        response.message ||
          "Your phone number has been verified."
      );

      setOtp("");
      setOtpSent(false);

      await onVerificationUpdated?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to verify the code."
      );
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
          <DevicePhoneMobileIcon className="h-5 w-5 text-slate-600" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Phone verification
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Manage your phone number and verify it using a one-time verification code.
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

          {editingPhone ? (
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <label
                htmlFor="phone-number"
                className="block text-sm font-medium text-slate-700"
              >
                Phone number
              </label>

              <p className="mt-1 text-xs text-slate-500">
                Enter the phone number you want to use for verification.
              </p>

              <input
                id="phone-number"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phoneInput}
                onChange={(event) => {
                  setPhoneInput(
                    event.target.value
                  );
                  setError("");
                  setSuccess("");
                }}
                placeholder="0977123456"
                disabled={savingPhone}
                className="mt-3 block w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              />

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    void handleSavePhone()
                  }
                  disabled={
                    savingPhone ||
                    !phoneInput.trim()
                  }
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingPhone
                    ? "Saving..."
                    : "Save phone number"}
                </button>

                <button
                  type="button"
                  onClick={
                    handleCancelEditing
                  }
                  disabled={savingPhone}
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
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Phone number
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {phoneNumber ||
                        "No phone number available"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleStartEditing
                    }
                    className="inline-flex w-fit items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <PencilIcon className="h-4 w-4" />

                    {phoneNumber
                      ? "Edit"
                      : "Add phone"}
                  </button>
                </div>
              </div>

              {isVerified ? (
                <div className="mt-4 flex items-center gap-2 text-xs text-emerald-700">
                  <CheckCircleIcon className="h-4 w-4" />

                  <span>
                    Your phone number is verified and does not require further action.
                  </span>
                </div>
              ) : !phoneNumber ? (
                <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
                  <p className="text-sm font-medium text-amber-800">
                    Add a phone number to continue.
                  </p>

                  <p className="mt-1 text-xs text-amber-700">
                    After adding your number, you can request a verification code.
                  </p>
                </div>
              ) : (
                <div className="mt-4">
                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={() =>
                        void handleSendOTP()
                      }
                      disabled={sendingOtp}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <PaperAirplaneIcon className="h-4 w-4" />

                      {sendingOtp
                        ? "Sending code..."
                        : "Send verification code"}
                    </button>
                  ) : (
                    <form
                      onSubmit={
                        handleVerifyOTP
                      }
                      className="space-y-4"
                    >
                      <div>
                        <label
                          htmlFor="phone-verification-otp"
                          className="block text-sm font-medium text-slate-700"
                        >
                          Verification code
                        </label>

                        <p className="mt-1 text-xs text-slate-500">
                          Enter the 6-digit code sent to your phone.
                        </p>

                        <input
                          id="phone-verification-otp"
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          value={otp}
                          onChange={(event) => {
                            const value =
                              event.target.value.replace(
                                /\D/g,
                                ""
                              );

                            setOtp(value);
                            setError("");
                          }}
                          placeholder="123456"
                          className="mt-2 block w-full max-w-xs rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm tracking-[0.25em] text-slate-900 outline-none transition placeholder:tracking-normal placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="submit"
                          disabled={
                            verifyingOtp ||
                            otp.length !== 6
                          }
                          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {verifyingOtp
                            ? "Verifying..."
                            : "Verify phone"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void handleSendOTP()
                          }
                          disabled={
                            sendingOtp
                          }
                          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {sendingOtp
                            ? "Sending..."
                            : "Resend code"}
                        </button>
                      </div>
                    </form>
                  )}
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

export default PhoneVerificationCard;