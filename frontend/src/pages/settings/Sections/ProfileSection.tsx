import { PencilIcon } from "@heroicons/react/24/outline";

import { getCurrentUser } from "@/shared/auth";

/* =========================================================
   PROFILE SECTION
   ========================================================= */

const getInitials = (
  firstName?: string,
  lastName?: string
): string => {
  const first = firstName?.trim().charAt(0) ?? "";
  const last = lastName?.trim().charAt(0) ?? "";

  return `${first}${last}`.toUpperCase() || "U";
};

const ProfileSection = () => {
  const user = getCurrentUser();

  const fullName = `${user?.first_name ?? ""} ${
    user?.last_name ?? ""
  }`.trim();

  return (
    <div className="w-full px-6 py-8 sm:px-8">
      {/* SECTION HEADER */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-semibold text-slate-900">
          Public profile
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Manage how your profile appears to other users.
        </p>
      </div>

      {/* PROFILE CONTENT */}
      <div className="mt-6 grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_220px]">
        {/* LEFT FORM */}
        <div className="space-y-6">
          {/* NAME */}
          <div>
            <label
              htmlFor="profile-name"
              className="block text-sm font-medium text-slate-900"
            >
              Name
            </label>

            <input
              id="profile-name"
              type="text"
              defaultValue={fullName}
              className="
                mt-1.5
                block
                w-full
                rounded-lg
                border
                border-slate-300
                bg-white
                px-3
                py-2.5
                text-sm
                text-slate-900
                shadow-sm
                outline-none
                transition
                focus:border-emerald-500
                focus:ring-2
                focus:ring-emerald-100
              "
            />

            <p className="mt-1.5 text-xs text-slate-500">
              Your name will be visible on your public profile.
            </p>
          </div>

          {/* PUBLIC EMAIL */}
          <div>
            <label
              htmlFor="profile-email"
              className="block text-sm font-medium text-slate-900"
            >
              Public email
            </label>

            <div className="mt-1.5 flex items-center gap-2">
              <select
                id="profile-email"
                defaultValue={user?.email ?? ""}
                className="
                  block
                  min-w-0
                  flex-1
                  rounded-lg
                  border
                  border-slate-300
                  bg-white
                  px-3
                  py-2.5
                  text-sm
                  text-slate-900
                  shadow-sm
                  outline-none
                  focus:border-emerald-500
                  focus:ring-2
                  focus:ring-emerald-100
                "
              >
                <option value={user?.email ?? ""}>
                  {user?.email ?? "No email available"}
                </option>
              </select>

              <button
                type="button"
                className="
                  shrink-0
                  text-sm
                  font-medium
                  text-slate-500
                  transition
                  hover:text-red-600
                "
              >
                Remove
              </button>
            </div>

            <p className="mt-1.5 text-xs text-slate-500">
              This email may be displayed on your public profile.
            </p>
          </div>

          {/* BIO */}
          <div>
            <label
              htmlFor="profile-bio"
              className="block text-sm font-medium text-slate-900"
            >
              Bio
            </label>

            <textarea
              id="profile-bio"
              rows={4}
              placeholder="Tell people a little about yourself..."
              className="
                mt-1.5
                block
                w-full
                resize-none
                rounded-lg
                border
                border-slate-300
                bg-white
                px-3
                py-2.5
                text-sm
                text-slate-900
                shadow-sm
                outline-none
                placeholder:text-slate-400
                focus:border-emerald-500
                focus:ring-2
                focus:ring-emerald-100
              "
            />

            <p className="mt-1.5 text-xs text-slate-500">
              A short description helps others know more about you.
            </p>
          </div>

          {/* PRONOUNS */}
          <div>
            <label
              htmlFor="profile-pronouns"
              className="block text-sm font-medium text-slate-900"
            >
              Pronouns
            </label>

            <select
              id="profile-pronouns"
              defaultValue=""
              className="
                mt-1.5
                block
                w-full
                rounded-lg
                border
                border-slate-300
                bg-white
                px-3
                py-2.5
                text-sm
                text-slate-900
                shadow-sm
                outline-none
                focus:border-emerald-500
                focus:ring-2
                focus:ring-emerald-100
              "
            >
              <option value="">Don't specify</option>
              <option value="he/him">he/him</option>
              <option value="she/her">she/her</option>
              <option value="they/them">they/them</option>
            </select>
          </div>

          {/* URL */}
          <div>
            <label
              htmlFor="profile-url"
              className="block text-sm font-medium text-slate-900"
            >
              URL
            </label>

            <input
              id="profile-url"
              type="url"
              placeholder="https://example.com"
              className="
                mt-1.5
                block
                w-full
                rounded-lg
                border
                border-slate-300
                bg-white
                px-3
                py-2.5
                text-sm
                text-slate-900
                shadow-sm
                outline-none
                placeholder:text-slate-400
                focus:border-emerald-500
                focus:ring-2
                focus:ring-emerald-100
              "
            />
          </div>

          {/* SAVE */}
          <div className="border-t border-slate-200 pt-6">
            <button
              type="button"
              className="
                rounded-lg
                bg-emerald-600
                px-4
                py-2.5
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-emerald-700
                focus:outline-none
                focus:ring-2
                focus:ring-emerald-500
                focus:ring-offset-2
              "
            >
              Save changes
            </button>
          </div>
        </div>

        {/* PROFILE PICTURE */}
        <div className="flex flex-col items-start">
          <h3 className="text-sm font-semibold text-slate-900">
            Profile picture
          </h3>

          <div className="relative mt-3">
            <div
              className="
                flex
                h-40
                w-40
                items-center
                justify-center
                rounded-full
                bg-emerald-100
                text-4xl
                font-semibold
                text-emerald-700
                ring-4
                ring-emerald-50
              "
            >
              {getInitials(
                user?.first_name,
                user?.last_name
              )}
            </div>

            <button
              type="button"
              className="
                absolute
                bottom-0
                right-0
                flex
                items-center
                gap-1.5
                rounded-lg
                border
                border-slate-200
                bg-white
                px-3
                py-2
                text-xs
                font-medium
                text-slate-700
                shadow-sm
                transition
                hover:bg-slate-50
                hover:text-emerald-600
              "
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </button>
          </div>

          <p className="mt-3 max-w-[200px] text-xs leading-5 text-slate-500">
            Your profile picture helps other users recognize you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;