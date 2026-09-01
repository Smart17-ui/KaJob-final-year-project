import {
  HomeIcon,
  BriefcaseIcon,
  PlusCircleIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

import { NavLink, useNavigate } from "react-router-dom";

type SidebarProps = {
  role?: "CLIENT" | "WORKER";
  isOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
  onSwitchRole?: () => void;
};

const Sidebar = ({
  role = "CLIENT",
  isOpen = false,
  onClose,
  onLogout,
  onSwitchRole,
}: SidebarProps) => {
  const navigate = useNavigate();

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
      description: "Dashboard home",
    },
    {
      name: "My Jobs",
      path: `${dashboardPath}/jobs`,
      icon: BriefcaseIcon,
      description: "Manage postings",
    },
    {
      name: "Post a Job",
      path: `${dashboardPath}/post-job`,
      icon: PlusCircleIcon,
      description: "Create new job",
    },
    {
      name: "Applications",
      path: `${dashboardPath}/applications`,
      icon: DocumentTextIcon,
      description: "Review submissions",
    },
    {
      name: "Messages",
      path: `${dashboardPath}/messages`,
      icon: ChatBubbleLeftRightIcon,
      description: "Chat with workers",
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
      description: "Dashboard home",
    },
    {
      name: "Find Jobs",
      path: `${dashboardPath}/jobs`,
      icon: BriefcaseIcon,
      description: "Browse opportunities",
    },
    {
      name: "My Applications",
      path: `${dashboardPath}/applications`,
      icon: DocumentTextIcon,
      description: "Your submissions",
    },
    {
      name: "My Work",
      path: `${dashboardPath}/my-jobs`,
      icon: BriefcaseIcon,
      description: "Active assignments",
    },
    {
      name: "Messages",
      path: `${dashboardPath}/messages`,
      icon: ChatBubbleLeftRightIcon,
      description: "Client conversations",
    },
  ];

  /* =========================
     SELECT NAVIGATION
  ========================= */

  const navigation = role === "CLIENT" ? clientLinks : workerLinks;

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

  /* =========================
     RENDER
  ========================= */

  return (
    <>
      {/* OVERLAY - Mobile & Tablet */}
      {isOpen && (
        <div
          onClick={onClose}
          className="
            fixed
            inset-0
            z-40
            bg-slate-950/20
            backdrop-blur-sm
            transition-opacity duration-300
            lg:hidden
          "
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR DRAWER */}
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
          shadow-lg
          transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          lg:shadow-none
        `}
      >
        {/* HEADER - Close Button */}
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
          {/* Logo/Branding Space */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
              <span className="text-xs font-bold text-white">KJ</span>
            </div>
            <span className="hidden text-sm font-semibold text-slate-900 sm:block">
              KaJob
            </span>
          </div>

          {/* Close Button - Mobile Only */}
          <button
            type="button"
            onClick={onClose}
            className="
              flex items-center justify-center
              h-9 w-9
              rounded-lg
              text-slate-500
              transition-all duration-150
              hover:bg-slate-100
              hover:text-slate-700
              active:scale-95
              focus:outline-none focus:ring-2 focus:ring-emerald-500
              lg:hidden
            "
            aria-label="Close navigation menu"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* WORKSPACE SECTION */}
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {role === "CLIENT" ? "Client" : "Worker"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {role === "CLIENT"
              ? "Post and manage jobs"
              : "Find and apply to jobs"}
          </p>
        </div>

        {/* MAIN NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Menu
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === dashboardPath}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `
                      group relative flex
                      items-center gap-3
                      rounded-lg
                      px-3 py-2.5
                      text-sm font-medium
                      transition-all duration-150
                      outline-none
                      focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                      ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }
                    `
                  }
                  title={item.description}
                >
                  {({ isActive }) => (
                    <>
                      {/* Active Indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-lg bg-gradient-to-b from-emerald-400 to-emerald-600" />
                      )}

                      {/* Icon */}
                      <Icon
                        className={`
                          h-5 w-5
                          flex-shrink-0
                          transition-colors duration-150
                          ${
                            isActive
                              ? "text-emerald-600"
                              : "text-slate-400 group-hover:text-emerald-500"
                          }
                        `}
                      />

                      {/* Label */}
                      <span className="flex-1">{item.name}</span>

                      {/* Badge Indicator (Optional - for new items) */}
                      {item.path.includes("applications") && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
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

        {/* BOTTOM SECTION - Actions */}
        <div className="flex-shrink-0 border-t border-slate-100 bg-gradient-to-t from-slate-50 to-transparent p-4">
          {/* Switch Role Button */}
          {onSwitchRole && (
            <button
              type="button"
              onClick={() => {
                onSwitchRole();
                onClose?.();
              }}
              className="
                group mb-3 flex w-full
                items-center gap-3
                rounded-lg
                border border-emerald-200
                bg-emerald-50 px-3 py-2.5
                text-sm font-medium
                text-emerald-700
                transition-all duration-150
                hover:border-emerald-300
                hover:bg-emerald-100
                active:scale-95
                focus:outline-none focus:ring-2 focus:ring-emerald-500
              "
            >
              <SparklesIcon className="h-5 w-5 text-emerald-600" />
              <span>Switch Role</span>
            </button>
          )}

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="
              group flex w-full
              items-center gap-3
              rounded-lg
              px-3 py-2.5
              text-sm font-medium
              text-slate-600
              transition-all duration-150
              hover:bg-red-50
              hover:text-red-600
              active:scale-95
              focus:outline-none focus:ring-2 focus:ring-red-500
            "
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 text-slate-400 transition-colors group-hover:text-red-500" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
