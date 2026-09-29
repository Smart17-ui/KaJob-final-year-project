// frontend/src/hooks/useCurrentLocation.ts

import { useState } from 'react';

interface Coords {
  latitude: number;
  longitude: number;
}

export const useCurrentLocation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = (): Promise<Coords | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser.');
        resolve(null);
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLoading(false);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          setLoading(false);
          let message = 'Unable to get your location.';
          if (err.code === err.PERMISSION_DENIED) {
            message =
              'Location permission denied. Enable it in your browser settings.';
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            message = 'Location information is unavailable.';
          } else if (err.code === err.TIMEOUT) {
            message = 'Location request timed out.';
          }
          setError(message);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  return { loading, error, getLocation };
};
