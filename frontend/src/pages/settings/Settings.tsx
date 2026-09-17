import {
  BellIcon,
  CalendarDaysIcon,
  LockClosedIcon,
  MapPinIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";

import { getCurrentUser } from "@/shared/auth";

/* =========================================================
   SETTINGS SIDEBAR
   ========================================================= */

type SettingsItem = {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
};

const commonItems: SettingsItem[] = [
  {
    label: "Profile",
    path: "profile",
    icon: UserCircleIcon,
  },
  {
    label: "Account",
    path: "account",
    icon: UserIcon,
  },
  {
    label: "Security",
    path: "security",
    icon: LockClosedIcon,
  },
  {
    label: "Location",
    path: "location",
    icon: MapPinIcon,
  },
  {
    label: "Notifications",
    path: "notifications",
    icon: BellIcon,
  },
  {
    label: "Verification",
    path: "verification",
    icon: ShieldCheckIcon,
  },
];

const workerItems: SettingsItem[] = [
  {
    label: "Availability",
    path: "availability",
    icon: CalendarDaysIcon,
  },
];

const SettingsSidebar = () => {
  const user = getCurrentUser();

  const isWorker = user?.role === "WORKER";

  const items = isWorker
    ? [...commonItems, ...workerItems]
    : commonItems;

  return (
    <nav className="py-3" aria-label="Settings navigation">
      <div className="space-y-1 px-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `
                  flex items-center gap-3
                  rounded-lg
                  px-3 py-2.5
                  text-sm font-medium
                  transition-colors duration-150
                  ${
                    isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }
                `
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`h-5 w-5 shrink-0 ${
                      isActive
                        ? "text-emerald-600"
                        : "text-slate-400"
                    }`}
                  />

                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default SettingsSidebar;