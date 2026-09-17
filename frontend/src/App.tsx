// frontend/src/App.tsx

import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

/* =========================
   PUBLIC LANDING PAGE
========================= */

import Navbar from "@/components/navbar";
import Home from "@/components/home";
import About from "@/components/about";
import HowItWorks from "@/components/HowItWorks";
import ContactUs from "@/components/ContactUs";
import Footer from "@/components/footer";

/* =========================
   AUTHENTICATION
========================= */

// Login: single auto-role page (backend detects role)
import Login from "@/pages/logIn";

// Register: main's three-page role-based flow
import RegisterRole from "@/pages/register/RegisterRole";
import ClientRegister from "@/pages/register/ClientRegister";
import WorkerRegister from "@/pages/register/WorkerRegister";

// Password flows
import ForgotPassword from "@/pages/logIn/ForgotPassword";
import ResetPassword from "@/pages/logIn/ResetPassword";
import ChangePassword from "@/pages/logIn/ChangePassword";

/* =========================
   IDENTITY VERIFICATION
========================= */

import VerifyDetails from "./pages/dashboard/VerifyDetails";

/* =========================
   SHARED AUTH HELPERS
========================= */

import {
  getCurrentUser,
  getSelectedRole,
} from "@/shared/auth";

import { SelectedPage } from "@/shared/types";

/* =========================
   DASHBOARD LAYOUT
========================= */

import DashboardLayout from "@/components/dashboard/DashboardLayout/DashboardLayout";

/* =========================
   CLIENT DASHBOARD PAGES
========================= */

import ClientDashboard from "@/pages/dashboard/client/ClientDashboard";
import MyJobs from "@/pages/dashboard/client/MyJobs";
import ClientJobDetails from "@/pages/dashboard/client/JobDetails";
import PostJob from "@/pages/dashboard/client/PostJob";
import Applications from "@/pages/dashboard/client/Applications";
import JobApplications from "@/pages/dashboard/client/JobApplications";
import Messages from "@/pages/dashboard/client/Messages";
import Analytics from "@/pages/dashboard/client/Analytics";
import ClientNotifications from "@/pages/dashboard/client/Notifications";
import Profile from "@/pages/dashboard/client/Profile";
import Settings from "@/pages/dashboard/client/Settings";

/* =========================
   WORKER DASHBOARD PAGES
========================= */

import WorkerDashboard from "@/pages/dashboard/worker/WorkerDashboard";
import FindJobs from "@/pages/dashboard/worker/FindJobs";
import WorkerJobDetails from "@/pages/dashboard/worker/JobDetails";
import MyApplications from "@/pages/dashboard/worker/MyApplications";
import MyWork from "@/pages/dashboard/worker/MyWork";
import WorkerMessages from "@/pages/dashboard/worker/Messages";
import Performance from "@/pages/dashboard/worker/Performance";
import WorkerNotifications from "@/pages/dashboard/worker/Notifications";
import WorkerProfile from "@/pages/dashboard/worker/Profile";
import WorkerSettings from "@/pages/dashboard/worker/Settings";

/* =========================
   ADMIN PANEL
========================= */

import { AdminRoutes } from "@/features/admin/routes";

/* =========================================================
   GET USER DASHBOARD
   ========================================================= */

function getUserDashboard(): string | null {
  const user = getCurrentUser();

  if (!user) {
    return null;
  }

  const selectedRole = getSelectedRole();

  /*
   * If the user has selected a valid role, respect that selection.
   */

  if (selectedRole === "CLIENT" && user.is_client) {
    return "/client/dashboard";
  }

  if (selectedRole === "WORKER" && user.is_worker) {
    return "/worker/dashboard";
  }

  /*
   * User only has CLIENT role.
   */

  if (user.is_client && !user.is_worker) {
    return "/client/dashboard";
  }

  /*
   * User only has WORKER role.
   */

  if (user.is_worker && !user.is_client) {
    return "/worker/dashboard";
  }

  /*
   * User has both roles but no selected role.
   * Default to CLIENT.
   */

  if (user.is_client && user.is_worker) {
    return "/client/dashboard";
  }

  return null;
}

/* =========================================================
   PUBLIC LANDING PAGE
   ========================================================= */

function PublicLandingPage() {
  const [selectedPage, setSelectedPage] = useState<SelectedPage>(
    SelectedPage.Home
  );

  const [isTopOfPage, setIsTopOfPage] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsTopOfPage(window.scrollY === 0);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const dashboard = getUserDashboard();

  /*
   * Logged-in users should never see the public landing page.
   */

  if (dashboard) {
    return <Navigate to={dashboard} replace />;
  }

  return (
    <div className="min-h-screen w-full bg-white">
      <Navbar
        isTopOfPage={isTopOfPage}
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
      />

      <main>
        <Home setSelectedPage={setSelectedPage} />
        <HowItWorks setSelectedPage={setSelectedPage} />
        <About setSelectedPage={setSelectedPage} />
        <ContactUs setSelectedPage={setSelectedPage} />
        <Footer />
      </main>
    </div>
  );
}

/* =========================================================
   PUBLIC AUTH ROUTE
   ========================================================= */

function PublicAuthRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const dashboard = getUserDashboard();

  /*
   * Already logged in? Send the user directly to their dashboard.
   */

  if (dashboard) {
    return <Navigate to={dashboard} replace />;
  }

  return <>{children}</>;
}

/* =========================================================
   PROTECTED DASHBOARD ROUTE
   ========================================================= */

function ProtectedDashboard({
  role,
}: {
  role: "CLIENT" | "WORKER";
}) {
  const user = getCurrentUser();

  /*
   * No authenticated user.
   */

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  /*
   * User is trying to access a CLIENT dashboard
   * but does not have the CLIENT role.
   */

  if (role === "CLIENT" && !user.is_client) {
    const dashboard = getUserDashboard();
    return <Navigate to={dashboard || "/login"} replace />;
  }

  /*
   * User is trying to access a WORKER dashboard
   * but does not have the WORKER role.
   */

  if (role === "WORKER" && !user.is_worker) {
    const dashboard = getUserDashboard();
    return <Navigate to={dashboard || "/login"} replace />;
  }

  /*
   * If the user has BOTH roles, make sure they are accessing
   * the currently selected role.
   */

  const selectedRole = getSelectedRole();

  if (
    user.is_client &&
    user.is_worker &&
    selectedRole &&
    selectedRole !== role
  ) {
    return (
      <Navigate
        to={
          selectedRole === "CLIENT"
            ? "/client/dashboard"
            : "/worker/dashboard"
        }
        replace
      />
    );
  }

  return <DashboardLayout />;
}

/* =========================================================
   APP
   ========================================================= */

function App() {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC LANDING PAGE
      ===================================================== */}

      <Route path="/" element={<PublicLandingPage />} />

      {/* =====================================================
          LOGIN — single auto-role page
      ===================================================== */}

      <Route
        path="/login"
        element={
          <PublicAuthRoute>
            <Login />
          </PublicAuthRoute>
        }
      />

      {/* =====================================================
          REGISTER — three-page role-based flow
      ===================================================== */}

      <Route
        path="/register"
        element={
          <PublicAuthRoute>
            <RegisterRole />
          </PublicAuthRoute>
        }
      />

      <Route
        path="/register/client"
        element={
          <PublicAuthRoute>
            <ClientRegister />
          </PublicAuthRoute>
        }
      />

      <Route
        path="/register/worker"
        element={
          <PublicAuthRoute>
            <WorkerRegister />
          </PublicAuthRoute>
        }
      />

      {/* =====================================================
          PASSWORD FLOWS
      ===================================================== */}

      <Route
        path="/forgot-password"
        element={
          <PublicAuthRoute>
            <ForgotPassword />
          </PublicAuthRoute>
        }
      />

      <Route
        path="/reset-password"
        element={
          <PublicAuthRoute>
            <ResetPassword />
          </PublicAuthRoute>
        }
      />

      {/* =====================================================
          CLIENT DASHBOARD
      ===================================================== */}

      <Route
        path="/client/dashboard"
        element={<ProtectedDashboard role="CLIENT" />}
      >
        <Route index element={<ClientDashboard />} />

        <Route path="jobs" element={<MyJobs />} />
        <Route path="jobs/:jobId" element={<ClientJobDetails />} />

        <Route path="post-job" element={<PostJob />} />

        <Route path="applications" element={<Applications />} />
        <Route path="applications/:jobId" element={<JobApplications />} />

        <Route path="messages" element={<Messages />} />

        <Route path="analytics" element={<Analytics />} />

        <Route
          path="notifications"
          element={<ClientNotifications />}
        />

        <Route path="profile" element={<Profile />} />

        <Route path="settings" element={<Settings />} />

        <Route path="change-password" element={<ChangePassword />} />

        <Route path="verify" element={<VerifyDetails />} />
      </Route>

      {/* =====================================================
          WORKER DASHBOARD
      ===================================================== */}

      <Route
        path="/worker/dashboard"
        element={<ProtectedDashboard role="WORKER" />}
      >
        <Route index element={<WorkerDashboard />} />

        <Route path="find-jobs" element={<FindJobs />} />
        <Route path="jobs/:jobId" element={<WorkerJobDetails />} />

        {/* Backward compatibility */}
        <Route
          path="jobs"
          element={
            <Navigate to="/worker/dashboard/find-jobs" replace />
          }
        />

        <Route path="applications" element={<MyApplications />} />

        <Route path="my-work" element={<MyWork />} />

        <Route path="messages" element={<WorkerMessages />} />

        <Route path="performance" element={<Performance />} />

        <Route
          path="notifications"
          element={<WorkerNotifications />}
        />

        <Route path="profile" element={<WorkerProfile />} />

        <Route path="settings" element={<WorkerSettings />} />

        <Route path="change-password" element={<ChangePassword />} />

        <Route path="verify" element={<VerifyDetails />} />
      </Route>

      {/* =====================================================
          ADMIN PANEL
      ===================================================== */}

      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* =====================================================
          FALLBACK
      ===================================================== */}

      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}

export default App;
