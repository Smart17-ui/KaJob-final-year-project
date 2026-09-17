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
// Note: admin_panel/urls.py mounts these routes at `/api/reports/`
// (no /admin/ prefix). Verified against the live URL resolver.
// ============================================

export const adminReportsApi = {
    /**
     * GET /api/reports/
     */
    getReports: async (
        filters?: ReportFilters
    ): Promise<{ count: number; results: AdminReport[] }> => {
        const params: Record<string, any> = {};
        if (filters?.status) params.status = filters.status;
        if (filters?.category) params.category = filters.category;
        return await http.get('/reports/', params);
    },

    /**
     * GET /api/reports/{id}/
     */
    getReport: async (
        reportId: number
    ): Promise<{ report: AdminReportDetail }> => {
        return await http.get(`/reports/${reportId}/`);
    },

    /**
     * POST /api/reports/{id}/investigate/
     */
    investigateReport: async (
        reportId: number,
        payload: InvestigateReportPayload
    ): Promise<{ message: string; investigation: ReportInvestigation }> => {
        return await http.post(
            `/reports/${reportId}/investigate/`,
            payload
        );
    },

    /**
     * POST /api/reports/{id}/resolve/
     */
    resolveReport: async (
        reportId: number,
        payload: ResolveReportPayload
    ): Promise<{ message: string; report: AdminReportDetail }> => {
        return await http.post(
            `/reports/${reportId}/resolve/`,
            payload
        );
    },

    /**
     * GET /api/reports/stats/
     */
    getStats: async (): Promise<ReportStats> => {
        return await http.get('/reports/stats/');
    },
};

export default adminReportsApi;
