import {
  useEffect,
  useState,
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
  MapPinIcon,
  ArrowPathIcon,
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

const DEFAULT_LOCATION: [
  number,
  number
] = [-15.3875, 28.3228];

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
  }, [latitude, longitude, map]);

  return null;
};

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

  const [hasRequestedLocation, setHasRequestedLocation] =
    useState(false);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        "Geolocation is not supported by your browser."
      );

      return;
    }

    setIsLocating(true);
    setLocationError("");
    setHasRequestedLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const {
          latitude,
          longitude,
          accuracy,
        } = position.coords;

        onLocationChange(
          latitude,
          longitude,
          accuracy
        );

        setIsLocating(false);
      },

      (error) => {
        setIsLocating(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(
              "Location permission was denied. Please allow location access in your browser."
            );
            break;

          case error.POSITION_UNAVAILABLE:
            setLocationError(
              "Your location could not be determined. Please try again."
            );
            break;

          case error.TIMEOUT:
            setLocationError(
              "Getting your location took too long. Please try again."
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

  useEffect(() => {
    if (!hasRequestedLocation) {
      requestLocation();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMapLocationChange = (
    newLatitude: number,
    newLongitude: number
  ) => {
    onLocationChange(
      newLatitude,
      newLongitude,
      null
    );

    setLocationError("");
  };

  const mapCenter: [
    number,
    number
  ] =
    latitude !== null &&
    longitude !== null
      ? [latitude, longitude]
      : DEFAULT_LOCATION;

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Job location
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Use your current location or click anywhere on the map to choose the job location.
            </p>
          </div>

          <MapPinIcon className="h-6 w-6 shrink-0 text-green-600" />
        </div>
      </div>

      {/* Location status */}
      <div className="mb-4 rounded-xl bg-gray-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">
              {latitude !== null &&
              longitude !== null
                ? "Location selected"
                : "Location not selected"}
            </p>

            {latitude !== null &&
              longitude !== null && (
                <p className="mt-1 text-xs text-gray-500">
                  {latitude.toFixed(6)},{" "}
                  {longitude.toFixed(6)}
                </p>
              )}

            {accuracy !== null && (
              <p className="mt-1 text-xs text-gray-500">
                Estimated accuracy:{" "}
                {Math.round(accuracy)} metres
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={requestLocation}
            disabled={isLocating}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
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
        </div>
      </div>

      {/* Manual address */}
      <div className="mb-4">
        <label
          htmlFor="location"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          General location
        </label>

        <input
          id="location"
          type="text"
          value={location}
          onChange={(event) =>
            onAddressChange(
              event.target.value
            )
          }
          placeholder="e.g. Kamwala, Lusaka"
          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 ${
            error
              ? "border-red-500 focus:ring-red-100"
              : "border-gray-300 focus:border-green-600 focus:ring-green-100"
          }`}
        />

        <p className="mt-1 text-xs text-gray-500">
          This is the general area workers will see.
        </p>

        {error && (
          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      {/* Map */}
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <MapContainer
          center={mapCenter}
          zoom={
            latitude !== null &&
            longitude !== null
              ? 16
              : 12
          }
          scrollWheelZoom={true}
          className="h-[350px] w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <RecenterMap
            latitude={latitude}
            longitude={longitude}
          />

          <MapClickHandler
            onLocationChange={
              handleMapLocationChange
            }
          />

          {latitude !== null &&
            longitude !== null && (
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

      <div className="mt-3 rounded-lg bg-green-50 p-3">
        <p className="text-xs text-green-800">
          <strong>Tip:</strong> You can click
          directly on the map to move the job
          location. This is useful if the job is
          somewhere different from your current
          location.
        </p>
      </div>

      {locationError && (
        <div className="mt-3 rounded-lg bg-red-50 p-3">
          <p className="text-sm text-red-700">
            {locationError}
          </p>
        </div>
      )}
    </section>
  );
};

export default JobLocationPicker;