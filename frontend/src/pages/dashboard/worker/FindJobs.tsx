import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowPathIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

import { applyForJob, getMyApplications } from "@/components/services/applicationService";
import { getMyActiveJobs } from "@/api/jobs";

import FeedbackModal from "@/components/pop/FeedbackModal/FeedbackModal";
import DetailsModal from "@/components/pop/DetailsModal/DetailsModal";

import FindJobsHeader from "@/components/find-jobs/FindJobsHeader";
import JobsGrid from "@/components/find-jobs/JobsGrid";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api";

type LocationStatus =
  | "idle"
  | "requesting"
  | "success"
  | "denied"
  | "error";

type ViewMode = "list" | "map";

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
  job_time?: string | null;
  is_flexible: boolean;
  duration_hours: string | null;
  posted_at: string;

  latitude?: number | string | null;
  longitude?: number | string | null;
  is_urgent?: boolean;
  required_skills?: string[];
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

const formatTime = (
  time?: string | null
): string => {
  if (!time) {
    return "Flexible";
  }

  const [hours, minutes] =
    time.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return time;
  }

  const date = new Date();

  date.setHours(
    hours,
    minutes,
    0,
    0
  );

  return date.toLocaleTimeString(
    "en-ZM",
    {
      hour: "numeric",
      minute: "2-digit",
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

  const [appliedJobIds, setAppliedJobIds] =
    useState<Set<number>>(new Set());

  const [activeJob, setActiveJob] =
    useState<Job | null>(null);

  const [
    checkingActiveJob,
    setCheckingActiveJob,
  ] = useState(true);

  const [
    showActiveJobPopup,
    setShowActiveJobPopup,
  ] = useState(false);

  const [radius, setRadius] =
    useState<number>(5);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<string>("all");

  const [viewMode, setViewMode] =
    useState<ViewMode>("list");

  const [
    locationStatus,
    setLocationStatus,
  ] = useState<LocationStatus>("idle");

  const [locationError, setLocationError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [jobsLoading, setJobsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [selectedJob, setSelectedJob] =
    useState<NearbyJob | null>(null);

  const [applyingJobId, setApplyingJobId] =
    useState<number | null>(null);

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

  /* CHECK ACTIVE JOB */
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

          setActiveJob(currentActiveJob);
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

        setActiveJob(null);

        return false;
      } finally {
        setCheckingActiveJob(false);
      }
    }, []);

  /* LOAD EXISTING APPLICATIONS */
  const loadAppliedJobs =
    useCallback(async () => {
      try {
        const response =
          await getMyApplications();

        const applications =
          response.results || [];

        const jobIds = new Set<number>(
          applications.map(
            (application) =>
              application.job
          )
        );

        setAppliedJobIds(jobIds);
      } catch (err) {
        console.error(
          "Failed to load existing applications:",
          err
        );

        /*
         * We intentionally do not block
         * Find Jobs if application history
         * fails to load.
         */
      }
    }, []);

  /* FETCH NEARBY JOBS */
  const fetchNearbyJobs =
    useCallback(
      async (selectedRadius: number) => {
        const token = getToken();

        if (!token) {
          setError(
            "You are not authenticated."
          );
          setJobs([]);
          return;
        }

        const hasActiveJob =
          await checkActiveJob();

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
                "Content-Type": "application/json",
              },
            }
          );

          const data =
            await parseJsonResponse(response);

          if (!response.ok) {
            if (data) {
              const errorMessage =
                data.error ||
                data.detail ||
                data.message ||
                `Failed to load nearby jobs (${response.status}).`;

              throw new Error(errorMessage);
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
            nearbyJobsResponse.results || []
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

  /* LOCATION */
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

        /*
         * Load both nearby jobs and the
         * worker's existing applications.
         */
        await Promise.all([
          fetchNearbyJobs(radius),
          loadAppliedJobs(),
        ]);
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
    }, [
      fetchNearbyJobs,
      loadAppliedJobs,
      radius,
    ]);

  useEffect(() => {
    requestLocationAndLoadJobs();
  }, [requestLocationAndLoadJobs]);

  /* RADIUS */
  const handleRadiusChange =
    async (newRadius: number) => {
      setRadius(newRadius);

      if (
        locationStatus === "success"
      ) {
        await fetchNearbyJobs(
          newRadius
        );
      }
    };

  /* JOB ACTIONS */
  const handleViewJob = (
    item: NearbyJob
  ) => {
    setSelectedJob(item);
  };

  const handleApplyFromCard =
    async (item: NearbyJob) => {
      /*
       * Do nothing if the worker has
       * already applied.
       */
      if (
        appliedJobIds.has(item.job.id)
      ) {
        return;
      }

      const hasActiveJob =
        await checkActiveJob();

      if (hasActiveJob) {
        return;
      }

      setApplyingJobId(item.job.id);

      try {
        await applyForJob(
          item.job.id
        );

        /*
         * Immediately mark this job
         * as applied.
         */
        setAppliedJobIds(
          (currentIds) => {
            const updatedIds =
              new Set(currentIds);

            updatedIds.add(
              item.job.id
            );

            return updatedIds;
          }
        );

        /*
         * No success feedback modal.
         */
      } catch (err) {
        console.error(
          "Failed to apply for job:",
          err
        );

        setFeedback({
          isOpen: true,
          type: "error",
          title: "Unable to Apply",
          message:
            err instanceof Error
              ? err.message
              : "Failed to apply for this job.",
        });
      } finally {
        setApplyingJobId(null);
      }
    };

  const handleCloseJob = () => {
    if (
      applyingJobId !== null
    ) {
      return;
    }

    setSelectedJob(null);
  };

  const handleCloseFeedback = () => {
    setFeedback(
      (current) => ({
        ...current,
        isOpen: false,
      })
    );
  };

  const handleApplyForJob =
    async () => {
      if (!selectedJob) {
        return;
      }

      const jobId =
        selectedJob.job.id;

      /*
       * Prevent applying again if the
       * worker already applied.
       */
      if (
        appliedJobIds.has(jobId)
      ) {
        setSelectedJob(null);
        return;
      }

      const hasActiveJob =
        await checkActiveJob();

      if (hasActiveJob) {
        setSelectedJob(null);
        return;
      }

      setApplyingJobId(jobId);

      try {
        await applyForJob(jobId);

        /*
         * Immediately mark the job
         * as applied.
         */
        setAppliedJobIds(
          (currentIds) => {
            const updatedIds =
              new Set(currentIds);

            updatedIds.add(jobId);

            return updatedIds;
          }
        );

        setSelectedJob(null);

        /*
         * No success feedback modal.
         */
      } catch (err) {
        console.error(
          "Failed to apply for job:",
          err
        );

        setSelectedJob(null);

        setFeedback({
          isOpen: true,
          type: "error",
          title: "Unable to Apply",
          message:
            err instanceof Error
              ? err.message
              : "Failed to apply for this job.",
        });
      } finally {
        setApplyingJobId(null);
      }
    };

  /* CATEGORIES */
  const categories = useMemo(
    () =>
      Array.from(
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
      ),
    [jobs]
  );

  /* FILTER JOBS */
  const filteredJobs = useMemo(() => {
    const normalizedSearch =
      searchQuery
        .trim()
        .toLowerCase();

    return jobs.filter(
      (item) => {
        const job = item.job;

        const matchesSearch =
          normalizedSearch === "" ||
          job.title
            .toLowerCase()
            .includes(
              normalizedSearch
            ) ||
          job.description
            .toLowerCase()
            .includes(
              normalizedSearch
            ) ||
          job.general_location
            .toLowerCase()
            .includes(
              normalizedSearch
            );

        const matchesCategory =
          selectedCategory ===
            "all" ||
          job.category_name ===
            selectedCategory;

        return (
          matchesSearch &&
          matchesCategory
        );
      }
    );
  }, [
    jobs,
    searchQuery,
    selectedCategory,
  ]);

  /* LOCATION SCREEN */
  if (
    locationStatus !== "success" &&
    (loading ||
      locationStatus === "idle" ||
      locationStatus ===
        "requesting" ||
      locationStatus ===
        "denied" ||
      locationStatus === "error")
  ) {
    return (
      <div className="min-h-full bg-white p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
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
                    KaJob needs your current location to find
                    available jobs near you.
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
                    KaJob uses your current location to show
                    available jobs near you. Your exact location
                    is not shown to clients before you are
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
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
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

  /* MAIN PAGE */
  return (
    <div className="min-h-full bg-white">
      <div className="mx-auto max-w-[1600px] px-6 py-2">
        {!activeJob && (
          <FindJobsHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            radius={radius}
            onRadiusChange={
              handleRadiusChange
            }
            selectedCategory={
              selectedCategory
            }
            onCategoryChange={
              setSelectedCategory
            }
            categories={categories}
            viewMode={viewMode}
            setViewMode={setViewMode}
            jobsLoading={jobsLoading}
            onRefresh={() =>
              fetchNearbyJobs(radius)
            }
          />
        )}

        {!checkingActiveJob &&
          activeJob && (
            <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <BriefcaseIcon className="h-5 w-5 shrink-0 text-blue-600" />

                <p className="text-sm text-blue-800">
                  You currently have an active
                  job. Complete it before applying
                  for another job.
                </p>
              </div>
            </div>
          )}

        {!activeJob && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {filteredJobs.length}{" "}
              {filteredJobs.length ===
              1
                ? "job"
                : "jobs"}{" "}
              within {radius} km
            </p>

            {jobsLoading && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                Updating jobs...
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-semibold text-red-800">
              Unable to load jobs
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>
          </div>
        )}

        {!activeJob &&
          viewMode === "list" &&
          !jobsLoading && (
            <JobsGrid
              jobs={filteredJobs}
              applyingJobId={
                applyingJobId
              }
              appliedJobIds={
                appliedJobIds
              }
              radius={radius}
              onViewJob={
                handleViewJob
              }
              onApply={
                handleApplyFromCard
              }
              onSearchWider={() =>
                handleRadiusChange(
                  Math.min(
                    radius * 2,
                    10
                  )
                )
              }
              canSearchWider={
                radius < 10
              }
            />
          )}

        {!activeJob &&
          viewMode === "map" &&
          filteredJobs.length > 0 && (
            <section className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <div className="relative h-[600px]">
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white">
                      <MapIcon className="h-7 w-7 text-gray-400" />
                    </div>

                    <h3 className="mt-4 text-base font-semibold text-gray-900">
                      Jobs Map
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                      Map view will display available jobs around
                      your current location.
                    </p>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 max-h-[250px] overflow-y-auto rounded-xl border border-gray-200 bg-white p-3 shadow-lg md:left-auto md:w-[360px]">
                  <div className="mb-2 px-1">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Nearby Jobs
                    </h3>

                    <p className="text-xs text-gray-500">
                      Select a job to view details.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    {filteredJobs
                      .slice(0, 5)
                      .map(
                        (item) => (
                          <button
                            key={
                              item.job.id
                            }
                            type="button"
                            onClick={() =>
                              handleViewJob(
                                item
                              )
                            }
                            className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition hover:bg-gray-50"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                              <MapPinIcon className="h-4 w-4 text-gray-500" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold text-gray-900">
                                {
                                  item
                                    .job
                                    .title
                                }
                              </p>

                              <p className="truncate text-[11px] text-gray-500">
                                {
                                  item
                                    .job
                                    .general_location
                                }
                              </p>
                            </div>

                            <span className="text-[10px] font-semibold text-gray-600">
                              {
                                item.distance_display
                              }
                            </span>
                          </button>
                        )
                      )}
                  </div>
                </div>
              </div>
            </section>
          )}

        {selectedJob && (
          <DetailsModal
            title={
              selectedJob.job.title
            }
            onClose={
              handleCloseJob
            }
            width="xl"
            footer={
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={
                    handleCloseJob
                  }
                  disabled={
                    applyingJobId !==
                    null
                  }
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleApplyForJob
                  }
                  disabled={
                    applyingJobId !==
                      null ||
                    appliedJobIds.has(
                      selectedJob.job.id
                    )
                  }
                  className={`flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                    appliedJobIds.has(
                      selectedJob.job.id
                    )
                      ? "cursor-not-allowed border border-green-200 bg-green-50 text-green-700"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  } disabled:opacity-50`}
                >
                  {appliedJobIds.has(
                    selectedJob.job.id
                  ) ? (
                    "Applied"
                  ) : applyingJobId ===
                    selectedJob.job.id ? (
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
              {selectedJob.job
                .category_name && (
                <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                  {
                    selectedJob.job
                      .category_name
                  }
                </span>
              )}

              <div className="mt-4 rounded-xl bg-gray-50 p-5">
                <p className="text-sm font-medium text-gray-500">
                  Job Budget
                </p>

                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {formatBudget(
                    selectedJob.job
                      .budget
                  )}
                </p>
              </div>

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

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="h-6 w-6 shrink-0 text-gray-500" />

                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Location
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {
                          selectedJob
                            .job
                            .general_location
                        }
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {
                          selectedJob.distance_display
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start gap-3">
                    <CalendarDaysIcon className="h-6 w-6 shrink-0 text-gray-500" />

                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Job Date
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {formatDate(
                          selectedJob
                            .job
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

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start gap-3">
                    <ClockIcon className="h-6 w-6 shrink-0 text-gray-500" />

                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Time
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {formatTime(
                          selectedJob
                            .job
                            .job_time
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start gap-3">
                    <ClockIcon className="h-6 w-6 shrink-0 text-gray-500" />

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

                <div className="rounded-xl border border-gray-200 p-4 sm:col-span-2">
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="h-6 w-6 shrink-0 text-gray-500" />

                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Distance from you
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {
                          selectedJob.distance_display
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedJob.job
                .urgency_display && (
                <div className="mt-6 rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">
                    Urgency
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {
                      selectedJob.job
                        .urgency_display
                    }
                  </p>
                </div>
              )}

              {selectedJob.job
                .status && (
                <div className="mt-5">
                  <p className="text-xs font-medium text-gray-500">
                    Status
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {formatStatus(
                      selectedJob.job
                        .status
                    )}
                  </p>
                </div>
              )}

              <div className="mt-5 text-xs text-gray-500">
                Posted on{" "}
                {formatPostedDate(
                  selectedJob.job
                    .posted_at
                )}
              </div>
            </div>
          </DetailsModal>
        )}

        <FeedbackModal
          isOpen={
            showActiveJobPopup
          }
          type="info"
          title="Active Job"
          message={
            activeJob
              ? `You already have an active job: "${activeJob.title}". Complete your current job before applying for another one.`
              : "You already have an active job. Complete your current job before applying for another one."
          }
          onClose={() =>
            setShowActiveJobPopup(
              false
            )
          }
        />

        <FeedbackModal
          isOpen={
            feedback.isOpen
          }
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
          onClose={
            handleCloseFeedback
          }
        />
      </div>
    </div>
  );
}