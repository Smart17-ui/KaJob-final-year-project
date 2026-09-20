import {
  useEffect,
  useRef,
} from "react";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import type {
  Coordinates,
  RouteResult,
} from "../utils/routeUtils";

import {
  createLocationMarker,
} from "./LocationMarker";

interface RouteMapProps {
  workerLocation: Coordinates | null;
  destination: Coordinates;
  route: RouteResult | null;
  destinationLabel?: string;
  clientName?: string;
  clientPhone?: string | null;
}

const RouteMap = ({
  workerLocation,
  destination,
  route,
}: RouteMapProps) => {
  const mapContainerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const mapRef =
    useRef<L.Map | null>(null);

  const workerMarkerRef =
    useRef<L.Marker | null>(null);

  const destinationMarkerRef =
    useRef<L.Marker | null>(null);

  const routeLayerRef =
    useRef<L.FeatureGroup | null>(
      null
    );

  /* =======================================================
     INITIALIZE MAP
  ======================================================= */

  useEffect(() => {
    if (
      !mapContainerRef.current ||
      mapRef.current
    ) {
      return;
    }

    const map = L.map(
      mapContainerRef.current,
      {
        center: [
          destination.latitude,
          destination.longitude,
        ],

        zoom: 14,

        scrollWheelZoom: false,
        dragging: true,
        touchZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        zoomControl: true,
        attributionControl: true,
      }
    );

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,

        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      }
    ).addTo(map);

    mapRef.current = map;

    window.setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      map.remove();

      mapRef.current = null;
      workerMarkerRef.current = null;
      destinationMarkerRef.current = null;
      routeLayerRef.current = null;
    };
  }, [
    destination.latitude,
    destination.longitude,
  ]);

  /* =======================================================
     DESTINATION MARKER
     
     The red destination pin intentionally has NO popup.
     Client details are handled by the "View Client Details"
     button on the My Work card.
  ======================================================= */

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    const position = L.latLng(
      destination.latitude,
      destination.longitude
    );

    if (
      !destinationMarkerRef.current
    ) {
      const marker =
        L.marker(position, {
          icon:
            createLocationMarker(
              "destination"
            ),
          zIndexOffset: 3000,
          riseOnHover: true,
        }).addTo(map);

      destinationMarkerRef.current =
        marker;
    } else {
      destinationMarkerRef.current.setLatLng(
        position
      );
    }

    destinationMarkerRef.current.setZIndexOffset(
      3000
    );
  }, [
    destination.latitude,
    destination.longitude,
  ]);

  /* =======================================================
     WORKER LOCATION MARKER
  ======================================================= */

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    if (workerLocation === null) {
      if (
        workerMarkerRef.current
      ) {
        map.removeLayer(
          workerMarkerRef.current
        );

        workerMarkerRef.current =
          null;
      }

      return;
    }

    const position = L.latLng(
      workerLocation.latitude,
      workerLocation.longitude
    );

    if (
      !workerMarkerRef.current
    ) {
      const marker =
        L.marker(position, {
          icon:
            createLocationMarker(
              "worker"
            ),
          zIndexOffset: 2500,
          riseOnHover: true,
        }).addTo(map);

      const popup =
        document.createElement(
          "div"
        );

      popup.style.minWidth =
        "150px";

      popup.style.fontFamily =
        "Arial, sans-serif";

      const title =
        document.createElement(
          "strong"
        );

      title.textContent =
        "Current Position";

      title.style.fontSize =
        "14px";

      title.style.color =
        "#111827";

      popup.appendChild(title);

      marker.bindPopup(popup);

      workerMarkerRef.current =
        marker;
    } else {
      workerMarkerRef.current.setLatLng(
        position
      );
    }

    workerMarkerRef.current.setZIndexOffset(
      2500
    );
  }, [
    workerLocation,
  ]);

  /* =======================================================
     ROUTE
  ======================================================= */

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    if (routeLayerRef.current) {
      map.removeLayer(
        routeLayerRef.current
      );

      routeLayerRef.current =
        null;
    }

    if (!route) {
      return;
    }

    const geoJson = {
      type: "Feature" as const,

      properties: {},

      geometry: {
        type: "LineString" as const,

        coordinates:
          route.geometry,
      },
    };

    const routeOutline =
      L.geoJSON(geoJson, {
        style: {
          color: "#ffffff",
          weight: 10,
          opacity: 1,
          lineCap: "round",
          lineJoin: "round",
        },
      });

    const routeLine =
      L.geoJSON(geoJson, {
        style: {
          color: "#2563eb",
          weight: 6,
          opacity: 0.95,
          lineCap: "round",
          lineJoin: "round",
        },
      });

    const routeGroup =
      L.featureGroup([
        routeOutline,
        routeLine,
      ]).addTo(map);

    routeLayerRef.current =
      routeGroup;

    const bounds =
      routeGroup.getBounds();

    if (bounds.isValid()) {
      map.fitBounds(
        bounds,
        {
          padding: [90, 90],
          maxZoom: 16,
          animate: true,
        }
      );
    }

    if (
      workerMarkerRef.current
    ) {
      workerMarkerRef.current.setZIndexOffset(
        2500
      );
    }

    if (
      destinationMarkerRef.current
    ) {
      destinationMarkerRef.current.setZIndexOffset(
        3000
      );
    }
  }, [route]);

  /* =======================================================
     MAP RESIZE
  ======================================================= */

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="relative z-30 h-full w-full overflow-hidden bg-white">
      <div
        ref={mapContainerRef}
        className="h-full w-full bg-white"
      />

      {/* =================================================
          MAP LEGEND
      ================================================= */}

      <div className="pointer-events-none absolute bottom-4 left-4 z-[1000] rounded-xl border border-gray-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-600 ring-2 ring-blue-100" />

            <span className="text-xs font-medium text-gray-700">
              Current position
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-600 ring-2 ring-red-100" />

            <span className="text-xs font-medium text-gray-700">
              Job destination
            </span>
          </div>
        </div>
      </div>

      {/* =================================================
          LOCATION STATUS
      ================================================= */}

      {!workerLocation && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-[1000] -translate-x-1/2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800 shadow-sm">
          Waiting for your location...
        </div>
      )}
    </div>
  );
};

export default RouteMap;
