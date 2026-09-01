import {
  ArrowLeftIcon,
  BriefcaseIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, useParams } from "react-router-dom";

type Job = {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  distance: string;
  budget: string;
  jobType: "One-time" | "Short-term" | "Long-term";
  posted: string;
  requirements: string[];
  duration: string;
};

const jobs: Job[] = [
  {
    id: 1,
    title: "House Cleaning",
    description:
      "Looking for someone to clean a three-bedroom house and organize the rooms. The job involves general cleaning, sweeping, mopping, dusting, and organizing the rooms.",
    category: "Cleaning",
    location: "Roma, Lusaka",
    distance: "2.4 km away",
    budget: "K250",
    jobType: "One-time",
    posted: "2 hours ago",
    duration: "1 day",
    requirements: [
      "Previous cleaning experience",
      "Must be reliable and punctual",
      "Bring your own basic cleaning equipment",
      "Able to complete the work within one day",
    ],
  },
  {
    id: 2,
    title: "Garden Maintenance",
    description:
      "Need someone to clean the garden, trim the grass and remove unwanted weeds. The worker should leave the garden clean and well maintained.",
    category: "Gardening",
    location: "Woodlands, Lusaka",
    distance: "3.1 km away",
    budget: "K180",
    jobType: "One-time",
    posted: "5 hours ago",
    duration: "1 day",
    requirements: [
      "Experience with garden maintenance",
      "Ability to use basic gardening tools",
      "Must be physically fit",
    ],
  },
  {
    id: 3,
    title: "Moving Assistance",
    description:
      "Looking for two people to help move furniture and boxes to a new house. The work will involve loading, transporting and unloading household items.",
    category: "Moving",
    location: "Chilenje, Lusaka",
    distance: "4.7 km away",
    budget: "K400",
    jobType: "Short-term",
    posted: "1 day ago",
    duration: "2 days",
    requirements: [
      "Able to lift heavy items",
      "Previous moving experience is an advantage",
      "Must be available for two days",
    ],
  },
  {
    id: 4,
    title: "Painting Assistant",
    description:
      "Need assistance with painting the interior walls of a small house. The worker will help prepare surfaces and apply paint to the walls.",
    category: "Construction",
    location: "Ibex Hill, Lusaka",
    distance: "5.2 km away",
    budget: "K350",
    jobType: "Short-term",
    posted: "1 day ago",
    duration: "3 days",
    requirements: [
      "Basic painting knowledge",
      "Attention to detail",
      "Must be reliable",
      "Previous painting experience is preferred",
    ],
  },
];

const JobDetails = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();

  const job = jobs.find((job) => job.id === Number(jobId));

  if (!job) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <BriefcaseIcon className="h-7 w-7 text-slate-400" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Job not found
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            This job may no longer be available.
          </p>

          <button
            type="button"
            onClick={() => navigate("/worker/find-jobs")}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Find Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* BACK BUTTON */}
      <button
        type="button"
        onClick={() => navigate("/worker/find-jobs")}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-emerald-600"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Find Jobs
      </button>

      {/* JOB HEADER */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

          <div className="flex gap-4">

            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50">
              <BriefcaseIcon className="h-7 w-7 text-emerald-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {job.title}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">

                <div className="flex items-center gap-1.5">
                  <MapPinIcon className="h-4 w-4" />
                  {job.location}
                </div>

                <div className="flex items-center gap-1.5">
                  <ClockIcon className="h-4 w-4" />
                  {job.posted}
                </div>

              </div>
            </div>

          </div>

          <div className="sm:text-right">
            <p className="text-2xl font-bold text-emerald-600">
              {job.budget}
            </p>

            <p className="text-sm text-slate-400">
              Budget
            </p>
          </div>

        </div>

      </section>

      {/* MAIN CONTENT */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* LEFT CONTENT */}
        <div className="space-y-6 lg:col-span-2">

          {/* DESCRIPTION */}
          <section className="rounded-xl border border-slate-200 bg-white p-6">

            <h2 className="text-lg font-semibold text-slate-900">
              Job Description
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              {job.description}
            </p>

          </section>

          {/* REQUIREMENTS */}
          <section className="rounded-xl border border-slate-200 bg-white p-6">

            <h2 className="text-lg font-semibold text-slate-900">
              Requirements
            </h2>

            <div className="mt-4 space-y-3">

              {job.requirements.map((requirement, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3"
                >
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />

                  <p className="text-sm text-slate-600">
                    {requirement}
                  </p>
                </div>
              ))}

            </div>

          </section>

        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="space-y-6">

          {/* JOB DETAILS */}
          <section className="rounded-xl border border-slate-200 bg-white p-6">

            <h2 className="text-lg font-semibold text-slate-900">
              Job Details
            </h2>

            <div className="mt-5 space-y-5">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Category
                </p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {job.category}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Job Type
                </p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {job.jobType}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Location
                </p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {job.location}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Distance
                </p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {job.distance}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Duration
                </p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {job.duration}
                </p>
              </div>

            </div>

          </section>

          {/* APPLY */}
          <section className="rounded-xl border border-slate-200 bg-white p-6">

            <h2 className="text-base font-semibold text-slate-900">
              Interested in this job?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Submit your application to let the client know you are
              interested in this job.
            </p>

            <button
              type="button"
              className="mt-5 w-full rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Apply for Job
            </button>

          </section>

        </aside>

      </div>

    </div>
  );
};

export default JobDetails;