/**
 * Utility functions for student data processing
 */

/**
 * Extracts the matriculation number from a student email
 * Student emails follow the format: matric_number@*.veritas.edu.ng
 * 
 * @param email - The student email address
 * @returns The extracted matriculation number or null if invalid format
 * 
 * @example
 * extractMatricFromEmail("vug/csc/16/1663@nas.veritas.edu.ng") // returns "vug/csc/16/1663"
 * extractMatricFromEmail("vug/ech/20/4815@edu.veritas.edu.ng") // returns "vug/ech/20/4815"
 * extractMatricFromEmail("vug/mth/19/2020@admin.veritas.edu.ng") // returns "vug/mth/19/2020"
 * extractMatricFromEmail("invalid@email.com") // returns null
 */
export function extractMatricFromEmail(email: string | null | undefined): string | null {
    if (!email || typeof email !== 'string') {
        return null;
    }

    // Check if email matches the expected format for student emails
    // Pattern: any subdomain ending with veritas.edu.ng
    const studentEmailPattern = /@.*\.veritas\.edu\.ng$/;
    if (!studentEmailPattern.test(email)) {
        return null;
    }

    // Extract the part before the @ symbol
    const matricPart = email.split('@')[0];

    // Additional validation: matric numbers typically have forward slashes
    // and follow a pattern like "vug/csc/16/1663"
    if (matricPart && matricPart.includes('/')) {
        return matricPart;
    }

    return null;
}

/**
 * Formats a matriculation number for display
 * Converts to uppercase for consistency
 * 
 * @param matric - The matriculation number
 * @returns Formatted matriculation number
 */
export function formatMatricNumber(matric: string | null | undefined): string {
    if (!matric) {
        return 'Not available';
    }

    return matric.toUpperCase();
}

/**
 * Gets the matriculation number from user data, prioritizing email extraction
 * Falls back to direct matric_no field if email extraction fails
 * 
 * @param user - User object with email and optional matric_no
 * @returns The matriculation number or fallback text
 */
export function getMatricNumber(user: { email?: string; matric_no?: string } | null | undefined): string {
    if (!user) {
        return 'Not available';
    }

    // Try to extract from email first
    const extractedMatric = extractMatricFromEmail(user.email);
    if (extractedMatric) {
        return formatMatricNumber(extractedMatric);
    }

    // Fall back to direct matric_no field
    if (user.matric_no) {
        return formatMatricNumber(user.matric_no);
    }

    return 'Not available';
}