import {
  useEffect,
  useState,
  type ChangeEvent,
} from "react";

import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import {
  ArrowsPointingOutIcon,
  ArrowPathIcon,
  CheckIcon,
  InformationCircleIcon,
  MapPinIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type JobLocationPickerProps = {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;

  location: string;

  onLocationChange: (
    latitude: number,
    longitude: number,
    accuracy?: number | null
  ) => void;

  onAddressChange: (
    location: string
  ) => void;

  error?: string;
};

type MapClickHandlerProps = {
  onLocationChange: (
    latitude: number,
    longitude: number
  ) => void;
};

/* =========================================================
   MARKER ICON
========================================================= */

const markerIcon = new L.Icon({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/* =========================================================
   DEFAULT LOCATION
========================================================= */

const DEFAULT_LOCATION: [
  number,
  number
] = [-15.3875, 28.3228];

/* =========================================================
   RECENTER MAP
========================================================= */

const RecenterMap = ({
  latitude,
  longitude,
}: {
  latitude: number | null;
  longitude: number | null;
}) => {
  const map = useMap();

  useEffect(() => {
    if (
      latitude === null ||
      longitude === null
    ) {
      return;
    }

    map.setView(
      [latitude, longitude],
      16,
      {
        animate: true,
      }
    );
  }, [
    latitude,
    longitude,
    map,
  ]);

  return null;
};

/* =========================================================
   MAP INVALIDATE SIZE
========================================================= */

const InvalidateMapSize = () => {
  const map = useMap();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [map]);

  return null;
};

/* =========================================================
   MAP CLICK HANDLER
========================================================= */

const MapClickHandler = ({
  onLocationChange,
}: MapClickHandlerProps) => {
  useMapEvents({
    click(event) {
      onLocationChange(
        event.latlng.lat,
        event.latlng.lng
      );
    },
  });

  return null;
};

/* =========================================================
   JOB LOCATION PICKER
========================================================= */

const JobLocationPicker = ({
  latitude,
  longitude,
  accuracy,
  location,
  onLocationChange,
  onAddressChange,
  error,
}: JobLocationPickerProps) => {
  const [isLocating, setIsLocating] =
    useState(false);

  const [locationError, setLocationError] =
    useState("");

  const [isMapOpen, setIsMapOpen] =
    useState(false);

  const [
    pendingLatitude,
    setPendingLatitude,
  ] = useState<number | null>(latitude);

  const [
    pendingLongitude,
    setPendingLongitude,
  ] = useState<number | null>(longitude);

  /* =========================================================
     KEEP MODAL SELECTION IN SYNC
  ========================================================= */

  useEffect(() => {
    if (!isMapOpen) {
      setPendingLatitude(latitude);
      setPendingLongitude(longitude);
    }
  }, [
    latitude,
    longitude,
    isMapOpen,
  ]);

  /* =========================================================
     PREVENT PAGE SCROLL WHEN MODAL IS OPEN
  ========================================================= */

  useEffect(() => {
    if (!isMapOpen) {
      return;
    }

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [isMapOpen]);

  /* =========================================================
     USE MY LOCATION
  ========================================================= */

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        "Geolocation is not supported by your browser."
      );

      return;
    }

    setIsLocating(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const {
          latitude: currentLatitude,
          longitude: currentLongitude,
          accuracy: currentAccuracy,
        } = position.coords;

        setPendingLatitude(
          currentLatitude
        );

        setPendingLongitude(
          currentLongitude
        );

        onLocationChange(
          currentLatitude,
          currentLongitude,
          currentAccuracy
        );

        setIsLocating(false);
      },

      (error) => {
        setIsLocating(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(
              "Location permission was denied. Please allow location access in your browser or select the location on the map."
            );
            break;

          case error.POSITION_UNAVAILABLE:
            setLocationError(
              "Your location could not be determined. Please select the location manually on the map."
            );
            break;

          case error.TIMEOUT:
            setLocationError(
              "Getting your current location took too long. Please try again."
            );
            break;

          default:
            setLocationError(
              "Unable to get your current location."
            );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  /* =========================================================
     OPEN FULL MAP
  ========================================================= */

  const openMap = () => {
    setLocationError("");

    setPendingLatitude(latitude);
    setPendingLongitude(longitude);

    setIsMapOpen(true);
  };

  /* =========================================================
     CLOSE FULL MAP
  ========================================================= */

  const closeMap = () => {
    setPendingLatitude(latitude);
    setPendingLongitude(longitude);

    setIsMapOpen(false);
  };

  /* =========================================================
     MAP SELECTION
  ========================================================= */

  const handleMapLocationChange = (
    newLatitude: number,
    newLongitude: number
  ) => {
    setPendingLatitude(newLatitude);
    setPendingLongitude(newLongitude);

    setLocationError("");
  };

  /* =========================================================
     CONFIRM MAP LOCATION
  ========================================================= */

  const confirmMapLocation = () => {
    if (
      pendingLatitude === null ||
      pendingLongitude === null
    ) {
      setLocationError(
        "Please select a location on the map first."
      );

      return;
    }

    onLocationChange(
      pendingLatitude,
      pendingLongitude,
      null
    );

    setLocationError("");
    setIsMapOpen(false);
  };

  /* =========================================================
     ADDRESS
  ========================================================= */

  const handleAddressChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    onAddressChange(
      event.target.value
    );

    if (locationError) {
      setLocationError("");
    }
  };

  const hasLocation =
    latitude !== null &&
    longitude !== null;

  const mapCenter: [
    number,
    number
  ] = hasLocation
    ? [latitude, longitude]
    : DEFAULT_LOCATION;

  const previewCenter: [
    number,
    number
  ] =
    pendingLatitude !== null &&
    pendingLongitude !== null
      ? [
          pendingLatitude,
          pendingLongitude,
        ]
      : DEFAULT_LOCATION;

  return (
    <>
      <section className="relative z-10">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="relative z-10 mb-6">
          <div className="flex items-center gap-2">
            <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
              <MapPinIcon className="h-4 w-4 text-emerald-600" />
            </div>

            <h2 className="text-lg font-semibold text-slate-900">
              Job location
            </h2>
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Tell workers the general area where
            the job will take place.
          </p>
        </div>

        {/* =====================================================
            GENERAL LOCATION
        ===================================================== */}

        <div className="relative z-10">
          <div className="mb-2 flex items-center justify-between gap-3">
            <label
              htmlFor="location"
              className="block text-sm font-medium text-slate-700"
            >
              General location
            </label>

            <span className="text-xs text-slate-400">
              Visible to workers
            </span>
          </div>

          <input
            id="location"
            type="text"
            value={location}
            onChange={handleAddressChange}
            placeholder="e.g. Kamwala, Lusaka"
            className={`relative z-10 w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                : "border-slate-300 focus:border-emerald-600 focus:ring-emerald-100"
            }`}
          />

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Enter the neighbourhood or general
            area. The exact job location is kept
            private until the job is assigned.
          </p>

          {error && (
            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* =====================================================
            LOCATION CONTROLS
        ===================================================== */}

        <div className="relative z-10 mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5">
          <div>
            <p className="text-sm font-medium text-slate-800">
              {hasLocation
                ? "Location selected"
                : "Choose your job location"}
            </p>

            {hasLocation ? (
              <p className="mt-1 text-xs text-slate-500">
                {latitude.toFixed(6)},{" "}
                {longitude.toFixed(6)}
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">
                Use your location or select one
                on the map.
              </p>
            )}

            {accuracy !== null && (
              <p className="mt-1 text-xs text-slate-500">
                Estimated accuracy:{" "}
                {Math.round(accuracy)} metres
              </p>
            )}
          </div>

          <div className="relative z-10 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={requestLocation}
              disabled={isLocating}
              className="
                relative
                z-10
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-slate-300
                bg-white
                px-4
                py-2.5
                text-sm
                font-medium
                text-slate-700
                transition
                hover:border-slate-400
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <ArrowPathIcon
                className={`h-4 w-4 ${
                  isLocating
                    ? "animate-spin"
                    : ""
                }`}
              />

              {isLocating
                ? "Locating..."
                : "Use my location"}
            </button>

            <button
              type="button"
              onClick={openMap}
              className="
                relative
                z-10
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-slate-900
                px-4
                py-2.5
                text-sm
                font-medium
                text-white
                transition
                hover:bg-slate-800
              "
            >
              <ArrowsPointingOutIcon className="h-4 w-4" />

              Select on map
            </button>
          </div>
        </div>

        {/* =====================================================
            MAP PREVIEW

            Leaflet is deliberately isolated at z-0.
            Every component outside this preview sits above it.
        ===================================================== */}

        <div className="relative z-0 isolate mt-5">
          <div className="relative z-10 mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-800">
              Map preview
            </p>

            <span className="text-xs text-slate-400">
              Preview only
            </span>
          </div>

          <div
            className="
              relative
              z-0
              isolate
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-slate-100
            "
          >
            {/* =================================================
                LEAFLET PREVIEW

                z-0 + isolate ensures Leaflet stays underneath
                the surrounding application UI.
            ================================================= */}

            <div className="relative z-0">
              <MapContainer
                center={mapCenter}
                zoom={
                  hasLocation ? 16 : 12
                }
                scrollWheelZoom={false}
                dragging={false}
                doubleClickZoom={false}
                boxZoom={false}
                keyboard={false}
                touchZoom={false}
                zoomControl={false}
                className="
                  relative
                  z-0
                  h-[280px]
                  w-full
                  sm:h-[320px]
                "
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <RecenterMap
                  latitude={latitude}
                  longitude={longitude}
                />

                {hasLocation && (
                  <Marker
                    position={[
                      latitude,
                      longitude,
                    ]}
                    icon={markerIcon}
                  />
                )}
              </MapContainer>
            </div>

            {/* =================================================
                PREVIEW OVERLAY

                Explicitly above Leaflet.
            ================================================= */}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/40 to-transparent px-4 pb-4 pt-10">
              <p className="text-xs font-medium text-white">
                Location preview
              </p>

              <p className="mt-0.5 text-[11px] text-white/80">
                Select on map to change the location
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            HELPER
        ===================================================== */}

        <div className="relative z-10 mt-4 flex gap-3 border-t border-slate-200 pt-4">
          <InformationCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

          <div>
            <p className="text-sm font-medium text-slate-900">
              Choose the job location
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Use your current location or open
              the map to choose a different place.
            </p>
          </div>
        </div>

        {/* =====================================================
            LOCATION ERROR
        ===================================================== */}

        {locationError && (
          <div className="relative z-10 mt-4 border-t border-slate-200 pt-4">
            <p className="text-sm leading-5 text-red-600">
              {locationError}
            </p>
          </div>
        )}
      </section>

      {/* =======================================================
          FULL MAP MODAL

          This is intentionally much higher than Leaflet.
      ======================================================= */}

      {isMapOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/50 p-4 sm:p-6">
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Select job location
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Move around the map and click where
                  the job will take place.
                </p>
              </div>

              <button
                type="button"
                onClick={closeMap}
                className="
                  relative
                  z-20
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-500
                  transition
                  hover:bg-slate-100
                  hover:text-slate-900
                "
                aria-label="Close map"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* =================================================
                FULL MAP
            ================================================= */}

            <div className="relative min-h-0 flex-1 isolate">
              <MapContainer
                center={previewCenter}
                zoom={
                  pendingLatitude !== null &&
                  pendingLongitude !== null
                    ? 16
                    : 12
                }
                scrollWheelZoom={true}
                className="relative z-0 h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <InvalidateMapSize />

                <RecenterMap
                  latitude={
                    pendingLatitude
                  }
                  longitude={
                    pendingLongitude
                  }
                />

                <MapClickHandler
                  onLocationChange={
                    handleMapLocationChange
                  }
                />

                {pendingLatitude !== null &&
                  pendingLongitude !== null && (
                    <Marker
                      position={[
                        pendingLatitude,
                        pendingLongitude,
                      ]}
                      icon={markerIcon}
                    />
                  )}
              </MapContainer>

              {/* =================================================
                  MODAL MAP ACTIONS
              ================================================= */}

              <div className="absolute inset-x-0 bottom-0 z-[10001] border-t border-slate-200 bg-white/95 p-4 backdrop-blur">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    {pendingLatitude !== null &&
                    pendingLongitude !== null ? (
                      <>
                        <p className="text-sm font-medium text-slate-900">
                          Location selected
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {pendingLatitude.toFixed(
                            6
                          )},{" "}
                          {pendingLongitude.toFixed(
                            6
                          )}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-500">
                        Click the map to select a location.
                      </p>
                    )}
                  </div>

                  <div className="relative z-[10002] flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={requestLocation}
                      disabled={isLocating}
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-300
                        bg-white
                        px-4
                        py-2.5
                        text-sm
                        font-medium
                        text-slate-700
                        transition
                        hover:bg-slate-50
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      <ArrowPathIcon
                        className={`h-4 w-4 ${
                          isLocating
                            ? "animate-spin"
                            : ""
                        }`}
                      />

                      {isLocating
                        ? "Locating..."
                        : "Use my location"}
                    </button>

                    <button
                      type="button"
                      onClick={
                        confirmMapLocation
                      }
                      disabled={
                        pendingLatitude === null ||
                        pendingLongitude === null
                      }
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-emerald-600
                        px-5
                        py-2.5
                        text-sm
                        font-medium
                        text-white
                        transition
                        hover:bg-emerald-700
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      <CheckIcon className="h-4 w-4" />

                      Confirm location
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JobLocationPicker;