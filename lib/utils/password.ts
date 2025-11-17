/**
 * Calculate password strength based on various criteria
 * @param password - The password to evaluate
 * @returns A score from 0 to 5 indicating password strength
 */
export function getPasswordStrength(password: string): number {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (password.length >= 12) score++;
    return score;
}

/**
 * Get the color class for password strength visualization
 * @param score - The password strength score (0-5)
 * @returns A Tailwind CSS class for the appropriate color
 */
export function getStrengthColor(score: number): string {
    if (score <= 1) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-400';
    return 'bg-green-500';
}

/**
 * Get a human-readable label for password strength
 * @param score - The password strength score (0-5)
 * @returns A string describing the password strength
 */
export function getStrengthLabel(score: number): string {
    if (score <= 1) return 'Weak';
    if (score <= 3) return 'Medium';
    return 'Strong';
}