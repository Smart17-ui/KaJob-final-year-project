// frontend/src/api/admin/verifications.ts

import { http } from './helpers';
import type {
    PendingVerification,
    PaginatedResponse,
    VerificationFilters,
} from '@/types/admin';

// ============================================
// TYPES
// ============================================

export interface ApproveVerificationPayload {
    action: 'approve';
    notes?: string;
}

export interface RejectVerificationPayload {
    action: 'reject';
    reason: string;
    notes?: string;
}

export interface RequestResubmissionPayload {
    action: 'resubmit';
    reason: string;
}

export type VerificationAction =
    | ApproveVerificationPayload
    | RejectVerificationPayload
    | RequestResubmissionPayload;

// ============================================
// API FUNCTIONS
// ============================================

export const adminVerificationsApi = {
    /**
     * GET /api/verifications/
     */
    getVerifications: async (
        filters?: VerificationFilters
    ): Promise<PaginatedResponse<PendingVerification>> => {
        const params: Record<string, any> = {};
        if (filters?.status) params.status = filters.status;
        if (filters?.page) params.page = filters.page;
        if (filters?.page_size) params.page_size = filters.page_size;
        if (filters?.ordering) params.ordering = filters.ordering;
        return await http.get('/verifications/', params);
    },

    /**
     * GET /api/admin/verifications/pending/
     */
    getPending: async (): Promise<PaginatedResponse<PendingVerification>> => {
        return await http.get('/admin/verifications/pending/');
    },

    /**
     * GET /api/verifications/{id}/
     */
    getVerification: async (
        verificationId: number
    ): Promise<PendingVerification> => {
        return await http.get(`/verifications/${verificationId}/`);
    },

    /**
     * POST /api/verifications/{id}/approve/
     */
    approveVerification: async (verificationId: number, notes?: string) => {
        return await http.post(
            `/verifications/${verificationId}/approve/`,
            { notes }
        );
    },

    /**
     * POST /api/verifications/{id}/reject/
     */
    rejectVerification: async (
        verificationId: number,
        reason: string,
        notes?: string
    ) => {
        return await http.post(
            `/verifications/${verificationId}/reject/`,
            { reason, notes }
        );
    },

    /**
     * GET /api/verifications/{id}/documents/
     */
    getDocuments: async (verificationId: number) => {
        return await http.get(`/verifications/${verificationId}/documents/`);
    },

    /**
     * GET /api/verifications/stats/
     */
    getStats: async () => {
        return await http.get('/verifications/stats/');
    },

    /**
     * POST /api/admin/verifications/{id}/review/
     */
    reviewVerification: async (
        verificationId: number,
        payload: VerificationAction
    ) => {
        return await http.post(
            `/admin/verifications/${verificationId}/review/`,
            payload
        );
    },
};

export default adminVerificationsApi;
