/**
 * Base API response type for all API calls
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    status?: number;
} 