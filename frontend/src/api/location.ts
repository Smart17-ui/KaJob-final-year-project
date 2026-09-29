// frontend/src/api/location.ts

import apiClient from './client';

export interface LocationPayload {
  latitude: number;
  longitude: number;
}

export interface LocationUpdateResponse {
  message: string;
  profile: any;
  nearby_jobs_count: number;
}

export const locationApi = {
  update: (payload: LocationPayload): Promise<LocationUpdateResponse> =>
    apiClient('/auth/profile/location/', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
};
