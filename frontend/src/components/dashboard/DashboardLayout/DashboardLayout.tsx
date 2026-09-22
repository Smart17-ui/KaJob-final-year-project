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
   */
  const [user, setUser] = useState<User | null>(
    () => getCurrentUser()
  );

  const [selectedRole, setSelectedRoleState] = useState<
    string | null
  >(() => getSelectedRole());

  /*
   * =========================================================
   * ROLE SUCCESS FEEDBACK
   * =========================================================
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
   */
  const availableRoles: UserRole[] = [];

  if (user?.is_client) {
    availableRoles.push("CLIENT");
  }

  if (user?.is_worker) {
    availableRoles.push("WORKER");
  }

  /*
   * =========================================================
   * SETTINGS PAGE
   * =========================================================
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
   */
  function saveRoleAuthentication(
    access: string,
    refresh: string,
    updatedUser: User,
    newRole: UserRole
  ) {
    saveAuth(
      access,
      refresh,
      updatedUser,
      newRole
    );

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
   */
  async function handleAddRole(
    newRole: UserRole
  ) {
    if (!user || !role) {
      return;
    }

    /*
     * Prevent trying to add a role the user already has.
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

      saveRoleAuthentication(
        response.tokens.access,
        response.tokens.refresh,
        updatedUser,
        newRole
      );

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
   */
  async function handleSwitchRole(
    newRole: UserRole
  ) {
    if (!user || !role) {
      return;
    }

    /*
     * Already on this role.
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

      saveRoleAuthentication(
        response.tokens.access,
        response.tokens.refresh,
        updatedUser,
        newRole
      );

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
   * The Sidebar passes the selected role.
   *
   * If the user already has that role, switch to it.
   *
   * If the user does not have that role yet, add it.
   */
  function handleSidebarSwitchRole(
    selectedRoleToUse: UserRole
  ) {
    if (!user || !role) {
      return;
    }

    const alreadyHasRole =
      selectedRoleToUse === "CLIENT"
        ? user.is_client
        : user.is_worker;

    if (alreadyHasRole) {
      void handleSwitchRole(selectedRoleToUse);
    } else {
      void handleAddRole(selectedRoleToUse);
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
          availableRoles={availableRoles}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
          onSwitchRole={handleSidebarSwitchRole}
        />
      )}

      {isSettingsPage && (
        <div className="lg:hidden">
          <Sidebar
            role={role}
            availableRoles={availableRoles}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onLogout={handleLogout}
            onSwitchRole={handleSidebarSwitchRole}
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
            onSwitchRole={
              user.is_client &&
              user.is_worker
                ? handleSwitchRole
                : undefined
            }
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
        message={`Your ${addedRoleLabel} account has been successfully added to your KaJob account. You can now use both your ${
          role === "CLIENT"
            ? "Client and Worker"
            : "Worker and Client"
        } roles.`}
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