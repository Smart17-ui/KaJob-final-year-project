import { NavLink } from "react-router-dom";

import {
  UserCircleIcon,
  IdentificationIcon,
  LockClosedIcon,
  BellIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

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

const compactItems = [
  { label: "Profile", path: "profile", icon: UserCircleIcon },
  { label: "Account", path: "account", icon: IdentificationIcon },
  { label: "Notifications", path: "notifications", icon: BellIcon },
  { label: "Security", path: "security", icon: LockClosedIcon },
  { label: "Verification", path: "verification", icon: ShieldCheckIcon },
  { label: "Reports", path: "my-reports", icon: DocumentTextIcon },
];

const SettingsSidebar = ({ compact = false }: { compact?: boolean }) => {
  if (compact) {
    return (
      <nav
        aria-label="Settings navigation"
        className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex w-max min-w-full gap-1 px-2 py-2">
          {compactItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-100 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    );
  }

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
