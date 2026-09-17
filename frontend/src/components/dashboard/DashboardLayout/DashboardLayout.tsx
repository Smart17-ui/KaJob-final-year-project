import {
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useEffect, useState } from "react";

import Sidebar from "../Sidebar/Sidebar";
import TopBar from "../TopBar/TopBar";
import DashboardTabs from "../DashboardTabs/DashboardTabs";

import {
  getCurrentUser,
  getRefreshToken,
  clearAuth,
  getSelectedRole,
  setSelectedRole,
} from "@/shared/auth";

import { logoutUser } from "@/api/auth/auth";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = getCurrentUser();

  const selectedRole = getSelectedRole();

  const role =
    selectedRole ||
    (user?.is_worker
      ? "WORKER"
      : user?.is_client
      ? "CLIENT"
      : null);

  /*
   * Settings has its own internal navigation.
   *
   * When we are anywhere inside Settings:
   * - Dashboard sidebar is hidden on desktop
   * - Dashboard sidebar can still open as a mobile drawer
   * - DashboardTabs are hidden
   * - TopBar remains visible
   */
  const isSettingsPage =
    location.pathname.includes("/settings");

  useEffect(() => {
    if (!user || !role) {
      clearAuth();

      navigate("/", {
        replace: true,
      });
    }
  }, [user, role, navigate]);

  /*
   * Close the mobile sidebar whenever the route changes.
   */
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  async function handleLogout() {
    const refreshToken = getRefreshToken();

    try {
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    } finally {
      clearAuth();

      navigate("/", {
        replace: true,
      });
    }
  }

  function handleSwitchRole() {
    if (!user || !role) {
      return;
    }

    if (user.is_client && user.is_worker) {
      const nextRole =
        role === "CLIENT"
          ? "WORKER"
          : "CLIENT";

      setSelectedRole(nextRole);

      navigate(
        nextRole === "CLIENT"
          ? "/client/dashboard"
          : "/worker/dashboard",
        {
          replace: true,
        }
      );

      return;
    }

    if (
      role === "CLIENT" &&
      user.is_client &&
      !user.is_worker
    ) {
      console.log("Add Worker Role");
      return;
    }

    if (
      role === "WORKER" &&
      user.is_worker &&
      !user.is_client
    ) {
      console.log("Add Client Role");
      return;
    }
  }

  function handleProfile() {
    if (!role) {
      return;
    }

    navigate(
      `/${role.toLowerCase()}/dashboard/profile`
    );
  }

  function handleVerify() {
    if (!role) {
      return;
    }

    navigate(
      `/${role.toLowerCase()}/dashboard/verify`
    );
  }

  function handleSettings() {
    if (!role) {
      return;
    }

    navigate(
      `/${role.toLowerCase()}/dashboard/settings`
    );
  }

  function handleNotifications() {
    if (!role) {
      return;
    }

    navigate(
      `/${role.toLowerCase()}/dashboard/notifications`
    );
  }

  if (!user || !role) {
    return null;
  }

  let roleActionText = "";

  if (user.is_client && user.is_worker) {
    roleActionText =
      role === "CLIENT"
        ? "Switch to Worker"
        : "Switch to Client";
  } else if (
    user.is_client &&
    !user.is_worker
  ) {
    roleActionText = "Add Worker Role";
  } else if (
    user.is_worker &&
    !user.is_client
  ) {
    roleActionText = "Add Client Role";
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          DASHBOARD SIDEBAR
          =====================================================

          Normal dashboard:
          - Sidebar is rendered normally.

          Settings:
          - Sidebar is hidden on desktop.
          - Sidebar can still open as a mobile drawer
            when the TopBar hamburger is clicked.
      ===================================================== */}

      {!isSettingsPage && (
        <Sidebar
          role={role}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
          onSwitchRole={handleSwitchRole}
          roleActionText={roleActionText}
        />
      )}

      {isSettingsPage && (
        <div className="lg:hidden">
          <Sidebar
            role={role}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onLogout={handleLogout}
            onSwitchRole={handleSwitchRole}
            roleActionText={roleActionText}
          />
        </div>
      )}

      {/* =====================================================
          MAIN DASHBOARD AREA
      ===================================================== */}

      <div
        className={
          isSettingsPage
            ? ""
            : "lg:pl-64"
        }
      >

        {/* ===================================================
            TOPBAR
        =================================================== */}

        <div
          className={
            isSettingsPage
              ? "fixed left-0 right-0 top-0 z-40"
              : "fixed left-0 right-0 top-0 z-40 lg:left-64"
          }
        >
          <TopBar
            userName={`${user.first_name ?? ""} ${
              user.last_name ?? ""
            }`.trim()}

            userRole={role}

            /*
             * The hamburger always works.
             *
             * On Settings:
             * it opens the mobile Dashboard Sidebar.
             *
             * On normal dashboard:
             * it also opens the Dashboard Sidebar.
             */
            onMenuOpen={() =>
              setSidebarOpen(true)
            }

            onNotificationsClick={
              handleNotifications
            }

            onProfileClick={
              handleProfile
            }

            onVerifyClick={
              handleVerify
            }

            onSettingsClick={
              handleSettings
            }

            onSwitchRole={
              user.is_client &&
              user.is_worker
                ? handleSwitchRole
                : undefined
            }

            onLogout={handleLogout}
          />

          {/* =================================================
              DASHBOARD TABS

              Completely hidden on Settings.
          ================================================= */}

          {!isSettingsPage && (
            <DashboardTabs
              role={role}
            />
          )}
        </div>

        {/* ===================================================
            MAIN CONTENT
        =================================================== */}

        <main
          className={
            isSettingsPage
              ? `
                min-w-0
                p-4
                pt-[80px]
                sm:p-6
                sm:pt-[80px]
                lg:p-8
                lg:pt-[80px]
              `
              : `
                min-w-0
                p-4
                pt-[120px]
                sm:p-6
                sm:pt-[120px]
                lg:p-8
                lg:pt-[120px]
              `
          }
        >
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;