import {
  ClockIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

import type {
  Coordinates,
  RouteResult,
} from "../utils/routeUtils";

import {
  formatRouteDistance,
  formatRouteDuration,
} from "../utils/routeUtils";

interface RouteSummaryProps {
  workerLocation: Coordinates | null;
  destination: Coordinates;
  route: RouteResult | null;
  routeLoading: boolean;
  routeError: string;
  destinationLabel?: string;
  onRetryRoute?: () => void;
}

const RouteSummary = ({
  workerLocation,
  destination,
  route,
  routeLoading,
  routeError,
  destinationLabel,
  onRetryRoute,
}: RouteSummaryProps) => {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">

          <PaperAirplaneIcon className="h-5 w-5 text-blue-600" />

        </div>

        <div>

          <h2 className="text-base font-semibold text-gray-900">
            Route to Job
          </h2>

          <p className="mt-0.5 text-xs text-gray-500">
            Estimated distance and travel time.
          </p>

        </div>

      </div>

      {/* =====================================================
          CALCULATING
      ===================================================== */}

      {routeLoading && (
        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">

          <div className="flex items-center gap-3">

            <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-600" />

            <div>

              <p className="text-sm font-semibold text-blue-900">
                Calculating route...
              </p>

              <p className="mt-0.5 text-xs text-blue-700">
                Finding the best route.
              </p>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          LOCATION UNAVAILABLE
      ===================================================== */}

      {!workerLocation &&
        !routeLoading &&
        !routeError && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">

            <div className="flex items-start gap-3">

              <MapPinIcon className="h-5 w-5 shrink-0 text-amber-600" />

              <div>

                <p className="text-sm font-semibold text-amber-900">
                  Your location is unavailable
                </p>

                <p className="mt-1 text-xs leading-5 text-amber-700">
                  Allow location access to calculate your route.
                </p>

              </div>

            </div>

          </div>
        )}

      {/* =====================================================
          ROUTE ERROR
      ===================================================== */}

      {routeError &&
        !routeLoading && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">

            <div className="flex items-start gap-3">

              <MapPinIcon className="h-5 w-5 shrink-0 text-red-600" />

              <div className="min-w-0 flex-1">

                <p className="text-sm font-semibold text-red-900">
                  Route unavailable
                </p>

                <p className="mt-1 text-xs leading-5 text-red-700">
                  {routeError}
                </p>

                {onRetryRoute && (
                  <button
                    type="button"
                    onClick={
                      onRetryRoute
                    }
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                  >

                    <ArrowPathIcon className="h-4 w-4" />

                    Try Again

                  </button>
                )}

              </div>

            </div>

          </div>
        )}

      {/* =====================================================
          ROUTE RESULTS
      ===================================================== */}

      {route &&
        !routeLoading &&
        !routeError && (
          <div className="mt-5">

            {/* Main ETA */}

            <div className="rounded-2xl bg-blue-600 p-5 text-white">

              <p className="text-xs font-medium text-blue-100">
                Estimated travel time
              </p>

              <div className="mt-1 flex items-baseline gap-2">

                <span className="text-3xl font-bold tracking-tight">
                  {formatRouteDuration(
                    route.durationSeconds
                  )}
                </span>

              </div>

            </div>

            {/* Distance + ETA */}

            <div className="mt-3 grid grid-cols-2 gap-3">

              {/* Distance */}

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">

                  <MapPinIcon className="h-4 w-4 text-gray-600" />

                </div>

                <p className="mt-3 text-xs font-medium text-gray-500">
                  Distance
                </p>

                <p className="mt-1 text-lg font-bold text-gray-900">
                  {formatRouteDistance(
                    route.distanceMeters
                  )}
                </p>

              </div>

              {/* ETA */}

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">

                  <ClockIcon className="h-4 w-4 text-gray-600" />

                </div>

                <p className="mt-3 text-xs font-medium text-gray-500">
                  ETA
                </p>

                <p className="mt-1 text-lg font-bold text-gray-900">
                  {formatRouteDuration(
                    route.durationSeconds
                  )}
                </p>

              </div>

            </div>

          </div>
        )}

      {/* =====================================================
          DESTINATION
      ===================================================== */}

      <div className="mt-5 border-t border-gray-100 pt-5">

        <div className="flex items-start gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">

            <MapPinIcon className="h-5 w-5 text-red-600" />

          </div>

          <div className="min-w-0">

            <p className="text-xs font-medium text-gray-500">
              Destination
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-900">
              {destinationLabel ||
                "Assigned job location"}
            </p>

          </div>

        </div>

      </div>

    </section>
  );
};

export default RouteSummary;