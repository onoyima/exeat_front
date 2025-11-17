import { useMemo } from 'react';
import {
    useGetStaffProfileQuery,
    useGetAllExeatRequestsQuery,
    useGetExeatRequestsByStatusQuery,
    useGetExeatRequestByIdQuery,
    useApproveExeatRequestMutation,
    useRejectExeatRequestMutation,
    useSignStudentOutMutation,
    useSignStudentInMutation,
    useGetExeatStatisticsQuery,
    useSendCommentMutation,
    useEditExeatRequestMutation,
} from '@/lib/services/staffApi';
import type { StaffProfile } from '@/types/staff';
import { extractRoleName } from '@/lib/utils/csrf';
import { canEditExeat, getEditableFields } from '@/lib/utils/exeat';

/**
 * Custom hook for staff functionality with role-based access control
 * Provides role-based permissions and exeat request management
 */
export const useStaff = () => {
    const { data: profile, isLoading: profileLoading, error: profileError } = useGetStaffProfileQuery();
    const { data: statistics, isLoading: statsLoading } = useGetExeatStatisticsQuery();

    // Role-based access control
    const hasRole = useMemo(() => {
        return (roleName: string) => {
            // First check localStorage roles array (most direct and reliable)
            try {
                if (typeof window !== 'undefined') {
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        // Check roles array first (primary source)
                        if (user.roles && Array.isArray(user.roles) && user.roles.includes(roleName)) {
                            return true;
                        }
                    }
                }
            } catch (e) {
                console.error('Error checking localStorage for roles:', e);
            }

            // Then check profile from API
            if (profile?.exeat_roles) {
                const apiRoles = profile.exeat_roles.map((role: any) => extractRoleName(role));
                if (apiRoles.includes(roleName)) {
                    return true;
                }
            }

            // Fallback to exeat_roles in localStorage
            try {
                if (typeof window !== 'undefined') {
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        if (user.exeat_roles && Array.isArray(user.exeat_roles)) {
                            const localRoles = user.exeat_roles.map((role: any) =>
                                role.role?.name || (typeof role.role === 'string' ? role.role : '')
                            ).filter(Boolean);
                            if (localRoles.includes(roleName)) {
                                return true;
                            }
                        }
                    }
                }
            } catch (e) {
                console.error('Error checking localStorage exeat_roles:', e);
            }

            return false;
        };
    }, [profile]);

    // Check if staff has multiple roles
    const hasMultipleRoles = useMemo(() => {
        return profile?.exeat_roles && profile.exeat_roles.length > 1;
    }, [profile]);

    // Get primary role (first role in the list)
    const primaryRole = useMemo(() => {
        return profile?.exeat_roles?.[0]?.role;
    }, [profile]);

    // Get all roles (from API profile or localStorage)
    const allRoles = useMemo(() => {
        // First try to get from API profile
        if (profile?.exeat_roles && profile.exeat_roles.length > 0) {
            return profile.exeat_roles.map((role: any) => role.role);
        }

        // Fallback to localStorage roles array
        if (typeof window !== 'undefined') {
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    // If roles array exists, convert it to the expected format
                    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
                        return user.roles.map((roleName: string) => ({
                            name: roleName,
                            display_name: roleName.charAt(0).toUpperCase() + roleName.slice(1).replace('_', ' '),
                            description: ''
                        }));
                    }
                }
            } catch (e) {
                console.error('Error reading roles from localStorage:', e);
            }
        }

        return [];
    }, [profile]);

    // Role-specific permissions
    const canApproveExeat = useMemo(() => {
        return hasRole('dean') || hasRole('secretary');
    }, [hasRole]);

    const canVetMedical = useMemo(() => {
        return hasRole('cmd');
    }, [hasRole]);

    const canSignStudents = useMemo(() => {
        return hasRole('hostel_admin');
    }, [hasRole]);

    const canOverrideApprovals = useMemo(() => {
        return hasRole('dean');
    }, [hasRole]);

    // Get role-specific exeat requests
    const getRoleSpecificRequests = () => {
        if (hasRole('cmd')) {
            return useGetExeatRequestsByStatusQuery('cmd_review');
        }
        if (hasRole('dean') || hasRole('secretary')) {
            return useGetAllExeatRequestsQuery();
        }
        if (hasRole('hostel_admin')) {
            return useGetExeatRequestsByStatusQuery('approved');
        }
        return useGetAllExeatRequestsQuery();
    };

    // Get mutation hooks
    const [editExeatRequest] = useEditExeatRequestMutation();

    // Function to edit exeat request with role-based access control
    const editExeatRequestWithAccess = async (exeat_request_id: number, payload: Partial<any>) => {
        try {
            // Get user roles directly from localStorage
            let userRoles: string[] = [];
            let userObj = null;

            if (typeof window !== 'undefined') {
                const userStr = localStorage.getItem('user');

                if (userStr) {
                    try {
                        userObj = JSON.parse(userStr);

                        // Get roles from the roles array
                        userRoles = userObj.roles || [];

                        // If no roles found in roles array, try to extract from exeat_roles
                        if (!userRoles.length && userObj.exeat_roles) {
                            userRoles = userObj.exeat_roles.map((role: any) => {
                                const extractedRole = role.role?.name || (typeof role.role === 'string' ? role.role : '');
                                return extractedRole;
                            }).filter(Boolean);
                        }
                    } catch (e) {
                        console.error('DEBUG: Error parsing user from localStorage:', e);
                    }
                }
            } else {
                console.log('DEBUG: Window is not defined (server-side rendering)');
            }

            // Check if user has permission to edit (admin, dean, or deputy_dean)
            const hasPermission = userRoles.some(role => ['admin', 'dean', 'deputy_dean'].includes(role));

            if (!hasPermission) {
                throw new Error('You do not have permission to edit exeat requests');
            }

            // Get primary role for field filtering
            const primaryRole = userRoles[0] || '';

            const editableFields = getEditableFields(primaryRole);

            const filteredPayload = Object.fromEntries(
                Object.entries(payload).filter(([key]) => {
                    const isEditable = editableFields.includes(key);
                    return isEditable;
                })
            );

            if (Object.keys(filteredPayload).length === 0) {
                throw new Error('No valid fields to update');
            }

            // Proceed with edit if all checks pass
            const result = await editExeatRequest({ exeat_request_id, payload: filteredPayload });
            return result;
        } catch (error) {
            console.error('DEBUG: Error in editExeatRequestWithAccess:', error);
            throw error;
        }
    };

    // Get user profile with fallback to localStorage
    const userProfile = useMemo(() => {
        // Use API profile if available
        if (profile) return profile;

        // Fallback to localStorage
        if (typeof window !== 'undefined') {
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    return JSON.parse(userStr);
                }
            } catch (e) {
                console.error('Error reading user from localStorage:', e);
            }
        }

        return null;
    }, [profile]);

    return {
        // Profile (with localStorage fallback)
        profile: userProfile,
        profileLoading,
        profileError,

        // Statistics
        statistics,
        statsLoading,

        // Role management
        hasRole,
        hasMultipleRoles,
        primaryRole,
        allRoles,

        // Permissions
        canApproveExeat,
        canVetMedical,
        canSignStudents,
        canOverrideApprovals,

        // Role-specific requests
        getRoleSpecificRequests,

        // Mutations
        approveExeatRequest: useApproveExeatRequestMutation(),
        rejectExeatRequest: useRejectExeatRequestMutation(),
        signStudentOut: useSignStudentOutMutation(),
        signStudentIn: useSignStudentInMutation(),
        sendComment: useSendCommentMutation(),
        editExeatRequest: useEditExeatRequestMutation(),
        editExeatRequestWithAccess,
    };
};

/**
 * Hook for getting exeat requests based on staff role
 */
export const useStaffExeatRequests = (status?: string) => {
    const { hasRole } = useStaff();

    const allRequests = useGetAllExeatRequestsQuery();
    const statusRequests = useGetExeatRequestsByStatusQuery(status || '');

    // Return appropriate requests based on role
    if (hasRole('cmd')) {
        return useGetExeatRequestsByStatusQuery('cmd_review');
    }

    // If status is 'all' or undefined, return all requests
    if (!status || status === 'all') {
        return allRequests;
    }

    // Otherwise return status-specific requests
    return statusRequests;
};

/**
 * Hook for staff dashboard statistics
 */
export const useStaffDashboard = () => {
    const { data: statistics, isLoading } = useGetExeatStatisticsQuery();
    const { profile } = useStaff();

    const roleSpecificStats = useMemo(() => {
        if (!statistics || !profile?.exeat_roles) return {};

        const roleStats: Record<string, any> = {};
        profile.exeat_roles.forEach((role: any) => {
            const roleName = extractRoleName(role);
            roleStats[roleName] = statistics.role_specific_stats[roleName] || {
                pending: 0,
                approved: 0,
                rejected: 0,
            };
        });

        return roleStats;
    }, [statistics, profile]);

    return {
        statistics,
        roleSpecificStats,
        isLoading,
    };
};
