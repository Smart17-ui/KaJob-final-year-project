import apiClient from "@/api/client";

export type VerificationStatus =
  | "NOT_SUBMITTED"
  | "PENDING"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "REJECTED"
  | "EXPIRED"
  | string;

export type VerificationDocumentType =
  | "NRC_FRONT"
  | "NRC_BACK"
  | "PASSPORT_PHOTO"
  | "SELFIE";

export type VerificationStatusResponse = {
  has_submitted: boolean;
  verification_id: number | null;
  verification_status: VerificationStatus | null;
  status_display: string | null;

  phone_verified: boolean;
  email_verified: boolean;
  fully_verified: boolean;

  phone_number: string;
  email: string;

  document_type: string;
  document_number: string;

  submitted_at: string | null;
  reviewed_at: string | null;

  rejection_reason: string;

  message: string;
  next_step: string;
};

export type SendPhoneOTPResponse = {
  status?: string;
  message?: string;
  phone_number?: string;
  via?: string;
  expires_in?: number;
  country_code?: string;
  [key: string]: unknown;
};

export type VerifyPhoneOTPResponse = {
  status?: string;
  message?: string;
  verified?: boolean;
  [key: string]: unknown;
};

export type UpdatePhoneNumberResponse = {
  status?: string;
  message?: string;
  phone_number?: string;
  verification_reset?: boolean;
  next_step?: string;
  [key: string]: unknown;
};

export type UpdateEmailAddressResponse = {
  status?: string;
  message?: string;
  email?: string;
  verification_reset?: boolean;
  next_step?: string;
  [key: string]: unknown;
};

export type ResendEmailVerificationResponse = {
  status?: string;
  message?: string;
  email?: string;
  [key: string]: unknown;
};

export type UploadVerificationDocumentResponse = {
  message: string;
  document: {
    id: number;
    document_type: VerificationDocumentType | string;
    verification: number;
    document_type_display?: string;
    file?: string;
    file_url?: string;
    file_name?: string;
    file_size?: number;
    mime_type?: string;
    uploaded_at?: string;
  };
};

export type SubmitVerificationResponse = {
  message: string;
  verification_id: number;
  status: VerificationStatus;
  document_count: number;
};

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api";

export const getVerificationStatus =
  async (): Promise<VerificationStatusResponse> => {
    const data = await apiClient(
      "/verification/status/"
    ) as VerificationStatusResponse;

    return data;
  };

/* =========================
   EMAIL VERIFICATION
========================= */

export const updateEmailAddress =
  async (
    email: string
  ): Promise<UpdateEmailAddressResponse> => {
    const data = await apiClient(
      "/auth/profile/email/",
      {
        method: "PUT",
        body: JSON.stringify({
          email,
        }),
      }
    ) as UpdateEmailAddressResponse;

    return data;
  };

export const resendEmailVerification =
  async (): Promise<ResendEmailVerificationResponse> => {
    const data = await apiClient(
      "/auth/resend-verification/",
      {
        method: "POST",
      }
    ) as ResendEmailVerificationResponse;

    return data;
  };

/* =========================
   PHONE VERIFICATION
========================= */

export const updatePhoneNumber =
  async (
    phoneNumber: string
  ): Promise<UpdatePhoneNumberResponse> => {
    const data = await apiClient(
      "/auth/profile/phone/",
      {
        method: "PUT",
        body: JSON.stringify({
          phone_number: phoneNumber,
        }),
      }
    ) as UpdatePhoneNumberResponse;

    return data;
  };

export const sendPhoneOTP =
  async (): Promise<SendPhoneOTPResponse> => {
    const data = await apiClient(
      "/verification/phone/send-otp/",
      {
        method: "POST",
      }
    ) as SendPhoneOTPResponse;

    return data;
  };

export const verifyPhoneOTP =
  async (
    otp: string
  ): Promise<VerifyPhoneOTPResponse> => {
    const data = await apiClient(
      "/verification/phone/verify-otp/",
      {
        method: "POST",
        body: JSON.stringify({
          otp,
        }),
      }
    ) as VerifyPhoneOTPResponse;

    return data;
  };

/* =========================
   DOCUMENT UPLOAD
========================= */

export const uploadVerificationDocument =
  async (
    documentType: VerificationDocumentType | string,
    file: File
  ): Promise<UploadVerificationDocumentResponse> => {
    const token = localStorage.getItem("access_token");

    const formData = new FormData();

    formData.append("document_type", documentType);
    formData.append("file", file);

    const response = await fetch(
      `${API_BASE_URL}/verification/documents/upload/`,
      {
        method: "POST",
        headers: {
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
        body: formData,
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.error ||
          data?.detail ||
          "Failed to upload verification document."
      );
    }

    return data as UploadVerificationDocumentResponse;
  };

/* =========================
   IDENTITY VERIFICATION
========================= */

export const submitVerification =
  async (
    documentType: VerificationDocumentType | string,
    documentNumber: string
  ): Promise<SubmitVerificationResponse> => {
    const data = await apiClient(
      "/verification/documents/submit/",
      {
        method: "POST",
        body: JSON.stringify({
          document_type: documentType,
          document_number: documentNumber,
        }),
      }
    ) as SubmitVerificationResponse;

    return data;
  };