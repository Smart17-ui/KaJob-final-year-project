// frontend/src/api/admin/reports.ts

import { http } from './helpers';
import type {
    AdminReport,
    AdminReportDetail,
    ReportDecision,
    ReportFilters,
    ReportInvestigation,
    ReportStats,
} from '@/types/admin';

// ============================================
// PAYLOADS
// ============================================

export interface InvestigateReportPayload {
    internal_notes?: string;
}

export interface ResolveReportPayload {
    decision: ReportDecision;
    decision_notes: string;
}

// ============================================
// API FUNCTIONS
//
// Admin endpoints live under /api/reports/admin/.
// (Mounted via apps.reports.urls in config/urls.py)
// ============================================

export const adminReportsApi = {
    /**
     * GET /api/reports/admin/
     */
    getReports: async (
        filters?: ReportFilters
    ): Promise<{ count: number; results: AdminReport[] }> => {
        const params: Record<string, any> = {};
        if (filters?.status) params.status = filters.status;
        if (filters?.category) params.category = filters.category;
        return await http.get('/reports/admin/', params);
    },

    /**
     * GET /api/reports/admin/{id}/
     */
    getReport: async (
        reportId: number
    ): Promise<{ report: AdminReportDetail }> => {
        return await http.get(`/reports/admin/${reportId}/`);
    },

    /**
     * POST /api/reports/admin/{id}/investigate/
     */
    investigateReport: async (
        reportId: number,
        payload: InvestigateReportPayload
    ): Promise<{ message: string; investigation: ReportInvestigation }> => {
        return await http.post(
            `/reports/admin/${reportId}/investigate/`,
            payload
        );
    },

    /**
     * POST /api/reports/admin/{id}/resolve/
     */
    resolveReport: async (
        reportId: number,
        payload: ResolveReportPayload
    ): Promise<{ message: string; report: AdminReportDetail }> => {
        return await http.post(
            `/reports/admin/${reportId}/resolve/`,
            payload
        );
    },

    /**
     * GET /api/reports/stats/
     *
     * Note: stats is also available at /api/reports/admin/stats/.
     * Either works — keeping this URL since it already returns 200.
     */
    getStats: async (): Promise<ReportStats> => {
        return await http.get('/reports/stats/');
    },
};

export default adminReportsApi;
