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
} from "@heroicons/react/24/outline";

import { motion } from "framer-motion";

import ActionButton from "@/shared/ActionButton";

import {
  loginUser,
  ApiError,
} from "@/api/auth/auth";

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

  /* =========================
     UPDATE FORM
  ========================= */

  function update<K extends keyof FormState>(
    key: K,
    value: FormState[K]
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

  /* =========================
     VALIDATION
  ========================= */

  function validate(): boolean {
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
  }

  /* =========================
     SUBMIT
  ========================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setFormError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await loginUser({
        email: form.email.trim(),
        password: form.password,
      });

      /* Save authentication */
      saveAuth(
        data.tokens.access,
        data.tokens.refresh,
        data.user
      );

      console.log(
        "LOGIN SUCCESS:",
        data.user
      );

      /* Go to homepage */
      navigate("/", {
        replace: true,
        state: {
          welcomeName:
            data.user.first_name,
        },
      });
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      /* Invalid credentials */
      if (
        error instanceof ApiError &&
        (error.status === 400 ||
          error.status === 401)
      ) {
        setFormError(
          "Invalid email or password."
        );

        return;
      }

      /* Backend field errors */
      if (error instanceof ApiError) {
        const backendErrors: FormErrors =
          {};

        const emailError =
          error.fields.email;

        const passwordError =
          error.fields.password;

        if (Array.isArray(emailError)) {
          backendErrors.email =
            String(emailError[0]);
        }

        if (
          Array.isArray(passwordError)
        ) {
          backendErrors.password =
            String(passwordError[0]);
        }

        setErrors(backendErrors);

        setFormError(
          error.message ||
            "Unable to log in."
        );

        return;
      }

      /* Network error */
      setFormError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-12">
      <motion.div
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.35,
          ease: "easeOut",
        }}
        className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm sm:p-10"
      >
        {/* HEADER */}

        <h1 className="font-serif text-2xl font-semibold text-stone-900">
          Log in to KaJob
        </h1>

        <p className="mt-1.5 text-sm text-stone-500">
          Welcome back. Enter your details
          to continue.
        </p>

        {/* GENERAL ERROR */}

        {formError && (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700"
          >
            {formError}
          </div>
        )}

        {/* FORM */}

        <form
          className="mt-6 space-y-5"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* EMAIL */}

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-stone-700"
            >
              Email
            </label>

            <div
              className={`flex items-center gap-2 rounded-xl border bg-white px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-emerald-700/30 ${
                errors.email
                  ? "border-red-400"
                  : "border-stone-300 focus-within:border-emerald-700"
              }`}
            >
              <EnvelopeIcon
                className="h-5 w-5 flex-shrink-0 text-stone-400"
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
                    event.target.value
                  )
                }
                className="w-full border-none bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
                aria-invalid={Boolean(
                  errors.email
                )}
              />
            </div>

            {errors.email && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          {/* PASSWORD */}

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-stone-700"
              >
                Password
              </label>

              <button
                type="button"
                onClick={() =>
                  setFormError(
                    "Password reset is not available yet."
                  )
                }
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Forgot password?
              </button>
            </div>

            <div
              className={`flex items-center gap-2 rounded-xl border bg-white px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-emerald-700/30 ${
                errors.password
                  ? "border-red-400"
                  : "border-stone-300 focus-within:border-emerald-700"
              }`}
            >
              <LockClosedIcon
                className="h-5 w-5 flex-shrink-0 text-stone-400"
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
                    event.target.value
                  )
                }
                className="w-full border-none bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
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
                className="flex-shrink-0 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.password}
              </p>
            )}
          </div>

          {/* REMEMBER ME */}

          <label className="flex items-center gap-2 text-sm text-stone-600">
            <input
              type="checkbox"
              checked={form.rememberMe}
              onChange={(event) =>
                update(
                  "rememberMe",
                  event.target.checked
                )
              }
              className="h-4 w-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-700"
            />

            Remember me
          </label>

          {/* LOGIN BUTTON */}

          <div className="flex justify-center">
            <ActionButton
              type="submit"
              loading={isSubmitting}
            >
              {isSubmitting
                ? "Logging in..."
                : "Log In"}
            </ActionButton>
          </div>
        </form>

        {/* REGISTER */}

        <p className="mt-6 text-center text-sm text-stone-500">
          Don't have an account?{" "}

          <Link
            to="/register"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}