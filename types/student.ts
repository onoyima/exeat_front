/**
 * Student profile information
 */
export interface StudentProfile {
    personal: {
        fname: string;
        middle_name: string;
        last_name: string;
        gender: string;
        dob: string;
        marital_status: string;
        title: number;
        nationality: {
            country_id: number;
            state_id: number;
            lga_name: string;
            city: string;
        };
        contact: {
            address: string;
            phone: string;
            email: string;
            username: string;
        };
        extras: {
            passport?: string;
            signature?: string;
            hobbies?: string;
            status: number;
        };
    };
    academic: {
        matric_no: string;
        old_matric_no: string;
        course_study_id: number;
        level: number;
        entry_mode_id: number;
        study_mode_id: number;
        academic_session_id: number;
        admissions_type_id: number;
        faculty_id: number;
        department_id: number;
        acad_status_id: number;
        admitted_date: string | null;
        jamb_no: string;
        jamb_score: number;
        is_hostel: boolean | null;
        studentship: number;
        studentship_id: number;
        program_type: string;
    };
    medical: {
        physical: string;
        blood_group: string;
        genotype: string;
        condition: string;
        allergies: string;
    };
    sponsor_contact: {
        title: string;
        full_name: string;
        relationship: string;
        address: string;
        state: string;
        city: string;
        phone_no: string;
        phone_no_two: string;
        email: string;
        email_two: string;
    };
}

/**
 * Exeat request form data
 */
export interface ExeatRequestForm {
    category_id: number;
    preferred_mode_of_contact: string;
    reason: string;
    destination: string;
    departure_date: string;
    return_date: string;
}

/**
 * Exeat request status type
 */
export type ExeatStatus =
    | 'pending'
    | 'cmd_review'
    | 'secretary_review'
    | 'parent_consent'
    | 'dean_review'
    | 'hostel_signin'
    | 'hostel_signout'
    | 'approved'
    | 'rejected'
    | 'completed';

/**
 * Exeat request details
 */
export interface ExeatRequest {
    id: number;
    student_id: number;
    matric_no: string;
    category_id: number;
    reason: string;
    destination: string;
    departure_date: string;
    return_date: string;
    preferred_mode_of_contact: string;
    parent_surname: string;
    parent_othernames: string;
    parent_phone_no: string;
    parent_phone_no_two: string | null;
    parent_email: string;
    student_accommodation: string | null;
    status: string;
    is_medical: number;
    created_at: string;
    updated_at: string;
    category?: {
        id: number;
        name: string;
    };
}

/**
 * Exeat category
 */
export interface ExeatCategory {
    id: number;
    name: string;
    description?: string;
}

// ===== STUDENT DEBT MANAGEMENT TYPES =====

/**
 * Student debt information
 */
export interface StudentDebt {
    id: number;
    student_id: number;
    exeat_request_id: number;
    amount: string;
    overdue_hours: number;
    payment_status: 'unpaid' | 'paid' | 'cleared';
    payment_reference: string | null;
    payment_proof: string | null;
    payment_date: string | null;
    cleared_by: number | null;
    cleared_at: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    student: {
        id: number;
        user_id: number;
        user_type: number;
        student_role_id: number;
        email: string;
        password: string;
        title_id: number;
        lname: string;
        fname: string;
        mname: string;
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
        passport: string;
        signature: string;
        hobbies: string;
        email_verified_at: string;
        status: number;
        remember_token: string;
        created_at: string | null;
        updated_at: string;
    };
    exeat_request: {
        id: number;
        student_id: number;
        matric_no: string;
        category_id: number;
        reason: string;
        destination: string;
        departure_date: string;
        return_date: string;
        preferred_mode_of_contact: string;
        parent_surname: string;
        parent_othernames: string;
        parent_phone_no: string;
        parent_phone_no_two: string;
        parent_email: string;
        student_accommodation: string | null;
        status: string;
        is_medical: boolean;
        is_expired: boolean;
        expired_at: string | null;
        created_at: string;
        updated_at: string;
    };
    cleared_by_staff: any | null;
}

/**
 * Student debt list response
 */
export interface StudentDebtListResponse {
    status: 'success';
    data: {
        current_page: number;
        data: StudentDebt[];
        total: number;
    };
}

/**
 * Payment initialization request
 */
export interface PaymentInitRequest {
    payment_method: 'paystack';
}

/**
 * Payment initialization response
 */
export interface PaymentInitResponse {
    status: 'success';
    message: string;
    data: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
}

/**
 * Payment verification response
 */
export interface PaymentVerificationResponse {
    status: 'success';
    message: string;
    data: {
        id: number;
        student_id: number;
        exeat_request_id: number;
        amount: string;
        processing_charge: string;
        total_amount_with_charge: string;
        overdue_hours: number;
        payment_status: 'cleared';
        payment_reference: string;
        payment_proof: string | null;
        payment_date: string;
        cleared_by: number | null;
        cleared_at: string;
        notes: string | null;
        created_at: string;
        updated_at: string;
        exeat_request: {
            id: number;
            student_id: number;
            matric_no: string;
            category_id: number;
            reason: string;
            destination: string;
            departure_date: string;
            return_date: string;
            preferred_mode_of_contact: string;
            parent_surname: string;
            parent_othernames: string;
            parent_phone_no: string;
            parent_phone_no_two: string;
            parent_email: string;
            student_accommodation: string | null;
            status: string;
            is_medical: boolean;
            is_expired: boolean;
            expired_at: string | null;
            created_at: string;
            updated_at: string;
        };
    };
}

/**
 * Admin debt list item
 */
export interface AdminDebtListItem {
    id: number;
    student_id: number;
    exeat_request_id: number;
    amount: string;
    overdue_hours: number;
    payment_status: 'unpaid' | 'paid' | 'cleared';
    payment_reference: string | null;
    payment_proof: string | null;
    payment_date: string | null;
    cleared_by: number | null;
    cleared_at: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    student: {
        id: number;
        user_id: number;
        user_type: number;
        student_role_id: number;
        email: string;
        password: string;
        title_id: number;
        lname: string;
        fname: string;
        mname: string;
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
        passport: string;
        signature: string;
        hobbies: string;
        email_verified_at: string;
        status: number;
        remember_token: string;
        created_at: string | null;
        updated_at: string;
    };
    exeat_request: {
        id: number;
        student_id: number;
        matric_no: string;
        category_id: number;
        reason: string;
        destination: string;
        departure_date: string;
        return_date: string;
        preferred_mode_of_contact: string;
        parent_surname: string;
        parent_othernames: string;
        parent_phone_no: string;
        parent_phone_no_two: string;
        parent_email: string;
        student_accommodation: string | null;
        status: string;
        is_medical: boolean;
        is_expired: boolean;
        expired_at: string | null;
        created_at: string;
        updated_at: string;
    };
    cleared_by_staff: any | null;
}

/**
 * Admin debt list response
 */
export interface AdminDebtListResponse {
    status: 'success';
    data: {
        current_page: number;
        data: AdminDebtListItem[];
        total: number;
    };
}

/**
 * Clear debt request
 */
export interface ClearDebtRequest {
    notes: string;
}

/**
 * Clear debt response
 */
export interface ClearDebtResponse {
    status: 'success';
    message: string;
    data: {
        id: number;
        payment_status: 'cleared';
        cleared_by: number;
        cleared_at: string;
        notes: string;
        clearedByStaff: {
            id: number;
            fname: string;
            lname: string;
        };
    };
}

/**
 * Debt check response for exeat creation
 */
export interface DebtCheckResponse {
    status: 'error';
    message: string;
    details: {
        total_debt_amount: number;
        number_of_debts: number;
        debts: Array<{
            debt_id: number;
            amount: number;
            payment_status: string;
            exeat_request_id: number;
        }>;
        payment_instructions: string;
    };
}

/**
 * Exeat comment from staff
 */
export interface ExeatComment {
    status: string;
    raw_comment: string;
}

/**
 * Exeat comments response
 */
export interface ExeatCommentsResponse {
    comments: ExeatComment[];
} 