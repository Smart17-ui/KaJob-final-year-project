import {
  Bars3Icon,
  BellIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import ProfileDropdown from "./ProfileDropdown";

type TopBarProps = {
  userName?: string;
  userRole?: "CLIENT" | "WORKER";

  onMenuOpen?: () => void;
  onNotificationsClick?: () => void;
  onProfileClick?: () => void;
  onVerifyClick?: () => void;
  onSettingsClick?: () => void;
  onSwitchRole?: () => void;
  onLogout?: () => void;
};

const TopBar = ({
  userName = "User",
  userRole = "CLIENT",
  onMenuOpen,
  onNotificationsClick,
  onProfileClick,
  onVerifyClick,
  onSettingsClick,
  onSwitchRole,
  onLogout,
}: TopBarProps) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* LEFT SIDE - Menu Trigger */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={onMenuOpen}
            className="
              flex items-center justify-center
              h-10 w-10
              rounded-lg
              text-slate-600
              transition-all duration-200
              hover:bg-slate-100
              hover:text-emerald-600
              active:scale-95
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
              lg:hidden
            "
            aria-label="Open navigation menu"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
        </div>

        {/* CENTER - Branding (optional, can show logo) */}
        <div className="hidden flex-1 items-center justify-center lg:flex">
          <span className="text-sm font-semibold text-slate-600">
            {userRole === "CLIENT" ? "Client" : "Worker"} Dashboard
          </span>
        </div>

        {/* RIGHT SIDE - Actions */}
        <div className="flex items-center gap-1">
          {/* Notifications Button */}
          <button
            type="button"
            onClick={onNotificationsClick}
            className="
              group relative flex items-center justify-center
              h-10 w-10
              rounded-lg
              text-slate-500
              transition-all duration-200
              hover:bg-slate-100
              hover:text-emerald-600
              active:scale-95
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
            "
            aria-label="View notifications"
          >
            <BellIcon className="h-5 w-5 transition-colors" />

            {/* Notification Badge */}
            <span
              className="
                absolute right-2 top-2
                h-2 w-2
                rounded-full
                bg-amber-400
                shadow-md
                animate-pulse
              "
              aria-label="Unread notifications"
            />
          </button>

          {/* Settings Button - Hidden on Small Screens */}
          <button
            type="button"
            onClick={onSettingsClick}
            className="
              group hidden items-center justify-center
              h-10 w-10
              rounded-lg
              text-slate-500
              transition-all duration-200
              hover:bg-slate-100
              hover:text-emerald-600
              active:scale-95
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
              sm:flex
            "
            aria-label="Open settings"
          >
            <Cog6ToothIcon className="h-5 w-5 transition-colors" />
          </button>

          {/* Divider */}
          <div className="mx-2 hidden h-6 w-px bg-slate-200 sm:block" />

          {/* Profile Dropdown */}
          <ProfileDropdown
            userName={userName}
            userRole={userRole}
            onProfileClick={onProfileClick}
            onVerifyClick={onVerifyClick}
            onSettingsClick={onSettingsClick}
            onSwitchRole={onSwitchRole}
            onLogout={onLogout}
          />
        </div>
      </div>
    </header>
  );
};

export default TopBar;