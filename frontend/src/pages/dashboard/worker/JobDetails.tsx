import { Navigate, Route, Routes } from "react-router-dom";

// Authentication
import Login from "@/pages/logIn";
import Register from "@/pages/register";

// Dashboard layout
import DashboardLayout from "@/components/dashboard/DashboardLayout/DashboardLayout";

// Client dashboard pages
import ClientDashboard from "@/pages/dashboard/client/ClientDashboard";
import MyJobs from "@/pages/dashboard/client/MyJobs";
import ClientJobDetails from "@/pages/dashboard/client/JobDetails";
import PostJob from "@/pages/dashboard/client/PostJob";
import Applications from "@/pages/dashboard/client/Applications";
import JobApplications from "@/pages/dashboard/client/JobApplications";
import Messages from "@/pages/dashboard/client/Messages";
import Analytics from "@/pages/dashboard/client/Analytics";

// Worker dashboard pages
import WorkerDashboard from "@/pages/dashboard/worker/WorkerDashboard";
import FindJobs from "@/pages/dashboard/worker/FindJobs";
import WorkerJobDetails from "@/pages/dashboard/worker/JobDetails";
import MyApplications from "@/pages/dashboard/worker/MyApplications";
import MyWork from "@/pages/dashboard/worker/MyWork";
import WorkerMessages from "@/pages/dashboard/worker/Messages";
import Performance from "@/pages/dashboard/worker/Performance";


function App() {
  return (
    <Routes>

      {/* =========================
          PUBLIC / AUTH ROUTES
         ========================= */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

      <Route
        path="/login"
        element={
          <Login />
        }
      />

      <Route
        path="/register"
        element={
          <Register />
        }
      />


      {/* =========================
          CLIENT DASHBOARD
         ========================= */}

      <Route
        path="/client/dashboard"
        element={
          <DashboardLayout />
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


        {/* =========================
            APPLICATIONS
           ========================= */}

        {/* All jobs posted by the client */}

        <Route
          path="applications"
          element={
            <Applications />
          }
        />


        {/* Applications for one specific job */}

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


      {/* =========================
          WORKER DASHBOARD
         ========================= */}

      <Route
        path="/worker/dashboard"
        element={
          <DashboardLayout />
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

    </Routes>
  );
}


export default App;