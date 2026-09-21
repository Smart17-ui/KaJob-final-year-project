import {
  Bars3Icon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

import NotificationBell from "./NotificationBell";
import ProfileDropdown from "./ProfileDropdown";

type UserRole = "CLIENT" | "WORKER";

type TopBarProps = {
  userName?: string;
  userRole?: UserRole;
  availableRoles?: UserRole[];

  onMenuOpen?: () => void;
  onNotificationsClick?: () => void;
  onProfileClick?: () => void;
  onVerifyClick?: () => void;
  onSettingsClick?: () => void;

  onSwitchRole?: (role: UserRole) => void;
  onAddRole?: (role: UserRole) => void;

  onLogout?: () => void;
};

const TopBar = ({
  userName = "User",
  userRole = "CLIENT",
  availableRoles = [userRole],

  onMenuOpen,
  onNotificationsClick,
  onProfileClick,
  onVerifyClick,
  onSettingsClick,
  onSwitchRole,
  onAddRole,
  onLogout,
}: TopBarProps) => {
  void onNotificationsClick;

  const roles = Array.from(
    new Set(
      availableRoles.includes(userRole)
        ? availableRoles
        : [...availableRoles, userRole]
    )
  );

  const hasMultipleRoles = roles.length > 1;

  const handleRoleAction = (role: UserRole) => {
    if (hasMultipleRoles) {
      onSwitchRole?.(role);
      return;
    }

    onAddRole?.(role);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">

        {/* LEFT */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={onMenuOpen}
            className="
              flex h-10 w-10 items-center justify-center
              rounded-lg text-slate-500
              transition-all duration-200
              hover:bg-slate-100
              hover:text-emerald-600
              active:scale-95
              focus:outline-none
              focus:ring-2
              focus:ring-emerald-500
              focus:ring-offset-2
              lg:hidden
            "
            aria-label="Open menu"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
        </div>

        {/* CENTER */}
        <div className="hidden flex-1 items-center justify-center lg:flex">
          <span className="text-sm font-semibold text-slate-600">
            {userRole === "CLIENT"
              ? "Client Dashboard"
              : "Worker Dashboard"}
          </span>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-1">

          {/* NOTIFICATIONS */}
          <NotificationBell userRole={userRole} />

          {/* SETTINGS */}
          <button
            type="button"
            onClick={onSettingsClick}
            className="
              hidden h-10 w-10 items-center justify-center
              rounded-lg text-slate-500
              transition-all duration-200
              hover:bg-slate-100
              hover:text-emerald-600
              active:scale-95
              focus:outline-none
              focus:ring-2
              focus:ring-emerald-500
              focus:ring-offset-2
              sm:flex
            "
            aria-label="Open settings"
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>

          {/* DIVIDER */}
          <div className="mx-2 hidden h-6 w-px bg-slate-200 sm:block" />

          {/* PROFILE */}
          <ProfileDropdown
            userName={userName}
            userRole={userRole}
            availableRoles={roles}
            onProfileClick={onProfileClick}
            onVerifyClick={onVerifyClick}
            onSettingsClick={onSettingsClick}
            onSwitchRole={handleRoleAction}
            onLogout={onLogout}
          />
        </div>
      </div>
    </header>
  );
};

export default TopBar;