// frontend/src/api/admin/analytics.ts

import { http } from './helpers';
import type { PlatformStats } from '@/types/admin';

export interface TrendDataParams {
    days?: number;
    start_date?: string;
    end_date?: string;
}

export const adminAnalyticsApi = {
    /**
     * GET /api/admin/dashboard/
     */
    getDashboard: async () => {
        return await http.get('/admin/dashboard/');
    },

    /**
     * GET /api/admin/platform-stats/
     */
    getPlatformStats: async (): Promise<PlatformStats> => {
        return await http.get('/admin/platform-stats/');
    },

    /**
     * GET /api/admin/summary/
     */
    getSummary: async () => {
        return await http.get('/admin/summary/');
    },

    /**
     * GET /api/admin/trend/
     */
    getTrend: async (params?: TrendDataParams) => {
        return await http.get('/admin/trend/', params);
    },

    /**
     * GET /api/admin/daily/
     */
    getDaily: async (date?: string) => {
        return await http.get('/admin/daily/', date ? { date } : undefined);
    },

    /**
     * GET /api/admin/weekly/
     */
    getWeekly: async (week?: string) => {
        return await http.get('/admin/weekly/', week ? { week } : undefined);
    },

    /**
     * GET /api/admin/monthly/
     */
    getMonthly: async (month?: string) => {
        return await http.get('/admin/monthly/', month ? { month } : undefined);
    },

    /**
     * GET /api/admin/comparison/
     */
    getComparison: async () => {
        return await http.get('/admin/comparison/');
    },

    /**
     * GET /api/admin/top-users/
     */
    getTopUsers: async (days: number = 7, limit: number = 10) => {
        return await http.get('/admin/top-users/', { days, limit });
    },
};

export default adminAnalyticsApi;
