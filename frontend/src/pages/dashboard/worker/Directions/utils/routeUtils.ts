export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface RouteResult {
  distanceMeters: number;
  durationSeconds: number;
  geometry: [number, number][];
}

interface OsrmRoute {
  distance: number;
  duration: number;
  geometry: {
    coordinates: [number, number][];
    type: string;
  };
}

interface OsrmResponse {
  code: string;
  message?: string;
  routes?: OsrmRoute[];
}

const ROUTE_TIMEOUT_MS = 10000;

export const getRoute = async (
  origin: Coordinates,
  destination: Coordinates
): Promise<RouteResult> => {
  if (
    !Number.isFinite(
      origin.latitude
    ) ||
    !Number.isFinite(
      origin.longitude
    ) ||
    !Number.isFinite(
      destination.latitude
    ) ||
    !Number.isFinite(
      destination.longitude
    )
  ) {
    throw new Error(
      "Invalid coordinates were provided for routing."
    );
  }

  const originCoordinates =
    `${origin.longitude},${origin.latitude}`;

  const destinationCoordinates =
    `${destination.longitude},${destination.latitude}`;

  /*
   * OSRM driving profile.
   */
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${originCoordinates};${destinationCoordinates}` +
    `?overview=full&geometries=geojson`;

  console.log(
    "[KaJob Routing] Request:",
    {
      origin,
      destination,
      url,
    }
  );

  const controller =
    new AbortController();

  const timeoutId =
    window.setTimeout(
      () => {
        controller.abort();
      },
      ROUTE_TIMEOUT_MS
    );

  try {
    const response =
      await fetch(
        url,
        {
          method: "GET",

          headers: {
            Accept:
              "application/json",
          },

          signal:
            controller.signal,
        }
      );

    if (!response.ok) {
      throw new Error(
        `Routing service returned HTTP ${response.status}.`
      );
    }

    const data =
      (await response.json()) as OsrmResponse;

    console.log(
      "[KaJob Routing] Response:",
      data
    );

    if (
      data.code !== "Ok"
    ) {
      throw new Error(
        data.message ||
          "No route could be found between these locations."
      );
    }

    if (
      !data.routes ||
      data.routes.length === 0
    ) {
      throw new Error(
        "No route could be found between these locations."
      );
    }

    const route =
      data.routes[0];

    if (
      !route.geometry ||
      !route.geometry.coordinates ||
      route.geometry.coordinates.length === 0
    ) {
      throw new Error(
        "The routing service returned no route geometry."
      );
    }

    return {
      distanceMeters:
        route.distance,

      durationSeconds:
        route.duration,

      geometry:
        route.geometry.coordinates,
    };
  } catch (error) {
    console.error(
      "[KaJob Routing] Error:",
      error
    );

    if (
      error instanceof DOMException &&
      error.name ===
        "AbortError"
    ) {
      throw new Error(
        "Route calculation timed out. Please try again."
      );
    }

    if (
      error instanceof TypeError
    ) {
      throw new Error(
        "Unable to connect to the routing service. Please check your internet connection."
      );
    }

    if (
      error instanceof Error
    ) {
      throw error;
    }

    throw new Error(
      "Unable to calculate the route."
    );
  } finally {
    window.clearTimeout(
      timeoutId
    );
  }
};

export const formatRouteDistance = (
  distanceMeters: number
): string => {
  if (
    distanceMeters < 1000
  ) {
    return `${Math.round(
      distanceMeters
    )} m`;
  }

  return `${(
    distanceMeters / 1000
  ).toFixed(1)} km`;
};

export const formatRouteDuration = (
  durationSeconds: number
): string => {
  const totalMinutes =
    Math.max(
      1,
      Math.round(
        durationSeconds / 60
      )
    );

  if (
    totalMinutes < 60
  ) {
    return `${totalMinutes} min`;
  }

  const hours =
    Math.floor(
      totalMinutes / 60
    );

  const minutes =
    totalMinutes % 60;

  if (
    minutes === 0
  ) {
    return `${hours} hr`;
  }

  return `${hours} hr ${minutes} min`;
};

export const getRouteMinutes = (
  durationSeconds: number
): number => {
  return Math.max(
    1,
    Math.round(
      durationSeconds / 60
    )
  );
};