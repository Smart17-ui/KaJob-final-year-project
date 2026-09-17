// frontend/src/types/admin.ts

// ============================================
// USER TYPES
// ============================================

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DEACTIVATED';
export type UserRole = 'WORKER' | 'CLIENT' | 'ADMIN';

export interface AdminUser {
    id: number;
    full_name: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    account_status: AccountStatus;
    is_verified: boolean;
    roles: UserRole[];
    is_worker: boolean;
    is_client: boolean;
    is_admin: boolean;
    created_at: string;
    last_login: string | null;
}

export interface AdminUserDetail extends AdminUser {
    profile?: {
        bio: string;
        address: string;
        province: string;
        district: string;
        latitude: string | null;
        longitude: string | null;
        profile_photo_path: string | null;
    };
    worker_profile?: {
        bio: string;
        hourly_rate: string | null;
        average_rating: number;
        jobs_completed: number;
        availability_status: string;
        skills: string[];
    };
    stats?: {
        total_jobs_posted?: number;
        total_jobs_completed?: number;
        total_earnings?: number;
        total_spent?: number;
        total_reports?: number;
    };
}

// ============================================
// PAGINATION
// ============================================

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// ============================================
// ANALYTICS TYPES
// ============================================

export type AnalyticsPeriod =
    | 'today'
    | 'yesterday'
    | 'this_week'
    | 'last_week'
    | 'this_month'
    | 'last_month'
    | 'this_year'
    | 'last_7_days'
    | 'last_30_days'
    | 'all_time';

export interface DailySummary {
    date: string;
    new_users: number;
    jobs_created: number;
    jobs_completed: number;
    reviews_created: number;
    page_views: number;
    unique_visitors: number;
}

export interface PlatformStats {
    period: {
        key: string;
        label: string;
        start: string | null;
        end: string | null;
    };
    users: {
        total: number;
        active: number;
        workers: number;
        clients: number;
        both_roles: number;
        verified: number;
        new_users: number;
    };
    jobs: {
        total: number;
        created: number;
        completed: number;
        cancelled: number;
        open: number;
        assigned: number;
        in_progress: number;
        completion_rate: number;
    };
    reviews: {
        total: number;
        average_rating: number;
        rating_distribution: Record<string, number>;
    };
    daily_summary: DailySummary[];
    generated_at: string;
}

// ============================================
// VERIFICATION TYPES
// ============================================

export type VerificationStatus =
    | 'NOT_SUBMITTED'
    | 'PENDING'
    | 'UNDER_REVIEW'
    | 'VERIFIED'
    | 'REJECTED'
    | 'EXPIRED';

export type DocumentType =
    | 'NRC_FRONT'
    | 'NRC_BACK'
    | 'PASSPORT_PHOTO'
    | 'SELFIE';

export interface VerificationDocument {
    id: number;
    document_type: DocumentType;
    file_path: string;
    file_name: string;
    file_size: number;
    mime_type: string;
}

export interface PendingVerification {
    id: number;
    user: {
        id: number;
        full_name: string;
        email: string;
        phone_number: string;
        account_status: AccountStatus;
        is_verified: boolean;
    };
    document_type: DocumentType;
    document_number: string;
    verification_status?: VerificationStatus;
    status?: VerificationStatus;
    status_display: string;
    submitted_at: string;
    reviewed_at: string | null;
    reviewed_by?: {
        id: number;
        full_name: string;
        email: string;
    } | null;
    rejection_reason: string | null;
    verification_notes?: string | null;
    documents: VerificationDocument[];
}

// ============================================
// REPORT TYPES
// ============================================

export type ReportStatus =
    | 'PENDING'
    | 'UNDER_INVESTIGATION'
    | 'AWAITING_USER_RESPONSE'
    | 'RESOLVED'
    | 'ESCALATED_TO_POLICE'
    | 'CLOSED';

export type ReportCategory =
    | 'THEFT'
    | 'VIOLENCE'
    | 'HARASSMENT'
    | 'FRAUD'
    | 'PROPERTY_DAMAGE'
    | 'NO_SHOW'
    | 'POOR_CONDUCT'
    | 'OTHER';

export type ReportDecision =
    | 'DISMISSED'
    | 'WARNED'
    | 'SUSPENDED'
    | 'BANNED'
    | 'ESCALATED';

export interface ReportUser {
    id: number;
    full_name: string;
    email: string;
    phone_number: string;
    account_status: AccountStatus;
    is_verified: boolean;
}

export interface ReportJob {
    id: number;
    title: string;
    status: string;
    budget: string | null;
}

export interface ReportInvestigation {
    id: number;
    report: number;
    admin: ReportUser;
    status: string;
    status_display: string;
    decision: ReportDecision | null;
    decision_display: string | null;
    decision_notes: string;
    internal_notes: string;
    started_at: string;
    completed_at: string | null;
}

export interface AdminReport {
    id: number;
    reference_number: string;
    job_id: number;
    job_title: string;
    reporter: ReportUser;
    reported_user: ReportUser;
    category: ReportCategory;
    category_display: string;
    status: ReportStatus;
    status_display: string;
    submitted_at: string;
}

export interface AdminReportDetail {
    id: number;
    reference_number: string;
    job: ReportJob;
    reporter: ReportUser;
    reported_user: ReportUser;
    category: ReportCategory;
    category_display: string;
    description: string;
    status: ReportStatus;
    status_display: string;
    police_report_generated: boolean;
    police_report_path: string;
    submitted_at: string;
    investigation: ReportInvestigation | null;
}

export interface ReportStats {
    total: number;
    pending: number;
    under_investigation: number;
    resolved: number;
    escalated_to_police: number;
    by_status: { status: string; count: number }[];
    by_category: { category: string; count: number }[];
    recent: AdminReport[];
}

// ============================================
// ADMIN JOB TYPES
// ============================================

export interface AdminJob {
    id: number;
    title: string;
    description: string;
    budget: string;
    category: number;
    category_name: string;
    client: number;
    client_name: string;
    assigned_worker: {
        id: number;
        full_name: string;
        email: string;
    } | null;
    assigned_worker_name: string | null;
    general_location: string;
    exact_location?: string;
    map_url?: string;
    directions_url?: string;
    latitude?: string;
    longitude?: string;
    status: string;
    status_display: string;
    urgency?: string;
    urgency_display?: string;
    is_urgent?: boolean;
    job_date?: string | null;
    job_time?: string | null;
    timeframe?: string;
    timeframe_display?: string;
    is_flexible?: boolean;
    duration_hours?: string | null;
    posted_at: string;
    created_at: string;
    updated_at?: string;
    completed_at?: string | null;
}

export interface JobStats {
    total: number;
    open: number;
    assigned: number;
    in_progress: number;
    completed: number;
    cancelled: number;
    completion_rate: number;
}

export interface JobFilters {
    search?: string;
    status?: string;
    category?: number;
    page?: number;
    page_size?: number;
    ordering?: string;
}

// ============================================
// AUDIT LOG TYPES
// ============================================

export interface AuditLog {
    id: number;
    timestamp: string;
    admin: {
        id: number;
        full_name: string;
        email: string;
    };
    action: string;
    action_display: string;
    resource_type: string;
    resource_id: string;
    result: 'SUCCESS' | 'FAILURE' | 'ERROR';
    metadata: Record<string, any>;
}

// ============================================
// FILTER TYPES
// ============================================

export interface UserFilters {
    search?: string;
    role?: UserRole;
    status?: AccountStatus;
    is_verified?: boolean;
    page?: number;
    page_size?: number;
    ordering?: string;
}

export interface ReportFilters {
    status?: ReportStatus;
    category?: ReportCategory;
    page?: number;
    page_size?: number;
    ordering?: string;
}

export interface VerificationFilters {
    status?: VerificationStatus;
    page?: number;
    page_size?: number;
    ordering?: string;
}
