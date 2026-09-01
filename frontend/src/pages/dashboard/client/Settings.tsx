import {
  BellIcon,
  LockClosedIcon,
  UserCircleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const Settings = () => {
  return (
    <div className="space-y-6">

      {/* =========================
          HEADER
      ========================= */}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Settings
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your account and notification preferences.
        </p>
      </div>

      {/* =========================
          ACCOUNT SETTINGS
      ========================= */}

      <section className="rounded-xl border border-slate-200 bg-white">

        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <UserCircleIcon className="h-5 w-5 text-emerald-600" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Account
              </h2>

              <p className="text-sm text-slate-500">
                Manage your account information.
              </p>
            </div>

          </div>
        </div>

        <div className="divide-y divide-slate-100">

          {/* EMAIL */}

          <div className="flex flex-col justify-between gap-3 px-6 py-5 sm:flex-row sm:items-center">

            <div>
              <p className="text-sm font-medium text-slate-900">
                Email address
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Manage the email associated with your account.
              </p>
            </div>

            <button
              type="button"
              className="self-start rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:self-auto"
            >
              Change
            </button>

          </div>

          {/* PASSWORD */}

          <div className="flex flex-col justify-between gap-3 px-6 py-5 sm:flex-row sm:items-center">

            <div className="flex items-start gap-3">

              <LockClosedIcon className="mt-0.5 h-5 w-5 text-slate-400" />

              <div>
                <p className="text-sm font-medium text-slate-900">
                  Password
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Change your account password.
                </p>
              </div>

            </div>

            <button
              type="button"
              className="self-start rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:self-auto"
            >
              Change password
            </button>

          </div>

        </div>

      </section>

      {/* =========================
          NOTIFICATIONS
      ========================= */}

      <section className="rounded-xl border border-slate-200 bg-white">

        <div className="border-b border-slate-100 px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <BellIcon className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Notifications
              </h2>

              <p className="text-sm text-slate-500">
                Choose how you want to receive notifications.
              </p>
            </div>

          </div>

        </div>

        <div className="divide-y divide-slate-100">

          {/* JOB APPLICATIONS */}

          <div className="flex items-center justify-between gap-4 px-6 py-5">

            <div>
              <p className="text-sm font-medium text-slate-900">
                Job applications
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Receive notifications when workers apply to your jobs.
              </p>
            </div>

            <input
              type="checkbox"
              defaultChecked
              className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />

          </div>

          {/* MESSAGES */}

          <div className="flex items-center justify-between gap-4 px-6 py-5">

            <div>
              <p className="text-sm font-medium text-slate-900">
                Messages
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Receive notifications when you receive a message.
              </p>
            </div>

            <input
              type="checkbox"
              defaultChecked
              className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />

          </div>

          {/* JOB UPDATES */}

          <div className="flex items-center justify-between gap-4 px-6 py-5">

            <div>
              <p className="text-sm font-medium text-slate-900">
                Job updates
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Receive updates about your active jobs.
              </p>
            </div>

            <input
              type="checkbox"
              defaultChecked
              className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />

          </div>

        </div>

      </section>

      {/* =========================
          PRIVACY & SECURITY
      ========================= */}

      <section className="rounded-xl border border-slate-200 bg-white">

        <div className="border-b border-slate-100 px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
              <ShieldCheckIcon className="h-5 w-5 text-purple-600" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Privacy & Security
              </h2>

              <p className="text-sm text-slate-500">
                Manage your privacy and account security.
              </p>
            </div>

          </div>

        </div>

        <div className="px-6 py-5">

          <button
            type="button"
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Manage privacy
          </button>

        </div>

      </section>

    </div>
  );
};

export default Settings;