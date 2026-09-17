// frontend/src/api/admin/analytics.ts

import { http } from './helpers';
import type { PlatformStats, AnalyticsPeriod } from '@/types/admin';

export interface TrendDataParams {
    days?: number;
    start_date?: string;
    end_date?: string;
}

export interface PlatformStatsParams {
    period?: AnalyticsPeriod;
}

export const adminAnalyticsApi = {
    getPlatformStats: async (
        params?: PlatformStatsParams
    ): Promise<PlatformStats> => {
        return await http.get('/admin/platform-stats/', params || {});
    },

    getDashboard: async () => {
        return await http.get('/admin/dashboard/');
    },

    getSummary: async () => {
        return await http.get('/admin/summary/');
    },

    getTrend: async (params?: TrendDataParams) => {
        return await http.get('/admin/trend/', params);
    },

    getDaily: async (date?: string) => {
        return await http.get('/admin/daily/', date ? { date } : undefined);
    },

    getWeekly: async (week?: string) => {
        return await http.get('/admin/weekly/', week ? { week } : undefined);
    },

    getMonthly: async (month?: string) => {
        return await http.get('/admin/monthly/', month ? { month } : undefined);
    },

    getComparison: async () => {
        return await http.get('/admin/comparison/');
    },

    getTopUsers: async (days: number = 7, limit: number = 10) => {
        return await http.get('/admin/top-users/', { days, limit });
    },
};

export default adminAnalyticsApi;
