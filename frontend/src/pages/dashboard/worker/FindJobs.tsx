import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapIcon,
  ListBulletIcon,
  BriefcaseIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import JobCard from "@/components/dashboard/JobCard";
import JobMap from "@/components/dashboard/JobMap";

import type {
  Job,
  JobsResponse,
} from "@/shared/types/job";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api";


type ApiError = {
  error?: string;
  detail?: string;
};


const getToken = () => {
  return localStorage.getItem("access_token");
};


const FindJobs = () => {

  const [jobs, setJobs] =
    useState<Job[]>([]);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("All Categories");

  const [jobType, setJobType] =
    useState("All Types");

  const [view, setView] =
    useState<"list" | "map">("list");

  const [loading, setLoading] =
    useState(true);

  const [searching, setSearching] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);


  /* =========================
     GET JOBS
  ========================= */

  const fetchJobs = async () => {

    try {

      setLoading(true);
      setError(null);

      const token = getToken();

      if (!token) {
        throw new Error(
          "You are not authenticated."
        );
      }

      const response = await fetch(
        `${API_URL}/jobs/`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },
        }
      );

      const data:
        | JobsResponse
        | ApiError =
        await response.json();

      if (!response.ok) {

        throw new Error(
          (data as ApiError).error ||
          (data as ApiError).detail ||
          "Failed to load jobs."
        );

      }

      setJobs(
        (data as JobsResponse).results || []
      );

    } catch (err) {

      console.error(
        "Failed to fetch jobs:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load jobs."
      );

    } finally {

      setLoading(false);

    }
  };


  /* =========================
     INITIAL LOAD
  ========================= */

  useEffect(() => {

    fetchJobs();

  }, []);


  /* =========================
     SEARCH
  ========================= */

  const handleSearch = async () => {

    const query =
      search.trim();

    if (!query) {

      fetchJobs();

      return;
    }

    try {

      setSearching(true);
      setError(null);

      const token =
        getToken();

      if (!token) {
        throw new Error(
          "You are not authenticated."
        );
      }

      const response =
        await fetch(
          `${API_URL}/jobs/search/?q=${encodeURIComponent(
            query
          )}`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },
          }
        );

      const data:
        | JobsResponse
        | ApiError =
        await response.json();

      if (!response.ok) {

        throw new Error(
          (data as ApiError).error ||
          (data as ApiError).detail ||
          "Search failed."
        );

      }

      setJobs(
        (data as JobsResponse).results || []
      );

    } catch (err) {

      console.error(
        "Search failed:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Search failed."
      );

    } finally {

      setSearching(false);

    }
  };


  /* =========================
     CATEGORIES
  ========================= */

  const categories =
    useMemo(() => {

      const values =
        jobs
          .map(
            (job) =>
              job.category_name
          )
          .filter(
            (
              value
            ): value is string =>
              Boolean(value)
          );

      return Array.from(
        new Set(values)
      );

    }, [jobs]);


  /* =========================
     JOB TYPES
  ========================= */

  const jobTypes =
    useMemo(() => {

      const values =
        jobs
          .map(
            (job) =>
              job.timeframe_display ||
              job.timeframe
          )
          .filter(
            (
              value
            ): value is string =>
              Boolean(value)
          );

      return Array.from(
        new Set(values)
      );

    }, [jobs]);


  /* =========================
     FILTER JOBS
  ========================= */

  const filteredJobs =
    useMemo(() => {

      return jobs.filter(
        (job) => {

          const categoryMatch =
            category ===
              "All Categories" ||
            job.category_name ===
              category;

          const type =
            job.timeframe_display ||
            job.timeframe;

          const typeMatch =
            jobType === "All Types" ||
            type === jobType;

          return (
            categoryMatch &&
            typeMatch
          );

        }
      );

    }, [
      jobs,
      category,
      jobType,
    ]);


  /* =========================
     CLEAR FILTERS
  ========================= */

  const clearFilters = () => {

    setSearch("");

    setCategory(
      "All Categories"
    );

    setJobType(
      "All Types"
    );

    fetchJobs();
  };


  /* =========================
     LOADING
  ========================= */

  if (loading) {

    return (
      <div className="space-y-6">

        <Header />

        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading available jobs...
          </p>

        </div>

      </div>
    );
  }


  /* =========================
     PAGE
  ========================= */

  return (
    <div className="space-y-6">

      <Header />


      {/* =====================
          ERROR
      ===================== */}

      {error && (

        <div className="rounded-xl border border-red-200 bg-red-50 p-4">

          <div className="flex items-start gap-3">

            <ExclamationTriangleIcon
              className="h-5 w-5 shrink-0 text-red-500"
            />

            <div>

              <p className="font-semibold text-red-800">
                Unable to load jobs
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchJobs}
                className="mt-2 text-sm font-semibold text-red-700 underline hover:text-red-900"
              >
                Try again
              </button>

            </div>

          </div>

        </div>

      )}


      {/* =====================
          SEARCH + FILTERS
      ===================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-5">

        {/* SEARCH */}

        <div className="flex flex-col gap-3 lg:flex-row">

          <div className="flex flex-1 items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 transition focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">

            <MagnifyingGlassIcon
              className="h-5 w-5 shrink-0 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              onKeyDown={(e) => {

                if (
                  e.key === "Enter"
                ) {
                  handleSearch();
                }

              }}
              placeholder="Search for jobs..."
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />

          </div>


          {/* SEARCH BUTTON */}

          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >

            <MagnifyingGlassIcon className="h-5 w-5" />

            {searching
              ? "Searching..."
              : "Search"}

          </button>

        </div>


        {/* FILTERS */}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">

          {/* CATEGORY */}

          <div className="flex flex-1 items-center gap-2">

            <FunnelIcon
              className="h-5 w-5 shrink-0 text-slate-400"
            />

            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >

              <option value="All Categories">
                All Categories
              </option>

              {categories.map(
                (item) => (

                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>

                )
              )}

            </select>

          </div>


          {/* JOB TYPE */}

          <select
            value={jobType}
            onChange={(e) =>
              setJobType(
                e.target.value
              )
            }
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >

            <option value="All Types">
              All Types
            </option>

            {jobTypes.map(
              (type) => (

                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>

              )
            )}

          </select>

        </div>

      </div>


      {/* =====================
          RESULTS HEADER
      ===================== */}

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-lg font-semibold text-slate-900">
            Available Jobs
          </h2>

          <p className="text-sm text-slate-500">

            {filteredJobs.length}{" "}

            {filteredJobs.length === 1
              ? "job"
              : "jobs"}{" "}

            available

          </p>

        </div>


        {/* VIEW SWITCHER */}

        <div className="flex rounded-lg border border-slate-200 bg-white p-1">

          <button
            type="button"
            onClick={() =>
              setView("list")
            }
            aria-label="List view"
            className={`rounded-md p-2 transition ${
              view === "list"
                ? "bg-emerald-600 text-white"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >

            <ListBulletIcon className="h-4 w-4" />

          </button>


          <button
            type="button"
            onClick={() =>
              setView("map")
            }
            aria-label="Map view"
            className={`rounded-md p-2 transition ${
              view === "map"
                ? "bg-emerald-600 text-white"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >

            <MapIcon className="h-4 w-4" />

          </button>

        </div>

      </div>


      {/* =====================
          JOB RESULTS
      ===================== */}

      {filteredJobs.length === 0 ? (

        <EmptyState
          clearFilters={
            clearFilters
          }
        />

      ) : view === "list" ? (

        <div className="space-y-4">

          {filteredJobs.map(
            (job) => (

              <JobCard
                key={job.id}
                job={job}
              />

            )
          )}

        </div>

      ) : (

        <JobMap
          jobs={filteredJobs}
        />

      )}

    </div>
  );
};


/* =========================
   HEADER
========================= */

const Header = () => {

  return (
    <section>

      <h1 className="text-2xl font-bold text-slate-900">
        Find Jobs
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        Find available jobs that match your skills and location.
      </p>

    </section>
  );
};


/* =========================
   EMPTY STATE
========================= */

type EmptyStateProps = {
  clearFilters: () => void;
};


const EmptyState = ({
  clearFilters,
}: EmptyStateProps) => {

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-10 text-center">

      <BriefcaseIcon className="mx-auto h-10 w-10 text-slate-300" />

      <h3 className="mt-4 font-semibold text-slate-900">
        No jobs found
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        No jobs match your current filters.
      </p>

      <button
        type="button"
        onClick={clearFilters}
        className="mt-4 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
      >
        Clear filters
      </button>

    </section>
  );
};


export default FindJobs;