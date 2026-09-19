import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ArrowPathIcon,
  BriefcaseIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import { applyForJob } from "@/components/services/applicationService";
import { getMyActiveJobs } from "@/api/jobs";

import FeedbackModal from "@/components/pop/FeedbackModal/FeedbackModal";
import DetailsModal from "@/components/pop/DetailsModal/DetailsModal";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api";

type LocationStatus =
  | "idle"
  | "requesting"
  | "success"
  | "denied"
  | "error";

type Job = {
  id: number;
  title: string;
  description: string;
  budget: string;
  general_location: string;
  category_name: string | null;
  status: string;
  urgency: string;
  urgency_display: string;
  job_date: string | null;
  is_flexible: boolean;
  duration_hours: string | null;
  posted_at: string;

  latitude?: number | string | null;
  longitude?: number | string | null;
  is_urgent?: boolean;
};

type NearbyJob = {
  job: Job;
  distance_km: number;
  distance_display: string;
};

type NearbyJobsResponse = {
  count: number;
  radius_km: number;
  results: NearbyJob[];
};

const getToken = (): string | null => {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token")
  );
};

const parseJsonResponse = async (
  response: Response
): Promise<any | null> => {
  const contentType =
    response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
};

const updateWorkerLocation = async (
  latitude: number,
  longitude: number
): Promise<void> => {
  const token = getToken();

  if (!token) {
    throw new Error("You are not authenticated.");
  }

  const response = await fetch(
    `${API_URL}/auth/profile/location/`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        latitude,
        longitude,
      }),
    }
  );

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    if (data) {
      const errorMessage =
        data.error ||
        data.detail ||
        data.message ||
        `Failed to update location (${response.status}).`;

      throw new Error(errorMessage);
    }

    throw new Error(
      `Failed to update location (${response.status}).`
    );
  }
};

const getCurrentLocation =
  (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(
          new Error(
            "Geolocation is not supported by your browser."
          )
        );

        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000,
        }
      );
    });
  };

const getLocationErrorMessage = (
  error: GeolocationPositionError
): string => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location access was denied. Please enable location permission in your browser.";

    case error.POSITION_UNAVAILABLE:
      return "Your current location could not be determined. Please try again.";

    case error.TIMEOUT:
      return "Getting your location took too long. Please try again.";

    default:
      return "Unable to get your current location.";
  }
};

const formatBudget = (
  budget: string
): string => {
  if (!budget) {
    return "K0";
  }

  if (budget.startsWith("K")) {
    return budget;
  }

  return `K${budget}`;
};

const formatDate = (
  date: string | null
): string => {
  if (!date) {
    return "Flexible";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString(
    "en-ZM",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

const formatPostedDate = (
  date: string
): string => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString(
    "en-ZM",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

const formatStatus = (
  status: string
): string => {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (letter) => letter.toUpperCase()
    );
};

export default function FindJobs() {
  const [jobs, setJobs] =
    useState<NearbyJob[]>([]);

  /*
   * =========================
   * ACTIVE JOB
   * =========================
   *
   * This is used to determine
   * whether the worker already
   * has an active assignment.
   */
  const [activeJob, setActiveJob] =
    useState<Job | null>(null);

  const [
    checkingActiveJob,
    setCheckingActiveJob,
  ] = useState(true);

  /*
   * =========================
   * ACTIVE JOB POPUP
   * =========================
   */
  const [
    showActiveJobPopup,
    setShowActiveJobPopup,
  ] = useState(false);

  /*
   * =========================
   * SEARCH
   * =========================
   */
  const [radius, setRadius] =
    useState<number>(5);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<string>("all");

  /*
   * =========================
   * LOCATION
   * =========================
   */
  const [
    locationStatus,
    setLocationStatus,
  ] = useState<LocationStatus>("idle");

  const [locationError, setLocationError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  /*
   * =========================
   * JOB LOADING
   * =========================
   */
  const [jobsLoading, setJobsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * =========================
   * SELECTED JOB
   * =========================
   */
  const [selectedJob, setSelectedJob] =
    useState<NearbyJob | null>(null);

  /*
   * =========================
   * APPLICATION
   * =========================
   */
  const [applying, setApplying] =
    useState(false);

  /*
   * =========================
   * FEEDBACK
   * =========================
   */
  const [feedback, setFeedback] =
    useState<{
      isOpen: boolean;
      type:
        | "success"
        | "error"
        | "warning"
        | "info";
      title: string;
      message: string;
    }>({
      isOpen: false,
      type: "info",
      title: "",
      message: "",
    });

  /*
   * =========================
   * CHECK ACTIVE JOB
   * =========================
   */
  const checkActiveJob =
    useCallback(async (): Promise<boolean> => {
      try {
        setCheckingActiveJob(true);

        const response =
          await getMyActiveJobs();

        const activeJobs =
          response.results || [];

        if (activeJobs.length > 0) {
          const currentActiveJob =
            activeJobs[0] as Job;

          setActiveJob(
            currentActiveJob
          );

          /*
           * Show popup only when an
           * active assignment exists.
           */
          setShowActiveJobPopup(true);

          return true;
        }

        setActiveJob(null);

        return false;
      } catch (err) {
        console.error(
          "Failed to check active job:",
          err
        );

        /*
         * Do not block Find Jobs if
         * this check fails.
         *
         * The backend still protects
         * the application endpoint.
         */
        setActiveJob(null);

        return false;
      } finally {
        setCheckingActiveJob(false);
      }
    }, []);

  /*
   * =========================
   * FETCH NEARBY JOBS
   * =========================
   */
  const fetchNearbyJobs =
    useCallback(
      async (
        selectedRadius: number
      ) => {
        const token = getToken();

        if (!token) {
          setError(
            "You are not authenticated."
          );

          setJobs([]);

          return;
        }

        /*
         * Always check whether the
         * worker already has an
         * active assignment.
         */
        const hasActiveJob =
          await checkActiveJob();

        /*
         * If the worker already has
         * an active job, don't show
         * nearby jobs.
         */
        if (hasActiveJob) {
          setJobs([]);
          setJobsLoading(false);

          return;
        }

        setJobsLoading(true);
        setError("");

        try {
          const response = await fetch(
            `${API_URL}/matching/nearby/?radius=${selectedRadius}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type":
                  "application/json",
              },
            }
          );

          const data =
            await parseJsonResponse(
              response
            );

          if (!response.ok) {
            if (data) {
              const errorMessage =
                data.error ||
                data.detail ||
                data.message ||
                `Failed to load nearby jobs (${response.status}).`;

              throw new Error(
                errorMessage
              );
            }

            throw new Error(
              `Failed to load nearby jobs (${response.status}).`
            );
          }

          if (!data) {
            throw new Error(
              "The server returned an invalid jobs response."
            );
          }

          const nearbyJobsResponse =
            data as NearbyJobsResponse;

          setJobs(
            nearbyJobsResponse.results ||
              []
          );
        } catch (err) {
          console.error(
            "Failed to fetch nearby jobs:",
            err
          );

          setJobs([]);

          setError(
            err instanceof Error
              ? err.message
              : "Failed to load nearby jobs."
          );
        } finally {
          setJobsLoading(false);
        }
      },
      [checkActiveJob]
    );

  /*
   * =========================
   * LOCATION + JOBS
   * =========================
   */
  const requestLocationAndLoadJobs =
    useCallback(async () => {
      setLocationStatus("requesting");
      setLocationError("");
      setError("");
      setLoading(true);

      try {
        const position =
          await getCurrentLocation();

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        await updateWorkerLocation(
          latitude,
          longitude
        );

        setLocationStatus("success");

        await fetchNearbyJobs(radius);
      } catch (err) {
        console.error(
          "Location error:",
          err
        );

        if (
          typeof err === "object" &&
          err !== null &&
          "code" in err
        ) {
          const geoError =
            err as GeolocationPositionError;

          setLocationStatus(
            geoError.code === 1
              ? "denied"
              : "error"
          );

          setLocationError(
            getLocationErrorMessage(
              geoError
            )
          );
        } else {
          setLocationStatus("error");

          setLocationError(
            err instanceof Error
              ? err.message
              : "Unable to update your location."
          );
        }

        setJobs([]);
      } finally {
        setLoading(false);
      }
    }, [fetchNearbyJobs, radius]);

  /*
   * =========================
   * INITIAL LOAD
   * =========================
   */
  useEffect(() => {
    requestLocationAndLoadJobs();
  }, [requestLocationAndLoadJobs]);

  /*
   * =========================
   * CHANGE RADIUS
   * =========================
   */
  const handleRadiusChange = async (
    newRadius: number
  ) => {
    setRadius(newRadius);

    if (
      locationStatus === "success"
    ) {
      await fetchNearbyJobs(
        newRadius
      );
    }
  };

  /*
   * =========================
   * VIEW JOB
   * =========================
   */
  const handleViewJob = (
    item: NearbyJob
  ) => {
    setSelectedJob(item);
  };

  /*
   * =========================
   * CLOSE JOB
   * =========================
   */
  const handleCloseJob = () => {
    if (applying) {
      return;
    }

    setSelectedJob(null);
  };

  /*
   * =========================
   * CLOSE FEEDBACK
   * =========================
   */
  const handleCloseFeedback = () => {
    setFeedback((current) => ({
      ...current,
      isOpen: false,
    }));
  };

  /*
   * =========================
   * APPLY FOR JOB
   * =========================
   */
  const handleApplyForJob =
    async () => {
      if (!selectedJob) {
        return;
      }

      /*
       * Check again before applying.
       *
       * This protects against the
       * worker being assigned to a
       * job while Find Jobs was open.
       */
      const hasActiveJob =
        await checkActiveJob();

      if (hasActiveJob) {
        setSelectedJob(null);

        return;
      }

      setApplying(true);

      try {
        const result =
          await applyForJob(
            selectedJob.job.id
          );

        setSelectedJob(null);

        setFeedback({
          isOpen: true,
          type: "success",
          title: "Application Submitted",
          message:
            result.message ||
            "Your application has been submitted successfully.",
        });
      } catch (err) {
        console.error(
          "Failed to apply for job:",
          err
        );

        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to apply for this job.";

        setSelectedJob(null);

        setFeedback({
          isOpen: true,
          type: "error",
          title: "Unable to Apply",
          message: errorMessage,
        });
      } finally {
        setApplying(false);
      }
    };

  /*
   * =========================
   * CATEGORIES
   * =========================
   */
  const categories = Array.from(
    new Set(
      jobs
        .map(
          (item) =>
            item.job.category_name
        )
        .filter(
          (
            category
          ): category is string =>
            Boolean(category)
        )
    )
  );

  /*
   * =========================
   * FILTER JOBS
   * =========================
   */
  const filteredJobs = jobs.filter(
    (item) => {
      const job = item.job;

      const normalizedSearch =
        searchQuery
          .trim()
          .toLowerCase();

      const matchesSearch =
        normalizedSearch === "" ||
        job.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        job.description
          .toLowerCase()
          .includes(normalizedSearch) ||
        job.general_location
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesCategory =
        selectedCategory === "all" ||
        job.category_name ===
          selectedCategory;

      return (
        matchesSearch &&
        matchesCategory
      );
    }
  );

  /*
   * =========================
   * LOCATION SCREEN
   * =========================
   */
  if (
    locationStatus !== "success" &&
    (loading ||
      locationStatus === "idle" ||
      locationStatus === "requesting" ||
      locationStatus === "denied" ||
      locationStatus === "error")
  ) {
    return (
      <div className="min-h-full bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center text-center">
              {locationStatus ===
                "requesting" ||
              loading ? (
                <>
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                    <MapPinIcon className="h-8 w-8 animate-pulse text-blue-600" />
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900">
                    Getting your location
                  </h2>

                  <p className="mt-2 max-w-lg text-sm text-gray-600">
                    KaJob needs your current
                    location to find available
                    jobs near you.
                  </p>

                  <div className="mt-6 h-2 w-48 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-600" />
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
                    <MapPinIcon className="h-8 w-8 text-amber-600" />
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900">
                    Location access is required
                  </h2>

                  <p className="mt-3 max-w-lg text-sm leading-6 text-gray-600">
                    KaJob uses your current
                    location to show available
                    jobs near you. Your exact
                    location is not shown to
                    clients before you are
                    assigned to a job.
                  </p>

                  {locationError && (
                    <div className="mt-4 max-w-lg rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                      {locationError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={
                      requestLocationAndLoadJobs
                    }
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <MapPinIcon className="h-5 w-5" />
                    Enable Location
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* =========================
            HEADER
            ========================= */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Find Jobs
              </h1>

              <p className="mt-1 text-sm text-gray-600">
                Find available work
                opportunities near you.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              <MapPinIcon className="h-5 w-5" />

              <span>
                Location enabled
              </span>
            </div>
          </div>
        </div>

        {/* =========================
            ACTIVE JOB INFORMATION
            ========================= */}

        {!checkingActiveJob &&
          activeJob && (
            <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <BriefcaseIcon className="h-5 w-5 flex-shrink-0 text-blue-600" />

                <p className="text-sm text-blue-800">
                  You currently have an
                  active job. Complete it
                  before applying for
                  another job.
                </p>
              </div>
            </div>
          )}

        {/* =========================
            SEARCH + FILTERS
            ========================= */}

        {!activeJob && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row">

              {/* Search */}

              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search jobs..."
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Radius */}

              <div className="flex items-center gap-2">
                <MapPinIcon className="h-5 w-5 text-gray-500" />

                <label
                  htmlFor="radius"
                  className="whitespace-nowrap text-sm font-medium text-gray-700"
                >
                  Radius
                </label>

                <select
                  id="radius"
                  value={radius}
                  onChange={(event) =>
                    handleRadiusChange(
                      Number(
                        event.target.value
                      )
                    )
                  }
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value={0.5}>
                    0.5 km
                  </option>

                  <option value={1}>
                    1 km
                  </option>

                  <option value={2}>
                    2 km
                  </option>

                  <option value={5}>
                    5 km
                  </option>

                  <option value={10}>
                    10 km
                  </option>
                </select>
              </div>

              {/* Category */}

              <div className="flex items-center gap-2">
                <FunnelIcon className="h-5 w-5 text-gray-500" />

                <select
                  value={selectedCategory}
                  onChange={(event) =>
                    setSelectedCategory(
                      event.target.value
                    )
                  }
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="all">
                    All categories
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Refresh */}

              <button
                type="button"
                onClick={() =>
                  fetchNearbyJobs(radius)
                }
                disabled={jobsLoading}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowPathIcon
                  className={`h-5 w-5 ${
                    jobsLoading
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh
              </button>
            </div>
          </div>
        )}

        {/* =========================
            RESULTS HEADER
            ========================= */}

        {!activeJob && (
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Nearby Jobs
              </h2>

              <p className="text-sm text-gray-500">
                {filteredJobs.length}{" "}
                {filteredJobs.length === 1
                  ? "job"
                  : "jobs"}{" "}
                within {radius} km
              </p>
            </div>
          </div>
        )}

        {/* =========================
            JOB LOADING
            ========================= */}

        {jobsLoading && !activeJob && (
          <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Searching for jobs near you...
          </div>
        )}

        {/* =========================
            ERROR
            ========================= */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">
              Unable to load jobs
            </p>

            <p className="mt-1">
              {error}
            </p>
          </div>
        )}

        {/* =========================
            EMPTY STATE
            ========================= */}

        {!activeJob &&
          !jobsLoading &&
          filteredJobs.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <BriefcaseIcon className="h-8 w-8 text-gray-500" />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No jobs found nearby
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
                There are currently no
                available jobs matching
                your search within{" "}
                {radius} km of your
                location.
              </p>

              <button
                type="button"
                onClick={() =>
                  handleRadiusChange(
                    radius < 10
                      ? Math.min(
                          radius * 2,
                          10
                        )
                      : radius
                  )
                }
                disabled={radius >= 10}
                className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {radius < 10
                  ? "Search a wider area"
                  : "Maximum radius reached"}
              </button>
            </div>
          )}

        {/* =========================
            JOB CARDS
            ========================= */}

        {!activeJob &&
          filteredJobs.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredJobs.map((item) => {
                const job = item.job;

                return (
                  <article
                    key={job.id}
                    onClick={() =>
                      handleViewJob(item)
                    }
                    className="cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="p-5">

                      {/* Job heading */}

                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-lg font-semibold text-gray-900">
                            {job.title}
                          </h3>

                          {job.category_name && (
                            <span className="mt-2 inline-block rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                              {
                                job.category_name
                              }
                            </span>
                          )}
                        </div>

                        <span className="flex-shrink-0 rounded-lg bg-green-50 px-2.5 py-1 text-sm font-semibold text-green-700">
                          {formatBudget(
                            job.budget
                          )}
                        </span>
                      </div>

                      {/* Description */}

                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600">
                        {job.description}
                      </p>

                      {/* Location */}

                      <div className="mt-4 flex items-start gap-2 text-sm text-gray-600">
                        <MapPinIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-500" />

                        <div>
                          <p className="font-medium text-gray-800">
                            {job.general_location ||
                              "Location available"}
                          </p>

                          <p className="text-xs text-gray-500">
                            {item.distance_display ||
                              `${item.distance_km} km away`}
                          </p>
                        </div>
                      </div>

                      {/* Details */}

                      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                        <div>
                          <p className="text-xs text-gray-500">
                            Date
                          </p>

                          <p className="mt-1 text-sm font-medium text-gray-800">
                            {formatDate(
                              job.job_date
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Duration
                          </p>

                          <p className="mt-1 text-sm font-medium text-gray-800">
                            {job.duration_hours
                              ? `${job.duration_hours} hrs`
                              : "Not specified"}
                          </p>
                        </div>
                      </div>

                      {/* Urgency */}

                      {job.urgency_display && (
                        <div className="mt-4">
                          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
                            {
                              job.urgency_display
                            }
                          </span>
                        </div>
                      )}

                      {/* View */}

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();

                          handleViewJob(item);
                        }}
                        className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        View Job
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
      </div>

      {/* =====================================================
          ACTIVE JOB POPUP
          ===================================================== */}

      <FeedbackModal
        isOpen={showActiveJobPopup}
        type="info"
        title="Active Job"
        message={
          activeJob
            ? `You already have an active job: "${activeJob.title}". Complete your current job before applying for another one.`
            : "You already have an active job. Complete your current job before applying for another one."
        }
        onClose={() =>
          setShowActiveJobPopup(false)
        }
      />

      {/* =====================================================
          JOB DETAILS POPUP
          ===================================================== */}

      {selectedJob && (
        <DetailsModal
          title={selectedJob.job.title}
          onClose={handleCloseJob}
          width="xl"
          footer={
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleCloseJob}
                disabled={applying}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApplyForJob}
                disabled={applying}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {applying ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    Applying...
                  </span>
                ) : (
                  "Apply for Job"
                )}
              </button>
            </div>
          }
        >
          <div>
            {/* Category */}

            {selectedJob.job.category_name && (
              <span className="inline-block rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                {
                  selectedJob.job
                    .category_name
                }
              </span>
            )}

            {/* Budget */}

            <div className="mt-4 rounded-xl bg-green-50 p-5">
              <p className="text-sm font-medium text-green-700">
                Job Budget
              </p>

              <p className="mt-1 text-3xl font-bold text-green-800">
                {formatBudget(
                  selectedJob.job.budget
                )}
              </p>
            </div>

            {/* Description */}

            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Job Description
              </h3>

              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-gray-700">
                {
                  selectedJob.job
                    .description
                }
              </p>
            </div>

            {/* Job information */}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              {/* Location */}

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  <MapPinIcon className="h-6 w-6 flex-shrink-0 text-blue-600" />

                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Location
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {
                        selectedJob.job
                          .general_location
                      }
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {
                        selectedJob
                          .distance_display
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Date */}

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  <CalendarDaysIcon className="h-6 w-6 flex-shrink-0 text-blue-600" />

                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Job Date
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {formatDate(
                        selectedJob.job
                          .job_date
                      )}
                    </p>

                    {selectedJob.job
                      .is_flexible && (
                      <p className="mt-1 text-xs text-gray-500">
                        Date is flexible
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Duration */}

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  <ClockIcon className="h-6 w-6 flex-shrink-0 text-blue-600" />

                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Duration
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {selectedJob.job
                        .duration_hours
                        ? `${selectedJob.job.duration_hours} hours`
                        : "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Distance */}

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  <MapPinIcon className="h-6 w-6 flex-shrink-0 text-blue-600" />

                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Distance
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {
                        selectedJob
                          .distance_display
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Urgency */}

            {selectedJob.job
              .urgency_display && (
              <div className="mt-6 rounded-xl border border-orange-100 bg-orange-50 p-4">
                <p className="text-xs font-medium text-orange-600">
                  Urgency
                </p>

                <p className="mt-1 text-sm font-semibold text-orange-800">
                  {
                    selectedJob.job
                      .urgency_display
                  }
                </p>
              </div>
            )}

            {/* Status */}

            {selectedJob.job.status && (
              <div className="mt-5">
                <p className="text-xs font-medium text-gray-500">
                  Status
                </p>

                <p className="mt-1 text-sm font-medium text-gray-800">
                  {formatStatus(
                    selectedJob.job.status
                  )}
                </p>
              </div>
            )}

            {/* Posted */}

            <div className="mt-5 text-xs text-gray-500">
              Posted on{" "}
              {formatPostedDate(
                selectedJob.job.posted_at
              )}
            </div>
          </div>
        </DetailsModal>
      )}

      {/* =====================================================
          APPLICATION FEEDBACK
          ===================================================== */}

      <FeedbackModal
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        onClose={handleCloseFeedback}
      />
    </div>
  );
}