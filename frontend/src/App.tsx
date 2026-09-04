import { useEffect, useState } from "react";

import {
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import Navbar from "@/components/navbar";

import Home from "@/components/home";
import HowItWorks from "@/components/HowItWorks";
import About from "@/components/about";
import ContactUs from "@/components/ContactUs";
import Footer from "@/components/footer";

import Login from "@/pages/logIn";
import Register from "@/pages/register";

/* =========================
   PASSWORD AUTH PAGES
========================= */

import ForgotPassword from "./pages/logIn/ForgotPassword";
import ResetPassword from "./pages/logIn/ResetPassword";

/* =========================
   DASHBOARD LAYOUT
========================= */

import DashboardLayout from "@/components/dashboard/DashboardLayout/DashboardLayout";

/* =========================
   IDENTITY VERIFICATION
========================= */

import VerifyDetails from "./pages/dashboard/VerifyDetails";

/* =========================
   CLIENT DASHBOARD PAGES
========================= */

import ClientDashboard from "@/pages/dashboard/client/ClientDashboard";
import MyJobs from "@/pages/dashboard/client/MyJobs";
import PostJob from "@/pages/dashboard/client/PostJob";
import Applications from "@/pages/dashboard/client/Applications";
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
import JobDetails from "@/pages/dashboard/worker/JobDetails";
import MyApplications from "@/pages/dashboard/worker/MyApplications";
import MyWork from "@/pages/dashboard/worker/MyWork";
import WorkerMessages from "@/pages/dashboard/worker/Messages";
import Performance from "@/pages/dashboard/worker/Performance";
import WorkerNotifications from "@/pages/dashboard/worker/Notifications";
import WorkerProfile from "@/pages/dashboard/worker/Profile";
import WorkerSettings from "@/pages/dashboard/worker/Settings";

/* =========================
   CHANGE PASSWORD
========================= */

import ChangePassword from "./pages/logIn/ChangePassword";

/* =========================
   SHARED TYPES
========================= */

import { SelectedPage } from "@/shared/types";

/* =========================
   AUTH HELPERS
========================= */

import {
  isAuthenticated,
  getSelectedRole,
  getCurrentUser,
} from "@/shared/auth";

/* =========================
   LANDING PAGE PROPS
========================= */

type HomePageProps = {
  selectedPage: SelectedPage;

  setSelectedPage: (
    value: SelectedPage
  ) => void;
};

/* =========================
   LANDING PAGE
========================= */

const HomePage = ({
  setSelectedPage,
}: HomePageProps) => {
  return (
    <>
      <Home
        setSelectedPage={
          setSelectedPage
        }
      />

      <HowItWorks
        setSelectedPage={
          setSelectedPage
        }
      />

      <About
        setSelectedPage={
          setSelectedPage
        }
      />

      <ContactUs
        setSelectedPage={
          setSelectedPage
        }
      />

      <Footer />
    </>
  );
};

/* =========================
   HOME REDIRECT
========================= */

const HomeRedirect = () => {
  const authenticated =
    isAuthenticated();

  const user =
    getCurrentUser();

  const selectedRole =
    getSelectedRole();

  /* =========================
     NOT LOGGED IN
  ========================= */

  if (!authenticated) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  /* =========================
     DETERMINE ROLE
  ========================= */

  const role =
    selectedRole ||
    (user?.is_worker
      ? "WORKER"
      : user?.is_client
      ? "CLIENT"
      : null);

  /* =========================
     CLIENT
  ========================= */

  if (role === "CLIENT") {
    return (
      <Navigate
        to="/client/dashboard"
        replace
      />
    );
  }

  /* =========================
     WORKER
  ========================= */

  if (role === "WORKER") {
    return (
      <Navigate
        to="/worker/dashboard"
        replace
      />
    );
  }

  /* =========================
     INVALID AUTH
  ========================= */

  return (
    <Navigate
      to="/login"
      replace
    />
  );
};

/* =========================
   APP
========================= */

function App() {
  /* =========================
     SELECTED LANDING PAGE
  ========================= */

  const [
    selectedPage,
    setSelectedPage,
  ] = useState<SelectedPage>(
    SelectedPage.Home
  );

  /* =========================
     TOP OF PAGE
  ========================= */

  const [
    isTopOfPage,
    setIsTopOfPage,
  ] = useState(true);

  /* =========================
     LOCATION
  ========================= */

  const location =
    useLocation();

  /* =========================
     SCROLL DETECTION
  ========================= */

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

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  /* =========================
     DASHBOARD CHECK
  ========================= */

  const isDashboard =
    location.pathname.startsWith(
      "/client/dashboard"
    ) ||
    location.pathname.startsWith(
      "/worker/dashboard"
    );

  /* =========================
     AUTH PAGE CHECK
     
     These pages should NOT
     display the Navbar.
  ========================= */

  const isAuthPage = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ].includes(location.pathname);

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="app min-h-screen bg-gray-20">

      {/* =========================
          NAVBAR

          Hidden on:
          - Dashboard pages
          - Login
          - Register
          - Forgot Password
          - Reset Password
      ========================= */}

      {!isDashboard &&
        !isAuthPage && (
          <Navbar
            isTopOfPage={
              isTopOfPage
            }
            selectedPage={
              selectedPage
            }
            setSelectedPage={
              setSelectedPage
            }
          />
        )}

      {/* =========================
          ROUTES
      ========================= */}

      <Routes>

        {/* ==================================================
            HOME
        ================================================== */}

        <Route
          path="/"
          element={
            isAuthenticated() ? (
              <HomeRedirect />
            ) : (
              <HomePage
                selectedPage={
                  selectedPage
                }
                setSelectedPage={
                  setSelectedPage
                }
              />
            )
          }
        />

        {/* ==================================================
            GENERIC DASHBOARD URL

            /dashboard

            Logged in:
              → appropriate dashboard
        ================================================== */}

        <Route
          path="/dashboard"
          element={
            <HomeRedirect />
          }
        />

        {/* ==================================================
            LOGIN

            Navbar is hidden because
            /login is included in isAuthPage.
        ================================================== */}

        <Route
          path="/login"
          element={
            <Login />
          }
        />

        {/* ==================================================
            REGISTER

            Navbar is hidden because
            /register is included in isAuthPage.
        ================================================== */}

        <Route
          path="/register"
          element={
            <Register />
          }
        />

        {/* ==================================================
            FORGOT PASSWORD

            Navbar is hidden.
        ================================================== */}

        <Route
          path="/forgot-password"
          element={
            <ForgotPassword />
          }
        />

        {/* ==================================================
            RESET PASSWORD

            Example:

            /reset-password?token=eyJhbGci...
            
            Navbar is hidden.
        ================================================== */}

        <Route
          path="/reset-password"
          element={
            <ResetPassword />
          }
        />

        {/* ==================================================
            CLIENT DASHBOARD
        ================================================== */}

        <Route
          path="/client/dashboard"
          element={
            <DashboardLayout />
          }
        >

          {/* =========================
              CLIENT OVERVIEW
          ========================= */}

          <Route
            index
            element={
              <ClientDashboard />
            }
          />

          {/* =========================
              MY JOBS
          ========================= */}

          <Route
            path="jobs"
            element={
              <MyJobs />
            }
          />

          {/* =========================
              POST JOB
          ========================= */}

          <Route
            path="post-job"
            element={
              <PostJob />
            }
          />

          {/* =========================
              APPLICATIONS
          ========================= */}

          <Route
            path="applications"
            element={
              <Applications />
            }
          />

          {/* =========================
              MESSAGES
          ========================= */}

          <Route
            path="messages"
            element={
              <Messages />
            }
          />

          {/* =========================
              ANALYTICS
          ========================= */}

          <Route
            path="analytics"
            element={
              <Analytics />
            }
          />

          {/* =========================
              NOTIFICATIONS
          ========================= */}

          <Route
            path="notifications"
            element={
              <ClientNotifications />
            }
          />

          {/* =========================
              PROFILE
          ========================= */}

          <Route
            path="profile"
            element={
              <Profile />
            }
          />

          {/* =========================
              SETTINGS
          ========================= */}

          <Route
            path="settings"
            element={
              <Settings />
            }
          />

          {/* =========================
              CHANGE PASSWORD
          ========================= */}

          <Route
            path="change-password"
            element={
              <ChangePassword />
            }
          />

          {/* =========================
              VERIFY DETAILS
          ========================= */}

          <Route
            path="verify"
            element={
              <VerifyDetails />
            }
          />

        </Route>

        {/* ==================================================
            WORKER DASHBOARD
        ================================================== */}

        <Route
          path="/worker/dashboard"
          element={
            <DashboardLayout />
          }
        >

          {/* =========================
              WORKER OVERVIEW
          ========================= */}

          <Route
            index
            element={
              <WorkerDashboard />
            }
          />

          {/* =========================
              FIND JOBS
          ========================= */}

          <Route
            path="jobs"
            element={
              <FindJobs />
            }
          />

          {/* =========================
              JOB DETAILS
          ========================= */}

          <Route
            path="jobs/:jobId"
            element={
              <JobDetails />
            }
          />

          {/* =========================
              MY JOBS
          ========================= */}

          <Route
            path="my-jobs"
            element={
              <MyWork />
            }
          />

          {/* =========================
              APPLICATIONS
          ========================= */}

          <Route
            path="applications"
            element={
              <MyApplications />
            }
          />

          {/* =========================
              MESSAGES
          ========================= */}

          <Route
            path="messages"
            element={
              <WorkerMessages />
            }
          />

          {/* =========================
              PERFORMANCE
          ========================= */}

          <Route
            path="performance"
            element={
              <Performance />
            }
          />

          {/* =========================
              NOTIFICATIONS
          ========================= */}

          <Route
            path="notifications"
            element={
              <WorkerNotifications />
            }
          />

          {/* =========================
              PROFILE
          ========================= */}

          <Route
            path="profile"
            element={
              <WorkerProfile />
            }
          />

          {/* =========================
              SETTINGS
          ========================= */}

          <Route
            path="settings"
            element={
              <WorkerSettings />
            }
          />

          {/* =========================
              CHANGE PASSWORD
          ========================= */}

          <Route
            path="change-password"
            element={
              <ChangePassword />
            }
          />

          {/* =========================
              VERIFY DETAILS
          ========================= */}

          <Route
            path="verify"
            element={
              <VerifyDetails />
            }
          />

        </Route>

      </Routes>

    </div>
  );
}

export default App;