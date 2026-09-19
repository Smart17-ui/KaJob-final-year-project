import L from "leaflet";

export type LocationMarkerType =
  | "worker"
  | "destination";

const MARKER_COLORS = {
  worker: "#2563eb",
  destination: "#dc2626",
};

export const createLocationMarker = (
  type: LocationMarkerType
): L.DivIcon => {
  const color =
    MARKER_COLORS[type];

  const label =
    type === "worker"
      ? "Current position"
      : "Job destination";

  return L.divIcon({
    className:
      "kajob-location-marker",

    html: `
      <div
        aria-label="${label}"
        style="
          position: relative;
          width: 44px;
          height: 58px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          pointer-events: auto;
        "
      >
        <div
          style="
            position: absolute;
            top: 1px;
            left: 50%;
            width: 38px;
            height: 38px;
            transform: translateX(-50%) rotate(-45deg);
            background: ${color};
            border: 3px solid #ffffff;
            border-radius: 50% 50% 50% 0;
            box-shadow:
              0 2px 6px rgba(0, 0, 0, 0.35),
              0 1px 2px rgba(0, 0, 0, 0.2);
          "
        >
          <div
            style="
              position: absolute;
              top: 50%;
              left: 50%;
              width: 11px;
              height: 11px;
              transform:
                translate(-50%, -50%)
                rotate(45deg);
              background: #ffffff;
              border-radius: 50%;
            "
          ></div>
        </div>
      </div>
    `,

    iconSize: [
      44,
      58,
    ],

    iconAnchor: [
      22,
      56,
    ],

    popupAnchor: [
      0,
      -50,
    ],

    tooltipAnchor: [
      0,
      -50,
    ],
  });
};

export const getLocationMarkerColor = (
  type: LocationMarkerType
): string => {
  return MARKER_COLORS[type];
};