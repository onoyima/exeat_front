import { api } from './api';
import type { AuthCredentials, AuthResponse } from '@/types/auth';

export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<AuthResponse, AuthCredentials>({
            query: (credentials) => ({
                url: '/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        logout: builder.mutation<{ message: string }, void>({
            query: () => ({
                url: '/logout',
                method: 'POST',
            }),
        }),
        getProfile: builder.query<any, void>({
            query: () => '/me',
            providesTags: ['Profile'],
        }),
    }),
});

export const {
    useLoginMutation,
    useLogoutMutation,
    useGetProfileQuery,
} = authApi;