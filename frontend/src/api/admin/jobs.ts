// frontend/src/api/admin/jobs.ts

import { http } from './helpers';
import type {
    AdminJob,
    PaginatedResponse,
    JobFilters,
} from '@/types/admin';

// ============================================
// TYPES
// ============================================

export interface CancelJobPayload {
    reason: string;
}

// ============================================
// API FUNCTIONS
// ============================================

export const adminJobsApi = {
    /**
     * GET /api/jobs/
     */
    getJobs: async (
        filters?: JobFilters
    ): Promise<PaginatedResponse<AdminJob>> => {
        const params: Record<string, any> = {};

        if (filters?.search) params.search = filters.search;
        if (filters?.status) params.status = filters.status;
        if (filters?.category) params.category = filters.category;
        if (filters?.page) params.page = filters.page;
        if (filters?.page_size) params.page_size = filters.page_size;
        if (filters?.ordering) params.ordering = filters.ordering;

        return await http.get('/jobs/', params);
    },

    /**
     * GET /api/jobs/{id}/
     * 
     * FIXED: Unwraps the response from { job: {...} } to {...}
     */
    getJob: async (jobId: number): Promise<AdminJob> => {
        const response = await http.get(`/jobs/${jobId}/`);
        // Unwrap: backend returns { job: {...} }
        return (response as any)?.job || response;
    },

    /**
     * POST /api/jobs/{id}/cancel/
     */
    cancelJob: async (jobId: number, payload: CancelJobPayload) => {
        return await http.post(`/jobs/${jobId}/cancel/`, payload);
    },

    /**
     * POST /api/jobs/{id}/delete/
     */
    deleteJob: async (jobId: number) => {
        return await http.post(`/jobs/${jobId}/delete/`);
    },
};

export default adminJobsApi;
