// frontend/src/api/admin/helpers.ts

import adminClient from './client';

/**
 * HTTP helpers for admin API calls.
 * Uses the admin client (separate from friend's client).
 */
export const http = {
    /**
     * GET request with optional query params
     */
    get: async <T = any>(
        endpoint: string,
        params?: Record<string, any>
    ): Promise<T> => {
        let url = endpoint;

        if (params) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    searchParams.append(key, String(value));
                }
            });
            const query = searchParams.toString();
            if (query) {
                url = `${endpoint}?${query}`;
            }
        }

        return (await adminClient(url, { method: 'GET' })) as T;
    },

    /**
     * POST request
     */
    post: async <T = any>(endpoint: string, data?: any): Promise<T> => {
        return (await adminClient(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        })) as T;
    },

    /**
     * PUT request
     */
    put: async <T = any>(endpoint: string, data?: any): Promise<T> => {
        return (await adminClient(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        })) as T;
    },

    /**
     * PATCH request
     */
    patch: async <T = any>(endpoint: string, data?: any): Promise<T> => {
        return (await adminClient(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        })) as T;
    },

    /**
     * DELETE request
     */
    delete: async <T = any>(endpoint: string): Promise<T> => {
        return (await adminClient(endpoint, { method: 'DELETE' })) as T;
    },
};
