
#  KaJob API Documentation

## Overview

KaJob is a job marketplace platform that connects workers with clients for small tasks. This API provides endpoints for user management, identity verification, and job operations.

## Base URL

```http
http://localhost:8000/api
```

## Response Format

### Success Response

```json
{
  "message": "Success message",
  "data": {},
  "tokens": {}  // Only for authentication endpoints
}
```

### Error Response

```json
{
  "error": "Error message"
}
```

### Validation Error Response

```json
{
  "field_name": [
    "Error message about this field"
  ]
}
```

## HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| `200 OK` | Request successful |
| `201 Created` | Resource created |
| `204 No Content` | Resource deleted |
| `400 Bad Request` | Validation error |
| `401 Unauthorized` | Invalid or missing authentication |
| `403 Forbidden` | Authenticated but not authorized |
| `404 Not Found` | Resource not found |
| `429 Too Many Requests` | Rate limit exceeded |
| `500 Internal Server Error` | Server error |

## Authentication

Most endpoints require JWT authentication.

**Header Format:**
```http
Authorization: Bearer <access_token>
```

**Token Expiry:**
- Access Token: 1 day
- Refresh Token: 7 days

---

## Module 1: Accounts

### 1.1 Register User

**`POST /auth/register/`**

Creates a new user account.

**Authentication:**  Not required

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Banda",
  "email": "john@example.com",
  "phone_number": "0971234567",
  "password": "SecurePass123!",
  "role": "WORKER"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `first_name` | string |  Yes | User's first name |
| `last_name` | string |  Yes | User's last name |
| `email` | string |  Yes | User's email (used for login) |
| `phone_number` | string |  Yes | User's phone number |
| `password` | string |  Yes | Min 8 characters |
| `role` | string |  Yes | `WORKER` or `CLIENT` |

**Success Response (201 Created):**
```json
{
  "message": "Registration successful! Please check your email to verify your account.",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Banda",
    "full_name": "John Banda",
    "email": "john@example.com",
    "phone_number": "0971234567",
    "account_status": "ACTIVE",
    "is_verified": false,
    "roles": ["WORKER"],
    "is_admin": false,
    "is_worker": true,
    "is_client": false,
    "created_at": "2026-08-07T10:00:00Z"
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIs...",
    "refresh": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses:**

```json
// 400 Bad Request - Email already exists
{
  "error": "Email is already registered."
}
```

```json
// 400 Bad Request - Phone already exists
{
  "error": "Phone number is already registered."
}
```

---

### 1.2 Login User

**`POST /auth/login/`**

Authenticates a user and returns JWT tokens.

**Authentication:**  Not required

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string |  Yes | User's email |
| `password` | string |  Yes | User's password |

**Success Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Banda",
    "full_name": "John Banda",
    "email": "john@example.com",
    "phone_number": "0971234567",
    "account_status": "ACTIVE",
    "is_verified": true,
    "roles": ["WORKER"],
    "is_admin": false,
    "is_worker": true,
    "is_client": false,
    "last_login": "2026-08-07T10:05:00Z",
    "created_at": "2026-08-07T10:00:00Z",
    "updated_at": "2026-08-07T10:05:00Z"
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIs...",
    "refresh": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses:**

```json
// 401 Unauthorized - Invalid credentials
{
  "error": "Invalid email or password."
}
```

```json
// 400 Bad Request - Account suspended
{
  "error": "Account has been suspended."
}
```

---

### 1.3 Refresh Token

**`POST /auth/refresh/`**

Gets a new access token using a refresh token.

**Authentication:**  Not required

**Request Body:**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `refresh` | string |  Yes | Refresh token from login |

**Success Response (200 OK):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Responses:**

```json
// 401 Unauthorized - Invalid token
{
  "error": "Invalid or expired refresh token"
}
```

---

### 1.4 Logout

**`POST /auth/logout/`**

Blacklists the refresh token.

**Authentication:**  Required

**Request Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response (200 OK):**
```json
{
  "message": "Logout successful"
}
```

**Error Responses:**

```json
// 400 Bad Request - Missing token
{
  "error": "Refresh token is required"
}
```

---

### 1.5 Get Current User

**`GET /auth/me/`**

Returns the authenticated user's profile.

**Authentication:**  Required

**Request Headers:**
```http
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Banda",
    "full_name": "John Banda",
    "email": "john@example.com",
    "phone_number": "0971234567",
    "account_status": "ACTIVE",
    "is_verified": true,
    "roles": ["WORKER"],
    "is_admin": false,
    "is_worker": true,
    "is_client": false,
    "created_at": "2026-08-07T10:00:00Z"
  }
}
```

---

### 1.6 Change Password

**`POST /auth/change-password/`**

Changes the authenticated user's password.

**Authentication:**  Required

**Request Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "old_password": "SecurePass123!",
  "new_password": "NewSecurePass456!"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `old_password` | string |  Yes | Current password |
| `new_password` | string |  Yes | Min 8 characters |

**Success Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**

```json
// 400 Bad Request - Wrong password
{
  "error": "Current password is incorrect."
}
```

---

### 1.7 Forgot Password

**`POST /auth/forgot-password/`**

Sends a password reset link to the user's email.

**Authentication:**  Not required

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "message": "If an account exists with this email, you will receive a password reset link."
}
```

---

### 1.8 Reset Password

**`POST /auth/reset-password/`**

Resets the user's password using a token.

**Authentication:**  Not required

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "new_password": "NewSecurePass456!"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `token` | string |  Yes | Token from reset email |
| `new_password` | string |  Yes | Min 8 characters |

**Success Response (200 OK):**
```json
{
  "message": "Password reset successfully"
}
```

---

### 1.9 Verify Email

**`POST /auth/verify-email/`**

Verifies the user's email address.

**Authentication:**  Not required

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response (200 OK):**
```json
{
  "message": "Email verified successfully"
}
```

---

### 1.10 Resend Verification Email

**`POST /auth/resend-verification/`**

Resends the verification email.

**Authentication:**  Required

**Request Headers:**
```http
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "message": "Verification email sent successfully"
}
```

---

## Module 2: Identity Verification

### 2.1 Submit Verification

**`POST /verification/submit/`**

Submits identity verification documents.

**Authentication:**  Required (User)

**Request Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "document_type": "NRC_FRONT",
  "document_number": "123456/78/1",
  "documents": [
    {
      "document_type": "NRC_FRONT",
      "file_path": "/media/verification/nrc_front.jpg",
      "file_name": "nrc_front.jpg",
      "file_size": 1024567,
      "mime_type": "image/jpeg"
    },
    {
      "document_type": "NRC_BACK",
      "file_path": "/media/verification/nrc_back.jpg",
      "file_name": "nrc_back.jpg",
      "file_size": 987654,
      "mime_type": "image/jpeg"
    },
    {
      "document_type": "SELFIE",
      "file_path": "/media/verification/selfie.jpg",
      "file_name": "selfie.jpg",
      "file_size": 543210,
      "mime_type": "image/jpeg"
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `document_type` | string |  Yes | `NRC_FRONT`, `NRC_BACK`, `PASSPORT_PHOTO`, `SELFIE` |
| `document_number` | string |  Yes | Document identification number |
| `documents` | array |  Yes | List of document uploads |

**Success Response (201 Created):**
```json
{
  "message": "Verification submitted successfully. Please wait for admin review.",
  "verification_id": 1,
  "status": "PENDING",
  "documents": 3
}
```

---

### 2.2 Get Verification Status

**`GET /verification/status/`**

Gets the current verification status.

**Authentication:**  Required (User)

**Request Headers:**
```http
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "has_submitted": true,
  "verification_id": 1,
  "status": "PENDING",
  "submitted_at": "2026-08-07T10:00:00Z",
  "reviewed_at": null,
  "rejection_reason": null,
  "document_types": ["NRC_FRONT", "NRC_BACK", "SELFIE"],
  "message": "Your verification is pending review."
}
```

---

### 2.3 Get Verification History

**`GET /verification/history/`**

Gets verification submission history.

**Authentication:**  Required (User)

**Request Headers:**
```http
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "count": 2,
  "results": [
    {
      "id": 1,
      "status": "VERIFIED",
      "submitted_at": "2026-08-07T10:00:00Z",
      "reviewed_at": "2026-08-07T10:05:00Z",
      "rejection_reason": null,
      "document_count": 3
    }
  ]
}
```

---

### 2.4 Admin: List Pending Verifications

**`GET /admin/verifications/pending/`**

Lists all pending verifications for admin review.

**Authentication:**  Required (Admin)

**Request Headers:**
```http
Authorization: Bearer <admin_token>
```

**Success Response (200 OK):**
```json
{
  "count": 1,
  "results": [
    {
      "id": 1,
      "user": {
        "id": 2,
        "full_name": "John Banda",
        "email": "john@example.com",
        "phone_number": "0971234567",
        "account_status": "ACTIVE",
        "is_verified": false
      },
      "document_type": "NRC_FRONT",
      "document_number": "123456/78/1",
      "status": "PENDING",
      "submitted_at": "2026-08-07T10:00:00Z",
      "document_count": 3
    }
  ]
}
```

---

### 2.5 Admin: View Verification Detail

**`GET /admin/verifications/{id}/`**

Gets detailed verification information.

**Authentication:**  Required (Admin)

**Request Headers:**
```http
Authorization: Bearer <admin_token>
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "user": {
    "id": 2,
    "full_name": "John Banda",
    "email": "john@example.com",
    "phone_number": "0971234567",
    "account_status": "ACTIVE",
    "is_verified": false
  },
  "document_type": "NRC_FRONT",
  "document_number": "123456/78/1",
  "status": "PENDING",
  "submitted_at": "2026-08-07T10:00:00Z",
  "reviewed_at": null,
  "rejection_reason": null,
  "documents": [
    {
      "id": 1,
      "document_type": "NRC_FRONT",
      "file_path": "/media/verification/nrc_front.jpg",
      "file_name": "nrc_front.jpg",
      "uploaded_at": "2026-08-07T10:00:01Z"
    }
  ],
  "verification_notes": null
}
```

---

### 2.6 Admin: Review Verification

**`POST /admin/verifications/{id}/review/`**

Approves or rejects a verification request.

**Authentication:**  Required (Admin)

**Request Headers:**
```http
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body (Approve):**
```json
{
  "action": "approve",
  "notes": "All documents look valid. Approved."
}
```

**Request Body (Reject):**
```json
{
  "action": "reject",
  "reason": "Document number does not match the uploaded document.",
  "notes": "NRC number doesn't match document."
}
```

**Success Response (200 OK):**
```json
{
  "message": "Verification for John Banda has been approved.",
  "verification_id": 1,
  "status": "VERIFIED"
}
```

---

### 2.7 Admin: Get Verification Stats

**`GET /admin/verifications/stats/`**

Gets verification statistics for admin dashboard.

**Authentication:**  Required (Admin)

**Request Headers:**
```http
Authorization: Bearer <admin_token>
```

**Success Response (200 OK):**
```json
{
  "pending": 0,
  "verified": 1,
  "rejected": 0,
  "total": 1
}
```

---

## Module 3: Jobs

### 3.1 Create Job

**`POST /jobs/create/`**

Creates a new job posting.

**Authentication:**  Required (Client, Verified)

**Request Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Plumbing Repair Needed",
  "description": "Need a plumber to fix a leaking pipe.",
  "budget": 500.00,
  "category_id": 1,
  "general_location": "Kamwala, Lusaka",
  "exact_location": "Plot 15, Kamwala Road",
  "latitude": -15.3875,
  "longitude": 28.3412,
  "radius": 5
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string |  Yes | Job title |
| `description` | string |  Yes | Job description |
| `budget` | decimal |  Yes | Job budget (> 0) |
| `category_id` | integer |  Yes | Job category ID |
| `general_location` | string |  Yes | Area/neighborhood |
| `exact_location` | string |  No | Specific address |
| `latitude` | decimal |  No | For location matching |
| `longitude` | decimal |  No | For location matching |
| `radius` | integer |  No | Search radius (km), default 5 |

**Success Response (201 Created):**
```json
{
  "message": "Job posted successfully!",
  "job": {
    "id": 1,
    "title": "Plumbing Repair Needed",
    "description": "Need a plumber to fix a leaking pipe.",
    "budget": "500.00",
    "client": 1,
    "client_name": "Smart Mbuzi",
    "category": 1,
    "category_name": "Plumbing",
    "assigned_worker_name": null,
    "general_location": "Kamwala, Lusaka",
    "exact_location": "Plot 15, Kamwala Road",
    "latitude": "-15.3875",
    "longitude": "28.3412",
    "radius": 5,
    "status": "OPEN",
    "status_display": "Open",
    "posted_at": "2026-08-07T10:00:00Z"
  }
}
```

---

### 3.2 List Open Jobs

**`GET /jobs/`**

Lists all open jobs available for workers.

**Authentication:**  Required (Worker)

**Request Headers:**
```http
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "title": "Plumbing Repair Needed",
      "budget": "500.00",
      "client_name": "Smart Mbuzi",
      "category_name": "Plumbing",
      "general_location": "Kamwala, Lusaka",
      "status": "OPEN",
      "status_display": "Open",
      "posted_at": "2026-08-07T10:00:00Z"
    }
  ]
}
```

---

### 3.3 Get Job Details

**`GET /jobs/{id}/`**

Gets detailed job information.

**Authentication:**  Required (Any authenticated user)

**Success Response (200 OK):**
```json
{
  "job": {
    "id": 1,
    "title": "Plumbing Repair Needed",
    "description": "Need a plumber to fix a leaking pipe.",
    "budget": "500.00",
    "client": 1,
    "client_name": "Smart Mbuzi",
    "category": 1,
    "category_name": "Plumbing",
    "assigned_worker_name": null,
    "general_location": "Kamwala, Lusaka",
    "exact_location": "Plot 15, Kamwala Road",
    "latitude": "-15.3875",
    "longitude": "28.3412",
    "radius": 5,
    "status": "OPEN",
    "status_display": "Open",
    "posted_at": "2026-08-07T10:00:00Z"
  }
}
```

---

### 3.4 Update Job

**`PUT /jobs/{id}/update/`**

Updates a job posting.

**Authentication:**  Required (Client who owns the job)

**Request Body:**
```json
{
  "title": "Updated Plumbing Repair",
  "budget": 600.00,
  "radius": 10
}
```

**Success Response (200 OK):**
```json
{
  "message": "Job updated successfully!",
  "job": {
    "id": 1,
    "title": "Updated Plumbing Repair",
    // ... rest of job details
  }
}
```

---

### 3.5 Delete Job

**`DELETE /jobs/{id}/delete/`**

Soft deletes a job.

**Authentication:**  Required (Client who owns the job)

**Success Response (200 OK):**
```json
{
  "message": "Job deleted successfully!"
}
```

---

### 3.6 Cancel Job

**`POST /jobs/{id}/cancel/`**

Cancels a job.

**Authentication:**  Required (Client who owns the job)

**Success Response (200 OK):**
```json
{
  "message": "Job cancelled successfully!",
  "job": {
    "id": 1,
    "status": "CANCELLED",
    "status_display": "Cancelled"
  }
}
```

---

### 3.7 Apply for Job

**`POST /jobs/{id}/apply/`**

Applies for a job.

**Authentication:**  Required (Worker, Verified)

**Request Body:** (empty)
```json
{}
```

**Success Response (201 Created):**
```json
{
  "message": "Application submitted successfully!",
  "application": {
    "id": 1,
    "job": 1,
    "job_title": "Plumbing Repair Needed",
    "worker": 2,
    "worker_name": "John Banda",
    "status": "PENDING",
    "status_display": "Pending",
    "applied_at": "2026-08-07T10:05:00Z"
  }
}
```

---

### 3.8 List Job Applications

**`GET /jobs/{id}/applications/`**

Lists all applications for a job (newest first).

**Authentication:**  Required (Client who owns the job)

**Success Response (200 OK):**
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "job_title": "Plumbing Repair Needed",
      "worker_name": "John Banda",
      "status": "PENDING",
      "status_display": "Pending",
      "applied_at": "2026-08-07T10:05:00Z"
    }
  ]
}
```

---

### 3.9 Update Application Status

**`PATCH /applications/{id}/status/`**

Accepts or rejects an application.

**Authentication:**  Required (Client who owns the job)

**Request Body:**
```json
{
  "status": "accept"
}
```

or

```json
{
  "status": "reject"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Application accepted successfully!",
  "application": {
    "id": 1,
    "status": "ACCEPTED",
    "status_display": "Accepted"
  }
}
```

---

### 3.10 Assign Worker

**`POST /jobs/{id}/assign/`**

Assigns a worker to a job.

**Authentication:**  Required (Client, Verified)

**Request Body:**
```json
{
  "worker_id": 2
}
```

**Success Response (200 OK):**
```json
{
  "message": "Worker assigned successfully! All other applications have been withdrawn.",
  "assignment": {
    "id": 1,
    "job": 1,
    "job_title": "Plumbing Repair Needed",
    "worker": 2,
    "worker_name": "John Banda",
    "status": "ACTIVE",
    "status_display": "Active",
    "assigned_at": "2026-08-07T10:15:00Z"
  },
  "job": {
    "id": 1,
    "status": "ASSIGNED",
    "status_display": "Assigned"
  },
  "withdrawn_applications": 2
}
```

---

### 3.11 Worker Mark Complete

**`POST /jobs/{id}/mark-complete/`**

Worker marks the job as complete (pending client confirmation).

**Authentication:**  Required (Worker, Verified)

**Request Body:** (empty)
```json
{}
```

**Success Response (200 OK):**
```json
{
  "message": "Job marked as complete. Client has 10 minutes to confirm.",
  "job": {
    "id": 1,
    "status": "AWAITING_CONFIRMATION",
    "status_display": "Awaiting Confirmation"
  }
}
```

---

### 3.12 Client Confirm Complete

**`POST /jobs/{id}/confirm/`**

Client confirms the job is complete.

**Authentication:**  Required (Client who owns the job)

**Request Body:** (empty)
```json
{}
```

**Success Response (200 OK):**
```json
{
  "message": "Job confirmed successfully!",
  "job": {
    "id": 1,
    "status": "COMPLETED",
    "status_display": "Completed",
    "completed_at": "2026-08-07T12:00:00Z"
  }
}
```

---

### 3.13 My Jobs

**`GET /my-jobs/`**

Gets jobs posted by or assigned to the authenticated user.

**Authentication:**  Required (Any authenticated user)

**Success Response (200 OK):**
```json
{
  "count": 3,
  "results": [
    {
      "id": 1,
      "title": "Plumbing Repair Needed",
      "budget": "500.00",
      "client_name": "Smart Mbuzi",
      "category_name": "Plumbing",
      "general_location": "Kamwala, Lusaka",
      "status": "OPEN",
      "status_display": "Open",
      "posted_at": "2026-08-07T10:00:00Z"
    }
  ]
}
```

---

### 3.14 My Applications

**`GET /my-applications/`**

Gets all applications made by the authenticated worker.

**Authentication:**  Required (Worker)

**Success Response (200 OK):**
```json
{
  "count": 3,
  "results": [
    {
      "id": 1,
      "job_title": "Plumbing Repair Needed",
      "worker_name": "John Banda",
      "status": "PENDING",
      "status_display": "Pending",
      "applied_at": "2026-08-07T10:05:00Z"
    }
  ]
}
```

---

## Rate Limiting

| Endpoint | Rate Limit | Time Window |
|----------|------------|-------------|
| `/auth/register/` | 5 requests | 1 hour |
| `/auth/login/` | 10 requests | 1 minute |
| `/auth/refresh/` | 20 requests | 1 minute |
| `/auth/forgot-password/` | 3 requests | 1 hour |
| `/jobs/create/` | 10 requests | 1 minute |
| `/jobs/{id}/apply/` | 10 requests | 1 minute |

**Rate Limit Response (429):**
```json
{
  "error": "Rate limit exceeded. Please try again later.",
  "retry_after": 60,
  "max_requests": 10,
  "time_window": 60
}
```
---
