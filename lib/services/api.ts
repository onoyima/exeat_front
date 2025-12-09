import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/lib/store';

const resolveBaseUrl = () => {
    const env = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (env && env.length) return env;
    if (typeof window !== 'undefined') {
        const h = window.location.hostname || '';
        if (h.endsWith('veritas.edu.ng')) return 'https://attendance.veritas.edu.ng/api';
    }
    return process.env.NODE_ENV === 'production' ? 'https://attendance.veritas.edu.ng/api' : 'http://localhost:8000/api';
};

export const API_BASE_URL: string = resolveBaseUrl();

// Get token from Redux state
const getAuthToken = (getState: () => RootState) => {
    const state = getState();
    return state.auth.token;
};

// Create a base query with error handling
const baseQueryWithErrorHandling = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
        // Get token from Redux state
        const token = getAuthToken(getState as () => RootState);
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        headers.set('Content-Type', 'application/json');
        headers.set('Accept', 'application/json');
        return headers;
    },
});

// Wrapper to handle authentication errors
const baseQuery = async (args: any, api: any, extraOptions: any) => {
    const result = await baseQueryWithErrorHandling(args, api, extraOptions);

    // Handle 401 Unauthorized errors
    if (result.error && result.error.status === 401) {
        // Clear authentication data
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }

        // Redirect to login if not already there
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
        }
    }

    return result;
};

export const api = createApi({
    reducerPath: 'api',
    baseQuery,
    tagTypes: ['Profile', 'ExeatCategories', 'ExeatRequests', 'ExeatRoles', 'Staff', 'ExeatRequests', 'DashboardStats', 'Admin', 'StudentDebts', 'Notifications'],
    endpoints: () => ({}),
});
