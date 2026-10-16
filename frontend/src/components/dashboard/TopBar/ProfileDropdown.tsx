import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDownIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

import Avatar from "@/components/shared/Avatar";

import type { User } from "@/shared/types";

type UserRole = "CLIENT" | "WORKER";

type ProfileDropdownProps = {
  user?: User | null;
  userName?: string;
  userRole?: UserRole;
  availableRoles?: UserRole[];

  onProfileClick?: () => void;
  onVerifyClick?: () => void;
  onSettingsClick?: () => void;

  onSwitchRole?: (role: UserRole) => void;

  onLogout?: () => void;
};

const ProfileDropdown = ({
  user,
  userName = "User",
  userRole = "CLIENT",
  availableRoles = [userRole],

  onProfileClick,
  onVerifyClick,
  onSettingsClick,
  onSwitchRole,
  onLogout,
}: ProfileDropdownProps) => {
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  /*
   * Resolve the display name from the user object if available,
   * otherwise fall back to the userName prop.
   */
  const displayName =
    user?.full_name?.trim() ||
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() ||
    userName;

  const photoUrl = user?.profile_photo_url ?? null;

  const roles = Array.from(
    new Set(
      availableRoles.filter(
        (role): role is UserRole =>
          role === "CLIENT" || role === "WORKER"
      )
    )
  );

  if (!roles.includes(userRole)) {
    roles.push(userRole);
  }

  const currentRole =
    userRole === "CLIENT" ? "Client" : "Worker";

  const settingsBasePath =
    userRole === "CLIENT"
      ? "/client/dashboard/settings"
      : "/worker/dashboard/settings";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        profileRef.current &&
        profileRef.current.contains(target)
      ) {
        return;
      }

      setShowProfileMenu(false);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const closeMenu = () => {
    setShowProfileMenu(false);
  };

  const handleProfileClick = () => {
    closeMenu();

    if (onProfileClick) {
      onProfileClick();
      return;
    }

    navigate(`${settingsBasePath}/profile`);
  };

  const handleVerifyClick = () => {
    closeMenu();

    if (onVerifyClick) {
      onVerifyClick();
      return;
    }

    navigate(`${settingsBasePath}/verification`);
  };

  const handleSettingsClick = () => {
    closeMenu();

    if (onSettingsClick) {
      onSettingsClick();
      return;
    }

    navigate(`${settingsBasePath}/account`);
  };

  return (
    <div ref={profileRef} className="relative">
      {/* TRIGGER */}

      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setShowProfileMenu((prev) => !prev);
        }}
        className="
          flex shrink-0 items-center gap-1.5
          rounded-lg p-1 sm:gap-2.5
          transition-all duration-200
          hover:bg-slate-50
          active:scale-95
          focus:outline-none
          focus:ring-2 focus:ring-emerald-500
          focus:ring-offset-2
        "
        aria-label={`Open ${displayName}'s profile menu${user?.is_verified ? ", verified account" : ""}`}
        aria-expanded={showProfileMenu}
        aria-haspopup="true"
      >
        {/* AVATAR */}

        <Avatar
          photoUrl={photoUrl}
          name={displayName}
          size="md"
          className="ring-2 ring-white/30"
        />

        {/* NAME + CHEVRON */}

        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="hidden max-w-32 truncate text-sm font-medium text-slate-700 md:inline">
            {displayName}
          </span>

          {user?.is_verified === true && (
            <CheckBadgeIcon
              className="h-4 w-4 shrink-0 text-emerald-600"
              title="Verified account"
              aria-label="Verified account"
            />
          )}

          <ChevronDownIcon
            className={`
              h-4 w-4 text-slate-400
              transition-transform duration-200
              ${showProfileMenu ? "rotate-180" : ""}
            `}
          />
        </div>
      </button>

      {/* DROPDOWN */}

      {showProfileMenu && (
        <div
          className="
            absolute right-0 top-full z-50
            mt-2 w-72
            overflow-hidden
            rounded-xl
            border border-slate-200
            bg-white
            shadow-lg
            backdrop-blur-sm
          "
        >
          {/* HEADER */}

          <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent px-4 py-4">
            <Avatar
              photoUrl={photoUrl}
              name={displayName}
              size="md"
            />

            <div className="min-w-0">
              <p className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-slate-900">
                <span className="truncate">{displayName}</span>
                {user?.is_verified === true && (
                  <CheckBadgeIcon
                    className="h-4 w-4 shrink-0 text-emerald-600"
                    title="Verified account"
                    aria-label="Verified account"
                  />
                )}
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                {currentRole} account
              </p>
            </div>
          </div>

          {/* MENU */}

          <div className="py-1">
            <button
              type="button"
              onClick={handleProfileClick}
              className="
                group flex w-full
                items-center gap-3
                px-4 py-2.5
                text-left text-sm
                text-slate-600
                transition-colors duration-150
                hover:bg-slate-50
                active:bg-slate-100
              "
            >
              <UserCircleIcon className="h-4 w-4 text-slate-400 transition-colors group-hover:text-emerald-600" />

              <span className="font-medium">Profile</span>
            </button>

            <button
              type="button"
              onClick={handleVerifyClick}
              className="
                group flex w-full
                items-center gap-3
                px-4 py-2.5
                text-left text-sm
                text-slate-600
                transition-colors duration-150
                hover:bg-slate-50
                active:bg-slate-100
              "
            >
              <ShieldCheckIcon className="h-4 w-4 text-slate-400 transition-colors group-hover:text-emerald-600" />

              <span className="font-medium">Verify Details</span>
            </button>

            <button
              type="button"
              onClick={handleSettingsClick}
              className="
                group flex w-full
                items-center gap-3
                px-4 py-2.5
                text-left text-sm
                text-slate-600
                transition-colors duration-150
                hover:bg-slate-50
                active:bg-slate-100
              "
            >
              <Cog6ToothIcon className="h-4 w-4 text-slate-400 transition-colors group-hover:text-emerald-600" />

              <span className="font-medium">Settings</span>
            </button>

            <div className="my-1 border-t border-slate-100" />

            {onLogout && (
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();

                  closeMenu();
                  onLogout();
                }}
                className="
                  group flex w-full
                  items-center gap-3
                  px-4 py-2.5
                  text-left text-sm
                  font-medium
                  text-red-600
                  transition-colors duration-150
                  hover:bg-red-50
                  active:bg-red-100
                "
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 transition-colors group-hover:text-red-700" />

                <span>Sign out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
