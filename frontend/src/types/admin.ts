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
// STATS TYPES
// ============================================

export interface PlatformStats {
    users: {
        total: number;
        workers: number;
        clients: number;
        verified: number;
        active_today: number;
    };
    jobs: {
        total: number;
        open: number;
        assigned: number;
        in_progress: number;
        completed: number;
        cancelled: number;
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

export interface DailySummary {
    date: string;
    new_users: number;
    jobs_created: number;
    jobs_completed: number;
    reviews_created: number;
    page_views: number;
    unique_visitors: number;
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
    verification_status?: VerificationStatus;   // actual backend field
    status?: VerificationStatus;                // alias
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

export type ReportPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ReportCategory =
    | 'THEFT'
    | 'VIOLENCE'
    | 'HARASSMENT'
    | 'FRAUD'
    | 'PROPERTY_DAMAGE'
    | 'NO_SHOW'
    | 'POOR_CONDUCT'
    | 'OTHER';

export interface AdminReport {
    id: number;
    reporter: {
        id: number;
        full_name: string;
        email: string;
    };
    reported_user: {
        id: number;
        full_name: string;
        email: string;
    } | null;
    reported_job: {
        id: number;
        title: string;
    } | null;
    category: ReportCategory;
    category_display: string;
    priority: ReportPriority;
    description: string;
    status: ReportStatus;
    status_display: string;
    evidence: string[];
    created_at: string;
    resolved_at: string | null;
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
    priority?: ReportPriority;
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
