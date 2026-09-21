import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDownIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  ArrowsRightLeftIcon,
  CheckIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

type UserRole = "CLIENT" | "WORKER";

type ProfileDropdownProps = {
  userName?: string;
  userRole?: UserRole;
  availableRoles?: UserRole[];

  onProfileClick?: () => void;
  onVerifyClick?: () => void;
  onSettingsClick?: () => void;

  /*
   * Called when the user selects an existing role
   * or wants to add a missing role.
   *
   * The parent component can decide whether this
   * should call switch-role or add-role.
   */
  onSwitchRole?: (role: UserRole) => void;

  onLogout?: () => void;
};

const ProfileDropdown = ({
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
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  /*
   * Make sure we only work with valid unique roles.
   */
  const roles = Array.from(
    new Set(
      availableRoles.filter(
        (role): role is UserRole =>
          role === "CLIENT" || role === "WORKER"
      )
    )
  );

  /*
   * Always make sure the current role is represented.
   */
  if (!roles.includes(userRole)) {
    roles.push(userRole);
  }

  const hasMultipleRoles = roles.length > 1;

  const otherRole: UserRole =
    userRole === "CLIENT" ? "WORKER" : "CLIENT";

  const currentRole =
    userRole === "CLIENT" ? "Client" : "Worker";

  const otherRoleLabel =
    otherRole === "CLIENT" ? "Client" : "Worker";

  /*
   * If the user has only one role, the missing role
   * becomes the role they can add to their account.
   */
  const missingRole: UserRole | null = hasMultipleRoles
    ? null
    : otherRole;

  const missingRoleLabel =
    missingRole === "CLIENT"
      ? "Client"
      : "Worker";

  /*
   * Settings route for the currently active role.
   */
  const settingsBasePath =
    userRole === "CLIENT"
      ? "/client/dashboard/settings"
      : "/worker/dashboard/settings";

  /*
   * User initials.
   */
  const initials = userName
    .split(" ")
    .map((name) => name.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  /*
   * Close profile menu when clicking outside.
   */
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
      setShowRoleSwitcher(false);
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /*
   * Go to Profile settings.
   */
  const handleProfileClick = () => {
    setShowProfileMenu(false);
    setShowRoleSwitcher(false);

    navigate(`${settingsBasePath}/profile`);
  };

  /*
   * Go to Verification settings.
   */
  const handleVerifyClick = () => {
    setShowProfileMenu(false);
    setShowRoleSwitcher(false);

    navigate(`${settingsBasePath}/verification`);
  };

  /*
   * Go to Settings.
   */
  const handleSettingsClick = () => {
    setShowProfileMenu(false);
    setShowRoleSwitcher(false);

    navigate(`${settingsBasePath}/profile`);
  };

  /*
   * Select an existing role.
   */
  const handleSelectRole = (role: UserRole) => {
    setShowProfileMenu(false);
    setShowRoleSwitcher(false);

    onSwitchRole?.(role);
  };

  /*
   * Add the missing role.
   *
   * We still use onSwitchRole here because the parent
   * will decide whether this action means "add role"
   * or "switch role".
   */
  const handleAddRole = (role: UserRole) => {
    setShowProfileMenu(false);
    setShowRoleSwitcher(false);

    onSwitchRole?.(role);
  };

  return (
    <div
      ref={profileRef}
      className="relative"
    >
      {/* =====================================================
          PROFILE TRIGGER BUTTON
          ===================================================== */}

      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();

          setShowProfileMenu((prev) => !prev);
          setShowRoleSwitcher(false);
        }}
        className="
          flex items-center gap-2.5
          rounded-lg p-1
          transition-all duration-200
          hover:bg-slate-50
          active:scale-95
          focus:outline-none
          focus:ring-2 focus:ring-emerald-500
          focus:ring-offset-2
        "
        aria-label="Open profile menu"
        aria-expanded={showProfileMenu}
        aria-haspopup="true"
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
              h-4 w-4 text-slate-400
              transition-transform duration-200
              ${showProfileMenu ? "rotate-180" : ""}
            `}
          />
        </div>
      </button>

      {/* =====================================================
          DROPDOWN MENU
          ===================================================== */}

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
          {/* =================================================
              ACCOUNT HEADER
              ================================================= */}

          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent px-4 py-4">
            <p className="truncate text-sm font-semibold text-slate-900">
              {userName}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {currentRole} account
            </p>
          </div>

          {/* =================================================
              MENU ITEMS
              ================================================= */}

          <div className="py-1">
            {/* Profile */}

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

              <span className="font-medium">
                Profile
              </span>
            </button>

            {/* Verify Details */}

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

              <span className="font-medium">
                Verify Details
              </span>
            </button>

            {/* Settings */}

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

              <span className="font-medium">
                Settings
              </span>
            </button>

            {/* Divider */}

            <div className="my-1 border-t border-slate-100" />

            {/* =================================================
                SWITCH / ADD ROLE
                ================================================= */}

            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                setShowRoleSwitcher((prev) => !prev);
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
              <ArrowsRightLeftIcon className="h-4 w-4 text-slate-400 transition-colors group-hover:text-emerald-600" />

              <span className="flex-1 font-medium">
                {hasMultipleRoles
                  ? "Switch role"
                  : "Add another role"}
              </span>

              <ChevronDownIcon
                className={`
                  h-4 w-4 text-slate-400
                  transition-transform duration-200
                  ${showRoleSwitcher ? "rotate-180" : ""}
                `}
              />
            </button>

            {/* =================================================
                ROLE OPTIONS
                ================================================= */}

            {showRoleSwitcher && (
              <div className="border-t border-slate-100 bg-slate-50 px-2 py-2">
                {/* =================================================
                    MULTIPLE ROLES
                    ================================================= */}

                {hasMultipleRoles &&
                  roles.map((role) => {
                    const roleLabel =
                      role === "CLIENT"
                        ? "Client"
                        : "Worker";

                    const isCurrentRole =
                      role === userRole;

                    return (
                      <button
                        key={role}
                        type="button"
                        disabled={isCurrentRole}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();

                          if (!isCurrentRole) {
                            handleSelectRole(role);
                          }
                        }}
                        className={`
                          flex w-full
                          items-center gap-3
                          rounded-lg
                          px-3 py-2.5
                          text-left text-sm
                          transition-all duration-150
                          ${
                            isCurrentRole
                              ? "cursor-default bg-white"
                              : "hover:bg-white active:scale-[0.99]"
                          }
                        `}
                      >
                        {/* Role icon */}

                        <div
                          className={`
                            flex h-8 w-8
                            items-center justify-center
                            rounded-full
                            ${
                              isCurrentRole
                                ? "bg-emerald-100"
                                : "bg-slate-200"
                            }
                          `}
                        >
                          {isCurrentRole ? (
                            <CheckIcon className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <ArrowsRightLeftIcon className="h-4 w-4 text-slate-600" />
                          )}
                        </div>

                        {/* Role information */}

                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">
                            {roleLabel}
                          </p>

                          <p className="text-xs text-slate-500">
                            {isCurrentRole
                              ? "Active"
                              : `Switch to ${roleLabel.toLowerCase()}`}
                          </p>
                        </div>
                      </button>
                    );
                  })}

                {/* =================================================
                    SINGLE ROLE
                    ================================================= */}

                {!hasMultipleRoles && missingRole && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      handleAddRole(missingRole);
                    }}
                    className="
                      flex w-full
                      items-center gap-3
                      rounded-lg
                      px-3 py-2.5
                      text-left text-sm
                      transition-all duration-150
                      hover:bg-white
                      active:scale-[0.99]
                    "
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50">
                      <PlusIcon className="h-4 w-4 text-emerald-600" />
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">
                        Add {missingRoleLabel} Account
                      </p>

                      <p className="text-xs text-slate-500">
                        Add the {missingRoleLabel.toLowerCase()} role
                        to this account
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
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();

                  setShowProfileMenu(false);
                  setShowRoleSwitcher(false);

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

                <span>
                  Sign out
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
