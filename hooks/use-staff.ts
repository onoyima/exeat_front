import { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { updateRoles, updateAssignedHostels } from '@/lib/services/authSlice';
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
    const { data: profile, isLoading: profileLoading, error: profileError } = useGetStaffProfileQuery(undefined, { refetchOnMountOrArgChange: true, refetchOnFocus: true, refetchOnReconnect: true });
    const dispatch = useDispatch();

    useEffect(() => {
        if (profile) {
            const apiRoleNames = Array.isArray((profile as any)?.exeat_roles)
                ? (profile as any).exeat_roles.map((r: any) => extractRoleName(r))
                : Array.isArray((profile as any)?.roles)
                    ? ((profile as any).roles as string[])
                    : [];
            dispatch(updateRoles(apiRoleNames));

            const p: any = profile as any;
            const hostels = Array.isArray(p?.assigned_hostels)
                ? p.assigned_hostels
                : Array.isArray(p?.personal?.assigned_hostels)
                    ? p.personal.assigned_hostels
                    : [];
            if (hostels.length) {
                dispatch(updateAssignedHostels(hostels));
            }
        }
    }, [profile, dispatch]);
    const { data: statistics, isLoading: statsLoading } = useGetExeatStatisticsQuery();

    // Role-based access control
    const hasRole = useMemo(() => {
        return (roleName: string) => {
            if (profile?.exeat_roles) {
                const apiRoles = profile.exeat_roles.map((role: any) => extractRoleName(role));
                if (apiRoles.includes(roleName)) {
                    return true;
                }
            }

            if (profile && Array.isArray((profile as any).roles)) {
                const roleNames = ((profile as any).roles as string[]).map((r) => String(r));
                if (roleNames.includes(roleName)) {
                    return true;
                }
            }

            try {
                if (typeof window !== 'undefined') {
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        if (user.roles && Array.isArray(user.roles) && user.roles.includes(roleName)) {
                            return true;
                        }
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
                console.error('Error checking localStorage for roles:', e);
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
        if (profile) {
            if (Array.isArray((profile as any).exeat_roles)) {
                return (profile as any).exeat_roles.map((role: any) => role.role);
            }
            if (Array.isArray((profile as any).roles)) {
                return ((profile as any).roles as string[]).map((roleName: string) => ({
                    name: roleName,
                    display_name: roleName.charAt(0).toUpperCase() + roleName.slice(1).replace('_', ' '),
                    description: ''
                }));
            }
            return [];
        }

        if (typeof window !== 'undefined') {
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
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

    const assignedHostels = useMemo(() => {
        if (profile && (profile as any)?.personal && Array.isArray((profile as any).personal.assigned_hostels)) {
            return (profile as any).personal.assigned_hostels as string[];
        }
        if (profile && Array.isArray((profile as any).assigned_hostels)) {
            return (profile as any).assigned_hostels as string[];
        }
        if (typeof window !== 'undefined') {
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (Array.isArray(user.assigned_hostels)) return user.assigned_hostels as string[];
                }
            } catch {}
        }
        return [] as string[];
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
        let result: any = profile ? { ...(profile as any) } : null;

        if (typeof window !== 'undefined') {
            try {
                const userStr = localStorage.getItem('user');
                const localUser = userStr ? JSON.parse(userStr) : null;
                if (!result && localUser) result = localUser;
                if (result && localUser) {
                    if (!result.fname && localUser.fname) result.fname = localUser.fname;
                    if (!result.lname && localUser.lname) result.lname = localUser.lname;
                    if (!Array.isArray(result.roles) && Array.isArray(localUser.roles)) result.roles = localUser.roles;
                    if (!Array.isArray(result.assigned_hostels) && Array.isArray(localUser.assigned_hostels)) result.assigned_hostels = localUser.assigned_hostels;
                }
            } catch {}
        }

        return result;
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
        assignedHostels,
        
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
