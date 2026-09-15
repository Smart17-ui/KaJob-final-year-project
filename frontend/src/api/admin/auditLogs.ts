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
    resource_type?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    page_size?: number;
    ordering?: string;
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
        if (filters?.resource_type) params.resource_type = filters.resource_type;
        if (filters?.start_date) params.start_date = filters.start_date;
        if (filters?.end_date) params.end_date = filters.end_date;
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
     * GET /api/logs/actions/ — probably doesn't exist
     */
    getActions: async () => {
        return await http.get('/logs/actions/');
    },
};

export default adminAuditLogsApi;
