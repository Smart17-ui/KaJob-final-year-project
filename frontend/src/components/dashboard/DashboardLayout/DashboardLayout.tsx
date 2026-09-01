import {
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import Sidebar from "../Sidebar/Sidebar";
import TopBar from "../TopBar/TopBar";
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

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  /* =========================
     CURRENT USER
  ========================= */

  const user = getCurrentUser();

  /* =========================
     SELECTED ROLE
  ========================= */

  const selectedRole =
    getSelectedRole();

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
     
     If the user is NOT logged in,
     send them to the LANDING PAGE.
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
    const refreshToken =
      getRefreshToken();

    try {
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
    } catch (error) {
      console.error(
        "LOGOUT ERROR:",
        error
      );
    } finally {
      /*
       * Remove all authentication
       * information.
       */
      clearAuth();

      /*
       * Send user to landing page.
       */
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

    /*
     * USER HAS BOTH ROLES
     *
     * Switch between CLIENT
     * and WORKER.
     */

    if (
      user.is_client &&
      user.is_worker
    ) {
      const nextRole =
        role === "CLIENT"
          ? "WORKER"
          : "CLIENT";

      /*
       * Save the selected role.
       */
      setSelectedRole(nextRole);

      /*
       * Navigate to the
       * corresponding dashboard.
       */
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

    /*
     * USER ONLY HAS CLIENT ROLE
     *
     * The button will say:
     * "Add Worker Role"
     */

    if (
      role === "CLIENT" &&
      user.is_client &&
      !user.is_worker
    ) {
      console.log(
        "Add Worker Role"
      );

      /*
       * Later you can connect
       * your Add Worker Role API here.
       */

      return;
    }

    /*
     * USER ONLY HAS WORKER ROLE
     *
     * The button will say:
     * "Add Client Role"
     */

    if (
      role === "WORKER" &&
      user.is_worker &&
      !user.is_client
    ) {
      console.log(
        "Add Client Role"
      );

      /*
       * Later you can connect
       * your Add Client Role API here.
       */

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

  /* =========================
     CHECK DASHBOARD HOME
  ========================= */

  const isDashboardHome =
    location.pathname === dashboardPath;

  /* =========================
     ROLE BUTTON TEXT
  ========================= */

  let roleActionText = "";

  /*
   * USER HAS BOTH ROLES
   */

  if (
    user.is_client &&
    user.is_worker
  ) {
    roleActionText =
      role === "CLIENT"
        ? "Switch to Worker"
        : "Switch to Client";
  }

  /*
   * USER ONLY HAS CLIENT ROLE
   */

  else if (
    user.is_client &&
    !user.is_worker
  ) {
    roleActionText =
      "Add Worker Role";
  }

  /*
   * USER ONLY HAS WORKER ROLE
   */

  else if (
    user.is_worker &&
    !user.is_client
  ) {
    roleActionText =
      "Add Client Role";
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
        roleActionText={roleActionText}
      />

      {/* =====================================
          MAIN APPLICATION
      ===================================== */}

      <div
        className="
          flex
          min-w-0
          flex-1
          flex-col
          overflow-hidden
          md:ml-[248px]
        "
      >

        {/* =====================================
            TOP BAR
        ===================================== */}

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
          onLogout={handleLogout}
        />

        {/* =====================================
            PAGE CONTENT
        ===================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overflow-x-hidden
          "
        >
          <div
            className="
              min-h-full
              p-4
              sm:p-6
              lg:p-8
            "
          >

            {isDashboardHome ? (
              <DashboardOverview />
            ) : (
              <Outlet />
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardLayout;