import {
  UserCircleIcon,
  PencilIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";

const Profile = () => {
  /*
   * Temporary profile data.
   *
   * This will later come from the
   * authenticated user / Django API.
   */
  const user = {
    firstName: "Client",
    lastName: "",
    email: "client@example.com",
    phone: "+260 97 000 0000",
    location: "Lusaka, Zambia",
    role: "Client",
    memberSince: "2026",
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <section>
        <h1 className="text-2xl font-bold text-slate-900">
          Profile
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your personal information and
          account details.
        </p>
      </section>

      {/* =========================
          PROFILE CARD
      ========================= */}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

        {/* =========================
            PROFILE HEADER
        ========================= */}

        <div className="border-b border-slate-100 px-6 py-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            {/* USER */}

            <div className="flex items-center gap-4">

              {/* AVATAR */}

              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">

                <UserCircleIcon className="h-10 w-10 text-emerald-600" />

              </div>

              {/* NAME */}

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {user.firstName} {user.lastName}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {user.role}
                </p>
              </div>

            </div>

            {/* EDIT BUTTON */}

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <PencilIcon className="h-4 w-4" />

              Edit Profile
            </button>

          </div>

        </div>

        {/* =========================
            PERSONAL INFORMATION
        ========================= */}

        <div className="px-6 py-6">

          <div className="mb-5">

            <h3 className="text-base font-semibold text-slate-900">
              Personal Information
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Your basic account information.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* FIRST NAME */}

            <div className="rounded-lg border border-slate-200 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50">
                  <UserCircleIcon className="h-5 w-5 text-slate-500" />
                </div>

                <div>

                  <p className="text-xs font-medium text-slate-400">
                    First name
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {user.firstName}
                  </p>

                </div>

              </div>

            </div>

            {/* LAST NAME */}

            <div className="rounded-lg border border-slate-200 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50">
                  <UserCircleIcon className="h-5 w-5 text-slate-500" />
                </div>

                <div>

                  <p className="text-xs font-medium text-slate-400">
                    Last name
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {user.lastName || "Not provided"}
                  </p>

                </div>

              </div>

            </div>

            {/* EMAIL */}

            <div className="rounded-lg border border-slate-200 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50">
                  <EnvelopeIcon className="h-5 w-5 text-slate-500" />
                </div>

                <div className="min-w-0">

                  <p className="text-xs font-medium text-slate-400">
                    Email address
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                    {user.email}
                  </p>

                </div>

              </div>

            </div>

            {/* PHONE */}

            <div className="rounded-lg border border-slate-200 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50">
                  <PhoneIcon className="h-5 w-5 text-slate-500" />
                </div>

                <div>

                  <p className="text-xs font-medium text-slate-400">
                    Phone number
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {user.phone}
                  </p>

                </div>

              </div>

            </div>

            {/* LOCATION */}

            <div className="rounded-lg border border-slate-200 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50">
                  <MapPinIcon className="h-5 w-5 text-slate-500" />
                </div>

                <div>

                  <p className="text-xs font-medium text-slate-400">
                    Location
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {user.location}
                  </p>

                </div>

              </div>

            </div>

            {/* ACCOUNT TYPE */}

            <div className="rounded-lg border border-slate-200 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50">
                  <BriefcaseIcon className="h-5 w-5 text-slate-500" />
                </div>

                <div>

                  <p className="text-xs font-medium text-slate-400">
                    Account type
                  </p>

                  <p className="mt-1 text-sm font-semibold text-emerald-700">
                    {user.role}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* =========================
            ACCOUNT INFORMATION
        ========================= */}

        <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-medium text-slate-700">
                KaJob account
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Member since {user.memberSince}
              </p>

            </div>

            <span className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Active
            </span>

          </div>

        </div>

      </section>

    </div>
  );
};

export default Profile;