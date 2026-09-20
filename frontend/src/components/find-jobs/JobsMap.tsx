import {
  MapContainer,
  Marker,
  Popup,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";

import {
  ArrowPathIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import "leaflet/dist/leaflet.css";

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

type Coordinates = {
  latitude: number;
  longitude: number;
};

type JobsMapProps = {
  jobs: NearbyJob[];
  workerLocation?: Coordinates | null;
  applyingJobId: number | null;
  appliedJobIds: Set<number>;
  onViewJob: (item: NearbyJob) => void;
  onApply: (item: NearbyJob) => void;
};

type RouteData = {
  coordinates: [number, number][];
  distanceKm: number;
  durationMinutes: number;
};

const DEFAULT_CENTER: [number, number] = [
  -15.4167,
  28.2833,
];

const workerIcon = L.divIcon({
  className: "kajob-worker-marker",
  html: `
    <div
      style="
        width: 34px;
        height: 34px;
        border-radius: 9999px;
        background: #2563eb;
        border: 4px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      <div
        style="
          width: 9px;
          height: 9px;
          border-radius: 9999px;
          background: white;
        "
      ></div>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -18],
});

const jobIcon = L.divIcon({
  className: "kajob-job-marker",
  html: `
    <div
      style="
        width: 32px;
        height: 32px;
        border-radius: 9999px;
        background: #dc2626;
        border: 4px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      <div
        style="
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: white;
        "
      ></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -17],
});

const formatBudget = (budget: string): string => {
  if (!budget) return "K0";
  if (budget.startsWith("K")) return budget;
  return `K${budget}`;
};

const formatDate = (date: string | null): string => {
  if (!date) return "Flexible";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-ZM", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (time?: string | null): string => {
  if (!time) return "Flexible";

  const [hours, minutes] = time.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-ZM", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const getJobCoordinates = (
  item: NearbyJob
): [number, number] | null => {
  const latitude = Number(item.job.latitude);
  const longitude = Number(item.job.longitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  return [latitude, longitude];
};

const getUrgencyClasses = (urgency: string): string => {
  switch (urgency.toUpperCase()) {
    case "IMMEDIATE":
      return "bg-red-50 text-red-700";

    case "URGENT":
      return "bg-orange-50 text-orange-700";

    case "NORMAL":
      return "bg-blue-50 text-blue-700";

    case "FLEXIBLE":
      return "bg-gray-100 text-gray-600";

    default:
      return "bg-gray-100 text-gray-600";
  }
};

const MapViewport = ({
  workerLocation,
  jobs,
}: {
  workerLocation?: Coordinates | null;
  jobs: NearbyJob[];
}) => {
  const map = useMap();

  const bounds = useMemo(() => {
    const points: [number, number][] = [];

    if (workerLocation) {
      points.push([
        workerLocation.latitude,
        workerLocation.longitude,
      ]);
    }

    jobs.forEach((item) => {
      const coordinates = getJobCoordinates(item);

      if (coordinates) {
        points.push(coordinates);
      }
    });

    return points;
  }, [workerLocation, jobs]);

  useEffect(() => {
    if (bounds.length === 0) {
      map.setView(DEFAULT_CENTER, 13);
      return;
    }

    if (bounds.length === 1) {
      map.setView(bounds[0], 14);
      return;
    }

    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 15,
    });
  }, [map, bounds]);

  return null;
};

const RouteLayer = ({
  workerLocation,
  selectedJob,
  onRouteLoaded,
}: {
  workerLocation?: Coordinates | null;
  selectedJob: NearbyJob | null;
  onRouteLoaded: (route: RouteData | null) => void;
}) => {
  const [route, setRoute] =
    useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadRoute = async () => {
      if (!workerLocation || !selectedJob) {
        setRoute(null);
        onRouteLoaded(null);
        return;
      }

      const jobCoordinates =
        getJobCoordinates(selectedJob);

      if (!jobCoordinates) {
        setRoute(null);
        onRouteLoaded(null);
        return;
      }

      setLoading(true);

      try {
        const workerLongitude =
          workerLocation.longitude;

        const workerLatitude =
          workerLocation.latitude;

        const jobLongitude = jobCoordinates[1];
        const jobLatitude = jobCoordinates[0];

        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${workerLongitude},${workerLatitude};` +
          `${jobLongitude},${jobLatitude}` +
          `?overview=full&geometries=geojson`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `OSRM request failed (${response.status})`
          );
        }

        const data = await response.json();

        if (
          data.code !== "Ok" ||
          !data.routes ||
          data.routes.length === 0
        ) {
          throw new Error("No route found.");
        }

        const firstRoute = data.routes[0];

        const coordinates: [number, number][] =
          firstRoute.geometry.coordinates.map(
            ([longitude, latitude]: [
              number,
              number
            ]) => [latitude, longitude]
          );

        const routeData: RouteData = {
          coordinates,
          distanceKm:
            Number(firstRoute.distance || 0) / 1000,
          durationMinutes:
            Math.max(
              1,
              Math.round(
                Number(firstRoute.duration || 0) / 60
              )
            ),
        };

        if (!cancelled) {
          setRoute(routeData);
          onRouteLoaded(routeData);
        }
      } catch (error) {
        console.error(
          "Failed to load OSRM route:",
          error
        );

        if (!cancelled) {
          setRoute(null);
          onRouteLoaded(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadRoute();

    return () => {
      cancelled = true;
    };
  }, [workerLocation, selectedJob, onRouteLoaded]);

  if (!route || route.coordinates.length === 0) {
    return null;
  }

  return (
    <>
      <Polyline
        positions={route.coordinates}
        pathOptions={{
          color: "#2563eb",
          weight: 5,
          opacity: 0.85,
        }}
      />

      {loading && null}
    </>
  );
};

const JobsMap = ({
  jobs,
  workerLocation,
  applyingJobId,
  appliedJobIds,
  onViewJob,
  onApply,
}: JobsMapProps) => {
  const [selectedJobId, setSelectedJobId] =
    useState<number | null>(null);

  const [route, setRoute] =
    useState<RouteData | null>(null);

  const mappedJobs = useMemo(
    () =>
      jobs.filter(
        (item) => getJobCoordinates(item) !== null
      ),
    [jobs]
  );

  const selectedJob =
    mappedJobs.find(
      (item) => item.job.id === selectedJobId
    ) || null;

  const handleRouteLoaded = (
    nextRoute: RouteData | null
  ) => {
    setRoute(nextRoute);
  };

  const handleJobMarkerClick = (
    item: NearbyJob
  ) => {
    setSelectedJobId(item.job.id);
    setRoute(null);
  };

  const handleCloseRoute = () => {
    setSelectedJobId(null);
    setRoute(null);
  };

  return (
    <section className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="relative h-[calc(100vh-245px)] min-h-[560px] max-h-[760px]">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={13}
          scrollWheelZoom
          className="h-full w-full"
          zoomControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapViewport
            workerLocation={workerLocation}
            jobs={mappedJobs}
          />

          {workerLocation && (
            <Marker
              position={[
                workerLocation.latitude,
                workerLocation.longitude,
              ]}
              icon={workerIcon}
            >
              <Popup>
                <div className="min-w-[150px]">
                  <p className="text-sm font-semibold text-gray-900">
                    Your location
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Current worker location
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {mappedJobs.map((item) => {
            const coordinates =
              getJobCoordinates(item);

            if (!coordinates) {
              return null;
            }

            const job = item.job;
            const isApplied = appliedJobIds.has(job.id);
            const isApplying =
              applyingJobId === job.id;
            const isSelected =
              selectedJobId === job.id;

            return (
              <Marker
                key={job.id}
                position={coordinates}
                icon={jobIcon}
                eventHandlers={{
                  click: () =>
                    handleJobMarkerClick(item),
                }}
              >
                <Popup
                  closeButton
                  autoPan
                  maxWidth={300}
                >
                  <div className="w-[245px]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        {job.category_name && (
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                            {job.category_name}
                          </p>
                        )}

                        <h3 className="mt-0.5 line-clamp-2 text-sm font-bold text-gray-900">
                          {job.title}
                        </h3>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${getUrgencyClasses(
                          job.urgency
                        )}`}
                      >
                        {job.urgency_display ||
                          job.urgency}
                      </span>
                    </div>

                    <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2">
                      <p className="text-base font-bold text-gray-900">
                        {formatBudget(job.budget)}
                      </p>

                      <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                        <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          {item.distance_display}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <span className="truncate">
                          {job.general_location}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <CalendarDaysIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <span>
                          {formatDate(job.job_date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <ClockIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <span>
                          {formatTime(job.job_time)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => onViewJob(item)}
                        className="flex-1 rounded-lg border border-gray-200 px-2.5 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        View Details
                      </button>

                      <button
                        type="button"
                        onClick={() => onApply(item)}
                        disabled={
                          isApplied || isApplying
                        }
                        className={`flex-1 rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
                          isApplied
                            ? "cursor-not-allowed bg-gray-100 text-gray-500"
                            : "bg-gray-900 text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        }`}
                      >
                        {isApplied
                          ? "Applied"
                          : isApplying
                          ? "Applying..."
                          : "Apply"}
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {selectedJob && workerLocation && (
            <RouteLayer
              workerLocation={workerLocation}
              selectedJob={selectedJob}
              onRouteLoaded={handleRouteLoaded}
            />
          )}
        </MapContainer>

        {/* Map legend */}
        <div className="pointer-events-none absolute left-4 top-4 z-[1000] rounded-xl border border-gray-200 bg-white/95 px-3 py-2.5 shadow-sm backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border-2 border-white bg-blue-600 shadow-sm" />
              <span className="text-[11px] font-medium text-gray-600">
                You
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border-2 border-white bg-red-600 shadow-sm" />
              <span className="text-[11px] font-medium text-gray-600">
                Job
              </span>
            </div>
          </div>
        </div>

        {/* Job count */}
        <div className="pointer-events-none absolute right-4 top-4 z-[1000] rounded-xl border border-gray-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2">
            <BriefcaseIcon className="h-4 w-4 text-gray-500" />
            <span className="text-xs font-semibold text-gray-700">
              {mappedJobs.length}{" "}
              {mappedJobs.length === 1
                ? "job"
                : "jobs"}
            </span>
          </div>
        </div>

        {/* Selected route information */}
        {selectedJob && (
          <div className="absolute bottom-4 left-4 right-4 z-[1000] md:right-auto md:w-[360px]">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <MapPinIcon className="h-5 w-5 text-blue-600" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-900">
                        {selectedJob.job.title}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {selectedJob.job.general_location}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCloseRoute}
                      className="shrink-0 rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                      aria-label="Close route"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {route ? (
                    <div className="mt-3 flex items-center gap-4 border-t border-gray-100 pt-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400">
                          Distance
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-gray-900">
                          {route.distanceKm.toFixed(
                            1
                          )}{" "}
                          km
                        </p>
                      </div>

                      <div className="h-7 w-px bg-gray-200" />

                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400">
                          ETA
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-gray-900">
                          {route.durationMinutes}{" "}
                          min
                        </p>
                      </div>

                      <div className="ml-auto">
                        <button
                          type="button"
                          onClick={() =>
                            onViewJob(selectedJob)
                          }
                          className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
                      <ArrowPathIcon className="h-3.5 w-3.5 animate-spin text-gray-400" />
                      <span className="text-xs text-gray-500">
                        Calculating route and ETA...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No coordinate information */}
        {jobs.length > 0 && mappedJobs.length === 0 && (
          <div className="absolute inset-0 z-[900] flex items-center justify-center bg-white/70">
            <div className="mx-4 max-w-sm rounded-xl border border-gray-200 bg-white p-6 text-center shadow-lg">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <MapPinIcon className="h-6 w-6 text-gray-400" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-gray-900">
                Job locations unavailable
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                These jobs do not currently have map
                coordinates available.
              </p>
            </div>
          </div>
        )}

        {/* Worker location unavailable */}
        {!workerLocation && mappedJobs.length > 0 && (
          <div className="absolute bottom-4 left-4 z-[1000] max-w-[280px] rounded-xl border border-amber-200 bg-white px-3 py-2.5 shadow-lg">
            <p className="text-xs font-semibold text-gray-800">
              Your location is unavailable
            </p>

            <p className="mt-0.5 text-[11px] leading-4 text-gray-500">
              Job locations are shown, but route and ETA
              cannot be calculated.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default JobsMap;
