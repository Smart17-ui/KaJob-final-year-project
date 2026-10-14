// frontend/src/api/admin/client.ts

import API_BASE_URL from "@/api/config";

/**
 * Admin API Client
 * Separate from the main API client to avoid conflicts.
 */
const adminClient = async (
    endpoint: string,
    options: RequestInit = {}
) => {
    const token = localStorage.getItem('access_token');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // Handle 204 No Content
    if (response.status === 204) {
        return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        // Handle 401 - redirect to login
        if (response.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
        }

        throw new Error(
            data?.error ||
                data?.detail ||
                data?.message ||
                'Something went wrong. Please try again.'
        );
    }

    return data;
};

export default adminClient;
