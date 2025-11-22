import { api } from './api';
import type { ApiResponse } from '@/types/api';
import type {
    Staff,
    ExeatRole,
    ExeatRoleAssignment,
    StaffProfile,
    StaffApprovalAction,
    StudentSignAction,
    ExeatStatistics,
    CompletedExeatRequestsResponse,
    RejectedExeatRequestsResponse,
    StaffDashboardStats,
    DeanExeatApplyForm
} from '@/types/staff';
import type { ExeatRequest } from '@/types/student';

// Exeat request for staff approval
export interface StaffExeatRequest {
    id: number;
    student_id: number;
    matric_no: string;
    category_id?: number;
    reason: string;
    destination: string;
    departure_date: string;
    return_date: string;
    preferred_mode_of_contact: string;
    parent_surname: string;
    parent_othernames: string;
    parent_phone_no: string;
    parent_phone_no_two: string;
    parent_email: string;
    student_accommodation: string | null;
    status: string;
    is_medical: number | boolean;
    is_expired?: boolean;
    expired_at?: string | null;
    created_at: string;
    updated_at: string;
    student: {
        id: number;
        fname: string;
        lname: string;
        email?: string;
        passport?: string;
        phone?: string;
    };
    category?: {
        id: number;
        name: string;
    };
}

export const staffApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get staff profile with roles
        getStaffProfile: builder.query<StaffProfile, void>({
            query: () => '/me',
            transformResponse: (response: any) => {
                const base = response?.profile ?? response?.user ?? response ?? {};
                const profile: any = { ...base };

                // Merge top-level roles and assigned hostels into profile for easier consumption
                if (Array.isArray(response?.roles)) profile.roles = response.roles;
                if (Array.isArray(response?.assigned_hostels)) profile.assigned_hostels = response.assigned_hostels;

                // Normalize exeat roles: prefer profile.exeat_roles, else use profile.personal.exeat_roles
                const personalRoles = Array.isArray(profile?.personal?.exeat_roles) ? profile.personal.exeat_roles : [];
                if (!Array.isArray(profile?.exeat_roles) && personalRoles.length > 0) {
                    profile.exeat_roles = personalRoles.map((r: any) => ({
                        role: {
                            name: r?.name,
                            display_name: r?.display_name ?? (typeof r?.name === 'string' ? r.name.replace('_', ' ').toUpperCase() : ''),
                            description: r?.description ?? '',
                        }
                    }));
                }

                // Derive top-level name fields for convenience in UI
                if (!profile.fname && profile?.personal?.fname) profile.fname = profile.personal.fname;
                if (!profile.lname && (profile?.personal?.last_name || profile?.personal?.lname)) {
                    profile.lname = profile.personal.last_name ?? profile.personal.lname;
                }

                return profile as StaffProfile;
            },
            providesTags: ['Profile'],
        }),

        // Get all exeat requests (role-based filtering handled by backend)
        getAllExeatRequests: builder.query<StaffExeatRequest[], void>({
            query: () => '/staff/exeat-requests',
            transformResponse: (response: { exeat_requests: StaffExeatRequest[] }) => response.exeat_requests,
            providesTags: ['ExeatRequests'],
        }),

        // Search exeat requests by student_id (accessible by any staff)
        getExeatRequestsByStudentId: builder.query<StaffExeatRequest[], number | string>({
            query: (studentId) => ({
                url: '/staff/exeat-requests',
                params: { student_id: studentId },
            }),
            transformResponse: (response: { exeat_requests: StaffExeatRequest[] } | { data?: { exeat_requests: StaffExeatRequest[] } } | StaffExeatRequest[]) => {
                if (Array.isArray(response)) return response as StaffExeatRequest[];
                if ('exeat_requests' in (response as any)) return (response as any).exeat_requests;
                if ((response as any)?.data?.exeat_requests) return (response as any).data.exeat_requests;
                return [];
            },
            providesTags: ['ExeatRequests'],
        }),

        // Get exeat requests by status
        getExeatRequestsByStatus: builder.query<StaffExeatRequest[], string>({
            query: (status) => `/staff/exeat-requests?status=${status}`,
            transformResponse: (response: { exeat_requests: StaffExeatRequest[] }) => response.exeat_requests,
            providesTags: ['ExeatRequests'],
        }),

        // Get a single exeat request by ID
        getExeatRequestById: builder.query<StaffExeatRequest, number>({
            query: (id) => `/staff/exeat-requests/${id}`,
            transformResponse: (response: any) => {
                // Handle permission error response
                if (response?.message && response.message.includes('permission')) {
                    throw new Error(response.message);
                }

                // Handle normal success response
                if (response?.exeat_request) {
                    return response.exeat_request;
                }

                // If response structure is unexpected, throw error
                throw new Error('Invalid response format from server');
            },
            providesTags: (result, error, id) => [{ type: 'ExeatRequests', id }],
        }),

        // Approve an exeat request
        approveExeatRequest: builder.mutation<ApiResponse<StaffExeatRequest>, { exeat_request_id: number; comment?: string }>({
            query: ({ exeat_request_id, comment }) => ({
                url: `/staff/exeat-requests/${exeat_request_id}/approve`,
                method: 'POST',
                body: { comment },
            }),
            invalidatesTags: ['ExeatRequests'],
        }),

        // Reject an exeat request
        rejectExeatRequest: builder.mutation<ApiResponse<StaffExeatRequest>, { exeat_request_id: number; comment?: string }>({
            query: ({ exeat_request_id, comment }) => ({
                url: `/staff/exeat-requests/${exeat_request_id}/reject`,
                method: 'POST',
                body: { comment },
            }),
            invalidatesTags: ['ExeatRequests'],
        }),

        // Sign student out (for hostel admins)
        signStudentOut: builder.mutation<ApiResponse<StaffExeatRequest>, { exeat_request_id: number; comment?: string }>({
            query: ({ exeat_request_id, comment }) => ({
                url: `/staff/exeat-requests/${exeat_request_id}/sign-out`,
                method: 'POST',
                body: { comment },
            }),
            invalidatesTags: ['ExeatRequests'],
        }),

        // Sign student in (for hostel admins)
        signStudentIn: builder.mutation<ApiResponse<StaffExeatRequest>, { exeat_request_id: number; comment?: string }>({
            query: ({ exeat_request_id, comment }) => ({
                url: `/staff/exeat-requests/${exeat_request_id}/sign-in`,
                method: 'POST',
                body: { comment },
            }),
            invalidatesTags: ['ExeatRequests'],
        }),

        // Get exeat statistics for dashboard
        getExeatStatistics: builder.query<ExeatStatistics, void>({
            query: () => '/staff/exeat-statistics',
            transformResponse: (response: ApiResponse<ExeatStatistics>) => response.data!,
            providesTags: ['Staff'],
        }),

        getCompletedExeatRequests: builder.query<CompletedExeatRequestsResponse, { page?: number; per_page?: number }>({
            query: ({ page = 1, per_page = 50 } = {}) => ({
                url: '/exeats/by-status/completed',
                params: { page, per_page },
            }),
            transformResponse: (response: CompletedExeatRequestsResponse) => {
                // The response structure is already correct, just pass it through
                return response;
            },
            providesTags: ['ExeatRequests'],
        }),
        getCompletedExeatRequestDetails: builder.query<{ exeat_request: StaffExeatRequest }, number>({
            query: (id) => `/exeats/by-status/completed/${id}`,
            transformResponse: (response: { exeat_request: StaffExeatRequest }) => response,
            providesTags: ['ExeatRequests'],
        }),
        getStaffDashboardStats: builder.query<StaffDashboardStats, void>({
            query: () => '/staff/dashboard',
            transformResponse: (response: StaffDashboardStats) => response,
            providesTags: ['DashboardStats'],
        }),
        getRejectedExeatRequests: builder.query<RejectedExeatRequestsResponse, { page?: number; per_page?: number }>({
            query: ({ page = 1, per_page = 50 } = {}) => ({
                url: '/exeats/by-status/rejected',
                params: { page, per_page },
            }),
            transformResponse: (response: RejectedExeatRequestsResponse) => {
                // The response structure is already correct, just pass it through
                return response;
            },
            providesTags: ['ExeatRequests'],
        }),
        getRejectedExeatRequestDetails: builder.query<{ exeat_request: StaffExeatRequest }, number>({
            query: (id) => `/exeats/by-status/rejected/${id}`,
            transformResponse: (response: { exeat_request: StaffExeatRequest }) => response,
            providesTags: ['ExeatRequests'],
        }),
        sendComment: builder.mutation<ApiResponse<StaffExeatRequest>, { exeat_request_id: number; comment: string }>({
            query: ({ exeat_request_id, comment }) => ({
                url: `/staff/exeat-requests/${exeat_request_id}/send-comment`,
                method: 'POST',
                body: { comment, priority: "high" },
            }),
            invalidatesTags: ['ExeatRequests'],
        }),
        editExeatRequest: builder.mutation<ApiResponse<StaffExeatRequest>, { exeat_request_id: number; payload: Partial<StaffExeatRequest> }>({
            query: ({ exeat_request_id, payload }) => ({
                url: `/staff/exeat-requests/${exeat_request_id}`,
                method: 'PUT',
                body: payload,
            }),
            invalidatesTags: ['ExeatRequests'],
        }),

        // Dean applies for exeat on behalf of a student
        deanApplyExeatRequest: builder.mutation<{ success: boolean; message: string }, DeanExeatApplyForm>({
            query: (body) => ({
                url: '/dean/exeat-requests',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['ExeatRequests'],
        }),

        // Dean bulk approval: approve all that passed secretary and parent consent
        deanBulkApproveExeats: builder.mutation<{ success?: boolean; message?: string }, void>({
            query: () => ({
                url: '/dean/exeat-requests/bulkAprroval',
                method: 'POST',
            }),
            invalidatesTags: ['ExeatRequests'],
        }),

        // ===== NOTIFICATIONS =====
        getStaffNotifications: builder.query<{ items: any[]; pagination: any }, { page?: number; per_page?: number; read_status?: 'unread'|'read' } | void>({
            query: (params) => ({
                url: '/staff/notifications',
                params,
            }),
            transformResponse: (response: any) => {
                const items = Array.isArray(response)
                    ? response
                    : (response?.data?.notifications ?? response?.notifications ?? response?.data ?? []);
                const pagination = response?.pagination ?? null;
                return { items, pagination };
            },
            providesTags: ['Notifications'],
        }),
        getStaffUnreadCount: builder.query<number, void>({
            query: () => '/staff/notifications/unread-count',
            transformResponse: (response: any) => {
                if (typeof response === 'number') return response;
                if (response?.data?.unread_count != null) return Number(response.data.unread_count) || 0;
                if (response?.unread_count != null) return Number(response.unread_count) || 0;
                return 0;
            },
            providesTags: ['Notifications'],
        }),
        markStaffNotificationRead: builder.mutation<{ success?: boolean }, number>({
            query: (id) => ({
                url: `/staff/notifications/mark-read`,
                method: 'POST',
                body: { notification_ids: [id] },
            }),
            invalidatesTags: ['Notifications'],
        }),
        markAllStaffNotificationsRead: builder.mutation<{ success?: boolean; data?: { marked_count: number } }, void>({
            query: () => ({
                url: `/staff/notifications/mark-read`,
                method: 'POST',
                body: { mark_all: true },
            }),
            invalidatesTags: ['Notifications'],
        }),

        // ===== GATE EVENTS (HOSTEL ADMIN) =====
        getGateEvents: builder.query<{ items: any[]; pagination: any }, { page?: number; per_page?: number; checked?: 'all'|'in'|'out'; search?: string; sort_by?: string; order?: 'asc'|'desc' }>({
            query: ({ page = 1, per_page = 20, checked = 'all', search = '', sort_by, order } = {}) => ({
                url: '/staff/gate-events',
                params: { page, per_page, checked, search, ...(sort_by ? { sort_by } : {}), ...(order ? { order } : {}) },
            }),
            transformResponse: (response: any) => ({ items: response?.data ?? [], pagination: response?.pagination ?? null }),
            providesTags: ['ExeatRequests'],
        }),
        exportGateEvents: builder.query<Blob, { checked?: 'all'|'in'|'out'; search?: string; format?: 'csv'|'xls'|'pdf' }>({
            query: ({ checked = 'all', search = '', format = 'csv' } = {}) => ({
                url: '/staff/gate-events/export',
                params: { checked, search, format },
            }),
        }),
    }),
});

export const {
    useGetStaffProfileQuery,
    useGetAllExeatRequestsQuery,
    useGetExeatRequestsByStatusQuery,
    useGetExeatRequestByIdQuery,
    useGetExeatRequestsByStudentIdQuery,
    useApproveExeatRequestMutation,
    useRejectExeatRequestMutation,
    useSignStudentOutMutation,
    useSignStudentInMutation,
    useGetExeatStatisticsQuery,
    useGetCompletedExeatRequestsQuery,
    useGetCompletedExeatRequestDetailsQuery,
    useGetRejectedExeatRequestsQuery,
    useGetRejectedExeatRequestDetailsQuery,
    useGetStaffDashboardStatsQuery,
    useSendCommentMutation,
    useEditExeatRequestMutation,
    useDeanApplyExeatRequestMutation,
    useDeanBulkApproveExeatsMutation,
    useGetStaffNotificationsQuery,
    useGetStaffUnreadCountQuery,
    useMarkStaffNotificationReadMutation,
    useMarkAllStaffNotificationsReadMutation,
    useGetGateEventsQuery,
    useExportGateEventsQuery,
} = staffApi;
