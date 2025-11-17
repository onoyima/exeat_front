/**
 * Validates if the email is a Veritas University email
 */
export function isValidVeritasEmail(email: string): boolean {
    return email.toLowerCase().endsWith('.veritas.edu.ng');
}

/**
 * Returns a descriptive error message for invalid email formats
 */
export function getEmailErrorMessage(email: string): string {
    if (!email) return 'Email is required';
    if (!isValidVeritasEmail(email)) {
        return 'Please use your Veritas University email address';
    }
    return '';
}