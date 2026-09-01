import { useState } from "react";

import {
  ChevronDownIcon,
  BellIcon,
  UserCircleIcon,
  Bars3Icon,
  CheckIcon,
} from "@heroicons/react/24/outline";

type TopBarProps = {
  userName?: string;
  userRole?: "CLIENT" | "WORKER";
  onMenuOpen?: () => void;
  onNotificationsClick?: () => void;
  onProfileClick?: () => void;
  onLogout?: () => void;
};

const TopBar = ({
  userName = "User",
  userRole = "CLIENT",
  onMenuOpen,
  onNotificationsClick,
  onProfileClick,
  onLogout,
}: TopBarProps) => {
  const [timeFilter, setTimeFilter] =
    useState("Last week");

  const [showTimeMenu, setShowTimeMenu] =
    useState(false);

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  const timeOptions = [
    "Today",
    "Last week",
    "Last month",
    "Last quarter",
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";

    return "Good evening";
  };

  const initials = userName
    .split(" ")
    .map((name) => name.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* ================= LEFT ================= */}

          <div className="flex min-w-0 items-center gap-3">
            {/* Mobile menu */}

            <button
              type="button"
              onClick={onMenuOpen}
              className="
                rounded-md p-2
                text-slate-600
                hover:bg-slate-100
                md:hidden
              "
              aria-label="Open sidebar"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                {getGreeting()}, {userName}
              </h1>

              <p className="mt-1 hidden text-sm text-slate-500 sm:block">
                Here are your latest insights
                from your activity.
              </p>
            </div>
          </div>

          {/* ================= ACTIONS ================= */}

          <div className="flex flex-shrink-0 items-center gap-1">
            {/* Time filter */}

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setShowTimeMenu(
                    (previous) => !previous
                  )
                }
                className="
                  flex items-center gap-2
                  rounded-md
                  border border-slate-200
                  bg-white
                  px-3 py-2
                  text-xs font-medium
                  text-slate-700
                  transition
                  hover:bg-slate-50
                "
                aria-expanded={showTimeMenu}
              >
                <span className="hidden sm:inline">
                  {timeFilter}
                </span>

                <span className="sm:hidden">
                  {timeFilter === "Last week"
                    ? "Week"
                    : timeFilter}
                </span>

                <ChevronDownIcon
                  className={`
                    h-3.5 w-3.5
                    text-slate-400
                    transition-transform
                    ${
                      showTimeMenu
                        ? "rotate-180"
                        : ""
                    }
                  `}
                />
              </button>

              {showTimeMenu && (
                <div
                  className="
                    absolute right-0 top-full z-30
                    mt-2 w-40
                    overflow-hidden
                    rounded-lg
                    border border-slate-200
                    bg-white
                    py-1
                    shadow-xl
                  "
                >
                  {timeOptions.map(
                    (option) => {
                      const active =
                        timeFilter === option;

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setTimeFilter(
                              option
                            );
                            setShowTimeMenu(
                              false
                            );
                          }}
                          className="
                            flex w-full
                            items-center
                            justify-between
                            px-3 py-2.5
                            text-left text-xs
                            transition
                            hover:bg-slate-50
                          "
                        >
                          <span
                            className={
                              active
                                ? "font-semibold text-emerald-700"
                                : "text-slate-600"
                            }
                          >
                            {option}
                          </span>

                          {active && (
                            <CheckIcon className="h-4 w-4 text-emerald-600" />
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            {/* Notifications */}

            <button
              type="button"
              onClick={onNotificationsClick}
              className="
                relative ml-1
                rounded-md p-2
                text-slate-500
                transition
                hover:bg-slate-100
                hover:text-slate-700
              "
              aria-label="Notifications"
            >
              <BellIcon className="h-5 w-5" />

              <span
                className="
                  absolute right-1.5 top-1.5
                  h-1.5 w-1.5
                  rounded-full
                  bg-emerald-500
                  ring-2 ring-white
                "
              />
            </button>

            {/* Profile */}

            <div className="relative ml-1">
              <button
                type="button"
                onClick={() =>
                  setShowProfileMenu(
                    (previous) => !previous
                  )
                }
                className="
                  flex items-center
                  rounded-md p-1.5
                  transition
                  hover:bg-slate-100
                "
                aria-label="Open profile menu"
                aria-expanded={
                  showProfileMenu
                }
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                  <span className="text-[11px] font-bold text-emerald-700">
                    {initials}
                  </span>
                </div>
              </button>

              {showProfileMenu && (
                <div
                  className="
                    absolute right-0 top-full z-30
                    mt-2 w-52
                    overflow-hidden
                    rounded-lg
                    border border-slate-200
                    bg-white
                    shadow-xl
                  "
                >
                  {/* User */}

                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {userName}
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {userRole === "CLIENT"
                        ? "Client account"
                        : "Worker account"}
                    </p>
                  </div>

                  {/* Profile */}

                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(
                        false
                      );
                      onProfileClick?.();
                    }}
                    className="
                      flex w-full
                      items-center gap-3
                      px-4 py-3
                      text-left text-xs
                      font-medium
                      text-slate-600
                      hover:bg-slate-50
                    "
                  >
                    <UserCircleIcon className="h-4 w-4 text-slate-400" />

                    <span>View profile</span>
                  </button>

                  {/* Logout */}

                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(
                          false
                        );
                        onLogout();
                      }}
                      className="
                        flex w-full
                        items-center gap-3
                        border-t border-slate-100
                        px-4 py-3
                        text-left text-xs
                        font-medium
                        text-red-500
                        hover:bg-red-50
                      "
                    >
                      <span>Logout</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;