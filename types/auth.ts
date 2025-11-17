/**
 * User authentication credentials
 */
export interface AuthCredentials {
    email: string;
    password: string;
}

/**
 * Authenticated user information
 */
export interface User {
    id: number;
    user_id: number;
    user_type: number;
    student_role_id: number;
    email: string;
    title_id: number;
    lname: string;
    fname: string;
    mname?: string;
    gender: string;
    dob: string;
    country_id: number;
    state_id: number;
    lga_name: string;
    city: string;
    religion: string;
    marital_status: string;
    address: string;
    phone: string;
    username: string;
    passport?: string;
    hobbies?: string;
    email_verified_at: string;
    status: number;
    remember_token?: string;
    created_at: string;
    updated_at: string;
    matric_no?: string;
}

/**
 * User role type
 */
export type UserRole = 'student' | 'dean' | 'secretary' | 'hostel-admin' | 'admin' | 'cmd';

/**
 * Authentication response
 */
export interface AuthResponse {
    user: User;
    role: UserRole;  // Role at the top level to match backend response
    token: string;
    message: string;
} 