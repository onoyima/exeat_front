import { api } from './api';
import type { ExeatCategory, StudentProfile, ExeatRequestForm, ExeatRequest } from '@/types/student';

export const exeatApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getExeatRequests: builder.query<{ exeat_requests: ExeatRequest[] }, void>({
            query: () => '/student/exeat-requests',
            providesTags: ['ExeatRequests'],
        }),
        getCategories: builder.query<{ categories: ExeatCategory[] }, void>({
            query: () => '/student/exeat-categories',
            transformResponse: (response: { categories: ExeatCategory[] }) => response,
        }),
        getStudentProfileFromExeat: builder.query<{ profile: StudentProfile }, void>({
            query: () => '/me',
            transformResponse: (response: { success: boolean; data: { profile: StudentProfile } }) => {
                if (!response.success || !response.data?.profile) {
                    throw new Error('Failed to load profile data');
                }
                return response.data;
            },
        }),
        createExeatRequest: builder.mutation<{ success: boolean; message: string }, ExeatRequestForm>({
            query: (data) => ({
                url: '/student/exeat-requests',
                method: 'POST',
                body: data,
            }),
            // Invalidate the relevant queries after a successful request
            invalidatesTags: ['ExeatRequests'],
        }),
        getExeatRequestHistory: builder.query<{
            history: {
                audit_logs: Array<any>;
                approvals: Array<{
                    id: number;
                    exeat_request_id: number;
                    staff_id: number | null;
                    role: string;
                    status: string;
                    comment: string | null;
                    method: string | null;
                    created_at: string;
                    updated_at: string;
                    staff: {
                        id: number;
                        fname: string;
                        lname: string;
                    } | null;
                }>;
                exeat_request: ExeatRequest;
            };
        }, number>({
            query: (id) => `/student/exeat-requests/${id}/history`,
            providesTags: ['ExeatRequests'],
        }),
        getExeatRequestDetails: builder.query<{ exeat_request: ExeatRequest }, number>({
            query: (id) => `/student/exeat-requests/${id}`,
            providesTags: ['ExeatRequests'],
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useGetStudentProfileFromExeatQuery,
    useCreateExeatRequestMutation,
    useGetExeatRequestsQuery,
    useGetExeatRequestDetailsQuery,
    useGetExeatRequestHistoryQuery,
} = exeatApi;