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
    <div className="flex min-h-[calc(100dvh-80px)] w-full min-w-0 flex-col overflow-visible md:h-[calc(100vh-80px)] md:min-h-0 md:overflow-hidden">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="mx-auto flex w-full max-w-6xl shrink-0 items-center justify-between gap-3 px-3 pb-4 sm:px-6 sm:pb-6 lg:px-8">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            Settings
          </h1>

          <p className="mt-1 hidden text-sm text-slate-500 sm:block">
            Manage your account settings and preferences.
          </p>
        </div>

        {/* =================================================
            BACK TO DASHBOARD
        ================================================= */}

        <Link
          to={dashboardPath}
          aria-label="Back to dashboard"
          className="
            inline-flex
            shrink-0
            items-center
            gap-2
            rounded-lg
            border
            border-slate-300
            bg-white
            px-3
            py-2.5
            text-sm
            font-medium
            text-slate-700
            transition
            hover:bg-slate-50
            hover:text-slate-900
          "
        >
       
          <ArrowLeftIcon className="h-4 w-4 sm:hidden" />
          <span className="hidden sm:inline">Back to Dashboard</span>
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
          overflow-visible
          px-2
          pb-4
          sm:px-6
          sm:pb-6
          lg:px-8
          md:overflow-hidden
        "
      >
        <div
          className="
            flex
            min-h-0
            w-full
            flex-col
            overflow-visible
            rounded-xl
            border
            border-slate-200
            bg-white
            md:flex-row
            md:overflow-hidden
          "
        >
          <div className="border-b border-slate-200 bg-slate-50 md:hidden">
            <SettingsSidebar compact />
          </div>

          {/* =================================================
              SETTINGS SIDEBAR
          ================================================= */}

          <aside
            className="
              hidden
              w-[220px]
              shrink-0
              overflow-y-auto
              border-r
              border-slate-200
              bg-slate-50

              [scrollbar-width:none]
              [-ms-overflow-style:none]
              [&::-webkit-scrollbar]:hidden
              md:block
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
              overflow-visible
              bg-white

              [scrollbar-width:none]
              [-ms-overflow-style:none]
              [&::-webkit-scrollbar]:hidden
              md:overflow-y-auto
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
