import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

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

import ActionButton from "@/shared/ActionButton";

import {
  ApiError,
  ROLE_OPTIONS,
  type RoleValue,
  type RegisterPayload,
} from "@/shared/types";

import { registerUser } from "@/api/auth/auth";


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


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


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


  /* =========================
     UPDATE FORM
  ========================= */

  function update<K extends keyof FormState>(
    key: K,
    value: FormState[K],
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
     VALIDATION
  ========================= */

  function validate(): boolean {
    const next: Record<string, string> = {};

    if (!form.first_name.trim()) {
      next.first_name =
        "First name is required.";
    }

    if (!form.last_name.trim()) {
      next.last_name =
        "Last name is required.";
    }

    if (!form.email.trim()) {
      next.email =
        "Email is required.";
    } else if (!EMAIL_RE.test(form.email)) {
      next.email =
        "Enter a valid email address.";
    }

    if (!form.phone_number.trim()) {
      next.phone_number =
        "Phone number is required.";
    }

    if (!form.password) {
      next.password =
        "Password is required.";
    } else if (form.password.length < 8) {
      next.password =
        "Password must contain at least 8 characters.";
    }

    if (!form.password_confirm) {
      next.password_confirm =
        "Please confirm your password.";
    } else if (
      form.password_confirm !== form.password
    ) {
      next.password_confirm =
        "Passwords do not match.";
    }

    if (!form.role) {
      next.role =
        "Choose whether you want to work or post jobs.";
    }

    if (!form.acceptTerms) {
      next.acceptTerms =
        "You must accept the terms to continue.";
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  }


  /* =========================
     SUBMIT
  ========================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    console.log("REGISTER BUTTON CLICKED");

    if (isSubmitting) {
      return;
    }

    setFormError(null);

    const valid = validate();

    if (!valid) {
      console.log(
        "FORM VALIDATION FAILED",
      );

      return;
    }

    console.log(
      "FORM VALIDATION PASSED",
    );

    setIsSubmitting(true);

    try {
      /*
       * IMPORTANT:
       *
       * Django expects:
       *
       * WORKER
       * CLIENT
       *
       * NOT:
       *
       * worker
       * client
       */

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

        role:
          form.role as RoleValue,
      };

      console.log(
        "SENDING REGISTRATION:",
        payload,
      );

      const data =
        await registerUser(payload);

      console.log(
        "REGISTRATION SUCCESSFUL:",
        data,
      );

      /*
       * Account was successfully created.
       *
       * Take the user to login.
       */

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
        error,
      );

      if (error instanceof ApiError) {
        const fieldErrors: Record<
          string,
          string
        > = {};

        for (
          const [key, value]
          of Object.entries(error.fields)
        ) {
          if (
            key === "error" ||
            key === "detail"
          ) {
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

        setFormError(
          error.message,
        );

      } else {
        setFormError(
          "Unable to connect to the server. Make sure Django is running.",
        );
      }

    } finally {
      setIsSubmitting(false);
    }
  }


  /* =========================
     UI
  ========================= */

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
        className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-8 shadow-sm sm:p-10"
      >

        {/* HEADER */}

        <h1 className="font-serif text-2xl font-semibold text-stone-900">
          Create your KaJob account
        </h1>

        <p className="mt-1.5 text-sm text-stone-500">
          Join Lusaka&apos;s piecework marketplace — it&apos;s free.
        </p>


        {/* GENERAL ERROR */}

        {formError && (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
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

          {/* ROLE */}

          <fieldset>

            <legend className="mb-2 text-sm font-medium text-stone-700">
              I want to
            </legend>

            <div className="grid grid-cols-2 gap-3">

              {ROLE_OPTIONS.map(
                (option) => {
                  const selected =
                    form.role ===
                    option.value;

                  return (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-xl border p-4 text-left transition ${
                        selected
                          ? "border-emerald-700 bg-emerald-50"
                          : "border-stone-300 hover:border-stone-400"
                      }`}
                    >

                      <input
                        type="radio"
                        name="role"
                        value={option.value}
                        checked={selected}
                        onChange={() =>
                          update(
                            "role",
                            option.value,
                          )
                        }
                        className="sr-only"
                      />

                      {option.value ===
                      "WORKER" ? (
                        <WrenchScrewdriverIcon
                          className={`h-5 w-5 ${
                            selected
                              ? "text-emerald-700"
                              : "text-stone-400"
                          }`}
                          aria-hidden="true"
                        />
                      ) : (
                        <BriefcaseIcon
                          className={`h-5 w-5 ${
                            selected
                              ? "text-emerald-700"
                              : "text-stone-400"
                          }`}
                          aria-hidden="true"
                        />
                      )}

                      <p
                        className={`mt-2 text-sm font-semibold ${
                          selected
                            ? "text-emerald-800"
                            : "text-stone-800"
                        }`}
                      >
                        {option.label}
                      </p>

                      <p className="mt-0.5 text-xs text-stone-500">
                        {option.description}
                      </p>

                    </label>
                  );
                },
              )}

            </div>

            {errors.role && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.role}
              </p>
            )}

          </fieldset>


          {/* FIRST + LAST NAME */}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            <div>

              <label
                htmlFor="first_name"
                className="mb-1.5 block text-sm font-medium text-stone-700"
              >
                First name
              </label>

              <div
                className={`flex items-center gap-2 rounded-xl border bg-white px-3.5 py-2.5 ${
                  errors.first_name
                    ? "border-red-400"
                    : "border-stone-300"
                }`}
              >

                <UserIcon className="h-5 w-5 flex-shrink-0 text-stone-400" />

                <input
                  id="first_name"
                  autoComplete="given-name"
                  value={form.first_name}
                  onChange={(event) =>
                    update(
                      "first_name",
                      event.target.value,
                    )
                  }
                  className="w-full border-none bg-transparent text-sm text-stone-900 outline-none"
                />

              </div>

              {errors.first_name && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.first_name}
                </p>
              )}

            </div>


            <div>

              <label
                htmlFor="last_name"
                className="mb-1.5 block text-sm font-medium text-stone-700"
              >
                Last name
              </label>

              <div
                className={`flex items-center gap-2 rounded-xl border bg-white px-3.5 py-2.5 ${
                  errors.last_name
                    ? "border-red-400"
                    : "border-stone-300"
                }`}
              >

                <UserIcon className="h-5 w-5 flex-shrink-0 text-stone-400" />

                <input
                  id="last_name"
                  autoComplete="family-name"
                  value={form.last_name}
                  onChange={(event) =>
                    update(
                      "last_name",
                      event.target.value,
                    )
                  }
                  className="w-full border-none bg-transparent text-sm text-stone-900 outline-none"
                />

              </div>

              {errors.last_name && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.last_name}
                </p>
              )}

            </div>

          </div>


          {/* EMAIL */}

          <div>

            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-stone-700"
            >
              Email
            </label>

            <div
              className={`flex items-center gap-2 rounded-xl border bg-white px-3.5 py-2.5 ${
                errors.email
                  ? "border-red-400"
                  : "border-stone-300"
              }`}
            >

              <EnvelopeIcon className="h-5 w-5 flex-shrink-0 text-stone-400" />

              <input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) =>
                  update(
                    "email",
                    event.target.value,
                  )
                }
                className="w-full border-none bg-transparent text-sm text-stone-900 outline-none"
              />

            </div>

            {errors.email && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.email}
              </p>
            )}

          </div>


          {/* PHONE */}

          <div>

            <label
              htmlFor="phone_number"
              className="mb-1.5 block text-sm font-medium text-stone-700"
            >
              Phone number
            </label>

            <div
              className={`flex items-center gap-2 rounded-xl border bg-white px-3.5 py-2.5 ${
                errors.phone_number
                  ? "border-red-400"
                  : "border-stone-300"
              }`}
            >

              <PhoneIcon className="h-5 w-5 flex-shrink-0 text-stone-400" />

              <input
                id="phone_number"
                type="tel"
                autoComplete="tel"
                placeholder="e.g. 0977 000 000"
                value={form.phone_number}
                onChange={(event) =>
                  update(
                    "phone_number",
                    event.target.value,
                  )
                }
                className="w-full border-none bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
              />

            </div>

            {errors.phone_number && (
              <p className="mt-1.5 text-xs text-red-600">
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
                className="mb-1.5 block text-sm font-medium text-stone-700"
              >
                Password
              </label>

              <div
                className={`flex items-center gap-2 rounded-xl border bg-white px-3.5 py-2.5 ${
                  errors.password
                    ? "border-red-400"
                    : "border-stone-300"
                }`}
              >

                <LockClosedIcon className="h-5 w-5 flex-shrink-0 text-stone-400" />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(event) =>
                    update(
                      "password",
                      event.target.value,
                    )
                  }
                  className="w-full border-none bg-transparent text-sm text-stone-900 outline-none"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value,
                    )
                  }
                  className="text-stone-400 hover:text-stone-600"
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


            {/* CONFIRM PASSWORD */}

            <div>

              <label
                htmlFor="password_confirm"
                className="mb-1.5 block text-sm font-medium text-stone-700"
              >
                Confirm password
              </label>

              <div
                className={`flex items-center gap-2 rounded-xl border bg-white px-3.5 py-2.5 ${
                  errors.password_confirm
                    ? "border-red-400"
                    : "border-stone-300"
                }`}
              >

                <LockClosedIcon className="h-5 w-5 flex-shrink-0 text-stone-400" />

                <input
                  id="password_confirm"
                  type={
                    showConfirm
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  value={
                    form.password_confirm
                  }
                  onChange={(event) =>
                    update(
                      "password_confirm",
                      event.target.value,
                    )
                  }
                  className="w-full border-none bg-transparent text-sm text-stone-900 outline-none"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirm(
                      (value) => !value,
                    )
                  }
                  className="text-stone-400 hover:text-stone-600"
                >
                  {showConfirm ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>

              </div>

              {errors.password_confirm && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.password_confirm}
                </p>
              )}

            </div>

          </div>


          {/* TERMS */}

          <div>

            <label className="flex items-start gap-2.5 text-sm text-stone-600">

              <input
                type="checkbox"
                checked={form.acceptTerms}
                onChange={(event) =>
                  update(
                    "acceptTerms",
                    event.target.checked,
                  )
                }
                className="mt-0.5 h-4 w-4 rounded border-stone-300 text-emerald-700"
              />

              <span>
                I agree to KaJob&apos;s{" "}

                <Link
                  to="/terms"
                  className="font-semibold text-emerald-700"
                >
                  Terms of Service
                </Link>{" "}

                and{" "}

                <Link
                  to="/privacy"
                  className="font-semibold text-emerald-700"
                >
                  Privacy Policy
                </Link>
                .
              </span>

            </label>

            {errors.acceptTerms && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.acceptTerms}
              </p>
            )}

          </div>


          {/* SUBMIT */}

          <ActionButton
            type="submit"
            loading={isSubmitting}
          >
            {isSubmitting
              ? "Creating account..."
              : "Create Account"}
          </ActionButton>

        </form>


        {/* LOGIN */}

        <p className="mt-6 text-center text-sm text-stone-500">

          Already have an account?{" "}

          <Link
            to="/login"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Log in
          </Link>

        </p>

      </motion.div>

    </div>
  );
}