import { api } from './api';
import type { ApiResponse } from '@/types/api';
import type {
    StudentProfile,
    ExeatCategory,
    ExeatRequestForm,
    ExeatRequest,
    StudentDebtListResponse,
    PaymentInitRequest,
    PaymentInitResponse,
    PaymentVerificationResponse,
    ExeatCommentsResponse
} from '@/types/student';

export const studentApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getStudentProfile: builder.query<StudentProfile, void>({
            query: () => '/me',
            transformResponse: (response: { user_id: number; roles: string[]; profile: StudentProfile }) => {
                return response.profile;
            },
            providesTags: ['Profile'],
        }),
        getExeatCategories: builder.query<ExeatCategory[], void>({
            query: () => '/student/exeat-categories',
            transformResponse: (response: ApiResponse<{ categories: ExeatCategory[] }>) => response.data!.categories,
            providesTags: ['ExeatCategories'],
        }),
        createExeatRequest: builder.mutation<ApiResponse<ExeatRequest>, ExeatRequestForm>({
            query: (form) => ({
                url: '/student/exeat-requests',
                method: 'POST',
                body: form,
            }),
            invalidatesTags: ['ExeatRequests'],
        }),
        getExeatRequests: builder.query<ExeatRequest[], void>({
            query: () => '/student/exeat-requests',
            transformResponse: (response: ApiResponse<{ requests: ExeatRequest[] }>) => response.data!.requests,
            providesTags: ['ExeatRequests'],
        }),

        // ===== STUDENT DEBT MANAGEMENT ENDPOINTS =====

        // 1. List Student's Own Debts
        getStudentDebts: builder.query<StudentDebtListResponse, { page?: number; per_page?: number }>({
            query: (params) => ({
                url: '/student/debts',
                params,
            }),
            transformResponse: (response: StudentDebtListResponse) => response,
            providesTags: ['StudentDebts'],
        }),

        // 2. Initialize Payment (Paystack)
        initializePayment: builder.mutation<PaymentInitResponse, { id: number; data: PaymentInitRequest }>({
            query: ({ id, data }) => ({
                url: `/student/debts/${id}/payment-proof`,
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: PaymentInitResponse) => response,
            invalidatesTags: ['StudentDebts'],
        }),

        // 3. Verify Payment
        verifyPayment: builder.query<PaymentVerificationResponse, { id: number; reference: string }>({
            query: ({ id, reference }) => ({
                url: `/student/debts/${id}/verify-payment-api`,
                params: { reference },
            }),
            transformResponse: (response: PaymentVerificationResponse) => response,
            providesTags: ['StudentDebts'],
        }),

        // ===== EXEAT COMMENTS ENDPOINT =====

        // Get comments sent to student by staff
        getExeatComments: builder.query<ExeatCommentsResponse, void>({
            query: () => '/student/exeat-requests/comments',
            transformResponse: (response: ExeatCommentsResponse) => response,
            providesTags: ['ExeatRequests'],
        }),
    }),
});

export const {
    useGetStudentProfileQuery,
    useGetExeatCategoriesQuery,
    useCreateExeatRequestMutation,
    useGetExeatRequestsQuery,
    useGetStudentDebtsQuery,
    useInitializePaymentMutation,
    useVerifyPaymentQuery,
    useGetExeatCommentsQuery,
} = studentApi; 