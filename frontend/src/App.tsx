// frontend/src/App.tsx

import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

/* =========================
   PUBLIC LANDING PAGE
========================= */
import VerifyEmailPage from "@/pages/verifyEmail/VerifyEmailPage";
import Navbar from "@/components/navbar";
import Home from "@/components/home";
import About from "@/components/about";
import HowItWorks from "@/components/HowItWorks";
import ContactUs from "@/components/ContactUs";

/* =========================
   AUTHENTICATION
========================= */

// Single login page.
// The backend/login page determines the user's role.
import Login from "@/pages/logIn";

import RegisterRole from "@/pages/register/RegisterRole";
import ClientRegister from "@/pages/register/ClientRegister";
import WorkerRegister from "@/pages/register/WorkerRegister";

import ForgotPassword from "@/pages/logIn/ForgotPassword";
import ResetPassword from "@/pages/logIn/ResetPassword";
import ChangePassword from "@/pages/logIn/ChangePassword";

/* =========================
   IDENTITY VERIFICATION
========================= */

import VerifyDetails from "@/pages/dashboard/VerifyDetails";

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
import PostJob from "@/pages/dashboard/client/PostJob/PostJob";
import Applications from "@/pages/dashboard/client/Applications";
import JobApplications from "@/pages/dashboard/client/JobApplications";
import Messages from "@/pages/dashboard/client/Messages";
import Analytics from "@/pages/dashboard/client/Analytics";

/* =========================
   WORKER DASHBOARD PAGES
========================= */

import WorkerDashboard from "@/pages/dashboard/worker/WorkerDashboard";
import FindJobs from "@/pages/dashboard/worker/FindJobs";
import WorkerJobDetails from "@/pages/dashboard/worker/JobDetails";
import MyApplications from "@/pages/dashboard/worker/MyApplications";
import MyWork from "@/pages/dashboard/worker/MyWork";
import WorkerDirections from "@/pages/dashboard/worker/Directions/Directions";
import WorkerMessages from "@/pages/dashboard/worker/Messages";
import Performance from "@/pages/dashboard/worker/Performance";

/* =========================
   SETTINGS
========================= */

import SettingsLayout from "@/pages/settings/SettingsLayout";

import ProfileSection from "@/pages/settings/Sections/ProfileSection";
import AccountSection from "@/pages/settings/Sections/AccountSection";
import SecuritySection from "@/pages/settings/Sections/SecuritySection";
import LocationSection from "@/pages/settings/Sections/LocationSection";
import NotificationsSection from "@/pages/settings/Sections/NotificationsSection";
import VerificationSection from "@/pages/settings/Sections/VerificationSection";
import AvailabilitySection from "@/pages/settings/Sections/AvailabilitySection";

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
   * If the user has selected a valid CLIENT role,
   * respect that selection.
   */

  if (
    selectedRole === "CLIENT" &&
    user.is_client
  ) {
    return "/client/dashboard";
  }

  /*
   * If the user has selected a valid WORKER role,
   * respect that selection.
   */

  if (
    selectedRole === "WORKER" &&
    user.is_worker
  ) {
    return "/worker/dashboard";
  }

  /*
   * User only has CLIENT role.
   */

  if (
    user.is_client &&
    !user.is_worker
  ) {
    return "/client/dashboard";
  }

  /*
   * User only has WORKER role.
   */

  if (
    user.is_worker &&
    !user.is_client
  ) {
    return "/worker/dashboard";
  }

  /*
   * User has both CLIENT and WORKER roles
   * but no valid selected role.
   *
   * Default to CLIENT.
   */

  if (
    user.is_client &&
    user.is_worker
  ) {
    return "/client/dashboard";
  }

  /*
   * Admin-only users are handled by the
   * AdminRoutes section.
   */

  return null;
}

/* =========================================================
   PUBLIC LANDING PAGE
========================================================= */

function PublicLandingPage() {
  const [selectedPage, setSelectedPage] =
    useState<SelectedPage>(
      SelectedPage.Home
    );

  const [isTopOfPage, setIsTopOfPage] =
    useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsTopOfPage(
        window.scrollY === 0
      );
    };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    handleScroll();

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  const dashboard =
    getUserDashboard();

  /*
   * Logged-in client/worker users should
   * never see the public landing page.
   */

  if (dashboard) {
    return (
      <Navigate
        to={dashboard}
        replace
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-white">

      {/* =========================
          NAVBAR
      ========================= */}

      <Navbar
        isTopOfPage={isTopOfPage}
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
      />

      {/* =========================
          LANDING PAGE
      ========================= */}

      <main>
        <Home
          setSelectedPage={setSelectedPage}
        />

        <HowItWorks
          setSelectedPage={setSelectedPage}
        />

        <About
          setSelectedPage={setSelectedPage}
        />

        <ContactUs
          setSelectedPage={setSelectedPage}
        />
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
  const dashboard =
    getUserDashboard();

  /*
   * Already logged in?
   *
   * Send client/worker users directly
   * to their dashboard.
   */

  if (dashboard) {
    return (
      <Navigate
        to={dashboard}
        replace
      />
    );
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
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /*
   * User is trying to access a CLIENT dashboard
   * but does not have the CLIENT role.
   */

  if (
    role === "CLIENT" &&
    !user.is_client
  ) {
    const dashboard =
      getUserDashboard();

    return (
      <Navigate
        to={dashboard || "/login"}
        replace
      />
    );
  }

  /*
   * User is trying to access a WORKER dashboard
   * but does not have the WORKER role.
   */

  if (
    role === "WORKER" &&
    !user.is_worker
  ) {
    const dashboard =
      getUserDashboard();

    return (
      <Navigate
        to={dashboard || "/login"}
        replace
      />
    );
  }

  /*
   * If the user has BOTH CLIENT and WORKER roles,
   * make sure they are accessing the currently
   * selected role.
   *
   * ADMIN does not participate in this check.
   */

  const selectedRole =
    getSelectedRole();

  if (
    user.is_client &&
    user.is_worker &&
    selectedRole &&
    selectedRole !== role &&
    selectedRole !== "ADMIN"
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

  /*
   * DashboardLayout contains the navigation
   * and renders the nested page through Outlet.
   */

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

      <Route
        path="/"
        element={
          <PublicLandingPage />
        }
      />

      {/* =====================================================
          LOGIN
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
          REGISTER
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
          EMAIL VERIFICATION
          Accessible without login. Uses ?token=... in the URL.
      ===================================================== */}

      <Route
        path="/verify-email"
        element={<VerifyEmailPage />}
      />

      {/* =====================================================
          CLIENT DASHBOARD
      ===================================================== */}

      <Route
        path="/client/dashboard"
        element={
          <ProtectedDashboard
            role="CLIENT"
          />
        }
      >

        {/* Dashboard home */}

        <Route
          index
          element={
            <ClientDashboard />
          }
        />

        {/* My Jobs */}

        <Route
          path="jobs"
          element={
            <MyJobs />
          }
        />

        {/* Job details */}

        <Route
          path="jobs/:jobId"
          element={
            <ClientJobDetails />
          }
        />

        {/* Post a Job */}

        <Route
          path="post-job"
          element={
            <PostJob />
          }
        />

        {/* Applications */}

        <Route
          path="applications"
          element={
            <Applications />
          }
        />

        {/* Applications for a specific job */}

        <Route
          path="applications/:jobId"
          element={
            <JobApplications />
          }
        />

        {/* Messages */}

        <Route
          path="messages"
          element={
            <Messages />
          }
        />

        {/* Analytics */}

        <Route
          path="analytics"
          element={
            <Analytics />
          }
        />

        {/* =================================================
            CLIENT SETTINGS
        ================================================= */}

        <Route
          path="settings"
          element={
            <SettingsLayout />
          }
        >

          {/* /client/dashboard/settings
              → /client/dashboard/settings/profile
          */}

          <Route
            index
            element={
              <Navigate
                to="profile"
                replace
              />
            }
          />

          <Route
            path="profile"
            element={
              <ProfileSection />
            }
          />

          <Route
            path="account"
            element={
              <AccountSection />
            }
          />

          <Route
            path="security"
            element={
              <SecuritySection />
            }
          />

          <Route
            path="location"
            element={
              <LocationSection />
            }
          />

          <Route
            path="notifications"
            element={
              <NotificationsSection />
            }
          />

          <Route
            path="verification"
            element={
              <VerificationSection />
            }
          />

        </Route>

      </Route>

      {/* =====================================================
          WORKER DASHBOARD
      ===================================================== */}

      <Route
        path="/worker/dashboard"
        element={
          <ProtectedDashboard
            role="WORKER"
          />
        }
      >

        {/* Dashboard home */}

        <Route
          index
          element={
            <WorkerDashboard />
          }
        />

        {/* Find Jobs */}

        <Route
          path="find-jobs"
          element={
            <FindJobs />
          }
        />

        {/* Worker Job Details */}

        <Route
          path="jobs/:jobId"
          element={
            <WorkerJobDetails />
          }
        />

        {/* Worker Directions */}

        <Route
          path="directions/:jobId"
          element={
            <WorkerDirections />
          }
        />

        {/* Backward compatibility */}

        <Route
          path="jobs"
          element={
            <Navigate
              to="/worker/dashboard/find-jobs"
              replace
            />
          }
        />

        {/* My Applications */}

        <Route
          path="applications"
          element={
            <MyApplications />
          }
        />

        {/* My Work */}

        <Route
          path="my-work"
          element={
            <MyWork />
          }
        />

        {/* Messages */}

        <Route
          path="messages"
          element={
            <WorkerMessages />
          }
        />

        {/* Performance */}

        <Route
          path="performance"
          element={
            <Performance />
          }
        />

        {/* =================================================
            WORKER SETTINGS
        ================================================= */}

        <Route
          path="settings"
          element={
            <SettingsLayout />
          }
        >

          {/* /worker/dashboard/settings
              → /worker/dashboard/settings/profile
          */}

          <Route
            index
            element={
              <Navigate
                to="profile"
                replace
              />
            }
          />

          <Route
            path="profile"
            element={
              <ProfileSection />
            }
          />

          <Route
            path="account"
            element={
              <AccountSection />
            }
          />

          <Route
            path="security"
            element={
              <SecuritySection />
            }
          />

          <Route
            path="location"
            element={
              <LocationSection />
            }
          />

          <Route
            path="notifications"
            element={
              <NotificationsSection />
            }
          />

          <Route
            path="verification"
            element={
              <VerificationSection />
            }
          />

          <Route
            path="availability"
            element={
              <AvailabilitySection />
            }
          />

        </Route>

      </Route>

      {/* =====================================================
          ADMIN PANEL
      ===================================================== */}

      <Route
        path="/admin/*"
        element={
          <AdminRoutes />
        }
      />

      {/* =====================================================
          FALLBACK
      ===================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;
