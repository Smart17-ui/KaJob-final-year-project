import {
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useEffect, useState } from "react";

import Sidebar from "../Sidebar/Sidebar";
import TopBar from "../TopBar/TopBar";
import DashboardTabs from "../DashboardTabs/DashboardTabs";
import DashboardOverview from "../DashboardOverview/DashboardOverview";

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

  /* =========================
     CURRENT USER
  ========================= */

  const user = getCurrentUser();

  /* =========================
     SELECTED ROLE
  ========================= */

  const selectedRole = getSelectedRole();

  /* =========================
     DETERMINE CURRENT ROLE
  ========================= */

  const role =
    selectedRole ||
    (user?.is_worker
      ? "WORKER"
      : user?.is_client
      ? "CLIENT"
      : null);

  /* =========================
     AUTH CHECK
  ========================= */

  useEffect(() => {
    if (!user || !role) {
      clearAuth();

      navigate("/", {
        replace: true,
      });
    }
  }, [user, role, navigate]);

  /* =========================
     CLOSE SIDEBAR
     WHEN ROUTE CHANGES
  ========================= */

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  /* =========================
     LOGOUT
  ========================= */

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

  /* =========================
     SWITCH ROLE
  ========================= */

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

  /* =========================
     PROFILE
  ========================= */

  function handleProfile() {
    if (!role) {
      return;
    }

    navigate(
      `/${role.toLowerCase()}/dashboard/profile`
    );
  }

  /* =========================
     SETTINGS
  ========================= */

  function handleSettings() {
    if (!role) {
      return;
    }

    navigate(
      `/${role.toLowerCase()}/dashboard/settings`
    );
  }

  /* =========================
     NOTIFICATIONS
  ========================= */

  function handleNotifications() {
    if (!role) {
      return;
    }

    navigate(
      `/${role.toLowerCase()}/dashboard/notifications`
    );
  }

  /* =========================
     WAIT FOR AUTH CHECK
  ========================= */

  if (!user || !role) {
    return null;
  }

  /* =========================
     DASHBOARD PATH
  ========================= */

  const dashboardPath =
    `/${role.toLowerCase()}/dashboard`;

  const isDashboardHome =
    location.pathname === dashboardPath;

  /* =========================
     ROLE BUTTON TEXT
  ========================= */

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

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
        roleActionText={roleActionText}
      />

      {/* ==================================================
          MAIN AREA
      ================================================== */}

      <div className="lg:pl-64">

        {/* ==================================================
            FIXED HEADER
            TOPBAR + TABS
        ================================================== */}

        <div
          className="
            fixed
            left-0
            right-0
            top-0
            z-40
            lg:left-64
          "
        >

          {/* =========================
              TOP BAR
          ========================= */}

          <TopBar
            userName={`${user.first_name ?? ""} ${
              user.last_name ?? ""
            }`.trim()}
            userRole={role}
            onMenuOpen={() =>
              setSidebarOpen(true)
            }
            onNotificationsClick={
              handleNotifications
            }
            onProfileClick={
              handleProfile
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

          {/* =========================
              DASHBOARD TABS
          ========================= */}

          <DashboardTabs
            role={role}
          />

        </div>

        {/* ==================================================
            PAGE CONTENT
        ================================================== */}

        <main
          className="
            min-w-0
            p-4
            pt-36
            sm:p-6
            sm:pt-36
            lg:p-8
            lg:pt-36
          "
        >

          {isDashboardHome ? (
            <DashboardOverview />
          ) : (
            <Outlet />
          )}

        </main>

      </div>

    </div>
  );
};

export default DashboardLayout;