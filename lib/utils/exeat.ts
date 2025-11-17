import type { ExeatStatus } from '@/types/student';

export const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
        case 'approved':
            return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
        case 'completed':
            return 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200';
        case 'rejected':
            return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
        case 'cmd_review':
        case 'secretary_review':
        case 'dean_review':
            return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
        case 'parent_consent':
            return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200';
        case 'hostel_signin':
        case 'hostel_signout':
            return 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200';
        case 'recommendation1':
        case 'recommendation2':
        case 'dean_approval':
        case 'hostel_approval':
            return 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
    }
};

export const getStatusText = (status: string) => {
    switch (status) {
        case 'pending':
            return 'Awaiting Initial Review';
        case 'cmd_review':
            return 'Medical Director Review';
        case 'secretary_review':
            return 'Secretary Review';
        case 'parent_consent':
            return 'Awaiting Parent Approval';
        case 'dean_review':
            return 'Dean/Deputy Dean Review';
        case 'hostel_signin':
            return 'Ready for Hostel Sign-In';
        case 'hostel_signout':
            return 'Ready for Hostel Sign-Out';
        case 'security_signin':
            return 'Student Away - Awaiting Return';
        case 'security_signout':
            return 'Ready for Security Sign-Out';
        case 'recommendation1':
            return 'Under Initial Review';
        case 'recommendation2':
            return 'Under Final Review';
        case 'dean_approval':
            return 'Awaiting Dean Approval';
        case 'hostel_approval':
            return 'Hostel Processing';
        case 'approved':
            return 'Request Approved';
        case 'rejected':
            return 'Request Not Approved';
        case 'completed':
            return 'Request Completed';
        default:
            return status.split('_').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
    }
};

export const isActiveStatus = (status: string) => {
    return ['pending', 'recommendation1', 'recommendation2', 'parent_consent', 'dean_approval', 'hostel_approval', 'security_signin'].includes(status);
};

/**
 * Calculate time remaining until return date
 * @param returnDate - The return date string or Date object
 * @returns Object with time remaining details
 */
export const getTimeRemaining = (returnDate: string | Date) => {
    const now = new Date().getTime();
    const returnTime = new Date(returnDate).getTime();
    const timeRemaining = returnTime - now;

    const isOverdue = timeRemaining < 0;
    const absTimeRemaining = Math.abs(timeRemaining);

    const days = Math.floor(absTimeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absTimeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((absTimeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((absTimeRemaining % (1000 * 60)) / 1000);

    return {
        isOverdue,
        days,
        hours,
        minutes,
        seconds,
        totalMs: timeRemaining,
    };
};

/**
 * Format time remaining as a human-readable string
 * @param timeData - The time remaining object from getTimeRemaining
 * @returns Formatted string
 */
export const formatTimeRemaining = (timeData: ReturnType<typeof getTimeRemaining>) => {
    const { isOverdue, days, hours, minutes, seconds } = timeData;

    if (isOverdue) {
        return `Overdue by ${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m remaining`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s remaining`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s remaining`;
    } else {
        return `${seconds}s remaining`;
    }
};

/**
 * Get countdown color based on time remaining
 * @param timeData - The time remaining object from getTimeRemaining
 * @returns Tailwind CSS color classes
 */
export const getCountdownColor = (timeData: ReturnType<typeof getTimeRemaining>) => {
    const { isOverdue, days, hours } = timeData;

    if (isOverdue) {
        return 'text-red-600 bg-red-50 border-red-200';
    }

    if (days === 0 && hours < 6) {
        return 'text-orange-600 bg-orange-50 border-orange-200';
    }

    if (days === 0 && hours < 24) {
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }

    return 'text-green-600 bg-green-50 border-green-200';
};

/**
 * Check if a user can edit an exeat request based on their role and the exeat status
 * @param userRoles - Array of user roles
 * @param exeatStatus - Current status of the exeat request
 * @returns Boolean indicating if the user can edit the exeat
 */
export const canEditExeat = (userRoles: string[], exeatStatus: string): boolean => {
    // Only admin, dean, and deputy_dean roles can edit
    const hasEditRole = userRoles.some(role =>
        ['admin', 'dean', 'deputy_dean'].includes(role)
    );

    return hasEditRole;
};

/**
 * Get editable fields based on user role
 * @param userRole - The user's role
 * @returns Array of field names that can be edited
 */
export const getEditableFields = (userRole: string): string[] => {
    // Base fields that all editors can modify
    const baseFields = ['reason', 'destination', 'departure_date', 'return_date', 'comment'];

    // Additional fields for admin and dean roles
    if (['admin', 'dean'].includes(userRole)) {
        return [
            ...baseFields,
            'parent_surname',
            'parent_othernames',
            'parent_phone_no',
            'parent_phone_no_two',
            'parent_email',
            'preferred_mode_of_contact',
            'category_id',
            'is_medical'
        ];
    }

    return baseFields;
};