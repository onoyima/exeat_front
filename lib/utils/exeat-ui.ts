/**
 * UI helper functions for exeat request components
 * These functions provide dynamic text and labels based on exeat status
 */

/**
 * Get dynamic action title based on exeat status
 * @param status - The exeat request status
 * @returns Appropriate title for the action section
 */
export const getDynamicActionTitle = (status: string) => {
    switch (status) {
        case 'security_signin':
            return 'Monitor Return';
        case 'approved':
            return 'Active Request';
        case 'rejected':
            return 'Request Rejected';
        case 'completed':
            return 'Request Completed';
        case 'pending':
            return 'Take Action';
        case 'cmd_review':
            return 'Medical Director Review';
        case 'secretary_review':
            return 'Secretary Review';
        case 'dean_review':
            return 'Dean/Deputy Dean Review';
        case 'parent_consent':
            return 'Awaiting Parent Approval';
        case 'hostel_signin':
            return 'Hostel Sign-In Required';
        case 'hostel_signout':
            return 'Hostel Sign-Out Required';
        case 'recommendation1':
        case 'recommendation2':
            return 'Under Review';
        case 'dean_approval':
            return 'Awaiting Dean Approval';
        case 'security_signin':
            return 'Security Sign-In Required';
        case 'security_signout':
            return 'Security Sign-Out Required';
        case 'hostel_signin':
            return 'Hostel Sign-In Required';
        case 'hostel_signout':
            return 'Hostel Sign-Out Required';
        default:
            return 'Take Action';
    }
};

/**
 * Get dynamic action description based on exeat status
 * @param status - The exeat request status
 * @returns Appropriate description for the action section
 */
export const getDynamicActionDescription = (status: string) => {
    switch (status) {
        case 'security_signin':
            return 'Student is currently away. Monitor their return and ensure they check-in by the designated time.';
        case 'approved':
            return 'This exeat request has been approved and is currently active. The student is away from campus.';
        case 'rejected':
            return 'This request has been rejected. The student has been notified of the decision.';
        case 'completed':
            return 'This exeat request has been completed successfully. The student has returned to campus.';
        case 'pending':
            return 'This request requires your decision. Please review carefully and provide appropriate feedback.';
        case 'cmd_review':
            return 'This medical request is under review by the Medical Director. Your input may be required.';
        case 'secretary_review':
            return 'This request is under review by the Secretary. Please await their decision.';
        case 'dean_review':
            return 'This request requires review by the Dean of Students. Please await their decision.';
        case 'parent_consent':
            return 'This request is awaiting parent/guardian consent. Contact will be made soon.';
        case 'hostel_signin':
            return 'Student must complete hostel sign-in procedures before departure.';
        case 'hostel_signout':
            return 'Student must complete hostel sign-out procedures for departure.';
        case 'recommendation1':
        case 'recommendation2':
            return 'This request is currently under review by relevant authorities.';
        case 'dean_approval':
            return 'This request is awaiting final approval from the Dean.';
        case 'hostel_approval':
            return 'This request is being processed by hostel administration.';
        default:
            return 'This request requires your decision. Please review carefully and provide appropriate feedback.';
    }
};

/**
 * Get dynamic comment label based on exeat status
 * @param status - The exeat request status
 * @returns Appropriate label for the comment field
 */
export const getDynamicCommentLabel = (status: string) => {
    switch (status) {
        case 'security_signin':
            return 'Monitoring Notes';
        case 'approved':
            return 'Approval Notes';
        case 'rejected':
            return 'Rejection Reason';
        case 'completed':
            return 'Completion Notes';
        case 'pending':
            return 'Decision Comment';
        default:
            return 'Decision Comment';
    }
};

/**
 * Get dynamic comment placeholder based on exeat status
 * @param status - The exeat request status
 * @returns Appropriate placeholder text for the comment field
 */
export const getDynamicCommentPlaceholder = (status: string) => {
    switch (status) {
        case 'security_signin':
            return 'Add any notes about the student\'s return status...';
        case 'approved':
            return 'Add any additional notes about this approved request...';
        case 'rejected':
            return 'Provide the reason for rejection...';
        case 'completed':
            return 'Add notes about the completed request...';
        case 'pending':
            return 'Provide context for your decision...';
        default:
            return 'Provide context for your decision...';
    }
};

/**
 * Get dynamic comment requirement text based on exeat status
 * @param status - The exeat request status
 * @returns Appropriate requirement text for the comment field
 */
export const getDynamicCommentRequirement = (status: string) => {
    switch (status) {
        case 'rejected':
            return '(required)';
        case 'pending':
            return '(required for rejection, optional for approval)';
        case 'security_signin':
            return '(optional)';
        case 'approved':
            return '(optional)';
        case 'completed':
            return '(optional)';
        default:
            return '(optional)';
    }
};

/**
 * Check if a status allows actions (approve/reject)
 * @param status - The exeat request status
 * @returns True if the status allows action buttons
 */
export const canTakeAction = (status: string) => {
    return ['pending', 'cmd_review', 'secretary_review', 'dean_review', 'recommendation1', 'recommendation2'].includes(status);
};

/**
 * Get the category icon based on category ID and medical status
 * @param categoryId - The exeat category ID
 * @param isMedical - Whether the request is medical
 * @returns Emoji icon for the category
 */
export const getCategoryIcon = (categoryId: number, isMedical: boolean) => {
    if (isMedical || categoryId === 1) return '🏥';
    if (categoryId === 2) return '🌴';
    if (categoryId === 3) return '🚨';
    if (categoryId === 4) return '💼';
    if (categoryId === 6) return '✈️';
    return '📋';
};

/**
 * Get the category name based on category ID and medical status
 * @param categoryId - The exeat category ID
 * @param isMedical - Whether the request is medical
 * @returns Human-readable category name
 */
export const getCategoryName = (categoryId: number, isMedical: boolean) => {
    if (isMedical || categoryId === 1) return 'Medical';
    if (categoryId === 2) return 'Casual';
    if (categoryId === 3) return 'Emergency';
    if (categoryId === 4) return 'Official';
    if (categoryId === 6) return 'Holiday';
    return 'General';
};

/**
 * Get descriptive approval confirmation text based on exeat status
 * @param status - The exeat request status
 * @param studentName - The student's full name
 * @param reason - The exeat reason
 * @param destination - The destination
 * @param duration - The duration in days
 * @returns Descriptive text explaining what the approval means
 */
export const getApprovalConfirmationText = (
    status: string,
    studentName: string,
    reason: string,
    destination: string,
    duration: number
) => {
    const durationText = duration === 1 ? '1 day' : `${duration} days`;

    switch (status) {
        case 'pending':
            return `You are about to approve ${studentName}'s exeat request to ${destination} for ${durationText}. This will allow the student to leave campus for the stated reason: "${reason}". The student will be able to proceed to the next stage once approved.`;

        case 'cmd_review':
            return `You are approving ${studentName}'s medical exeat request to ${destination} for ${durationText}. As the Medical Director, your approval confirms that the medical reason "${reason}" is valid and the student may move to the next stage to proceed with their medical leave.`;

        case 'secretary_review':
            return `You are approving ${studentName}'s exeat request to ${destination} for ${durationText}. As the Secretary, your approval confirms that the reason "${reason}" meets institutional standards and the student may proceed with their leave.`;

        case 'dean_review':
            return `You are approving ${studentName}'s exeat request to ${destination} for ${durationText}. As the Dean of Students, your approval is the final authorization for the student to leave campus for the stated reason: "${reason}".`;

        case 'recommendation1':
        case 'recommendation2':
            return `You are approving ${studentName}'s exeat request to ${destination} for ${durationText}. Your approval confirms that the reason "${reason}" is acceptable and the student may proceed with their leave request.`;

        case 'security_signin':
            return `You are about to sign ${studentName} back into the school after their exeat. This will allow the student to return to campus and complete their exeat.`;

        case 'security_signout':
            return `You are about to sign ${studentName} out of the school. This will allow the student to leave campus.`;

        case 'hostel_signout':
            return `You are about to sign ${studentName} out of the hostel. As the Hostel Administrator, this will allow the student to leave campus.`;

        case 'hostel_signin':
            return `You are about to sign ${studentName} back into the hostel after their exeat. As the Hostel Administrator, this will allow the student to return to campus and complete their exeat.`;

        default:
            return `You are about to approve ${studentName}'s exeat request to ${destination} for ${durationText}. This will authorize the student to leave campus for the stated reason: "${reason}".`;
    }
};

/**
 * Get descriptive rejection confirmation text based on exeat status
 * @param status - The exeat request status
 * @param studentName - The student's full name
 * @param reason - The exeat reason
 * @param destination - The destination
 * @param duration - The duration in days
 * @returns Descriptive text explaining what the rejection means
 */
export const getRejectionConfirmationText = (
    status: string,
    studentName: string,
    reason: string,
    destination: string,
    duration: number
) => {
    const durationText = duration === 1 ? '1 day' : `${duration} days`;

    switch (status) {
        case 'pending':
            return `You are about to reject ${studentName}'s exeat request to ${destination} for ${durationText}. The student will not be allowed to leave campus for the stated reason: "${reason}". Please ensure you provide a clear reason for rejection.`;

        case 'cmd_review':
            return `You are rejecting ${studentName}'s medical exeat request to ${destination} for ${durationText}. As the Medical Director, your rejection indicates that the medical reason "${reason}" does not meet medical leave criteria.`;

        case 'secretary_review':
            return `You are rejecting ${studentName}'s exeat request to ${destination} for ${durationText}. As the Secretary, your rejection indicates that the reason "${reason}" does not meet institutional standards.`;

        case 'dean_review':
            return `You are rejecting ${studentName}'s exeat request to ${destination} for ${durationText}. As the Dean of Students, your rejection is the final decision denying the student's request to leave campus for the stated reason: "${reason}".`;

        case 'recommendation1':
        case 'recommendation2':
            return `You are rejecting ${studentName}'s exeat request to ${destination} for ${durationText}. Your rejection indicates that the reason "${reason}" is not acceptable for the requested leave.`;

        default:
            return `You are about to reject ${studentName}'s exeat request to ${destination} for ${durationText}. The student will not be allowed to leave campus for the stated reason: "${reason}".`;
    }
};

/**
 * Get dynamic approve button text based on exeat status
 * @param status - The exeat request status
 * @returns Appropriate text for the approve button
 */
export const getApproveButtonText = (status: string) => {
    switch (status) {
        case 'pending':
            return 'Approve Request';
        case 'cmd_review':
            return 'Approve Medical Review';
        case 'secretary_review':
            return 'Approve Secretary Review';
        case 'dean_review':
            return 'Approve Dean Review';
        case 'hostel_signout':
            return 'Approve Hostel Sign Out';
        case 'hostel_signin':
            return 'Approve Hostel Sign In';
        case 'security_signout':
            return 'Approve Security Sign Out';
        case 'security_signin':
            return 'Approve Security Sign In';
        case 'recommendation1':
        case 'recommendation2':
            return 'Approve Recommendation';
        default:
            return 'Approve Request';
    }
};

