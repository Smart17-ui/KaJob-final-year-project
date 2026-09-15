import { useState, type FormEvent } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  ArrowLeftIcon,
  WrenchScrewdriverIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

import { motion } from "framer-motion";

import {
  ApiError,
  registerUser,
} from "@/api/auth/auth";

import type { RegisterPayload } from "@/shared/types";

interface FormState {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  password_confirm: string;
  acceptTerms: boolean;
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  password?: string;
  password_confirm?: string;
  acceptTerms?: string;
}

const initialState: FormState = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  password: "",
  password_confirm: "",
  acceptTerms: false,
};

const EMAIL_RE =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function WorkerRegister() {
  const navigate = useNavigate();

  const [form, setForm] =
    useState<FormState>(initialState);

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [formError, setFormError] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const updateField = (
    field: keyof FormState,
    value: string | boolean
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));

    setFormError("");
  };

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!form.first_name.trim()) {
      newErrors.first_name =
        "First name is required.";
    }

    if (!form.last_name.trim()) {
      newErrors.last_name =
        "Last name is required.";
    }

    if (!form.email.trim()) {
      newErrors.email =
        "Email is required.";
    } else if (!EMAIL_RE.test(form.email.trim())) {
      newErrors.email =
        "Enter a valid email address.";
    }

    if (!form.phone_number.trim()) {
      newErrors.phone_number =
        "Phone number is required.";
    }

    if (!form.password) {
      newErrors.password =
        "Password is required.";
    } else if (form.password.length < 8) {
      newErrors.password =
        "Password must be at least 8 characters.";
    }

    if (!form.password_confirm) {
      newErrors.password_confirm =
        "Please confirm your password.";
    } else if (
      form.password !== form.password_confirm
    ) {
      newErrors.password_confirm =
        "Passwords do not match.";
    }

    if (!form.acceptTerms) {
      newErrors.acceptTerms =
        "You must accept the terms and conditions.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setFormError("");

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: RegisterPayload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim(),
        password: form.password,
        password_confirm: form.password_confirm,
        role: "WORKER",
      };

      await registerUser(payload);

      navigate("/login", {
        replace: true,
        state: {
          registrationSuccess:
            "Your account has been created successfully. Please log in.",
        },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        const backendErrors: FormErrors = {};
        const fields = error.fields ?? {};

        const firstNameError =
          fields.first_name;

        const lastNameError =
          fields.last_name;

        const emailError =
          fields.email;

        const phoneError =
          fields.phone_number;

        const passwordError =
          fields.password;

        const confirmPasswordError =
          fields.password_confirm;

        if (firstNameError) {
          backendErrors.first_name =
            Array.isArray(firstNameError)
              ? String(firstNameError[0])
              : String(firstNameError);
        }

        if (lastNameError) {
          backendErrors.last_name =
            Array.isArray(lastNameError)
              ? String(lastNameError[0])
              : String(lastNameError);
        }

        if (emailError) {
          backendErrors.email =
            Array.isArray(emailError)
              ? String(emailError[0])
              : String(emailError);
        }

        if (phoneError) {
          backendErrors.phone_number =
            Array.isArray(phoneError)
              ? String(phoneError[0])
              : String(phoneError);
        }

        if (passwordError) {
          backendErrors.password =
            Array.isArray(passwordError)
              ? String(passwordError[0])
              : String(passwordError);
        }

        if (confirmPasswordError) {
          backendErrors.password_confirm =
            Array.isArray(confirmPasswordError)
              ? String(confirmPasswordError[0])
              : String(confirmPasswordError);
        }

        setErrors(backendErrors);

        setFormError(
          error.message ||
            "Unable to create your account."
        );

        return;
      }

      setFormError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 px-4 py-8">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate("/register")}
        className="absolute left-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 sm:left-8 sm:top-8"
        aria-label="Go back"
      >
        <ArrowLeftIcon className="h-5 w-5" />
      </button>

      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <WrenchScrewdriverIcon className="h-7 w-7" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Create your Worker account
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Create an account to find jobs and showcase your skills.
            </p>
          </div>

          {formError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  First name
                </label>

                <input
                  type="text"
                  value={form.first_name}
                  onChange={(event) =>
                    updateField(
                      "first_name",
                      event.target.value
                    )
                  }
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${
                    errors.first_name
                      ? "border-red-400"
                      : "border-slate-200"
                  }`}
                  placeholder="First name"
                  autoComplete="given-name"
                />

                {errors.first_name && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.first_name}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Last name
                </label>

                <input
                  type="text"
                  value={form.last_name}
                  onChange={(event) =>
                    updateField(
                      "last_name",
                      event.target.value
                    )
                  }
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${
                    errors.last_name
                      ? "border-red-400"
                      : "border-slate-200"
                  }`}
                  placeholder="Last name"
                  autoComplete="family-name"
                />

                {errors.last_name && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.last_name}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email address
              </label>

              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value
                  )
                }
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${
                  errors.email
                    ? "border-red-400"
                    : "border-slate-200"
                }`}
                placeholder="you@example.com"
                autoComplete="email"
              />

              {errors.email && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Phone number
              </label>

              <input
                type="tel"
                value={form.phone_number}
                onChange={(event) =>
                  updateField(
                    "phone_number",
                    event.target.value
                  )
                }
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${
                  errors.phone_number
                    ? "border-red-400"
                    : "border-slate-200"
                }`}
                placeholder="0971234567"
                autoComplete="tel"
              />

              {errors.phone_number && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.phone_number}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>

              <div className="relative">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={form.password}
                  onChange={(event) =>
                    updateField(
                      "password",
                      event.target.value
                    )
                  }
                  className={`w-full rounded-xl border px-4 py-3 pr-12 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${
                    errors.password
                      ? "border-red-400"
                      : "border-slate-200"
                  }`}
                  placeholder="Create a password"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Confirm password
              </label>

              <div className="relative">
                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={form.password_confirm}
                  onChange={(event) =>
                    updateField(
                      "password_confirm",
                      event.target.value
                    )
                  }
                  className={`w-full rounded-xl border px-4 py-3 pr-12 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${
                    errors.password_confirm
                      ? "border-red-400"
                      : "border-slate-200"
                  }`}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) => !previous
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              {errors.password_confirm && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.password_confirm}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-start gap-3 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.acceptTerms}
                  onChange={(event) =>
                    updateField(
                      "acceptTerms",
                      event.target.checked
                    )
                  }
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />

                <span>
                  I agree to the KaJob terms and conditions.
                </span>
              </label>

              {errors.acceptTerms && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.acceptTerms}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Creating account..."
                : "Create Worker account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Log in
            </Link>
          </p>
        </motion.div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Your job. Your skills. Your community.
        </p>
      </div>
    </div>
  );
}