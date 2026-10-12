import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Link, Outlet } from "react-router-dom";

import SettingsSidebar from "./SettingsSidebar/SettingsSidebar";

import { getSelectedRole } from "@/shared/auth";

/* =========================================================
   SETTINGS LAYOUT
========================================================= */

const SettingsLayout = () => {
  const selectedRole = getSelectedRole();

  const dashboardPath =
    selectedRole === "WORKER"
      ? "/worker/dashboard"
      : selectedRole === "CLIENT"
        ? "/client/dashboard"
        : "/admin/dashboard";

  return (
    <div className="flex h-[calc(100vh-80px)] w-full min-w-0 flex-col overflow-hidden">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="mx-auto flex w-full max-w-6xl shrink-0 items-center justify-between px-4 pb-6 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Settings
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your account settings and preferences.
          </p>
        </div>

        {/* =================================================
            BACK TO DASHBOARD
        ================================================= */}

        <Link
          to={dashboardPath}
          className="
            inline-flex
            shrink-0
            items-center
            gap-2
            rounded-lg
            border
            border-slate-300
            bg-white
            px-4
            py-2.5
            text-sm
            font-medium
            text-slate-700
            transition
            hover:bg-slate-50
            hover:text-slate-900
          "
        >
       
          Back to Dashboard
        </Link>
      </div>

      {/* =====================================================
          SETTINGS AREA
      ===================================================== */}

      <div
        className="
          mx-auto
          flex
          min-h-0
          w-full
          max-w-6xl
          flex-1
          overflow-hidden
          px-4
          pb-6
          sm:px-6
          lg:px-8
        "
      >
        <div
          className="
            flex
            min-h-0
            w-full
            overflow-hidden
            rounded-xl
            border
            border-slate-200
            bg-white
          "
        >
          {/* =================================================
              SETTINGS SIDEBAR
          ================================================= */}

          <aside
            className="
              w-[220px]
              shrink-0
              overflow-y-auto
              border-r
              border-slate-200
              bg-slate-50

              [scrollbar-width:none]
              [-ms-overflow-style:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            <SettingsSidebar />
          </aside>

          {/* =================================================
              SETTINGS CONTENT
          ================================================= */}

          <main
            className="
              min-h-0
              min-w-0
              flex-1
              overflow-y-auto
              bg-white

              [scrollbar-width:none]
              [-ms-overflow-style:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;