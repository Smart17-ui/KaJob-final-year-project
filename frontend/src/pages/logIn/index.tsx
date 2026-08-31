import {
  useState,
  type FormEvent,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  BriefcaseIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

import { motion } from "framer-motion";

import { loginUser } from "@/api/auth/auth";

import {
  ApiError,
  ROLE_OPTIONS,
  type RoleValue,
} from "@/shared/types";

import { saveAuth } from "@/shared/auth";

// =========================
// FORM TYPES
// =========================

interface FormState {
  email: string;
  password: string;
  role: RoleValue | "";
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  role?: string;
}

// =========================
// INITIAL FORM STATE
// =========================

const initialState: FormState = {
  email: "",
  password: "",
  role: "",
  rememberMe: true,
};

// =========================
// EMAIL VALIDATION
// =========================

const EMAIL_RE =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// =========================
// LOGIN COMPONENT
// =========================

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] =
    useState<FormState>(initialState);

  const [showPassword, setShowPassword] =
    useState(false);

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [formError, setFormError] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [step, setStep] =
    useState<"role" | "credentials">("role");

  // =========================
  // UPDATE FORM
  // =========================

  function update<K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) {
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

  // =========================
  // SELECT ROLE
  // =========================

  function selectRole(role: RoleValue) {
    update("role", role);
    setStep("credentials");
  }

  // =========================
  // CHANGE ROLE
  // =========================

  function changeRole() {
    setStep("role");
    setFormError(null);
    setErrors({});
  }

  // =========================
  // VALIDATION
  // =========================

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    // Email
    if (!form.email.trim()) {
      nextErrors.email =
        "Email is required.";
    } else if (
      !EMAIL_RE.test(form.email.trim())
    ) {
      nextErrors.email =
        "Enter a valid email address.";
    }

    // Password
    if (!form.password) {
      nextErrors.password =
        "Password is required.";
    }

    // Role
    if (!form.role) {
      nextErrors.role =
        "Choose your account type.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  }

  // =========================
  // SUBMIT
  // =========================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setFormError(null);

    // Validate form
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // =========================
      // LOGIN REQUEST
      // =========================

      const data = await loginUser({
        email: form.email.trim(),
        password: form.password,
        role: form.role as RoleValue,
      });

      console.log(
        "LOGIN SUCCESS:",
        data.user,
      );

      // =========================
      // SAVE AUTHENTICATION
      // =========================

      saveAuth(
        data.tokens.access,
        data.tokens.refresh,
        data.user,
      );

      // =========================
      // REDIRECT TO HOME PAGE
      // =========================

      navigate("/", {
        replace: true,
      });

    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error,
      );

      // =========================
      // API ERROR
      // =========================

      if (error instanceof ApiError) {

        // -------------------------
        // INVALID CREDENTIALS
        // -------------------------

        if (
          error.status === 400 ||
          error.status === 401
        ) {
          setFormError(
            "Invalid email, password, or account type.",
          );

          return;
        }

        // -------------------------
        // BACKEND FIELD ERRORS
        // -------------------------

        const backendErrors: FormErrors = {};

        const emailError =
          error.fields.email;

        const passwordError =
          error.fields.password;

        const roleError =
          error.fields.role;

        if (emailError) {
          backendErrors.email =
            Array.isArray(emailError)
              ? String(emailError[0])
              : String(emailError);
        }

        if (passwordError) {
          backendErrors.password =
            Array.isArray(passwordError)
              ? String(passwordError[0])
              : String(passwordError);
        }

        if (roleError) {
          backendErrors.role =
            Array.isArray(roleError)
              ? String(roleError[0])
              : String(roleError);
        }

        setErrors(backendErrors);

        setFormError(
          error.message ||
            "Unable to log in.",
        );

        return;
      }

      // =========================
      // NETWORK ERROR
      // =========================

      setFormError(
        "Unable to connect to the server. Please try again.",
      );

    } finally {
      setIsSubmitting(false);
    }
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 px-4 py-12">

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

        {/* =========================
            CARD
        ========================= */}

        <div className="rounded-3xl border border-emerald-100/50 bg-white p-8 shadow-lg shadow-emerald-900/5 sm:p-10">

          {/* =========================
              LOGO
          ========================= */}

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1">

              <div className="h-2 w-2 rounded-full bg-emerald-600" />

              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                KaJob
              </p>

            </div>
          </div>

          {/* =========================
              HEADER
          ========================= */}

          <div className="mb-8">

            {step === "role" ? (
              <>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Let's get you in
                </h1>

                <p className="mt-2 text-base text-slate-600">
                  How do you want to use KaJob?
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Welcome back
                </h1>

                <p className="mt-2 text-base text-slate-600">
                  Sign in to your{" "}

                  <span className="font-semibold text-emerald-700">
                    {form.role === "WORKER"
                      ? "Worker"
                      : "Client"}
                  </span>{" "}

                  account.
                </p>
              </>
            )}

          </div>

          {/* =========================
              GENERAL ERROR
          ========================= */}

          {formError && (
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

              <span>
                {formError}
              </span>

            </motion.div>
          )}

          {/* =========================
              ROLE SELECTION
          ========================= */}

          {step === "role" && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                duration: 0.25,
              }}
            >

              <div className="grid grid-cols-2 gap-3">

                {ROLE_OPTIONS.map(
                  (option, index) => (

                    <motion.button
                      key={option.value}
                      type="button"

                      initial={{
                        opacity: 0,
                        y: 8,
                      }}

                      animate={{
                        opacity: 1,
                        y: 0,
                      }}

                      transition={{
                        delay: index * 0.1,
                      }}

                      onClick={() =>
                        selectRole(
                          option.value,
                        )
                      }

                      className="group rounded-2xl border-2 border-slate-200 bg-white p-5 text-left transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-50/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    >

                      {/* ICON */}

                      <div className="inline-flex rounded-lg bg-slate-100 p-2 transition-colors group-hover:bg-emerald-100">

                        {option.value ===
                        "WORKER" ? (

                          <WrenchScrewdriverIcon
                            className="h-5 w-5 text-slate-600 group-hover:text-emerald-700"
                            aria-hidden="true"
                          />

                        ) : (

                          <BriefcaseIcon
                            className="h-5 w-5 text-slate-600 group-hover:text-emerald-700"
                            aria-hidden="true"
                          />

                        )}

                      </div>

                      {/* TITLE */}

                      <p className="mt-3 text-sm font-semibold leading-snug text-slate-900 group-hover:text-emerald-800">
                        {option.label}
                      </p>

                      {/* DESCRIPTION */}

                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        {option.description}
                      </p>

                    </motion.button>
                  ),
                )}

              </div>

              {/* ROLE ERROR */}

              {errors.role && (
                <motion.p
                  initial={{
                    opacity: 0,
                    y: -4,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mt-3 text-xs font-medium text-red-600"
                >
                  {errors.role}
                </motion.p>
              )}

            </motion.div>
          )}

          {/* =========================
              CREDENTIALS
          ========================= */}

          {step === "credentials" && (
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

              {/* =========================
                  SELECTED ROLE
              ========================= */}

              <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">

                <div className="flex items-center gap-3">

                  {form.role === "WORKER" ? (
                    <WrenchScrewdriverIcon className="h-5 w-5 text-emerald-700" />
                  ) : (
                    <BriefcaseIcon className="h-5 w-5 text-emerald-700" />
                  )}

                  <div>

                    <p className="text-xs font-medium text-emerald-700">
                      Signing in as
                    </p>

                    <p className="text-sm font-semibold text-emerald-900">
                      {form.role === "WORKER"
                        ? "Worker"
                        : "Client"}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={changeRole}
                  className="text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-900"
                >
                  Change
                </button>

              </div>

              {/* =========================
                  EMAIL
              ========================= */}

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

                  <EnvelopeIcon
                    className="h-5 w-5 flex-shrink-0 text-slate-400"
                    aria-hidden="true"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(event) =>
                      update(
                        "email",
                        event.target.value,
                      )
                    }
                    className="w-full border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    aria-invalid={Boolean(
                      errors.email,
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

              {/* =========================
                  PASSWORD
              ========================= */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-900"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setFormError(
                        "Password reset is not available yet.",
                      )
                    }
                    className="text-xs font-medium text-emerald-600 transition-colors hover:text-emerald-700"
                  >
                    Forgot?
                  </button>

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
                    id="password"
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
                      update(
                        "password",
                        event.target.value,
                      )
                    }
                    className="w-full border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    aria-invalid={Boolean(
                      errors.password,
                    )}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value,
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

              {/* =========================
                  REMEMBER ME
              ========================= */}

              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">

                <input
                  type="checkbox"
                  checked={form.rememberMe}
                  onChange={(event) =>
                    update(
                      "rememberMe",
                      event.target.checked,
                    )
                  }
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />

                Keep me signed in

              </label>

              {/* =========================
                  LOGIN BUTTON
              ========================= */}

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

            </motion.form>
          )}

          {/* =========================
              DIVIDER
          ========================= */}

          {step === "credentials" && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.3,
              }}
              className="my-8 border-t border-slate-200"
            />
          )}

          {/* =========================
              REGISTER LINK
          ========================= */}

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

        {/* =========================
            TRUST SIGNAL
        ========================= */}

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