import {
  HomeIcon,
  BriefcaseIcon,
  PlusCircleIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowsRightLeftIcon,
  PlusIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useState } from "react";

type UserRole = "CLIENT" | "WORKER";

type SidebarProps = {
  role?: UserRole;
  availableRoles?: UserRole[];
  isOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
  onSwitchRole?: (role: UserRole) => void;
};

const Sidebar = ({
  role = "CLIENT",
  availableRoles = [role],
  isOpen = false,
  onClose,
  onLogout,
  onSwitchRole,
}: SidebarProps) => {
  const navigate = useNavigate();

  const [showRoleMenu, setShowRoleMenu] =
    useState(false);

  const dashboardPath =
    role === "CLIENT"
      ? "/client/dashboard"
      : "/worker/dashboard";

  /*
   * =========================================================
   * AVAILABLE ROLES
   * =========================================================
   */

  const roles = Array.from(
    new Set(
      availableRoles.filter(
        (availableRole): availableRole is UserRole =>
          availableRole === "CLIENT" ||
          availableRole === "WORKER"
      )
    )
  );

  /*
   * Always include the current role.
   */
  if (!roles.includes(role)) {
    roles.push(role);
  }

  const hasMultipleRoles =
    roles.length > 1;

  /*
   * =========================================================
   * MISSING ROLE
   * =========================================================
   */

  const otherRole: UserRole =
    role === "CLIENT"
      ? "WORKER"
      : "CLIENT";

  const missingRole: UserRole | null =
    hasMultipleRoles
      ? null
      : otherRole;

  const missingRoleLabel =
    missingRole === "CLIENT"
      ? "Client"
      : "Worker";

  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
   */

  const clientLinks = [
    {
      name: "Overview",
      path: dashboardPath,
      icon: HomeIcon,
    },
    {
      name: "My Jobs",
      path: `${dashboardPath}/jobs`,
      icon: BriefcaseIcon,
    },
    {
      name: "Post a Job",
      path: `${dashboardPath}/post-job`,
      icon: PlusCircleIcon,
    },
    {
      name: "Applications",
      path: `${dashboardPath}/applications`,
      icon: DocumentTextIcon,
    },
    {
      name: "Complaints",
      path: `${dashboardPath}/complaints`,
      icon: ExclamationTriangleIcon,
    },
  ];

  const workerLinks = [
    {
      name: "Overview",
      path: dashboardPath,
      icon: HomeIcon,
    },
    {
      name: "Find Jobs",
      path: `${dashboardPath}/find-jobs`,
      icon: BriefcaseIcon,
    },
    {
      name: "My Applications",
      path: `${dashboardPath}/applications`,
      icon: DocumentTextIcon,
    },
    {
      name: "My Work",
      path: `${dashboardPath}/my-work`,
      icon: BriefcaseIcon,
    },
    {
      name: "Complaints",
      path: `${dashboardPath}/complaints`,
      icon: ExclamationTriangleIcon,
    },
  ];

  const navigation =
    role === "CLIENT"
      ? clientLinks
      : workerLinks;

  /*
   * =========================================================
   * ROLE ACTION
   * =========================================================
   */

  const handleRoleAction = (
    selectedRole: UserRole
  ) => {
    setShowRoleMenu(false);
    onSwitchRole?.(selectedRole);
    onClose?.();
  };

  /*
   * =========================================================
   * LOGOUT
   * =========================================================
   */

  function handleLogout() {
    if (onLogout) {
      onLogout();
    } else {
      navigate("/");
    }

    onClose?.();
  }

  /*
   * =========================================================
   * CLOSE ROLE MENU WHEN SIDEBAR CLOSES
   * =========================================================
   */

  function handleCloseSidebar() {
    setShowRoleMenu(false);
    onClose?.();
  }

  return (
    <>
      {/* =====================================================
          MOBILE OVERLAY
          ===================================================== */}

      {isOpen && (
        <div
          onClick={handleCloseSidebar}
          className="
            fixed
            inset-0
            z-40
            bg-slate-950/20
            backdrop-blur-sm
            lg:hidden
          "
          aria-hidden="true"
        />
      )}

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          w-64
          flex-col
          bg-white
          border-r
          border-slate-100
          transition-transform
          duration-300
          ease-in-out
          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
          lg:translate-x-0
        `}
      >
        {/* ===================================================
            HEADER
            =================================================== */}

        <div
          className="
            flex
            h-16
            flex-shrink-0
            items-center
            justify-between
            border-b
            border-slate-100
            px-5
          "
        >
          <div className="flex items-center gap-2.5">
            <div
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                bg-gradient-to-br
                from-emerald-400
                to-emerald-600
                shadow-sm
              "
            >
              <span className="text-xs font-bold text-white">
                KJ
              </span>
            </div>

            <span className="text-sm font-semibold text-slate-900">
              KaJob
            </span>
          </div>

          <button
            type="button"
            onClick={handleCloseSidebar}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
              active:scale-95
              focus:outline-none
              focus:ring-2
              focus:ring-emerald-500
              lg:hidden
            "
            aria-label="Close navigation menu"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* ===================================================
            CURRENT ROLE
            =================================================== */}

        <div className="px-4 pt-5 pb-3">
          <div
            className="
              flex
              items-center
              gap-3
              rounded-xl
              bg-slate-50
              px-3
              py-2.5
            "
          >
            <div
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                bg-white
                shadow-sm
              "
            >
              <span className="text-xs font-bold text-emerald-600">
                {role === "CLIENT"
                  ? "C"
                  : "W"}
              </span>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Current role
              </p>

              <p className="truncate text-sm font-semibold text-slate-800">
                {role === "CLIENT"
                  ? "Client"
                  : "Worker"}
              </p>
            </div>
          </div>
        </div>

        {/* ===================================================
            NAVIGATION
            =================================================== */}

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={
                    item.path ===
                    dashboardPath
                  }
                  onClick={handleCloseSidebar}
                  className={({ isActive }) =>
                    `
                      group
                      relative
                      flex
                      items-center
                      gap-3
                      rounded-lg
                      px-3
                      py-2.5
                      text-sm
                      font-medium
                      transition-all
                      duration-150
                      outline-none
                      focus:ring-2
                      focus:ring-emerald-500
                      focus:ring-offset-1
                      ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }
                    `
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div
                          className="
                            absolute
                            left-0
                            top-1.5
                            bottom-1.5
                            w-0.5
                            rounded-r-full
                            bg-emerald-500
                          "
                        />
                      )}

                      <Icon
                        className={`
                          h-5
                          w-5
                          flex-shrink-0
                          transition-colors
                          duration-150
                          ${
                            isActive
                              ? "text-emerald-600"
                              : "text-slate-400 group-hover:text-emerald-500"
                          }
                        `}
                      />

                      <span className="flex-1">
                        {item.name}
                      </span>

                      {item.path.includes(
                        "applications"
                      ) && (
                        <span
                          className="
                            flex
                            h-5
                            min-w-5
                            items-center
                            justify-center
                            rounded-full
                            bg-amber-100
                            px-1
                            text-[10px]
                            font-bold
                            text-amber-700
                          "
                        >
                          3
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* ===================================================
            BOTTOM ACTIONS
            =================================================== */}

        <div
          className="
            relative
            flex-shrink-0
            border-t
            border-slate-100
            px-3
            py-3
          "
        >


          {/* =================================================
              LOGOUT
              ================================================= */}

          <button
            type="button"
            onClick={handleLogout}
            className="
              group
              mt-1.5
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              py-2.5
              text-sm
              font-medium
              text-slate-600
              transition
              hover:bg-red-50
              hover:text-red-600
              active:scale-[0.98]
              focus:outline-none
              focus:ring-2
              focus:ring-red-500
            "
          >
            <ArrowRightOnRectangleIcon
              className="
                h-5
                w-5
                text-slate-400
                transition-colors
                group-hover:text-red-500
              "
            />

            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;