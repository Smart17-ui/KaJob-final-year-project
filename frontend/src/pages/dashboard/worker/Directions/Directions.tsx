import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ClockIcon,
  BanknotesIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getWorkerJobDetails,
} from "@/api/jobs";

import type {
  Job,
} from "@/shared/types/job";

import RouteMap from "./components/RouteMap";
import RouteSummary from "./components/RouteSummary";
import ClientDetailsCard from "./components/ClientDetailsCard";
import NavigationActions from "./components/NavigationActions";

import {
  getRoute,
  type Coordinates,
  type RouteResult,
} from "./utils/routeUtils";

const Directions = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);

  const [workerLocation, setWorkerLocation] =
    useState<Coordinates | null>(null);

  const [route, setRoute] =
    useState<RouteResult | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [locationLoading, setLocationLoading] =
    useState(true);

  const [routeLoading, setRouteLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [routeError, setRouteError] =
    useState("");

  useEffect(() => {
    const loadJob = async () => {
      if (!jobId) {
        setError("No job was specified.");
        setLoading(false);
        return;
      }

      const numericJobId = Number(jobId);

      if (
        !Number.isInteger(numericJobId) ||
        numericJobId <= 0
      ) {
        setError("Invalid job ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const jobData =
          await getWorkerJobDetails(
            numericJobId
          );

        setJob(jobData.job);
      } catch (err) {
        console.error(
          "Failed to load job:",
          err
        );

        setError(
          "Unable to load the job details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [jobId]);

  const getWorkerLocation =
    useCallback(() => {
      if (!navigator.geolocation) {
        setLocationLoading(false);
        setWorkerLocation(null);

        setRouteError(
          "Location services are not supported by this browser."
        );

        return;
      }

      setLocationLoading(true);
      setRouteError("");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;

          if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
          ) {
            setWorkerLocation(null);
            setLocationLoading(false);

            setRouteError(
              "Your browser returned an invalid location."
            );

            return;
          }

          setWorkerLocation({
            latitude,
            longitude,
          });

          setLocationLoading(false);
        },
        (geolocationError) => {
          console.error(
            "Geolocation error:",
            geolocationError
          );

          setWorkerLocation(null);
          setLocationLoading(false);

          setRouteError(
            "Unable to access your current location. Please allow location access in your browser."
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000,
        }
      );
    }, []);

  useEffect(() => {
    getWorkerLocation();
  }, [getWorkerLocation]);

  const destination =
    useMemo<Coordinates | null>(() => {
      if (
        !job ||
        job.latitude == null ||
        job.longitude == null
      ) {
        return null;
      }

      const latitude =
        Number(job.latitude);

      const longitude =
        Number(job.longitude);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        return null;
      }

      return {
        latitude,
        longitude,
      };
    }, [
      job?.latitude,
      job?.longitude,
    ]);

  const calculateRoute =
    useCallback(async () => {
      if (
        !workerLocation ||
        !destination
      ) {
        return;
      }

      try {
        setRouteLoading(true);
        setRouteError("");

        const routeResult =
          await getRoute(
            workerLocation,
            destination
          );

        setRoute(routeResult);
      } catch (err) {
        console.error(
          "Failed to calculate route:",
          err
        );

        setRoute(null);

        setRouteError(
          err instanceof Error
            ? err.message
            : "Unable to calculate the route."
        );
      } finally {
        setRouteLoading(false);
      }
    }, [
      workerLocation,
      destination,
    ]);

  useEffect(() => {
    if (
      workerLocation &&
      destination
    ) {
      calculateRoute();
    }
  }, [
    calculateRoute,
    workerLocation,
    destination,
  ]);

  const handleRetry = () => {
    setRoute(null);
    setRouteError("");
    getWorkerLocation();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-10">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

            <p className="mt-4 text-sm font-medium text-gray-600">
              Loading directions...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </button>

          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>

            <h1 className="mt-4 text-lg font-semibold text-gray-900">
              Unable to load directions
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              {error ||
                "The requested job could not be found."}
            </p>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </button>

          <div className="rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
              <MapPinIcon className="h-6 w-6 text-amber-600" />
            </div>

            <h1 className="mt-4 text-lg font-semibold text-gray-900">
              Location unavailable
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              The exact location for this job is not currently available, so directions cannot be calculated.
            </p>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to My Work
          </button>

          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Directions
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Get directions to your assigned job.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl bg-white px-6 py-6">
        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  <BriefcaseIcon className="h-5 w-5 text-blue-600" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Assigned Job
                  </p>

                  <h2 className="mt-0.5 truncate text-lg font-bold text-gray-900">
                    {job.title}
                  </h2>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
                <BriefcaseIcon className="h-4 w-4 shrink-0 text-gray-500" />

                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                    Category
                  </p>

                  <p className="truncate text-xs font-semibold text-gray-800">
                    {job.category_name ||
                      "General"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
                <BanknotesIcon className="h-4 w-4 shrink-0 text-gray-500" />

                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                    Budget
                  </p>

                  <p className="text-xs font-semibold text-gray-800">
                    K
                    {Number(
                      job.budget
                    ).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
                <CalendarDaysIcon className="h-4 w-4 shrink-0 text-gray-500" />

                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                    Date
                  </p>

                  <p className="truncate text-xs font-semibold text-gray-800">
                    {job.job_display_date ||
                      job.job_date ||
                      "Flexible"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
                <ClockIcon className="h-4 w-4 shrink-0 text-gray-500" />

                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                    Duration
                  </p>

                  <p className="text-xs font-semibold text-gray-800">
                    {job.duration_hours !=
                    null
                      ? `${job.duration_hours} hr`
                      : "Flexible"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {job.description && (
            <div className="mt-5 border-t border-gray-100 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Job Description
              </p>

              <p className="mt-1.5 max-w-4xl text-sm leading-6 text-gray-600">
                {job.description}
              </p>
            </div>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.8fr)]">
          <section className="relative z-30 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Route Map
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Route from your current position to the job.
                </p>
              </div>

              {route && (
                <div className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  {Math.max(
                    1,
                    Math.round(
                      route.durationSeconds /
                        60
                    )
                  )}{" "}
                  min
                </div>
              )}
            </div>

            <div className="h-[500px] w-full bg-white">
              <RouteMap
                workerLocation={
                  workerLocation
                }
                destination={
                  destination
                }
                route={route}
              />
            </div>
          </section>

          <div className="relative z-10 space-y-6">
            <RouteSummary
              workerLocation={
                workerLocation
              }
              destination={
                destination
              }
              route={route}
              routeLoading={
                routeLoading ||
                locationLoading
              }
              routeError={
                routeError
              }
              destinationLabel={
                job.general_location ||
                "Assigned job location"
              }
              onRetryRoute={
                handleRetry
              }
            />

            <ClientDetailsCard
              job={job}
            />

            <NavigationActions
              destination={
                destination
              }
              workerLocation={
                workerLocation
              }
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Directions;