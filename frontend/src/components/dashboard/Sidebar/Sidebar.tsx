import {
  HomeIcon,
  BriefcaseIcon,
  PlusCircleIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  ArrowsRightLeftIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { getCurrentUser } from "@/shared/auth";
import Logo from "@/assets/Logo.png";

type SidebarProps = {
  role?: "CLIENT" | "WORKER";
  isOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
  onSwitchRole?: () => void;
  roleActionText?: string;
};

const Sidebar = ({
  role = "CLIENT",
  isOpen = true,
  onClose,
  onLogout,
  onSwitchRole,
  roleActionText,
}: SidebarProps) => {
  const navigate = useNavigate();

  /* =========================
     CURRENT USER
  ========================= */

  const user = getCurrentUser();

  /* =========================
     USER ROLES
  ========================= */

  const hasClientRole = Boolean(
    user?.is_client
  );

  const hasWorkerRole = Boolean(
    user?.is_worker
  );

  const hasBothRoles =
    hasClientRole && hasWorkerRole;

  /* =========================
     DASHBOARD BASE PATH
  ========================= */

  const dashboardPath =
    role === "CLIENT"
      ? "/client/dashboard"
      : "/worker/dashboard";

  /* =========================
     CLIENT NAVIGATION
  ========================= */

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
      name: "Messages",
      path: `${dashboardPath}/messages`,
      icon: ChatBubbleLeftRightIcon,
    },
  ];

  /* =========================
     WORKER NAVIGATION
  ========================= */

  const workerLinks = [
    {
      name: "Overview",
      path: dashboardPath,
      icon: HomeIcon,
    },
    {
      name: "Find Jobs",
      path: `${dashboardPath}/jobs`,
      icon: BriefcaseIcon,
    },
    {
      name: "My Applications",
      path: `${dashboardPath}/applications`,
      icon: DocumentTextIcon,
    },
    {
      name: "My Work",
      path: `${dashboardPath}/work`,
      icon: BriefcaseIcon,
    },
    {
      name: "Messages",
      path: `${dashboardPath}/messages`,
      icon: ChatBubbleLeftRightIcon,
    },
  ];

  /* =========================
     SELECT NAVIGATION
  ========================= */

  const navigation =
    role === "CLIENT"
      ? clientLinks
      : workerLinks;

  /* =========================
     ROLE BUTTON TEXT
  ========================= */

  const defaultRoleButtonText =
    hasBothRoles
      ? role === "CLIENT"
        ? "Switch to Worker"
        : "Switch to Client"
      : role === "CLIENT"
      ? "Add Worker Role"
      : "Add Client Role";

  const buttonText =
    roleActionText ||
    defaultRoleButtonText;

  /* =========================
     ROLE BUTTON ICON
  ========================= */

  const RoleButtonIcon =
    hasBothRoles
      ? ArrowsRightLeftIcon
      : UserPlusIcon;

  /* =========================
     ROLE ACTION
  ========================= */

  function handleRoleAction() {
    /*
     * USER HAS BOTH ROLES
     *
     * Switch between dashboards.
     */

    if (hasBothRoles) {
      onSwitchRole?.();
      onClose?.();

      return;
    }

    /*
     * USER ONLY HAS CLIENT ROLE
     *
     * Add Worker Role.
     */

    if (
      role === "CLIENT" &&
      hasClientRole &&
      !hasWorkerRole
    ) {
      navigate(
        "/client/dashboard/settings"
      );

      onClose?.();

      return;
    }

    /*
     * USER ONLY HAS WORKER ROLE
     *
     * Add Client Role.
     */

    if (
      role === "WORKER" &&
      hasWorkerRole &&
      !hasClientRole
    ) {
      navigate(
        "/worker/dashboard/settings"
      );

      onClose?.();

      return;
    }
  }

  /* =========================
     LOGOUT
  ========================= */

  function handleLogout() {
    if (onLogout) {
      onLogout();
    } else {
      navigate("/");
    }

    onClose?.();
  }

  return (
    <>
      {/* =========================
          MOBILE OVERLAY
      ========================= */}

      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
        />
      )}

      {/* =========================
          SIDEBAR
      ========================= */}

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
          border-r
          border-slate-200
          bg-white
          transition-transform
          duration-300
          md:translate-x-0
          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* =========================
            LOGO
        ========================= */}

        <div
          className="
            flex
            h-20
            flex-shrink-0
            items-center
            justify-between
            border-b
            border-slate-100
            px-6
          "
        >
          <NavLink
            to={dashboardPath}
            onClick={onClose}
            className="flex items-center"
          >
            <img
              src={Logo}
              alt="KaJob"
              className="
                h-10
                w-auto
                object-contain
              "
            />
          </NavLink>

          {/* MOBILE CLOSE */}

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg
              p-2
              text-slate-500
              transition-colors
              hover:bg-slate-100
              hover:text-slate-700
              md:hidden
            "
            aria-label="Close menu"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* =========================
            MAIN NAVIGATION
        ========================= */}

        <nav
          className="
            flex-1
            px-4
            pt-6
          "
        >
          <p
            className="
              mb-3
              px-3
              text-xs
              font-semibold
              uppercase
              tracking-wider
              text-slate-400
            "
          >
            Menu
          </p>

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
                  onClick={onClose}
                  className={({ isActive }) =>
                    `
                    group
                    flex
                    items-center
                    gap-3
                    rounded-lg
                    px-3
                    py-3
                    text-sm
                    font-medium
                    transition-all
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
                      <Icon
                        className={`
                          h-5
                          w-5
                          flex-shrink-0
                          ${
                            isActive
                              ? "text-emerald-600"
                              : "text-slate-400 group-hover:text-slate-600"
                          }
                        `}
                      />

                      <span>
                        {item.name}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* =========================
            BOTTOM SECTION
        ========================= */}

        <div
          className="
            flex-shrink-0
            border-t
            border-slate-100
            p-4
          "
        >

          {/* =========================
              SWITCH / ADD ROLE
          ========================= */}

          <button
            type="button"
            onClick={handleRoleAction}
            className="
              group
              mb-2
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              border
              border-emerald-100
              bg-emerald-50
              px-3
              py-3
              text-sm
              font-semibold
              text-emerald-700
              transition-all
              hover:border-emerald-200
              hover:bg-emerald-100
            "
          >
            <div
              className="
                flex
                h-8
                w-8
                flex-shrink-0
                items-center
                justify-center
                rounded-lg
                bg-white
                shadow-sm
              "
            >
              <RoleButtonIcon
                className="
                  h-5
                  w-5
                  text-emerald-600
                "
              />
            </div>

            <span>
              {buttonText}
            </span>
          </button>

          {/* =========================
              LOGOUT
          ========================= */}

          <button
            type="button"
            onClick={handleLogout}
            className="
              group
              flex
              w-full
              items-center
              gap-3
              rounded-lg
              px-3
              py-3
              text-sm
              font-medium
              text-slate-600
              transition-colors
              hover:bg-red-50
              hover:text-red-600
            "
          >
            <ArrowRightOnRectangleIcon
              className="
                h-5
                w-5
                text-slate-400
                group-hover:text-red-500
              "
            />

            <span>
              Logout
            </span>
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;