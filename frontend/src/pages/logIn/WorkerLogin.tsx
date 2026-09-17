import {
  useState,
  type FormEvent,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeftIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

import { motion } from "framer-motion";

import {
  loginUser,
  ApiError,
} from "@/api/auth/auth";

import {
  type RoleValue,
} from "@/shared/types";

import { saveAuth } from "@/shared/auth";

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

const EMAIL_RE =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function WorkerLogin() {
  const navigate = useNavigate();

  const [form, setForm] =
    useState<FormState>(initialState);

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [showPassword, setShowPassword] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [serverError, setServerError] =
    useState("");

  const handleChange = (
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

    setServerError("");
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!form.email.trim()) {
      nextErrors.email =
        "Email is required.";
    } else if (
      !EMAIL_RE.test(form.email.trim())
    ) {
      nextErrors.email =
        "Enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password =
        "Password is required.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setServerError("");

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const data = await loginUser({
        email: form.email.trim(),
        password: form.password,
        role: "WORKER",
      });

      console.log(
        "LOGIN SUCCESS:",
        data.user
      );

      console.log(
        "SELECTED ROLE:",
        data.selected_role
      );

      saveAuth(
        data.tokens.access,
        data.tokens.refresh,
        data.user,
        data.selected_role as RoleValue
      );

      if (
        data.selected_role === "WORKER"
      ) {
        navigate(
          "/worker/dashboard",
          {
            replace: true,
          }
        );

        return;
      }

      setServerError(
        "Your account role could not be determined."
      );
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      if (error instanceof ApiError) {
        if (
          error.status === 400 ||
          error.status === 401
        ) {
          setServerError(
            "Invalid email, password, or account type."
          );

          return;
        }

        const backendEmailError =
          error.fields?.email;

        const backendPasswordError =
          error.fields?.password;

        const backendErrors: FormErrors = {};

        if (backendEmailError) {
          backendErrors.email =
            Array.isArray(
              backendEmailError
            )
              ? String(
                  backendEmailError[0]
                )
              : String(
                  backendEmailError
                );
        }

        if (backendPasswordError) {
          backendErrors.password =
            Array.isArray(
              backendPasswordError
            )
              ? String(
                  backendPasswordError[0]
                )
              : String(
                  backendPasswordError
                );
        }

        setErrors(backendErrors);

        setServerError(
          error.message ||
            "Unable to log in."
        );

        return;
      }

      setServerError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 px-4 py-12">
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Go back"
        className="fixed left-6 top-6 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all duration-200 hover:text-slate-900 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        <ArrowLeftIcon className="h-6 w-6" />
      </button>

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
          ease: "easeOut",
        }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl border border-emerald-100/50 bg-white p-8 shadow-lg shadow-emerald-900/5 sm:p-10">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1">
              <div className="h-2 w-2 rounded-full bg-emerald-600" />

              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                KaJob
              </p>
            </div>
          </div>

          <div className="mb-8">
            <div className="mb-5 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/20">
                <WrenchScrewdriverIcon className="h-7 w-7 text-white" />
              </div>
            </div>

            <h1 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Welcome back
            </h1>

            <p className="mt-2 text-center text-base text-slate-600">
              Sign in to your{" "}
              <span className="font-semibold text-emerald-700">
                Worker
              </span>{" "}
              account.
            </p>
          </div>

          {serverError && (
            <motion.div
              initial={{
                opacity: 0,
                y: -8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-700"
            >
              <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-200">
                <span className="text-xs font-bold text-red-700">
                  !
                </span>
              </div>

              <span>{serverError}</span>
            </motion.div>
          )}

          <motion.form
            initial={{
              opacity: 0,
              x: 10,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.25,
            }}
            className="space-y-5"
            onSubmit={handleSubmit}
            noValidate
          >
            <div>
              <label
                htmlFor="worker-email"
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
                <EnvelopeIcon
                  className="h-5 w-5 flex-shrink-0 text-slate-400"
                  aria-hidden="true"
                />

                <input
                  id="worker-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(event) =>
                    handleChange(
                      "email",
                      event.target.value
                    )
                  }
                  className="w-full border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  aria-invalid={Boolean(
                    errors.email
                  )}
                />
              </div>

              {errors.email && (
                <motion.p
                  initial={{
                    opacity: 0,
                    y: -4,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mt-2 text-xs font-medium text-red-600"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="worker-password"
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
                <LockClosedIcon
                  className="h-5 w-5 flex-shrink-0 text-slate-400"
                  aria-hidden="true"
                />

                <input
                  id="worker-password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(event) =>
                    handleChange(
                      "password",
                      event.target.value
                    )
                  }
                  className="w-full border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  aria-invalid={Boolean(
                    errors.password
                  )}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
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
                  initial={{
                    opacity: 0,
                    y: -4,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mt-2 text-xs font-medium text-red-600"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.rememberMe}
                onChange={(event) =>
                  handleChange(
                    "rememberMe",
                    event.target.checked
                  )
                }
                className="h-4 w-4 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />

              Remember me
            </label>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-75 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  "Sign in as Worker"
                )}
              </button>
            </div>
          </motion.form>

          <div className="my-8 border-t border-slate-200" />

          <motion.p
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.2,
            }}
            className="text-center text-sm text-slate-600"
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

        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.5,
          }}
          className="mt-8 text-center text-xs text-slate-500"
        >
          Secure login • No spam • One-click sign up
        </motion.p>
      </motion.div>
    </div>
  );
}