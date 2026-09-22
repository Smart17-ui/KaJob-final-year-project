/* =========================================================
REPORT CATEGORY
========================================================= */

export type ReportCategory =
| "THEFT"
| "VIOLENCE"
| "HARASSMENT"
| "FRAUD"
| "PROPERTY_DAMAGE"
| "NO_SHOW"
| "POOR_CONDUCT"
| "OTHER";

/* =========================================================
REPORT STATUS
========================================================= */

export type ReportStatus =
| "PENDING"
| "UNDER_INVESTIGATION"
| "AWAITING_USER_RESPONSE"
| "RESOLVED"
| "ESCALATED_TO_POLICE"
| "CLOSED";

/* =========================================================
REPORT CATEGORY LABELS
========================================================= */

export const REPORT_CATEGORY_LABELS: {
[key in ReportCategory]: string;
} = {
THEFT: "Theft",
VIOLENCE: "Violence",
HARASSMENT: "Harassment",
FRAUD: "Fraud",
PROPERTY_DAMAGE: "Property Damage",
NO_SHOW: "No Show",
POOR_CONDUCT: "Poor Conduct",
OTHER: "Other",
};

/* =========================================================
REPORT STATUS LABELS
========================================================= */

export const REPORT_STATUS_LABELS: {
[key in ReportStatus]: string;
} = {
PENDING: "Pending",
UNDER_INVESTIGATION: "Under Investigation",
AWAITING_USER_RESPONSE: "Awaiting User Response",
RESOLVED: "Resolved",
ESCALATED_TO_POLICE: "Escalated to Police",
CLOSED: "Closed",
};

/* =========================================================
REPORT USER
========================================================= */

export interface ReportUser {
id: number;
full_name: string;
role?: "CLIENT" | "WORKER";
}

/* =========================================================
REPORTABLE JOB - OTHER PARTY
========================================================= */

export interface ReportOtherParty {
id: number;
full_name: string;
role: "CLIENT" | "WORKER";
}

/* =========================================================
REPORTABLE JOB
========================================================= */

export interface ReportableJob {
id: number;
title: string;
status: string;
status_display?: string;
other_party: ReportOtherParty | null;
has_existing_report: boolean;
}

/* =========================================================
REPORTABLE JOBS RESPONSE
========================================================= */

export interface ReportableJobsResponse {
count: number;
results: ReportableJob[];
next?: string | null;
previous?: string | null;
}

/* =========================================================
CREATE REPORT DATA
========================================================= */

export interface CreateReportData {
job_id?: number | null;
category: ReportCategory;
description: string;
}

/* =========================================================
REPORT
========================================================= */

export interface Report {
id: number;
reference_number: string;

job_id: number | null;
job_title: string | null;

reported_user: ReportUser | null;

category: ReportCategory;
category_display: string;

description: string;

status: ReportStatus;
status_display: string;

submitted_at: string;
}

/* =========================================================
CREATE REPORT RESPONSE
========================================================= */

export interface CreateReportResponse {
message: string;
report: Report;
}

/* =========================================================
MY REPORT
========================================================= */

export interface MyReport {
id: number;
reference_number: string;

job_id: number | null;
job_title: string | null;

reported_user_name: string | null;

category: ReportCategory;
category_display: string;

status: ReportStatus;
status_display: string;

submitted_at: string;
}

/* =========================================================
MY REPORTS RESPONSE
========================================================= */

export interface MyReportsResponse {
count: number;
results: MyReport[];
next?: string | null;
previous?: string | null;
}

/* =========================================================
REPORT DETAIL
========================================================= */

export interface MyReportDetail extends Report {}

/* =========================================================
MY REPORT DETAIL RESPONSE
========================================================= */

export interface MyReportDetailResponse {
report: MyReportDetail;
}
