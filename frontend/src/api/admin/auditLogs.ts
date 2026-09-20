// frontend/src/api/admin/auditLogs.ts

import { http } from './helpers';
import type {
    AuditLog,
    PaginatedResponse,
} from '@/types/admin';

// ============================================
// TYPES
// ============================================

export interface AuditLogFilters {
    user_id?: number;
    action?: string;
    entity_type?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    page?: number;
    page_size?: number;
    ordering?: string;
}

export interface AuditStats {
    total_actions: number;
    by_action: { action: string; count: number }[];
    top_users: { user_id: number; user_name: string; count: number }[];
    daily_activity: { date: string; count: number }[];
}

// ============================================
// API FUNCTIONS
// ============================================

export const adminAuditLogsApi = {
    /**
     * GET /api/logs/
     */
    getLogs: async (
        filters?: AuditLogFilters
    ): Promise<PaginatedResponse<AuditLog>> => {
        const params: Record<string, any> = {};
        if (filters?.user_id) params.user_id = filters.user_id;
        if (filters?.action) params.action = filters.action;
        if (filters?.entity_type) params.entity_type = filters.entity_type;
        if (filters?.start_date) params.start_date = filters.start_date;
        if (filters?.end_date) params.end_date = filters.end_date;
        if (filters?.search) params.search = filters.search;
        if (filters?.page) params.page = filters.page;
        if (filters?.page_size) params.page_size = filters.page_size;
        if (filters?.ordering) params.ordering = filters.ordering;
        return await http.get('/logs/', params);
    },

    /**
     * GET /api/logs/{id}/
     */
    getLog: async (logId: number): Promise<AuditLog> => {
        return await http.get(`/logs/${logId}/`);
    },

    /**
     * GET /api/stats/
     */
    getStats: async (days = 7): Promise<AuditStats> => {
        return await http.get('/stats/', { days });
    },

    /**
     * GET /api/users/{user_id}/logs/
     */
    getUserLogs: async (
        userId: number,
        page = 1
    ): Promise<PaginatedResponse<AuditLog>> => {
        return await http.get(`/users/${userId}/logs/`, { page });
    },

    /**
     * GET /api/entities/{entity_type}/{entity_id}/
     */
    getEntityLogs: async (
        entityType: string,
        entityId: number
    ): Promise<PaginatedResponse<AuditLog>> => {
        return await http.get(
            `/entities/${entityType}/${entityId}/`
        );
    },
};

export default adminAuditLogsApi;
