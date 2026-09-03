import { useState } from "react";
import {
  ChevronDownIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowsRightLeftIcon,
  CheckIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

type ProfileDropdownProps = {
  userName?: string;
  userRole?: "CLIENT" | "WORKER";

  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onSwitchRole?: () => void;
  onLogout?: () => void;
};

const ProfileDropdown = ({
  userName = "User",
  userRole = "CLIENT",
  onProfileClick,
  onSettingsClick,
  onSwitchRole,
  onLogout,
}: ProfileDropdownProps) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const initials = userName
    .split(" ")
    .map((name) => name.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const currentRole = userRole === "CLIENT" ? "Client" : "Worker";
  const otherRole = userRole === "CLIENT" ? "Worker" : "Client";

  return (
    <div className="relative">
      {/* PROFILE TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => {
          setShowProfileMenu((prev) => !prev);
          setShowRoleSwitcher(false);
        }}
        className="
          flex items-center gap-2.5
          rounded-lg p-1
          transition-all duration-200
          hover:bg-slate-50
          active:scale-95
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
        "
        aria-label="Open profile menu"
        aria-expanded={showProfileMenu}
      >
        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600">
          <span className="text-xs font-bold text-white">
            {initials}
          </span>
        </div>

        {/* Name & Chevron */}
        <div className="hidden items-center gap-1.5 md:flex">
          <span className="max-w-32 truncate text-sm font-medium text-slate-700">
            {userName}
          </span>
          <ChevronDownIcon
            className={`
              h-4 w-4 transition-transform duration-200
              ${showProfileMenu ? "rotate-180" : ""}
              text-slate-400
            `}
          />
        </div>
      </button>

      {/* DROPDOWN MENU */}
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
          {/* Account Header */}
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent px-4 py-4">
            <p className="truncate text-sm font-semibold text-slate-900">
              {userName}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {currentRole} account
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {/* Profile */}
            <button
              type="button"
              onClick={() => {
                setShowProfileMenu(false);
                onProfileClick?.();
              }}
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

            {/* Settings */}
            <button
              type="button"
              onClick={() => {
                setShowProfileMenu(false);
                onSettingsClick?.();
              }}
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

            {/* Divider */}
            <div className="my-1 border-t border-slate-100" />

            {/* Switch Role */}
            <button
              type="button"
              onClick={() => setShowRoleSwitcher((prev) => !prev)}
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
              <ArrowsRightLeftIcon className="h-4 w-4 text-slate-400 transition-colors group-hover:text-emerald-600" />
              <span className="flex-1 font-medium">
                Switch role
              </span>
              <ChevronDownIcon
                className={`
                  h-4 w-4 transition-transform duration-200
                  ${showRoleSwitcher ? "rotate-180" : ""}
                  text-slate-400
                `}
              />
            </button>

            {/* Role Options */}
            {showRoleSwitcher && (
              <div className="border-t border-slate-100 bg-slate-50 px-2 py-2">
                {/* Current Role */}
                <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600">
                    <span className="text-xs font-bold text-white">
                      {initials}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {currentRole}
                    </p>
                    <p className="text-xs text-slate-500">
                      Active
                    </p>
                  </div>
                  <CheckIcon className="h-4 w-4 text-emerald-600" />
                </div>

                {/* Other Role Option */}
                {onSwitchRole && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowRoleSwitcher(false);
                      onSwitchRole();
                    }}
                    className="
                      mt-1 flex w-full
                      items-center gap-3
                      rounded-lg
                      px-3 py-2.5
                      text-left text-sm
                      transition-all duration-150
                      hover:bg-white
                      active:scale-95
                    "
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
                      <ArrowsRightLeftIcon className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">
                        {otherRole}
                      </p>
                      <p className="text-xs text-slate-500">
                        Switch to {otherRole.toLowerCase()}
                      </p>
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* Divider */}
            <div className="my-1 border-t border-slate-100" />

            {/* Logout */}
            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
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
