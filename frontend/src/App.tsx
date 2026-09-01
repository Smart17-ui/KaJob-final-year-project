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

import DashboardLayout from "@/components/dashboard/DashboardLayout/DashboardLayout";

/* =========================
   CLIENT DASHBOARD PAGES
========================= */

import ClientDashboard from "@/pages/dashboard/client/ClientDashboard";
import MyJobs from "@/pages/dashboard/client/MyJobs";
import PostJob from "@/pages/dashboard/client/PostJob";
import Applications from "@/pages/dashboard/client/Applications";
import Messages from "@/pages/dashboard/client/Messages";
import Profile from "@/pages/dashboard/client/Profile";
import Settings from "@/pages/dashboard/client/Settings";

/* =========================
   WORKER DASHBOARD PAGES
========================= */

import WorkerDashboard from "@/pages/dashboard/worker/WorkerDashboard";
import FindJobs from "@/pages/dashboard/worker/FindJobs";
import MyApplications from "@/pages/dashboard/worker/MyApplications";
import MyWork from "@/pages/dashboard/worker/MyWork";
import WorkerMessages from "@/pages/dashboard/worker/Messages";
import WorkerProfile from "@/pages/dashboard/worker/Profile";
import WorkerSettings from "@/pages/dashboard/worker/Settings";

import {
  SelectedPage,
} from "@/shared/types";

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
     RENDER
  ========================= */

  return (
    <div className="app min-h-screen bg-gray-20">

      {/* =========================
          NAVBAR
      ========================= */}

      {!isDashboard && (
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

            Logged out:
              → /

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
        ================================================== */}

        <Route
          path="/login"
          element={
            <Login />
          }
        />

        {/* ==================================================
            REGISTER
        ================================================== */}

        <Route
          path="/register"
          element={
            <Register />
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

          {/* CLIENT OVERVIEW */}

          <Route
            index
            element={
              <ClientDashboard />
            }
          />

          {/* MY JOBS */}

          <Route
            path="jobs"
            element={
              <MyJobs />
            }
          />

          {/* POST JOB */}

          <Route
            path="post-job"
            element={
              <PostJob />
            }
          />

          {/* APPLICATIONS */}

          <Route
            path="applications"
            element={
              <Applications />
            }
          />

          {/* MESSAGES */}

          <Route
            path="messages"
            element={
              <Messages />
            }
          />

          {/* PROFILE */}

          <Route
            path="profile"
            element={
              <Profile />
            }
          />

          {/* SETTINGS */}

          <Route
            path="settings"
            element={
              <Settings />
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

          {/* WORKER OVERVIEW */}

          <Route
            index
            element={
              <WorkerDashboard />
            }
          />

          {/* FIND JOBS */}

          <Route
            path="jobs"
            element={
              <FindJobs />
            }
          />

          {/* MY APPLICATIONS */}

          <Route
            path="applications"
            element={
              <MyApplications />
            }
          />

          {/* MY WORK */}

          <Route
            path="work"
            element={
              <MyWork />
            }
          />

          {/* MESSAGES */}

          <Route
            path="messages"
            element={
              <WorkerMessages />
            }
          />

          {/* PROFILE */}

          <Route
            path="profile"
            element={
              <WorkerProfile />
            }
          />

          {/* SETTINGS */}

          <Route
            path="settings"
            element={
              <WorkerSettings />
            }
          />

        </Route>

      </Routes>

    </div>
  );
}

export default App;