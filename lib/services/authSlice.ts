import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User, AuthResponse } from '@/types/auth';
import { authApi } from './authApi';

interface AuthState {
    user: (User & { role: string; roles?: string[] }) | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

// Helper to safely access localStorage
const isClient = typeof window !== 'undefined';

const getFromStorage = (key: string) => {
    if (!isClient) return null;
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};

// Helper to safely parse stored user data
const getStoredUser = () => {
    const storedUser = getFromStorage('user');
    try {
        const parsed = storedUser ? JSON.parse(storedUser) : null;
        // If the stored user has exeat_roles but no roles, migrate it
        if (parsed && parsed.exeat_roles && !parsed.roles) {
            const roleNames = parsed.exeat_roles.map((role: any) => {
                // Safely extract role name from different possible structures
                if (role?.role?.name) return role.role.name;
                if (role?.name) return role.name;
                if (role?.display_name) return role.display_name;
                if (typeof role === 'string') return role;
                return 'Unknown Role';
            });
            parsed.roles = roleNames;
        }
        return parsed;
    } catch {
        return null;
    }
};

const initialState: AuthState = {
    user: getStoredUser(),
    token: getFromStorage('token'),
    isAuthenticated: !!(getFromStorage('token') && getStoredUser()),
    isLoading: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        startLoading: (state) => {
            state.isLoading = true;
        },
        stopLoading: (state) => {
            state.isLoading = false;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            if (isClient) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        },
        setCredentials: (state, action: PayloadAction<AuthResponse>) => {
            const { user, role, token } = action.payload;
            // Handle both 'roles' and 'exeat_roles' field names
            const exeatRoles = (user as any)?.exeat_roles || (action.payload as any).roles;

            // Extract role names from exeat_roles objects if they exist
            const roleNames = Array.isArray(exeatRoles)
                ? exeatRoles.map((roleObj: any) => {
                    // Handle different role object structures
                    if (roleObj?.role?.name) return roleObj.role.name;
                    if (roleObj?.name) return roleObj.name;
                    if (roleObj?.display_name) return roleObj.display_name;
                    if (typeof roleObj === 'string') return roleObj;
                    return 'Unknown Role';
                })
                : [];

            const userData = { ...user, role, roles: roleNames };
            state.user = userData;
            state.token = token;
            state.isAuthenticated = true;
            if (isClient) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
            }
        },
        updateRoles: (state, action: PayloadAction<string[]>) => {
            if (state.user) {
                const roles = action.payload || [];
                state.user = { ...state.user, roles } as any;
                if (isClient) {
                    const storedUserRaw = localStorage.getItem('user');
                    try {
                        const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : {};
                        localStorage.setItem('user', JSON.stringify({ ...storedUser, roles }));
                    } catch {
                        localStorage.setItem('user', JSON.stringify(state.user));
                    }
                }
            }
        },
        updateAssignedHostels: (state, action: PayloadAction<string[]>) => {
            if (isClient) {
                const storedUserRaw = localStorage.getItem('user');
                try {
                    const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : {};
                    localStorage.setItem('user', JSON.stringify({ ...storedUser, assigned_hostels: action.payload || [] }));
                } catch {
                    if (state.user) {
                        const nextUser = { ...state.user, assigned_hostels: action.payload || [] } as any;
                        localStorage.setItem('user', JSON.stringify(nextUser));
                        state.user = nextUser;
                    }
                }
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addMatcher(
                authApi.endpoints.login.matchPending,
                (state) => {
                    state.isLoading = true;
                }
            )
            .addMatcher(
                authApi.endpoints.login.matchFulfilled,
                (state, { payload }) => {
                    // Handle both 'roles' and 'exeat_roles' field names
                    const exeatRoles = (payload.user as any)?.exeat_roles || (payload as any).roles;

                    // Extract role names from exeat_roles objects if they exist
                    const roleNames = Array.isArray(exeatRoles)
                        ? exeatRoles.map((roleObj: any) => {
                            // Handle different role object structures
                            if (roleObj?.role?.name) return roleObj.role.name;
                            if (roleObj?.name) return roleObj.name;
                            if (roleObj?.display_name) return roleObj.display_name;
                            if (typeof roleObj === 'string') return roleObj;
                            return 'Unknown Role';
                        })
                        : [];

                    const user = { ...payload.user, role: payload.role, roles: roleNames };
                    state.user = user;
                    state.token = payload.token;
                    state.isAuthenticated = true;
                    state.isLoading = false;
                    if (isClient) {
                        localStorage.setItem('token', payload.token);
                        localStorage.setItem('user', JSON.stringify(user));
                    }
                }
            )
            .addMatcher(
                authApi.endpoints.login.matchRejected,
                (state) => {
                    state.isLoading = false;
                }
            )

    },
});

export const { startLoading, stopLoading, logout, setCredentials, updateRoles, updateAssignedHostels } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;