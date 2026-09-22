import { NavLink } from "react-router-dom";

import {
  UserCircleIcon,
  IdentificationIcon,
  LockClosedIcon,
  MapPinIcon,
  BellIcon,
  ShieldCheckIcon,
  ClockIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

/* =========================================================
   SETTINGS SIDEBAR PROPS
========================================================= */

type SettingsSidebarProps = {
  isWorker?: boolean;
};

/* =========================================================
   NAV ITEM CLASS
========================================================= */

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  `
    flex w-full items-center gap-3
    px-4 py-2.5
    text-sm font-medium
    transition-colors duration-150
    ${
      isActive
        ? "bg-emerald-50 text-emerald-700"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }
  `;

/* =========================================================
   SETTINGS SIDEBAR
========================================================= */

const SettingsSidebar = ({
  isWorker = false,
}: SettingsSidebarProps) => {
  return (
    <nav className="w-full">
      {/* =====================================================
          GENERAL
      ===================================================== */}

      <div className="py-3">
        <p className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          General
        </p>

        <div className="mt-2">
          <NavLink
            to="profile"
            className={navItemClass}
          >
            <UserCircleIcon className="h-5 w-5 shrink-0" />
            <span>Profile</span>
          </NavLink>

          <NavLink
            to="account"
            className={navItemClass}
          >
            <IdentificationIcon className="h-5 w-5 shrink-0" />
            <span>Account</span>
          </NavLink>

          <NavLink
            to="location"
            className={navItemClass}
          >
            <MapPinIcon className="h-5 w-5 shrink-0" />
            <span>Location</span>
          </NavLink>

          <NavLink
            to="notifications"
            className={navItemClass}
          >
            <BellIcon className="h-5 w-5 shrink-0" />
            <span>Notifications</span>
          </NavLink>
        </div>
      </div>

      {/* =====================================================
          ACCESS
      ===================================================== */}

      <div className="py-3">
        <p className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Access
        </p>

        <div className="mt-2">
          <NavLink
            to="security"
            className={navItemClass}
          >
            <LockClosedIcon className="h-5 w-5 shrink-0" />
            <span>Password & Authentication</span>
          </NavLink>

          <NavLink
            to="verification"
            className={navItemClass}
          >
            <ShieldCheckIcon className="h-5 w-5 shrink-0" />
            <span>Verify Details</span>
          </NavLink>
        </div>
      </div>

      {/* =====================================================
          WORKER
      ===================================================== */}

      {isWorker && (
        <div className="py-3">
          <p className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Worker
          </p>

          <div className="mt-2">
            <NavLink
              to="availability"
              className={navItemClass}
            >
              <ClockIcon className="h-5 w-5 shrink-0" />
              <span>Availability</span>
            </NavLink>
          </div>
        </div>
      )}

      {/* =====================================================
          SUPPORT
      ===================================================== */}

      <div className="py-3">
        <p className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Support
        </p>

        <div className="mt-2">
          <NavLink
            to="my-reports"
            className={navItemClass}
          >
            <DocumentTextIcon className="h-5 w-5 shrink-0" />
            <span>My Reports</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default SettingsSidebar;