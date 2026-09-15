// frontend/src/api/admin/reports.ts

import { http } from './helpers';
import type {
    AdminReport,
    PaginatedResponse,
    ReportFilters,
} from '@/types/admin';

// ============================================
// TYPES
// ============================================

export interface InvestigateReportPayload {
    notes: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ResolveReportPayload {
    decision: 'DISMISSED' | 'WARNED' | 'SUSPENDED' | 'BANNED' | 'ESCALATED';
    notes: string;
}

// ============================================
// API FUNCTIONS
// ============================================

export const adminReportsApi = {
    /**
     * GET /api/reports/
     */
    getReports: async (
        filters?: ReportFilters
    ): Promise<PaginatedResponse<AdminReport>> => {
        const params: Record<string, any> = {};
        if (filters?.status) params.status = filters.status;
        if (filters?.category) params.category = filters.category;
        if (filters?.priority) params.priority = filters.priority;
        if (filters?.page) params.page = filters.page;
        if (filters?.page_size) params.page_size = filters.page_size;
        if (filters?.ordering) params.ordering = filters.ordering;
        return await http.get('/reports/', params);
    },

    /**
     * GET /api/reports/{id}/
     */
    getReport: async (reportId: number): Promise<AdminReport> => {
        return await http.get(`/reports/${reportId}/`);
    },

    /**
     * GET /api/reports/{id}/evidence/
     */
    getEvidence: async (reportId: number) => {
        return await http.get(`/reports/${reportId}/evidence/`);
    },

    /**
     * POST /api/reports/{id}/investigate/
     */
    investigateReport: async (
        reportId: number,
        payload: InvestigateReportPayload
    ) => {
        return await http.post(`/reports/${reportId}/investigate/`, payload);
    },

    /**
     * POST /api/reports/{id}/resolve/
     */
    resolveReport: async (reportId: number, payload: ResolveReportPayload) => {
        return await http.post(`/reports/${reportId}/resolve/`, payload);
    },

    /**
     * GET /api/reports/stats/
     */
    getStats: async () => {
        return await http.get('/reports/stats/');
    },

    /**
     * Aliases for consistency with existing code
     */
    reviewReport: async (reportId: number, payload: ResolveReportPayload) => {
        return await http.post(`/reports/${reportId}/resolve/`, payload);
    },

    dismissReport: async (reportId: number, notes: string) => {
        return await http.post(`/reports/${reportId}/resolve/`, {
            decision: 'DISMISSED',
            notes,
        });
    },

    escalateReport: async (reportId: number, notes: string) => {
        return await http.post(`/reports/${reportId}/resolve/`, {
            decision: 'ESCALATED',
            notes,
        });
    },
};

export default adminReportsApi;
