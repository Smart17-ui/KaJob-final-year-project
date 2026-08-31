import {
  useState,
  type FormEvent,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  BriefcaseIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

import { motion } from "framer-motion";

import {
  ApiError,
  ROLE_OPTIONS,
  type RoleValue,
  type RegisterPayload,
} from "@/shared/types";

import { registerUser } from "@/api/auth/auth";

/* =========================
   FORM TYPES
========================= */

interface FormState {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  password_confirm: string;
  role: RoleValue | "";
  acceptTerms: boolean;
}

/* =========================
   INITIAL STATE
========================= */

const initialState: FormState = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  password: "",
  password_confirm: "",
  role: "",
  acceptTerms: false,
};

/* =========================
   EMAIL VALIDATION
========================= */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* =========================
   REGISTER COMPONENT
========================= */

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] =
    useState<FormState>(initialState);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const [formError, setFormError] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [step, setStep] =
    useState<"role" | "details">("role");

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

    setErrors((current) => {
      const updated = { ...current };

      delete updated[key];

      return updated;
    });

    setFormError(null);
  }

  /* =========================
     SELECT ROLE
  ========================= */

  function selectRole(role: RoleValue) {
    update("role", role);
    setStep("details");
  }

  /* =========================
     CHANGE ROLE
  ========================= */

  function changeRole() {
    setStep("role");
    setFormError(null);
    setErrors({});
  }

  /* =========================
     VALIDATION
  ========================= */

  function validate(): boolean {
    const next: Record<string, string> = {};

    /* First name */

    if (!form.first_name.trim()) {
      next.first_name =
        "First name is required.";
    }

    /* Last name */

    if (!form.last_name.trim()) {
      next.last_name =
        "Last name is required.";
    }

    /* Email */

    if (!form.email.trim()) {
      next.email =
        "Email is required.";
    } else if (
      !EMAIL_RE.test(form.email.trim())
    ) {
      next.email =
        "Enter a valid email address.";
    }

    /* Phone */

    if (!form.phone_number.trim()) {
      next.phone_number =
        "Phone number is required.";
    }

    /* Password */

    if (!form.password) {
      next.password =
        "Password is required.";
    } else if (
      form.password.length < 8
    ) {
      next.password =
        "Password must contain at least 8 characters.";
    }

    /* Confirm password */

    if (!form.password_confirm) {
      next.password_confirm =
        "Please confirm your password.";
    } else if (
      form.password_confirm !==
      form.password
    ) {
      next.password_confirm =
        "Passwords do not match.";
    }

    /* Role */

    if (!form.role) {
      next.role =
        "Choose whether you want to work or hire.";
    }

    /* Terms */

    if (!form.acceptTerms) {
      next.acceptTerms =
        "You must accept the terms to continue.";
    }

    setErrors(next);

    return (
      Object.keys(next).length === 0
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

    const valid = validate();

    if (!valid) {
      return;
    }

    setIsSubmitting(true);

    try {
      /* =========================
         REGISTRATION PAYLOAD
      ========================= */

      const payload: RegisterPayload = {
        first_name:
          form.first_name.trim(),

        last_name:
          form.last_name.trim(),

        email:
          form.email.trim(),

        phone_number:
          form.phone_number.trim(),

        password:
          form.password,

        /*
         * IMPORTANT:
         * Your Django serializer expects
         * password_confirm.
         */
        password_confirm:
          form.password_confirm,

        role:
          form.role as RoleValue,
      };

      console.log(
        "SENDING REGISTRATION:",
        payload
      );

      const data =
        await registerUser(payload);

      console.log(
        "REGISTRATION SUCCESSFUL:",
        data
      );

      /* =========================
         GO TO LOGIN
      ========================= */

      navigate("/login", {
        replace: true,
        state: {
          registrationSuccess:
            "Your account has been created successfully. Please log in.",
        },
      });
    } catch (error) {
      console.error(
        "REGISTRATION ERROR:",
        error
      );

      /* =========================
         API ERROR
      ========================= */

      if (error instanceof ApiError) {
        const fieldErrors: Record<
          string,
          string
        > = {};

        for (const [
          key,
          value,
        ] of Object.entries(
          error.fields
        )) {
          if (
            key === "error" ||
            key === "detail"
          ) {
            continue;
          }

          if (value === undefined) {
            continue;
          }

          fieldErrors[key] =
            Array.isArray(value)
              ? String(value[0])
              : String(value);
        }

        setErrors((previous) => ({
          ...previous,
          ...fieldErrors,
        }));

        setFormError(error.message);

        return;
      }

      /* =========================
         NETWORK ERROR
      ========================= */

      setFormError(
        "Unable to connect to the server. Make sure Django is running."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /* =========================
     UI
  ========================= */

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
        className="w-full max-w-lg"
      >

        {/* CARD */}

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
              Create your account
            </h1>

            {step === "role" && (
              <p className="mt-2 text-base text-slate-600">
                How do you want to use KaJob?
              </p>
            )}

          </div>

          {/* GENERAL ERROR */}

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

          {/* ROLE SELECTION */}

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
                        delay:
                          index * 0.1,
                      }}
                      onClick={() =>
                        selectRole(
                          option.value
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
                  )
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

          {/* REGISTRATION FORM */}

          {step === "details" && (
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

              {/* SELECTED ROLE */}

              <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">

                <div className="flex items-center gap-2">

                  {form.role ===
                  "WORKER" ? (
                    <WrenchScrewdriverIcon className="h-5 w-5 text-emerald-700" />
                  ) : (
                    <BriefcaseIcon className="h-5 w-5 text-emerald-700" />
                  )}

                  <div>

                    <p className="text-xs font-medium text-emerald-600">
                      Signing up as
                    </p>

                    <p className="text-sm font-semibold text-emerald-800">
                      {form.role ===
                      "WORKER"
                        ? "Worker"
                        : "Client"}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={changeRole}
                  className="text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
                >
                  Change
                </button>

              </div>

              {/* FIRST + LAST NAME */}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                {/* FIRST NAME */}

                <div>

                  <label
                    htmlFor="first_name"
                    className="mb-2 block text-sm font-semibold text-slate-900"
                  >
                    First name
                  </label>

                  <div
                    className={`flex items-center gap-3 rounded-xl border-2 bg-white px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-emerald-500/20 ${
                      errors.first_name
                        ? "border-red-300 focus-within:border-red-400"
                        : "border-slate-200 focus-within:border-emerald-500"
                    }`}
                  >

                    <UserIcon className="h-5 w-5 flex-shrink-0 text-slate-400" />

                    <input
                      id="first_name"
                      name="first_name"
                      autoComplete="given-name"
                      placeholder="First name"
                      value={form.first_name}
                      onChange={(event) =>
                        update(
                          "first_name",
                          event.target.value
                        )
                      }
                      className="w-full border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    />

                  </div>

                  {errors.first_name && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      {errors.first_name}
                    </p>
                  )}

                </div>

                {/* LAST NAME */}

                <div>

                  <label
                    htmlFor="last_name"
                    className="mb-2 block text-sm font-semibold text-slate-900"
                  >
                    Last name
                  </label>

                  <div
                    className={`flex items-center gap-3 rounded-xl border-2 bg-white px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-emerald-500/20 ${
                      errors.last_name
                        ? "border-red-300 focus-within:border-red-400"
                        : "border-slate-200 focus-within:border-emerald-500"
                    }`}
                  >

                    <UserIcon className="h-5 w-5 flex-shrink-0 text-slate-400" />

                    <input
                      id="last_name"
                      name="last_name"
                      autoComplete="family-name"
                      placeholder="Last name"
                      value={form.last_name}
                      onChange={(event) =>
                        update(
                          "last_name",
                          event.target.value
                        )
                      }
                      className="w-full border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    />

                  </div>

                  {errors.last_name && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      {errors.last_name}
                    </p>
                  )}

                </div>

              </div>

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
                    onChange={(event) =>
                      update(
                        "email",
                        event.target.value
                      )
                    }
                    className="w-full border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  />

                </div>

                {errors.email && (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    {errors.email}
                  </p>
                )}

              </div>

              {/* PHONE */}

              <div>

                <label
                  htmlFor="phone_number"
                  className="mb-2 block text-sm font-semibold text-slate-900"
                >
                  Phone number
                </label>

                <div
                  className={`flex items-center gap-3 rounded-xl border-2 bg-white px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-emerald-500/20 ${
                    errors.phone_number
                      ? "border-red-300 focus-within:border-red-400"
                      : "border-slate-200 focus-within:border-emerald-500"
                  }`}
                >

                  <PhoneIcon className="h-5 w-5 flex-shrink-0 text-slate-400" />

                  <input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    autoComplete="tel"
                    placeholder="e.g. 0977 000 000"
                    value={form.phone_number}
                    onChange={(event) =>
                      update(
                        "phone_number",
                        event.target.value
                      )
                    }
                    className="w-full border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  />

                </div>

                {errors.phone_number && (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    {errors.phone_number}
                  </p>
                )}

              </div>

              {/* PASSWORDS */}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                {/* PASSWORD */}

                <div>

                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-900"
                  >
                    Password
                  </label>

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
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      placeholder="Password"
                      value={form.password}
                      onChange={(event) =>
                        update(
                          "password",
                          event.target.value
                        )
                      }
                      className="w-full border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
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
                      className="flex-shrink-0 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>

                  </div>

                  {errors.password && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      {errors.password}
                    </p>
                  )}

                </div>

                {/* CONFIRM PASSWORD */}

                <div>

                  <label
                    htmlFor="password_confirm"
                    className="mb-2 block text-sm font-semibold text-slate-900"
                  >
                    Confirm password
                  </label>

                  <div
                    className={`flex items-center gap-3 rounded-xl border-2 bg-white px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-emerald-500/20 ${
                      errors.password_confirm
                        ? "border-red-300 focus-within:border-red-400"
                        : "border-slate-200 focus-within:border-emerald-500"
                    }`}
                  >

                    <LockClosedIcon className="h-5 w-5 flex-shrink-0 text-slate-400" />

                    <input
                      id="password_confirm"
                      name="password_confirm"
                      type={
                        showConfirm
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      placeholder="Confirm password"
                      value={
                        form.password_confirm
                      }
                      onChange={(event) =>
                        update(
                          "password_confirm",
                          event.target.value
                        )
                      }
                      className="w-full border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirm(
                          (value) => !value
                        )
                      }
                      aria-label={
                        showConfirm
                          ? "Hide password"
                          : "Show password"
                      }
                      className="flex-shrink-0 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirm ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>

                  </div>

                  {errors.password_confirm && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      {errors.password_confirm}
                    </p>
                  )}

                </div>

              </div>

              {/* TERMS */}

              <div>

                <label className="flex items-start gap-2.5 text-sm font-medium text-slate-600">

                  <input
                    type="checkbox"
                    checked={
                      form.acceptTerms
                    }
                    onChange={(event) =>
                      update(
                        "acceptTerms",
                        event.target.checked
                      )
                    }
                    className="mt-0.5 h-4 w-4 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />

                  <span>

                    I agree to KaJob's{" "}

                    <Link
                      to="/terms"
                      className="font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      Terms of Service
                    </Link>{" "}

                    and{" "}

                    <Link
                      to="/privacy"
                      className="font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      Privacy Policy
                    </Link>
                    .

                  </span>

                </label>

                {errors.acceptTerms && (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    {errors.acceptTerms}
                  </p>
                )}

              </div>

              {/* SUBMIT */}

              <div className="flex justify-center pt-3">

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full max-w-sm rounded-xl bg-emerald-700 px-8 py-4 text-base font-bold text-white shadow-md shadow-emerald-700/20 transition-all duration-200 hover:bg-emerald-800 hover:shadow-lg hover:shadow-emerald-700/25 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Creating account..."
                    : "Create Account"}
                </button>

              </div>

            </motion.form>
          )}

          {/* DIVIDER */}

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

          {/* LOGIN LINK */}

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
            Already have an account?{" "}

            <Link
              to="/login"
              className="font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
            >
              Log in
            </Link>

          </motion.p>

        </div>

        {/* TRUST SIGNAL */}

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
          Secure registration • No spam • Free to join
        </motion.p>

      </motion.div>

    </div>
  );
}