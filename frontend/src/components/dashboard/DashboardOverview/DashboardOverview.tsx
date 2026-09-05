import {
  BriefcaseIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  PlusIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

import { useNavigate } from "react-router-dom";

import {
  getCurrentUser,
  getSelectedRole,
} from "@/shared/auth";

const DashboardOverview = () => {
  const navigate = useNavigate();

  const user = getCurrentUser();
  const role = getSelectedRole();

  const firstName =
    user?.first_name || "there";

  const isWorker =
    role === "WORKER";

  const isClient =
    role === "CLIENT";

  return (
    <div className="min-h-full bg-slate-50">

      <div className="mx-auto max-w-7xl">

        {/* =====================================
            WORKSPACE HEADER
        ===================================== */}

        <div className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">

                <span>
                  KaJob
                </span>

                <span>
                  /
                </span>

                <span className="font-medium text-slate-700">
                  My Workspace
                </span>

              </div>

              <h1 className="text-2xl font-semibold text-slate-900">
                Welcome back, {firstName}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {isWorker
                  ? "Find nearby jobs and manage your work."
                  : "Manage your jobs and find the right workers."}
              </p>

            </div>

            {/* =========================
                POST JOB
            ========================= */}

            {isClient && (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/client/dashboard/post-job"
                  )
                }
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-md
                  bg-emerald-600
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-emerald-700
                "
              >

                <PlusIcon className="h-4 w-4" />

                Post a Job

              </button>
            )}

          </div>

        </div>

        {/* =====================================
            SEARCH
        ===================================== */}

        <div className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6 lg:px-8">

          <div className="relative max-w-2xl">

            <MagnifyingGlassIcon
              className="
                absolute
                left-3
                top-1/2
                h-5
                w-5
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="text"
              placeholder={
                isWorker
                  ? "Search for jobs..."
                  : "Search your jobs..."
              }
              className="
                w-full
                rounded-md
                border
                border-slate-300
                bg-white
                py-2.5
                pl-10
                pr-4
                text-sm
                text-slate-900
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-emerald-500
                focus:ring-2
                focus:ring-emerald-100
              "
            />

          </div>

        </div>

        {/* =====================================
            MAIN CONTENT
        ===================================== */}

        <div className="px-4 py-8 sm:px-6 lg:px-8">

          {/* =====================================
              WORKER VIEW
          ===================================== */}

          {isWorker && (
            <>

              {/* =========================
                  NEARBY JOBS HEADER
              ========================= */}

              <div className="mb-6 flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-semibold text-slate-900">
                    Nearby Jobs
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Jobs available around your current location.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/worker/dashboard/jobs"
                    )
                  }
                  className="
                    hidden
                    items-center
                    gap-1
                    text-sm
                    font-semibold
                    text-emerald-600
                    hover:text-emerald-700
                    sm:flex
                  "
                >

                  View all

                  <ArrowRightIcon className="h-4 w-4" />

                </button>

              </div>

              {/* =========================
                  JOB PREVIEW CARDS
              ========================= */}

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                <JobPreviewCard
                  title="Plumbing Repair"
                  category="Plumbing"
                  location="Kamwala, Lusaka"
                  distance="450m"
                  budget="K500"
                  urgency="Urgent"
                  onClick={() =>
                    navigate(
                      "/worker/dashboard/jobs"
                    )
                  }
                />

                <JobPreviewCard
                  title="Electrical Installation"
                  category="Electrical"
                  location="Chilenje, Lusaka"
                  distance="700m"
                  budget="K1,200"
                  urgency="Normal"
                  onClick={() =>
                    navigate(
                      "/worker/dashboard/jobs"
                    )
                  }
                />

                <JobPreviewCard
                  title="House Cleaning"
                  category="Cleaning"
                  location="Libala, Lusaka"
                  distance="900m"
                  budget="K350"
                  urgency="Normal"
                  onClick={() =>
                    navigate(
                      "/worker/dashboard/jobs"
                    )
                  }
                />

              </div>

              {/* =========================
                  LOCATION STATUS
              ========================= */}

              <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5">

                <div className="flex items-start gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">

                    <MapPinIcon className="h-5 w-5 text-emerald-600" />

                  </div>

                  <div className="flex-1">

                    <h3 className="text-sm font-semibold text-slate-900">
                      Location-based matching
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Your location helps KaJob find jobs within
                      your selected search radius.
                    </p>

                  </div>

                  <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:block">
                    Location enabled
                  </span>

                </div>

              </div>

            </>
          )}

          {/* =====================================
              CLIENT VIEW
          ===================================== */}

          {isClient && (
            <>

              {/* =========================
                  CLIENT HEADER
              ========================= */}

              <div className="mb-6">

                <h2 className="text-xl font-semibold text-slate-900">
                  Your Workspace
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage your jobs, applications and workers.
                </p>

              </div>

              {/* =========================
                  WORKSPACE CARDS
              ========================= */}

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                {/* =========================
                    MY JOBS
                ========================= */}

                <WorkspaceCard
                  icon={BriefcaseIcon}
                  title="My Jobs"
                  description="View and manage the jobs you have posted."
                  onClick={() =>
                    navigate(
                      "/client/dashboard/jobs"
                    )
                  }
                />

                {/* =========================
                    APPLICATIONS
                ========================= */}

                <WorkspaceCard
                  icon={DocumentTextIcon}
                  title="Applications"
                  description="Review applications from workers who have applied to your jobs."
                  onClick={() =>
                    navigate(
                      "/client/dashboard/jobs"
                    )
                  }
                />

                {/* =========================
                    MESSAGES
                ========================= */}

                <WorkspaceCard
                  icon={ChatBubbleLeftRightIcon}
                  title="Messages"
                  description="Communicate with workers and manage conversations."
                  onClick={() =>
                    navigate(
                      "/client/dashboard/messages"
                    )
                  }
                />

              </div>

              {/* =========================
                  GET STARTED
              ========================= */}

              <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6">

                <h3 className="text-lg font-semibold text-slate-900">
                  Get started
                </h3>

                <p className="mt-1 max-w-2xl text-sm text-slate-500">
                  Post a job and let KaJob help you find suitable
                  workers based on location, skills and availability.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/client/dashboard/post-job"
                    )
                  }
                  className="
                    mt-5
                    inline-flex
                    items-center
                    gap-2
                    rounded-md
                    bg-emerald-600
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-emerald-700
                  "
                >

                  <PlusIcon className="h-4 w-4" />

                  Post your first job

                </button>

              </div>

            </>
          )}

        </div>

      </div>

    </div>
  );
};


/* =====================================
   WORKER JOB CARD
===================================== */

interface JobPreviewCardProps {
  title: string;
  category: string;
  location: string;
  distance: string;
  budget: string;
  urgency: string;
  onClick: () => void;
}

const JobPreviewCard = ({
  title,
  category,
  location,
  distance,
  budget,
  urgency,
  onClick,
}: JobPreviewCardProps) => {
  return (
    <div
      className="
        group
        cursor-pointer
        rounded-lg
        border
        border-slate-200
        bg-white
        p-5
        transition-all
        hover:-translate-y-0.5
        hover:border-slate-300
        hover:shadow-md
      "
      onClick={onClick}
    >

      {/* =========================
          CARD HEADER
      ========================= */}

      <div className="flex items-start justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">

          <BriefcaseIcon className="h-5 w-5 text-emerald-600" />

        </div>

        <span
          className={`
            rounded-full
            px-2.5
            py-1
            text-xs
            font-medium
            ${
              urgency === "Urgent"
                ? "bg-red-50 text-red-700"
                : "bg-slate-100 text-slate-600"
            }
          `}
        >
          {urgency}
        </span>

      </div>

      {/* =========================
          JOB INFORMATION
      ========================= */}

      <div className="mt-5">

        <p className="text-xs font-medium text-emerald-600">
          {category}
        </p>

        <h3 className="mt-1 text-base font-semibold text-slate-900">
          {title}
        </h3>

        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">

          <MapPinIcon className="h-4 w-4" />

          {location}

        </div>

      </div>

      {/* =========================
          JOB META
      ========================= */}

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

        <div>

          <p className="text-xs text-slate-400">
            Distance
          </p>

          <p className="text-sm font-semibold text-slate-700">
            {distance}
          </p>

        </div>

        <div>

          <p className="text-xs text-slate-400">
            Budget
          </p>

          <p className="text-sm font-semibold text-slate-900">
            {budget}
          </p>

        </div>

        <ArrowRightIcon
          className="
            h-5
            w-5
            text-slate-400
            transition
            group-hover:translate-x-1
            group-hover:text-emerald-600
          "
        />

      </div>

    </div>
  );
};


/* =====================================
   WORKSPACE CARD
===================================== */

interface WorkspaceCardProps {
  icon: React.ComponentType<
    React.SVGProps<SVGSVGElement>
  >;
  title: string;
  description: string;
  onClick: () => void;
}

const WorkspaceCard = ({
  icon: Icon,
  title,
  description,
  onClick,
}: WorkspaceCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        rounded-lg
        border
        border-slate-200
        bg-white
        p-6
        text-left
        transition-all
        hover:-translate-y-0.5
        hover:border-slate-300
        hover:shadow-md
      "
    >

      <div className="flex items-center justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">

          <Icon className="h-5 w-5 text-emerald-600" />

        </div>

        <ArrowRightIcon
          className="
            h-5
            w-5
            text-slate-400
            transition
            group-hover:translate-x-1
            group-hover:text-emerald-600
          "
        />

      </div>

      <h3 className="mt-5 text-base font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </button>
  );
};

export default DashboardOverview;