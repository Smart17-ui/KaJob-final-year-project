// frontend/src/api/profile.ts

import apiClient from "@/api/client";

/* =========================
   GENERAL PROFILE
========================= */

export interface UserProfile {
  id: number;
  full_name: string | null;
  bio: string;
  profile_photo_path: string | null;
  address: string | null;
  province: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  location_updated_at: string | null;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone_number: string;
    account_status: string;
    is_verified: boolean;
    is_worker: boolean;
    is_client: boolean;
  };
}

export interface UserProfileResponse {
  profile: UserProfile;
}

/* =========================
   WORKER PROFILE
========================= */

export interface WorkerProfile {
  id: number;
  user: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  bio: string;
  years_of_experience: number;
  availability_status: string;
  availability_updated_at: string;
  average_rating: string;
  total_reviews: number;
  jobs_completed: number;
  skills: string[];
  created_at: string;
  updated_at: string;
}

export interface WorkerProfileResponse {
  worker_profile: WorkerProfile;
}

/* =========================
   CLIENT PROFILE
========================= */

export interface ClientProfile {
  id: number;
  user: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  organization_name: string;
  address: string;
  tax_id: string;
  average_rating: string;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface ClientProfileResponse {
  client_profile: ClientProfile;
}

/* =========================
   GET GENERAL PROFILE
========================= */

export async function getUserProfile(): Promise<UserProfileResponse> {
  return apiClient("/auth/profile/", {
    method: "GET",
  });
}

/* =========================
   UPDATE GENERAL PROFILE
========================= */

export async function updateUserProfile(payload: {
  bio?: string;
  profile_photo_path?: string;
  address?: string;
  province?: string;
  district?: string;
  latitude?: number | null;
  longitude?: number | null;
}): Promise<UserProfileResponse & { message: string }> {
  return apiClient("/auth/profile/update/", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/* =========================
   GET WORKER PROFILE
========================= */

export async function getWorkerProfile(): Promise<WorkerProfileResponse> {
  return apiClient("/auth/profile/worker/", {
    method: "GET",
  });
}

/* =========================
   UPDATE WORKER PROFILE
========================= */

export async function updateWorkerProfile(payload: {
  bio?: string;
  years_of_experience?: number;
  availability_status?: string;
}): Promise<WorkerProfileResponse & { message: string }> {
  return apiClient("/auth/profile/worker/update/", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/* =========================
   GET CLIENT PROFILE
========================= */

export async function getClientProfile(): Promise<ClientProfileResponse> {
  return apiClient("/auth/profile/client/", {
    method: "GET",
  });
}

/* =========================
   UPDATE CLIENT PROFILE
========================= */

export async function updateClientProfile(payload: {
  organization_name?: string;
  address?: string;
  tax_id?: string;
}): Promise<ClientProfileResponse & { message: string }> {
  return apiClient("/auth/profile/client/update/", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}