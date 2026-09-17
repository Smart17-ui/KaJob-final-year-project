// frontend/src/api/admin/users.ts

import { http } from './helpers';
import type {
    AdminUser,
    AdminUserDetail,
    PaginatedResponse,
} from '@/types/admin';

// ============================================
// TYPES
// ============================================

export interface SuspendUserPayload {
    reason: string;
}

export interface BanUserPayload {
    reason: string;
}

export interface ChangeUserStatusPayload {
    status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DEACTIVATED';
    reason?: string;
}

export interface GetUsersFilters {
    search?: string;
    role?: string;
    status?: string;
    is_verified?: boolean;
    page?: number;
    page_size?: number;
    ordering?: string;
}

// ============================================
// API FUNCTIONS
// ============================================

export const adminUsersApi = {
    /**
     * GET /api/users/
     */
    getUsers: async (
        filters?: GetUsersFilters
    ): Promise<PaginatedResponse<AdminUser>> => {
        const params: Record<string, any> = {};

        if (filters?.search) params.search = filters.search;
        if (filters?.role) params.role = filters.role;
        if (filters?.status) params.status = filters.status;
        if (filters?.is_verified !== undefined)
            params.is_verified = filters.is_verified;
        if (filters?.page) params.page = filters.page;
        if (filters?.page_size) params.page_size = filters.page_size;
        if (filters?.ordering) params.ordering = filters.ordering;

        return await http.get('/users/', params);
    },

    /**
     * GET /api/users/{id}/
     * 
     * FIXED: Unwraps the response from { user: {...} } to {...}
     */
    getUser: async (userId: number): Promise<AdminUserDetail> => {
        const response = await http.get(`/users/${userId}/`);
        // Unwrap: backend returns { user: {...} }
        return (response as any)?.user || response;
    },

    /**
     * POST /api/users/{id}/suspend/
     */
    suspendUser: async (userId: number, payload: SuspendUserPayload) => {
        return await http.post(`/users/${userId}/suspend/`, payload);
    },

    /**
     * POST /api/users/{id}/activate/
     */
    activateUser: async (userId: number) => {
        return await http.post(`/users/${userId}/activate/`);
    },

    /**
     * POST /api/users/{id}/ban/ — not in Swagger, use suspend
     */
    banUser: async (userId: number, payload: BanUserPayload) => {
        // Backend doesn't have /ban/, use /suspend/ with reason
        return await http.post(`/users/${userId}/suspend/`, payload);
    },

    /**
     * POST /api/users/{id}/unban/ — not in Swagger, use activate
     */
    unbanUser: async (userId: number) => {
        return await http.post(`/users/${userId}/activate/`);
    },

    /**
     * PUT /api/users/{id}/status/ — not in Swagger
     */
    changeStatus: async (
        userId: number,
        payload: ChangeUserStatusPayload
    ) => {
        if (payload.status === 'ACTIVE') {
            return await http.post(`/users/${userId}/activate/`);
        } else {
            return await http.post(`/users/${userId}/suspend/`, {
                reason: payload.reason || 'No reason provided',
            });
        }
    },

    /**
     * DELETE /api/users/{id}/ — not in Swagger, may not exist
     */
    deleteUser: async (userId: number) => {
        return await http.delete(`/users/${userId}/`);
    },

    /**
     * GET /api/users/{id}/logs/
     */
    getUserActivity: async (userId: number, days: number = 7) => {
        return await http.get(`/users/${userId}/logs/`, { days });
    },

    /**
     * GET /api/users/{id}/logs/
     */
    getUserLogs: async (userId: number) => {
        return await http.get(`/users/${userId}/logs/`);
    },

    /**
     * GET /api/users/{id}/jobs/ — may not exist
     */
    getUserJobs: async (userId: number) => {
        return await http.get(`/users/${userId}/jobs/`);
    },

    /**
     * GET /api/users/{id}/reports/ — may not exist
     */
    getUserReports: async (userId: number) => {
        return await http.get(`/users/${userId}/reports/`);
    },

    /**
     * GET /api/stats/
     */
    getStats: async () => {
        return await http.get('/stats/');
    },
};

export default adminUsersApi;
