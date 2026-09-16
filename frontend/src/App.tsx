import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

// =========================
// Public landing page
// =========================
import Navbar from "@/components/navbar";
import Home from "@/components/home";
import About from "@/components/about";
import HowItWorks from "@/components/HowItWorks";
import ContactUs from "@/components/ContactUs";

// =========================
// Authentication
// =========================
import LoginRole from "@/pages/logIn/LoginRole";
import ClientLogin from "@/pages/logIn/ClientLogin";
import WorkerLogin from "@/pages/logIn/WorkerLogin";
import ForgotPassword from "@/pages/logIn/ForgotPassword";

import RegisterRole from "@/pages/register/RegisterRole";
import ClientRegister from "@/pages/register/ClientRegister";
import WorkerRegister from "@/pages/register/WorkerRegister";

import {
  getCurrentUser,
  getSelectedRole,
} from "@/shared/auth";

import { SelectedPage } from "@/shared/types";

// =========================
// Dashboard layout
// =========================
import DashboardLayout from "@/components/dashboard/DashboardLayout/DashboardLayout";

// =========================
// Client dashboard pages
// =========================
import ClientDashboard from "@/pages/dashboard/client/ClientDashboard";
import MyJobs from "@/pages/dashboard/client/MyJobs";
import ClientJobDetails from "@/pages/dashboard/client/JobDetails";
import PostJob from "@/pages/dashboard/client/PostJob";
import Applications from "@/pages/dashboard/client/Applications";
import JobApplications from "@/pages/dashboard/client/JobApplications";
import Messages from "@/pages/dashboard/client/Messages";
import Analytics from "@/pages/dashboard/client/Analytics";

// =========================
// Worker dashboard pages
// =========================
import WorkerDashboard from "@/pages/dashboard/worker/WorkerDashboard";
import FindJobs from "@/pages/dashboard/worker/FindJobs";
import WorkerJobDetails from "@/pages/dashboard/worker/JobDetails";
import MyApplications from "@/pages/dashboard/worker/MyApplications";
import MyWork from "@/pages/dashboard/worker/MyWork";
import WorkerMessages from "@/pages/dashboard/worker/Messages";
import Performance from "@/pages/dashboard/worker/Performance";

/* =========================================================
   GET USER DASHBOARD
   ========================================================= */

function getUserDashboard() {
  const user = getCurrentUser();

  if (!user) {
    return null;
  }

  const selectedRole = getSelectedRole();

  /*
   * If the user has selected a valid role,
   * always respect that selection.
   */

  if (
    selectedRole === "CLIENT" &&
    user.is_client
  ) {
    return "/client/dashboard";
  }

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
   * User has both roles but no selected role.
   *
   * Default to CLIENT.
   */

  if (
    user.is_client &&
    user.is_worker
  ) {
    return "/client/dashboard";
  }

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

  /*
   * IMPORTANT:
   * Hooks must always run before any conditional return.
   */

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
   * Logged-in users should never see
   * the public landing page.
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
   * Send the user directly to their dashboard.
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
        to="/"
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
        to={dashboard || "/"}
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
        to={dashboard || "/"}
        replace
      />
    );
  }

  /*
   * If the user has BOTH roles, make sure they
   * are accessing the currently selected role.
   */

  const selectedRole =
    getSelectedRole();

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

  /*
   * The dashboard layout contains the navigation
   * and renders the nested dashboard page through Outlet.
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
            <LoginRole />
          </PublicAuthRoute>
        }
      />

      <Route
        path="/login/client"
        element={
          <PublicAuthRoute>
            <ClientLogin />
          </PublicAuthRoute>
        }
      />

      <Route
        path="/login/worker"
        element={
          <PublicAuthRoute>
            <WorkerLogin />
          </PublicAuthRoute>
        }
      />

      {/* =====================================================
          FORGOT PASSWORD
      ===================================================== */}

      <Route
        path="/forgot-password"
        element={
          <PublicAuthRoute>
            <ForgotPassword />
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

        {/* =================================================
            POST A JOB

            Unverified clients can enter this page.
            PostJob.tsx handles the verification check.
        ================================================= */}

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

      </Route>

      {/* =====================================================
          FALLBACK
      ===================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;