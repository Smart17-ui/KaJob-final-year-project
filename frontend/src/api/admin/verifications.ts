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
     * GET /api/admin/verifications/pending/
     * (backend ignores ?status= for now — filter client-side if needed)
     */
    getVerifications: async (
        filters?: VerificationFilters
    ): Promise<PaginatedResponse<PendingVerification>> => {
        const params: Record<string, any> = {};
        if (filters?.status) params.status = filters.status;
        if (filters?.page) params.page = filters.page;
        if (filters?.page_size) params.page_size = filters.page_size;
        if (filters?.ordering) params.ordering = filters.ordering;
        return await http.get('/admin/verifications/pending/', params);
    },

    /**
     * GET /api/admin/verifications/pending/
     */
    getPending: async (): Promise<PaginatedResponse<PendingVerification>> => {
        return await http.get('/admin/verifications/pending/');
    },

    /**
     * GET /api/admin/verifications/{id}/
     */
    getVerification: async (
        verificationId: number
    ): Promise<PendingVerification> => {
        return await http.get(`/admin/verifications/${verificationId}/`);
    },

    /**
     * POST /api/admin/verifications/{id}/review/
     * Body: { action: 'approve', notes?: string }
     */
    approveVerification: async (verificationId: number, notes?: string) => {
        return await http.post(
            `/admin/verifications/${verificationId}/review/`,
            { action: 'approve', notes }
        );
    },

    /**
     * POST /api/admin/verifications/{id}/review/
     * Body: { action: 'reject', reason, notes? }
     */
    rejectVerification: async (
        verificationId: number,
        reason: string,
        notes?: string
    ) => {
        return await http.post(
            `/admin/verifications/${verificationId}/review/`,
            { action: 'reject', reason, notes }
        );
    },

    /**
     * GET /api/admin/verifications/{id}/
     * Documents come embedded in the detail payload.
     */
    getDocuments: async (verificationId: number) => {
        const detail: any = await http.get(
            `/admin/verifications/${verificationId}/`
        );
        return detail?.documents || [];
    },

    /**
     * GET /api/admin/verifications/stats/
     */
    getStats: async () => {
        return await http.get('/admin/verifications/stats/');
    },

    /**
     * POST /api/admin/verifications/{id}/review/
     * Action is decided by the payload shape.
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
