import {
  ArrowTopRightOnSquareIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

import type {
  Coordinates,
} from "../utils/routeUtils";

interface NavigationActionsProps {
  destination: Coordinates | null;
  workerLocation: Coordinates | null;
}

const NavigationActions = ({
  destination,
  workerLocation,
}: NavigationActionsProps) => {

  /* =========================================================
     OPEN GOOGLE MAPS
  ========================================================= */

  const handleOpenNavigation =
    () => {
      if (!destination) {
        return;
      }

      const destinationString =
        `${destination.latitude},${destination.longitude}`;

      /*
       * Use the worker's current location as the origin
       * when it is available.
       */
      let navigationUrl =
        `https://www.google.com/maps/dir/?api=1` +
        `&destination=${encodeURIComponent(
          destinationString
        )}` +
        `&travelmode=driving`;

      if (workerLocation) {
        const origin =
          `${workerLocation.latitude},${workerLocation.longitude}`;

        navigationUrl +=
          `&origin=${encodeURIComponent(
            origin
          )}`;
      }

      window.open(
        navigationUrl,
        "_blank",
        "noopener,noreferrer"
      );
    };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-start gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">

          <MapPinIcon className="h-5 w-5 text-blue-600" />

        </div>

        <div>

          <h3 className="text-sm font-semibold text-gray-900">
            Ready to navigate?
          </h3>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            Open Google Maps for turn-by-turn navigation.
          </p>

        </div>

      </div>

      {/* =====================================================
          BUTTON
      ===================================================== */}

      <button
        type="button"
        onClick={
          handleOpenNavigation
        }
        disabled={!destination}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >

        <ArrowTopRightOnSquareIcon className="h-5 w-5" />

        Open Navigation

      </button>

      {/* =====================================================
          HELPER TEXT
      ===================================================== */}

      <p className="mt-2 text-center text-xs leading-5 text-gray-500">
        Google Maps will open with directions to the assigned job.
      </p>

    </section>
  );
};

export default NavigationActions;