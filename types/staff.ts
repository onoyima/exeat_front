/**
 * Staff member information
 */
export interface Staff {
    id: number;
    name: string;
    email: string;
    phone?: string;
    position?: string;
}

/**
 * Exeat role information
 */
export interface ExeatRole {
    id: number;
    name: string;
    description?: string;
    permissions?: string[];
}

/**
 * Staff exeat role assignment
 */
export interface ExeatRoleAssignment {
    staff_id: number;
    exeat_role_id: number;
    staff: Staff;
    role: ExeatRole;
    assigned_at?: string;
}

/**
 * Staff exeat approval request
 */
export interface StaffExeatApproval {
    exeat_request_id: number;
    staff_id: number;
    approved: boolean;
    comment?: string;
    approved_at: string;
}

/**
 * Hostel admin assignment
 */
export interface HostelAdminAssignment {
    staff_id: number;
    hostel_id: number;
    staff: Staff;
    hostel_name: string;
    assigned_at: string;
}

/**
 * Staff profile with roles
 */
export interface StaffProfile {
    id: number;
    user_type: number;
    fname: string;
    lname: string;
    mname?: string;
    maiden_name?: string;
    dob: string;
    title: string;
    country_id: string;
    state_id: string;
    lga_name: string;
    address: string;
    city: string;
    religion: string;
    phone: string;
    p_email: string;
    marital_status: string;
    gender: string;
    email: string;
    status: number;
    created_at: string;
    updated_at: string;
    contacts: Array<{
        id: number;
        staff_id: number;
        name: string;
        relationship: string;
        address: string;
        state: string;
        phone_no: string;
        phone_no_two?: string;
        email: string;
        status: number;
        created_at: string;
        updated_at: string;
    }>;
    exeat_roles: Array<{
        id: number;
        staff_id: number;
        exeat_role_id: number;
        assigned_at: string;
        updated_at: string;
        created_at: string;
        role: {
            id: number;
            name: string;
            display_name: string;
            description: string;
            created_at: string;
            updated_at: string;
        };
    }>;
}

/**
 * Staff approval action
 */
export interface StaffApprovalAction {
    exeat_request_id: number;
    action: 'approve' | 'reject';
    comment?: string;
}

/**
 * Student sign out/in action
 */
export interface StudentSignAction {
    exeat_request_id: number;
    action: 'sign_out' | 'sign_in';
    comment?: string;
}

/**
 * Exeat statistics for staff dashboard
 */
export interface ExeatStatistics {
    total_pending: number;
    total_approved: number;
    total_rejected: number;
    total_signed_out: number;
    total_signed_in: number;
    role_specific_stats: Record<string, {
        pending: number;
        approved: number;
        rejected: number;
    }>;
}

/**
 * Student information for completed exeat requests
 */
export interface CompletedExeatStudent {
    id: number;
    name: string;
    matric_no: string | null;
    email: string;
    passport?: string;
}

/**
 * Approval information for completed exeat requests
 */
export interface CompletedExeatApproval {
    staff_name: string;
    status: string;
    comments: string | null;
    approved_at: string;
}

/**
 * Individual completed exeat request
 */
export interface CompletedExeatRequest {
    id: number;
    student: CompletedExeatStudent;
    category: string;
    reason: string;
    destination: string;
    departure_date: string;
    return_date: string;
    status: string;
    is_medical: boolean;
    approvals: CompletedExeatApproval[];
    created_at: string;
    updated_at: string;
}

/**
 * Pagination information for completed exeat requests
 */
export interface CompletedExeatRequestsPagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

/**
 * Status summary for completed exeat requests
 */
export interface CompletedExeatRequestsStatusSummary {
    status: string;
    total_count: number;
    medical_count: number;
    regular_count: number;
}

/**
 * Paginated data wrapper for completed exeat requests
 */
export interface CompletedExeatRequestsData {
    current_page: number;
    data: CompletedExeatRequest[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

/**
 * Full response for completed exeat requests query
 */
export interface CompletedExeatRequestsResponse {
    success: boolean;
    data: CompletedExeatRequestsData;
    pagination: CompletedExeatRequestsPagination;
    status_summary: CompletedExeatRequestsStatusSummary;
}

/**
 * Student information for rejected exeat requests
 */
export interface RejectedExeatStudent {
    id: number;
    name: string;
    matric_no: string | null;
    email: string;
}

/**
 * Approval information for rejected exeat requests
 */
export interface RejectedExeatApproval {
    staff_name: string;
    status: string;
    comments: string | null;
    approved_at: string;
}

/**
 * Individual rejected exeat request
 */
export interface RejectedExeatRequest {
    id: number;
    student: RejectedExeatStudent;
    category: string;
    reason: string;
    destination: string;
    departure_date: string;
    return_date: string;
    status: string;
    is_medical: boolean;
    approvals: RejectedExeatApproval[];
    created_at: string;
    updated_at: string;
}

/**
 * Paginated data wrapper for rejected exeat requests
 */
export interface RejectedExeatRequestsData {
    current_page: number;
    data: RejectedExeatRequest[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

/**
 * Pagination information for rejected exeat requests
 */
export interface RejectedExeatRequestsPagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

/**
 * Status summary for rejected exeat requests
 */
export interface RejectedExeatRequestsStatusSummary {
    status: string;
    total_count: number;
    medical_count: number;
    regular_count: number;
}

/**
 * Full response for rejected exeat requests query
 */
export interface RejectedExeatRequestsResponse {
    success: boolean;
    data: RejectedExeatRequestsData;
    pagination: RejectedExeatRequestsPagination;
    status_summary: RejectedExeatRequestsStatusSummary;
}

/**
 * Admin Dashboard Overview
 */
export interface AdminDashboardOverview {
    total_students: number;
    total_staff: number;
    active_exeats: number;
    pending_approvals: number;
    total_requests_today: number;
    system_uptime: string;
    student_away: number;
    approved_exeats: number;
}

/**
 * Admin Dashboard Exeat Statistics
 */
export interface AdminDashboardExeatStatistics {
    total_requests: number;
    approved_requests: number;
    rejected_requests: number;
    pending_requests: number;
    parentRequestpending: number;
    completeRequests: number;
    student_outofschool: number;
    awaitingDeanApproval: number;
    approval_rate: number;
    average_processing_time: string;
}

/**
 * Admin Dashboard User Analytics
 */
export interface AdminDashboardUserAnalytics {
    active_users: number;
    new_registrations: number;
    role_distribution: Record<string, number>;
}

/**
 * Admin Dashboard Performance Metrics
 */
export interface AdminDashboardPerformanceMetrics {
    average_response_time: string;
    system_load: string;
    database_queries_per_minute: number;
    cache_hit_rate: string;
}

/**
 * Audit Log Entry
 */
export interface AuditLogEntry {
    id: number;
    action: string;
    target_type: string;
    target_id: number;
    actor: {
        type: string;
        name: string;
        id: number;
        email?: string;
        student_id?: number | null;
    };
    timestamp: string;
    details: string;
    formatted_time: string;
}

/**
 * Audit Trail Section
 */
export interface AdminDashboardAuditTrail {
    audit_logs: AuditLogEntry[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        has_more_pages: boolean;
    };
    total_actions: number;
    action_summary: Record<string, number>;
}

/**
 * Chart Dataset
 */
export interface ChartDataset {
    label: string;
    data: (number | string)[];
    borderColor?: string;
    backgroundColor?: string | string[];
}

/**
 * Chart Configuration
 */
export interface ChartConfig {
    labels: string[];
    datasets?: ChartDataset[];
    data?: (number | string)[];
    borderColor?: string;
    backgroundColor?: string | string[];
}

/**
 * Audit Statistics Charts
 */
export interface AdminDashboardAuditStatistics {
    daily_activity_chart: ChartConfig;
    action_types_chart: {
        labels: string[];
        data: number[];
        backgroundColor: string[];
    };
}

/**
 * Debt Trend Entry
 */
export interface DebtTrendEntry {
    date: string;
    new_debts: number;
    debt_amount: number | string;
    payments: number | string;
    formatted_date: string;
}

/**
 * Debt Aging Category
 */
export interface DebtAgingCategory {
    count: number;
    amount: number;
    formatted_amount: string;
}

/**
 * Dashboard Charts
 */
export interface AdminDashboardCharts {
    exeat_trends: ChartConfig;
    status_distribution: {
        labels: string[];
        data: number[];
        backgroundColor: string[];
    };
    user_activity: ChartConfig;
    approval_rates: ChartConfig;
    debt_trends: DebtTrendEntry[];
    payment_methods: Record<string, { count: number; amount: string }>;
    debt_aging: Record<string, DebtAgingCategory>;
}

/**
 * Recent Activity Entry
 */
export interface RecentActivityEntry {
    id: number;
    action: string;
    actor: string;
    actor_type: string;
    actor_id: number;
    timestamp: string;
    formatted_time: string;
    details: string;
}

/**
 * Debt Analytics Overview
 */
export interface DebtAnalyticsOverview {
    total_debts: number;
    total_amount: string;
    paid_amount: string;
    pending_amount: string;
    cleared_amount: string;
    average_debt: string;
    collection_rate: string;
}

/**
 * Debt Analytics Recent Activity
 */
export interface DebtAnalyticsRecentActivity {
    period_days: number;
    new_debts: number;
    new_amount: string;
    recent_payments: string;
}

/**
 * Debt Analytics Status Distribution
 */
export interface DebtAnalyticsStatusDistribution {
    cleared?: {
        count: number;
        amount: string;
    };
    unpaid?: {
        count: number;
        amount: string;
    };
    paid?: {
        count: number;
        amount: string;
    };
}

/**
 * Debt Analytics
 */
export interface DebtAnalytics {
    overview: DebtAnalyticsOverview;
    recent_activity: DebtAnalyticsRecentActivity;
    status_distribution: DebtAnalyticsStatusDistribution;
}

/**
 * Top Debtor Entry
 */
export interface TopDebtor {
    student_id: number;
    student_name: string;
    student_number: string;
    debt_count: number;
    total_amount: string;
}

/**
 * Monthly Debt Summary
 */
export interface MonthlyDebtSummary {
    month: string;
    month_name: string;
    new_debts: number;
    debt_amount: number | string;
    payments: number | string;
    net_change: number;
}

/**
 * Clearance Statistics
 */
export interface ClearanceStatistics {
    clearance_by_staff: any[];
    average_clearance_time_hours: string;
    total_cleared: number;
    total_cleared_amount: string;
}

/**
 * Debt Summary
 */
export interface DebtSummary {
    top_debtors: TopDebtor[];
    monthly_summary: MonthlyDebtSummary[];
    clearance_stats: ClearanceStatistics;
}

/**
 * Admin Dashboard Response
 */
export interface AdminDashboardResponse {
    success: boolean;
    data: {
        overview: AdminDashboardOverview;
        exeat_statistics: AdminDashboardExeatStatistics;
        user_analytics: AdminDashboardUserAnalytics;
        performance_metrics: AdminDashboardPerformanceMetrics;
        debt_analytics: DebtAnalytics;
        audit_trail: AdminDashboardAuditTrail;
        audit_statistics: AdminDashboardAuditStatistics;
        charts: AdminDashboardCharts;
        debt_summary: DebtSummary;
        recent_activities: RecentActivityEntry[];
    };
}

// ===== HOSTEL ASSIGNMENT TYPES =====

/**
 * Hostel information
 */
export interface Hostel {
    id: number;
    name: string;
    gender: string;
}

/**
 * Staff member for assignment
 */
export interface StaffForAssignment {
    id: number;
    fname: string;
    lname: string;
    email: string;
    passport?: string;
}

/**
 * Paginated response for hostels
 */
export interface HostelPagination {
    current_page: number;
    data: Hostel[];
    total: number;
}

/**
 * Paginated response for staff
 */
export interface StaffPagination {
    current_page: number;
    data: StaffForAssignment[];
    total: number;
}

/**
 * Assignment options response
 */
export interface HostelAssignmentOptions {
    hostels: HostelPagination;
    staff: StaffPagination;
}

/**
 * Create hostel assignment request
 */
export interface CreateHostelAssignmentRequest {
    vuna_accomodation_id: number;
    staff_id: number;
    auto_assign_role?: boolean;
    notes?: string;
}

/**
 * Hostel assignment response
 */
export interface HostelAssignment {
    id: number;
    vuna_accomodation_id: number;
    staff_id: number;
    assigned_at: string;
    status: 'active' | 'inactive';
    assigned_by: number;
    notes?: string;
    hostel: Hostel;
    staff: StaffForAssignment;
}

/**
 * Create hostel assignment response
 */
export interface CreateHostelAssignmentResponse {
    status: 'success';
    message: string;
    data: HostelAssignment;
}

/**
 * List hostel assignments query parameters
 */
export interface ListHostelAssignmentsParams {
    status?: 'active' | 'inactive';
    hostel_id?: number;
    staff_id?: number;
    page?: number;
    per_page?: number;
}

/**
 * Hostel assignment list item
 */
export interface HostelAssignmentListItem {
    id: number;
    vuna_accomodation_id: number;
    staff_id: number;
    assigned_at: string;
    status: 'active' | 'inactive';
    assigned_by: number;
    notes?: string;
    hostel: {
        id: number;
        name: string;
    };
    staff: {
        id: number;
        fname: string;
        lname: string;
        passport?: string;
    };
}

/**
 * Paginated hostel assignments response
 */
export interface HostelAssignmentsPagination {
    current_page: number;
    data: HostelAssignmentListItem[];
    total: number;
}

/**
 * List hostel assignments response
 */
export interface ListHostelAssignmentsResponse {
    status: 'success';
    data: HostelAssignmentsPagination;
}

/**
 * Update assignment status request
 */
export interface UpdateAssignmentStatusRequest {
    status: 'active' | 'inactive';
}

/**
 * Update assignment status response
 */
export interface UpdateAssignmentStatusResponse {
    status: 'success';
    message: string;
    data: {
        id: number;
        status: 'active' | 'inactive';
        updated_at: string;
    };
}

/**
 * Remove assignment response
 */
export interface RemoveAssignmentResponse {
    status: 'success';
    message: string;
}

/**
 * Staff's hostel assignments response
 */
export interface StaffHostelAssignmentsResponse {
    status: 'success';
    data: Array<{
        id: number;
        vuna_accomodation_id: number;
        staff_id: number;
        status: 'active' | 'inactive';
        hostel: Hostel;
    }>;
}

/**
 * Hostel's assigned staff response
 */
export interface HostelAssignedStaffResponse {
    status: 'success';
    data: Array<{
        id: number;
        vuna_accomodation_id: number;
        staff_id: number;
        status: 'active' | 'inactive';
        assigned_by: number;
        staff: StaffForAssignment;
    }>;
}

/**
 * Staff Dashboard Overview Statistics
 */
export interface StaffDashboardOverview {
    total_requests: number;
    pending_requests: number;
    approved_requests: number;
    rejected_requests: number;
}

/**
 * Status Analytics Entry
 */
export interface StatusAnalytics {
    status: string;
    count: number;
}

/**
 * Department Analytics Entry
 */
export interface DepartmentAnalytics {
    department: string;
    count: number;
}

/**
 * Date Analytics Entry
 */
export interface DateAnalytics {
    date: string;
    count: number;
}

/**
 * Staff Dashboard Analytics
 */
export interface StaffDashboardAnalytics {
    by_status: StatusAnalytics[];
    by_department: DepartmentAnalytics[];
    by_date: DateAnalytics[];
}

// Types
export interface AdminStaffAssignment {
    staff_id?: number;
    staff_name: string;
    staff_email: string;
    role_name: string;
    role_display_name: string;
    assigned_at: string;
    exeat_role_id?: number;
}

export interface AdminRole {
    id: number;
    name: string;
    display_name: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface AssignRoleRequest {
    staff_id: number;
    exeat_role_id: number;
}

export interface AssignRoleResponse {
    id: number;
    staff_id: number;
    exeat_role_id: number;
    assigned_at: string;
}

export interface StaffMember {
    id: number;
    fname: string;
    lname: string;
    middle_name?: string;
    email: string;
    title?: string;
    status?: number;
}

export interface UnassignRoleRequest {
    exeat_role_id: number;
}

/**
 * Staff Dashboard Statistics Response
 */
export interface StaffDashboardStats {
    data: {
        total_requests: number;
        pending_requests: number;
        approved_requests: number;
        rejected_requests: number;
        analytics: StaffDashboardAnalytics;
    };
}

/**
 * Audit Trail Overview Statistics
 */
export interface AuditTrailOverview {
    department_students: number;
    pending_approvals: number;
    approved_today: number;
    department_approval_rate: number;
}

/**
 * Department Statistics
 */
export interface DepartmentStatistics {
    total_requests: number;
    average_processing_time: string;
    most_active_day: string;
}

/**
 * Audit Trail Charts
 */
export interface AuditTrailCharts {
    department_trends: any[];
    approval_timeline: any[];
    student_activity: any[];
    debt_trends: DebtTrendEntry[];
    payment_methods: Record<string, { count: number; amount: string }>;
}

/**
 * Audit Trail Response
 */
export interface AuditTrailResponse {
    success: boolean;
    data: {
        overview: AuditTrailOverview;
        department_statistics: DepartmentStatistics;
        pending_approvals: any[];
        student_analytics: any[];
        debt_analytics: DebtAnalytics;
        audit_trail: {
            audit_logs: AuditLogEntry[];
            pagination: {
                current_page: number;
                last_page: number;
                per_page: number;
                total: number;
                from: number;
                to: number;
                has_more_pages: boolean;
            };
            total_actions: number;
            action_summary: Record<string, number>;
        };
        charts: AuditTrailCharts;
        debt_summary: DebtSummary;
        recent_requests: any[];
    };
}

// ===== DEAN/APPLY EXEAT ON BEHALF TYPES =====
export interface DeanExeatApplyForm {
    student_id: number;
    category_id: number;
    reason: string;
    destination: string;
    departure_date: string; // yyyy-MM-dd
    return_date: string; // yyyy-MM-dd
    preferred_mode_of_contact?: 'whatsapp' | 'text' | 'phone_call' | 'email';
}