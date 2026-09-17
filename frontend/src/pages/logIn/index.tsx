// frontend/src/pages/logIn/index.tsx

import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/api/auth/auth";

/* =========================
   FORM TYPES
========================= */

interface FormState {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const initialState: FormState = {
  email: "",
  password: "",
  rememberMe: true,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* =========================
   LOGIN COMPONENT
========================= */

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState<FormState>(initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* =========================
     UPDATE FORM
  ========================= */

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setErrors((current) => ({
      ...current,
      [key]: undefined,
    }));

    setFormError(null);
  }

  /* =========================
     VALIDATION
  ========================= */

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!EMAIL_RE.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  /* =========================
     SUBMIT LOGIN
  ========================= */

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    setFormError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // 🆕 Login with only email + password
      const { redirectTo } = await login(
        form.email.trim(),
        form.password
      );

      // 🆕 Auto-redirect to the correct dashboard
      navigate(redirectTo || "/dashboard", { replace: true });
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      if (error instanceof ApiError) {
        if (error.status === 400 || error.status === 401) {
          setFormError("Invalid email or password.");
          return;
        }

        const backendErrors: FormErrors = {};

        if (error.fields?.email) {
          backendErrors.email = Array.isArray(error.fields.email)
            ? String(error.fields.email[0])
            : String(error.fields.email);
        }

        if (error.fields?.password) {
          backendErrors.password = Array.isArray(error.fields.password)
            ? String(error.fields.password[0])
            : String(error.fields.password);
        }

        setErrors(backendErrors);
        setFormError(error.message || "Unable to log in.");
        return;
      }

      setFormError("Unable to connect to the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  /* =========================
     UI
  ========================= */

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 px-4 py-12">
      {/* BACK BUTTON */}
      <button
        type="button"
        onClick={() => navigate("/")}
        aria-label="Back to home"
        className="fixed left-6 top-6 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all duration-200 hover:text-slate-900 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        <ArrowLeftIcon className="h-6 w-6" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl border border-emerald-100/50 bg-white p-8 shadow-lg shadow-emerald-900/5 sm:p-10">
          {/* LOGO */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1">
              <div className="h-2 w-2 rounded-full bg-emerald-600" />
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                KaJob
              </p>
            </div>
          </div>

          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Welcome back
            </h1>
            <p className="mt-2 text-base text-slate-600">
              Sign in to your KaJob account.
            </p>
          </div>

          {/* ERROR */}
          {formError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-700"
            >
              <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-200">
                <span className="text-xs font-bold text-red-700">!</span>
              </div>
              <span>{formError}</span>
            </motion.div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-900"
              >
                Email address
              </label>
              <div
                className={`flex items-center gap-3 rounded-xl border-2 bg-white px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-emerald-500/20 ${
                  errors.email
                    ? "border-red-300 focus-within:border-red-400"
                    : "border-slate-200 focus-within:border-emerald-500"
                }`}
              >
                <EnvelopeIcon className="h-5 w-5 flex-shrink-0 text-slate-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  aria-invalid={Boolean(errors.email)}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-xs font-medium text-red-600"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-900"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-emerald-600 transition-colors hover:text-emerald-700"
                >
                  Forgot?
                </Link>
              </div>
              <div
                className={`flex items-center gap-3 rounded-xl border-2 bg-white px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-emerald-500/20 ${
                  errors.password
                    ? "border-red-300 focus-within:border-red-400"
                    : "border-slate-200 focus-within:border-emerald-500"
                }`}
              >
                <LockClosedIcon className="h-5 w-5 flex-shrink-0 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className="w-full border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  aria-invalid={Boolean(errors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="flex-shrink-0 text-slate-400 transition-colors hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-xs font-medium text-red-600"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* REMEMBER ME */}
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.rememberMe}
                onChange={(e) => update("rememberMe", e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Keep me signed in
            </label>

            {/* SUBMIT */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-75 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>

          {/* REGISTER LINK */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-center text-sm text-slate-600"
          >
            New to KaJob?{" "}
            <Link
              to="/register"
              className="font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
            >
              Create account
            </Link>
          </motion.p>
        </div>

        {/* TRUST */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-xs text-slate-500"
        >
          Secure login • No spam • One-click sign up
        </motion.p>
      </motion.div>
    </div>
  );
}
