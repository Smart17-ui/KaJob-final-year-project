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
  saveAuth,
} from "@/shared/auth";

import {
  addRole,
  switchRole,
  logoutUser,
} from "@/api/auth/auth";

import type { User } from "@/shared/types";

import FeedbackModal from "@/components/pop/FeedbackModal/FeedbackModal";

type UserRole = "CLIENT" | "WORKER";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  /*
   * =========================================================
   * AUTH STATE
   * =========================================================
   *
   * Do not read the user directly from localStorage on every
   * render.
   *
   * localStorage changes do not automatically trigger a React
   * re-render, so the authenticated user must live in state.
   */
  const [user, setUser] = useState<User | null>(
    () => getCurrentUser()
  );

  /*
   * The currently active dashboard role also needs to be
   * React state.
   */
  const [selectedRole, setSelectedRoleState] = useState<
    string | null
  >(() => getSelectedRole());

  /*
   * =========================================================
   * ROLE SUCCESS FEEDBACK
   * =========================================================
   *
   * After successfully adding a new role, the user should
   * receive clear confirmation before being taken to the
   * newly activated dashboard.
   */
  const [roleSuccess, setRoleSuccess] = useState<{
    isOpen: boolean;
    role: UserRole | null;
  }>({
    isOpen: false,
    role: null,
  });

  /*
   * =========================================================
   * CURRENT ROLE
   * =========================================================
   *
   * Prefer the explicitly selected role.
   *
   * If no selected role exists, fall back to the user's
   * available roles.
   */
  const role: UserRole | null =
    selectedRole === "CLIENT" ||
    selectedRole === "WORKER"
      ? selectedRole
      : user?.is_worker
      ? "WORKER"
      : user?.is_client
      ? "CLIENT"
      : null;

  /*
   * =========================================================
   * AVAILABLE ROLES
   * =========================================================
   *
   * Build this from the current React user state.
   *
   * This means the dropdown immediately updates after
   * addRole() returns the updated user.
   */
  const availableRoles: UserRole[] = [];

  if (user?.is_client) {
    availableRoles.push("CLIENT");
  }

  if (user?.is_worker) {
    availableRoles.push("WORKER");
  }

  /*
   * Settings has its own internal navigation.
   */
  const isSettingsPage =
    location.pathname.includes("/settings");

  /*
   * =========================================================
   * AUTH GUARD
   * =========================================================
   */
  useEffect(() => {
    if (!user || !role) {
      clearAuth();

      navigate("/", {
        replace: true,
      });
    }
  }, [user, role, navigate]);

  /*
   * =========================================================
   * CLOSE MOBILE SIDEBAR ON ROUTE CHANGE
   * =========================================================
   */
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  /*
   * =========================================================
   * LOGOUT
   * =========================================================
   */
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

      /*
       * Clear React state as well as localStorage.
       */
      setUser(null);
      setSelectedRoleState(null);

      navigate("/", {
        replace: true,
      });
    }
  }

  /*
   * =========================================================
   * SAVE ROLE AUTHENTICATION
   * =========================================================
   *
   * saveAuth() updates localStorage.
   *
   * setUser() and setSelectedRoleState() update React state.
   *
   * We need BOTH.
   */
  function saveRoleAuthentication(
    access: string,
    refresh: string,
    updatedUser: User,
    newRole: UserRole
  ) {
    /*
     * Persist authentication data.
     */
    saveAuth(
      access,
      refresh,
      updatedUser,
      newRole
    );

    /*
     * Immediately update React state.
     *
     * This causes DashboardLayout, TopBar, Sidebar,
     * and DashboardTabs to re-render with the new role
     * information.
     */
    setUser(updatedUser);
    setSelectedRoleState(newRole);
  }

  /*
   * =========================================================
   * ROLE DASHBOARD ROUTE
   * =========================================================
   */
  function getRoleDashboard(roleToNavigate: UserRole) {
    return roleToNavigate === "CLIENT"
      ? "/client/dashboard"
      : "/worker/dashboard";
  }

  /*
   * =========================================================
   * CLOSE ROLE SUCCESS FEEDBACK
   * =========================================================
   *
   * Closing the success message has the same effect as
   * pressing Continue.
   *
   * This prevents the user from remaining on the old
   * dashboard URL after their active role has changed.
   */
  function handleCloseRoleSuccess() {
    const newRole = roleSuccess.role;

    setRoleSuccess({
      isOpen: false,
      role: null,
    });

    if (!newRole) {
      return;
    }

    navigate(
      getRoleDashboard(newRole),
      {
        replace: true,
      }
    );
  }

  /*
   * =========================================================
   * ADD ROLE
   * =========================================================
   *
   * Used when the account currently has only one role.
   */
  async function handleAddRole(
    newRole: UserRole
  ) {
    if (!user || !role) {
      return;
    }

    /*
     * Prevent accidentally trying to add a role the user
     * already has.
     */
    if (
      (newRole === "CLIENT" && user.is_client) ||
      (newRole === "WORKER" && user.is_worker)
    ) {
      return;
    }

    try {
      const response = await addRole(newRole);

      const updatedUser =
        response.user as User;

      /*
       * The backend automatically activates the newly
       * added role.
       *
       * Save tokens + user + selected role and update
       * React state at the same time.
       */
      saveRoleAuthentication(
        response.tokens.access,
        response.tokens.refresh,
        updatedUser,
        newRole
      );

      /*
       * Show a success message before navigating to the
       * newly activated dashboard.
       */
      setRoleSuccess({
        isOpen: true,
        role: newRole,
      });
    } catch (error) {
      console.error("ADD ROLE ERROR:", error);
    }
  }

  /*
   * =========================================================
   * SWITCH ROLE
   * =========================================================
   *
   * Used when the account already contains both roles.
   */
  async function handleSwitchRole(
    newRole: UserRole
  ) {
    if (!user || !role) {
      return;
    }

    /*
     * Do nothing if the requested role is already active.
     */
    if (newRole === role) {
      return;
    }

    /*
     * Make sure the user actually has the requested role.
     */
    const hasRequestedRole =
      newRole === "CLIENT"
        ? user.is_client
        : user.is_worker;

    if (!hasRequestedRole) {
      return;
    }

    try {
      const response = await switchRole(newRole);

      const updatedUser =
        response.user as User;

      /*
       * Persist the new tokens and update React state.
       */
      saveRoleAuthentication(
        response.tokens.access,
        response.tokens.refresh,
        updatedUser,
        newRole
      );

      /*
       * Navigate to the selected dashboard.
       */
      navigate(
        getRoleDashboard(newRole),
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error("SWITCH ROLE ERROR:", error);
    }
  }

  /*
   * =========================================================
   * SIDEBAR ROLE ACTION
   * =========================================================
   *
   * The existing Sidebar only provides a no-argument
   * switch callback.
   *
   * When both roles exist, switch to the other one.
   *
   * Adding a new role remains available through the
   * ProfileDropdown.
   */
  function handleSidebarSwitchRole() {
    if (!user || !role) {
      return;
    }

    if (user.is_client && user.is_worker) {
      const nextRole: UserRole =
        role === "CLIENT"
          ? "WORKER"
          : "CLIENT";

      void handleSwitchRole(nextRole);
    }
  }

  /*
   * =========================================================
   * PROFILE
   * =========================================================
   */
  function handleProfile() {
    if (!role) {
      return;
    }

    navigate(
      `/${role.toLowerCase()}/dashboard/profile`
    );
  }

  /*
   * =========================================================
   * VERIFY
   * =========================================================
   */
  function handleVerify() {
    if (!role) {
      return;
    }

    navigate(
      `/${role.toLowerCase()}/dashboard/verify`
    );
  }

  /*
   * =========================================================
   * SETTINGS
   * =========================================================
   */
  function handleSettings() {
    if (!role) {
      return;
    }

    navigate(
      `/${role.toLowerCase()}/dashboard/settings`
    );
  }

  /*
   * =========================================================
   * NOTIFICATIONS
   * =========================================================
   */
  function handleNotifications() {
    if (!role) {
      return;
    }

    navigate(
      `/${role.toLowerCase()}/dashboard/notifications`
    );
  }

  /*
   * =========================================================
   * AUTH LOADING / INVALID STATE
   * =========================================================
   */
  if (!user || !role) {
    return null;
  }

  /*
   * =========================================================
   * SIDEBAR ROLE ACTION TEXT
   * =========================================================
   */
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

  /*
   * =========================================================
   * ROLE SUCCESS MESSAGE
   * =========================================================
   */
  const addedRoleLabel =
    roleSuccess.role === "CLIENT"
      ? "Client"
      : "Worker";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          DASHBOARD SIDEBAR
          ===================================================== */}

      {!isSettingsPage && (
        <Sidebar
          role={role}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
          onSwitchRole={handleSidebarSwitchRole}
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
            onSwitchRole={handleSidebarSwitchRole}
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
            availableRoles={availableRoles}
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

            /*
             * Existing roles use switch-role.
             */
            onSwitchRole={
              user.is_client &&
              user.is_worker
                ? handleSwitchRole
                : undefined
            }

            /*
             * Missing roles use add-role.
             */
            onAddRole={
              !user.is_client ||
              !user.is_worker
                ? handleAddRole
                : undefined
            }

            onLogout={handleLogout}
          />

          {/* =================================================
              DASHBOARD TABS
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

      {/* =====================================================
          ROLE ADDED SUCCESS FEEDBACK
          ===================================================== */}

      <FeedbackModal
        isOpen={roleSuccess.isOpen}
        type="success"
        title={`${addedRoleLabel} account added`}
        message={`Your ${addedRoleLabel} account has been successfully added to your KaJob account. You can now use both your ${role === "CLIENT" ? "Client and Worker" : "Worker and Client"} roles.`}
        onClose={handleCloseRoleSuccess}
        primaryAction={{
          label: "Continue",
          onClick: handleCloseRoleSuccess,
        }}
      />
    </div>
  );
};

export default DashboardLayout;