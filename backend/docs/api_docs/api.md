# KaJob API Documentation - Updated

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

# Module 1: Accounts

## 1.1 Register User

**`POST /auth/register/`**

Creates a new user account.

**Authentication:** Not required

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
| `first_name` | string | Yes | User's first name |
| `last_name` | string | Yes | User's last name |
| `email` | string | Yes | User's email (used for login) |
| `phone_number` | string | Yes | User's phone number |
| `password` | string | Yes | Min 8 characters |
| `role` | string | Yes | `WORKER` or `CLIENT` |

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

## 1.2 Login User

**`POST /auth/login/`**

Authenticates a user and returns JWT tokens.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User's email |
| `password` | string | Yes | User's password |

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

## 1.3 Refresh Token

**`POST /auth/refresh/`**

Gets a new access token using a refresh token.

**Authentication:** Not required

**Request Body:**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `refresh` | string | Yes | Refresh token from login |

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

## 1.4 Logout

**`POST /auth/logout/`**

Blacklists the refresh token.

**Authentication:** Required

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

## 1.5 Get Current User

**`GET /auth/me/`**

Returns the authenticated user's profile.

**Authentication:** Required

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

## 1.6 Change Password

**`POST /auth/change-password/`**

Changes the authenticated user's password.

**Authentication:** Required

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
| `old_password` | string | Yes | Current password |
| `new_password` | string | Yes | Min 8 characters |

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

## 1.7 Forgot Password

**`POST /auth/forgot-password/`**

Sends a password reset link to the user's email.

**Authentication:** Not required

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

## 1.8 Reset Password

**`POST /auth/reset-password/`**

Resets the user's password using a token.

**Authentication:** Not required

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "new_password": "NewSecurePass456!"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `token` | string | Yes | Token from reset email |
| `new_password` | string | Yes | Min 8 characters |

**Success Response (200 OK):**
```json
{
  "message": "Password reset successfully"
}
```

---

## 1.9 Verify Email

**`POST /auth/verify-email/`**

Verifies the user's email address.

**Authentication:** Not required

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

## 1.10 Resend Verification Email

**`POST /auth/resend-verification/`**

Resends the verification email.

**Authentication:** Required

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

# Module 2: Identity Verification

## 2.1 Upload Document

**`POST /upload/`**

Uploads a document image (supports both camera capture and gallery upload).

**Authentication:** Required (User)

**Request Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body:**
```html
<form>
  <input type="file" name="file" accept="image/*" capture="environment" />
  <input type="text" name="document_type" value="NRC_FRONT" />
  <button type="submit">Upload</button>
</form>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | file | Yes | Image file (JPG, PNG, GIF, WebP) |
| `document_type` | string | Yes | `NRC_FRONT`, `NRC_BACK`, `PASSPORT_PHOTO`, `SELFIE` |

**File Requirements:**
- **Max Size:** 5MB
- **Allowed Formats:** JPG, JPEG, PNG, GIF, WebP, BMP

**Success Response (201 Created):**
```json
{
  "file_path": "/media/verification/1_1234567890.jpg",
  "file_name": "nrc_front.jpg",
  "file_size": 1024567,
  "mime_type": "image/jpeg"
}
```

**Error Responses:**
```json
// 400 Bad Request - File too large
{
  "error": "File size exceeds 5MB limit."
}
```
```json
// 400 Bad Request - Invalid format
{
  "error": "Invalid image format. Allowed formats: .jpg, .jpeg, .png, .gif, .webp, .bmp"
}
```

---

## 2.2 Submit Verification

**`POST /verification/submit/`**

Submits identity verification documents.

**Authentication:** Required (User)

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
| `document_type` | string | Yes | `NRC_FRONT`, `NRC_BACK`, `PASSPORT_PHOTO`, `SELFIE` |
| `document_number` | string | Yes | Document identification number |
| `documents` | array | Yes | List of document uploads (from upload endpoint) |

**Document Number Validation:**

| Document Type | Format | Example |
|---------------|--------|---------|
| `NRC_FRONT` / `NRC_BACK` | `\d{6}/\d{2}/\d{1}` | `123456/78/1` |
| `PASSPORT_PHOTO` | `[A-Z]{2}\d{6}` | `ZA123456` |
| `SELFIE` | No validation | N/A |

**Success Response (201 Created):**
```json
{
  "message": "Verification submitted successfully. Please wait for admin review.",
  "verification_id": 1,
  "status": "PENDING",
  "documents": 3
}
```

**Error Responses:**
```json
// 400 Bad Request - Duplicate document
{
  "document_number": [
    "This document number is already registered. Please use a different one."
  ]
}
```
```json
// 400 Bad Request - Invalid NRC format
{
  "document_number": [
    "Invalid NRC format. Expected format: 123456/78/1 (6 digits / 2 digits / 1 digit)"
  ]
}
```

---

## 2.3 Get Verification Status

**`GET /verification/status/`**

Gets the current verification status.

**Authentication:** Required (User)

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

## 2.4 Get Verification History

**`GET /verification/history/`**

Gets verification submission history.

**Authentication:** Required (User)

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

## 2.5 Admin: List Pending Verifications

**`GET /admin/verifications/pending/`**

Lists all pending verifications for admin review.

**Authentication:** Required (Admin)

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

## 2.6 Admin: View Verification Detail

**`GET /admin/verifications/{id}/`**

Gets detailed verification information.

**Authentication:** Required (Admin)

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

## 2.7 Admin: Review Verification

**`POST /admin/verifications/{id}/review/`**

Approves or rejects a verification request.

**Authentication:** Required (Admin)

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

## 2.8 Admin: Get Verification Stats

**`GET /admin/verifications/stats/`**

Gets verification statistics for admin dashboard.

**Authentication:** Required (Admin)

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

# Module 3: Jobs

## 3.1 Create Job

**`POST /jobs/create/`**

Creates a new job posting. Automatically generates map URLs from GPS coordinates.

**Authentication:** Required (Client, Verified)

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
  "latitude": -15.3875,
  "longitude": 28.3412,
  "job_date": "2026-08-20",
  "job_time": "14:30:00",
  "timeframe": "AFTERNOON",
  "is_flexible": false,
  "duration_hours": 2.5,
  "urgency": "URGENT",
  "required_skills": [1, 3]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Basic Fields** | | | |
| `title` | string | Yes | Job title |
| `description` | string | Yes | Job description |
| `budget` | decimal | Yes | Job budget (> 0) |
| `category_id` | integer | Yes | Job category ID |
| **Location Fields** | | | |
| `general_location` | string | No | Area/neighborhood (auto-filled from GPS if not provided) |
| `latitude` | decimal | No | Auto-detected from device GPS |
| `longitude` | decimal | No | Auto-detected from device GPS |
| **Timing Fields (Optional)** | | | |
| `job_date` | date | No | Date job needs to be done |
| `job_time` | time | No | Time job should start |
| `timeframe` | string | No | `MORNING`, `AFTERNOON`, `EVENING`, `ANYTIME` |
| `is_flexible` | boolean | No | Can worker choose time? Default: true |
| `duration_hours` | decimal | No | Estimated duration in hours |
| `urgency` | string | No | `IMMEDIATE`, `URGENT`, `NORMAL`, `FLEXIBLE` |
| **Skills (Optional)** | | | |
| `required_skills` | array | No | List of skill IDs (only for skilled jobs) |

**Note:** 
- The search radius is **fixed at 1km** (system default)
- `map_url` and `directions_url` are auto-generated from GPS coordinates
- `general_location` is auto-filled from GPS using OpenStreetMap if not provided

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
    "exact_location": "",
    "map_url": "https://www.google.com/maps/place/-15.3875,28.3412",
    "directions_url": "https://www.google.com/maps/dir/?api=1&destination=-15.3875,28.3412",
    "place_id": "",
    "latitude": "-15.3875",
    "longitude": "28.3412",
    "search_radius_km": 1.0,
    "job_date": "2026-08-20",
    "job_time": "14:30:00",
    "timeframe": "AFTERNOON",
    "is_flexible": false,
    "duration_hours": "2.5",
    "urgency": "URGENT",
    "status": "OPEN",
    "status_display": "Open",
    "posted_at": "2026-08-07T10:00:00Z"
  }
}
```

**Error Responses:**
```json
// 400 Bad Request
{
  "error": "You must be verified to post a job."
}
```
```json
// 400 Bad Request
{
  "error": "Budget must be greater than zero."
}
```
```json
// 400 Bad Request
{
  "error": "Duration cannot exceed 24 hours."
}
```
```json
// 400 Bad Request
{
  "error": "Job date cannot be in the past."
}
```

---

## 3.2 List Open Jobs

**`GET /jobs/`**

Lists all open jobs available for workers.

**Authentication:** Required (Worker)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `urgency` | string | `IMMEDIATE`, `URGENT`, `NORMAL`, `FLEXIBLE` |
| `category` | integer | Filter by category |
| `min_budget` | decimal | Minimum budget |
| `max_budget` | decimal | Maximum budget |

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
      "posted_at": "2026-08-07T10:00:00Z",
      "search_radius_km": 1.0,
      "is_urgent": true,
      "urgency_display": "Urgent (Within 3 days)",
      "job_display_date": "August 20, 2026",
      "duration_hours": "2.5"
    }
  ]
}
```

---

## 3.3 Get Job Details (Client/Admin)

**`GET /jobs/{id}/`**

Gets detailed job information with full access.

**Authentication:** Required (Client/Admin)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Job ID |

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
    "map_url": "https://www.google.com/maps/place/-15.3875,28.3412",
    "directions_url": "https://www.google.com/maps/dir/?api=1&destination=-15.3875,28.3412",
    "place_id": "ChIJxxxxxxxxxxxx",
    "latitude": "-15.3875",
    "longitude": "28.3412",
    "search_radius_km": 1.0,
    "job_date": "2026-08-20",
    "job_time": "14:30:00",
    "timeframe": "AFTERNOON",
    "timeframe_display": "Afternoon (12PM - 5PM)",
    "is_flexible": false,
    "duration_hours": "2.5",
    "urgency": "URGENT",
    "urgency_display": "Urgent (Within 3 days)",
    "job_display_date": "August 20, 2026",
    "job_display_time": "2:30 PM",
    "is_urgent": true,
    "status": "OPEN",
    "status_display": "Open",
    "posted_at": "2026-08-07T10:00:00Z"
  }
}
```

---

## 3.4 Get Job Details (Worker - Conditional Disclosure)

**`GET /jobs/{id}/worker/`**

Gets job details for a worker with **CONDITIONAL DISCLOSURE**.

**🔑 KEY FEATURE:** Sensitive information is ONLY revealed after the worker is assigned.

| **Before Assignment** | **After Assignment** |
|----------------------|---------------------|
| ✅ `general_location` | ✅ `general_location` |
| ✅ `latitude`/`longitude` | ✅ `latitude`/`longitude` |
| ❌ `exact_location` | ✅ `exact_location` |
| ❌ `map_url` | ✅ `map_url` |
| ❌ `directions_url` | ✅ `directions_url` |
| ❌ `place_id` | ✅ `place_id` |
| ❌ `client_name` | ✅ `client_name` |
| ❌ `client_phone` | ✅ `client_phone` |
| ❌ `can_view_full_details: false` | ✅ `can_view_full_details: true` |

**Authentication:** Required (Worker, Verified)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Job ID |

**Request Headers:**
```http
Authorization: Bearer <access_token>
```

**Success Response (Before Assignment - 200 OK):**
```json
{
  "job": {
    "id": 1,
    "title": "Plumbing Repair Needed",
    "description": "Need a plumber to fix a leaking pipe.",
    "budget": "500.00",
    "client_name": null,
    "client_phone": null,
    "category_name": "Plumbing",
    "status": "OPEN",
    "status_display": "Open",
    "general_location": "Kamwala, Lusaka",
    "exact_location": null,
    "map_url": null,
    "directions_url": null,
    "place_id": null,
    "latitude": "-15.3875",
    "longitude": "28.3412",
    "search_radius_km": 1.0,
    "job_date": "2026-08-20",
    "job_time": "14:30:00",
    "timeframe": "AFTERNOON",
    "timeframe_display": "Afternoon (12PM - 5PM)",
    "is_flexible": false,
    "duration_hours": "2.5",
    "urgency": "URGENT",
    "urgency_display": "Urgent (Within 3 days)",
    "job_display_date": "August 20, 2026",
    "job_display_time": "2:30 PM",
    "is_urgent": true,
    "application_status": null,
    "assignment_status": null,
    "assigned_at": null,
    "can_view_full_details": false
  },
  "can_view_full_details": false,
  "assignment_status": null,
  "application_status": null
}
```

**Success Response (After Assignment - 200 OK):**
```json
{
  "job": {
    "id": 1,
    "title": "Plumbing Repair Needed",
    "description": "Need a plumber to fix a leaking pipe.",
    "budget": "500.00",
    "client_name": "Smart Mbuzi",
    "client_phone": "+260971234567",
    "category_name": "Plumbing",
    "status": "ASSIGNED",
    "status_display": "Assigned",
    "general_location": "Kamwala, Lusaka",
    "exact_location": "Plot 15, Kamwala Road",
    "map_url": "https://www.google.com/maps/place/-15.3875,28.3412",
    "directions_url": "https://www.google.com/maps/dir/?api=1&destination=-15.3875,28.3412",
    "place_id": "ChIJxxxxxxxxxxxx",
    "latitude": "-15.3875",
    "longitude": "28.3412",
    "search_radius_km": 1.0,
    "job_date": "2026-08-20",
    "job_time": "14:30:00",
    "timeframe": "AFTERNOON",
    "timeframe_display": "Afternoon (12PM - 5PM)",
    "is_flexible": false,
    "duration_hours": "2.5",
    "urgency": "URGENT",
    "urgency_display": "Urgent (Within 3 days)",
    "job_display_date": "August 20, 2026",
    "job_display_time": "2:30 PM",
    "is_urgent": true,
    "application_status": "ACCEPTED",
    "assignment_status": "ACTIVE",
    "assigned_at": "2026-08-07T10:15:00Z",
    "can_view_full_details": true
  },
  "can_view_full_details": true,
  "assignment_status": "ACTIVE",
  "application_status": "ACCEPTED"
}
```

**Error Responses:**
```json
// 403 Forbidden - Job assigned to someone else
{
  "error": "This job has been assigned to another worker."
}
```
```json
// 404 Not Found
{
  "error": "Job not found."
}
```

---

## 3.5 Update Job

**`PUT /jobs/{id}/update/`**

Updates a job posting. If GPS coordinates change, map URLs are auto-regenerated.

**Authentication:** Required (Client who owns the job)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Job ID |

**Request Body (Partial Updates Allowed):**
```json
{
  "title": "Updated Plumbing Repair",
  "budget": 600.00,
  "latitude": -15.3900,
  "longitude": 28.3450
}
```

**Success Response (200 OK):**
```json
{
  "message": "Job updated successfully!",
  "job": {
    "id": 1,
    "title": "Updated Plumbing Repair",
    "budget": "600.00",
    "latitude": "-15.3900",
    "longitude": "28.3450",
    "map_url": "https://www.google.com/maps/place/-15.3900,28.3450",
    "directions_url": "https://www.google.com/maps/dir/?api=1&destination=-15.3900,28.3450",
    "is_urgent": true,
    "status": "OPEN",
    "status_display": "Open"
  }
}
```

**Error Responses:**
```json
// 400 Bad Request
{
  "error": "You don't have permission to update this job."
}
```
```json
// 400 Bad Request
{
  "error": "Cannot update a completed job."
}
```

---

## 3.6 Delete Job

**`DELETE /jobs/{id}/delete/`**

Soft deletes a job.

**Authentication:** Required (Client who owns the job)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Job ID |

**Success Response (200 OK):**
```json
{
  "message": "Job deleted successfully!"
}
```

**Error Responses:**
```json
// 400 Bad Request
{
  "error": "Cannot delete a completed job."
}
```

---

## 3.7 Cancel Job

**`POST /jobs/{id}/cancel/`**

Cancels a job.

**Authentication:** Required (Client who owns the job)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Job ID |

**Request Body:** (empty)
```json
{}
```

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

**Error Responses:**
```json
// 400 Bad Request
{
  "error": "Cannot cancel a completed job."
}
```

---

## 3.8 Apply for Job

**`POST /jobs/{id}/apply/`**

Applies for a job. Worker must be within 1km of the job location.

**Authentication:** Required (Worker, Verified)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Job ID |

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

**Error Responses:**
```json
// 400 Bad Request - Already applied
{
  "error": "You have already applied for this job."
}
```
```json
// 400 Bad Request - Worker busy
{
  "error": "You are currently busy with another job."
}
```
```json
// 400 Bad Request - Not verified
{
  "error": "You must be verified to apply for jobs."
}
```
```json
// 400 Bad Request - Own job
{
  "error": "You cannot apply to a job you created."
}
```
```json
// 400 Bad Request - Outside radius
{
  "error": "You must be within 1km of the job location to apply. Please move closer to the job area and try again."
}
```

---

## 3.9 List Job Applications

**`GET /jobs/{id}/applications/`**

Lists all applications for a job (newest first).

**Authentication:** Required (Client who owns the job)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Job ID |

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
    },
    {
      "id": 2,
      "job_title": "Plumbing Repair Needed",
      "worker_name": "Mary Mwansa",
      "status": "PENDING",
      "status_display": "Pending",
      "applied_at": "2026-08-07T09:30:00Z"
    }
  ]
}
```

**Error Responses:**
```json
// 400 Bad Request
{
  "error": "You don't have permission to view applications for this job."
}
```

---

## 3.10 Get Pending Applications

**`GET /jobs/{id}/applications/pending/`**

Gets only pending applications for a job (newest first).

**Authentication:** Required (Client who owns the job)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Job ID |

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

## 3.11 Update Application Status

**`PATCH /applications/{id}/status/`**

Accepts or rejects an application.

**Authentication:** Required (Client who owns the job)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Application ID |

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
or
```json
{
  "message": "Application rejected successfully!",
  "application": {
    "id": 1,
    "status": "REJECTED",
    "status_display": "Rejected"
  }
}
```

**Error Responses:**
```json
// 400 Bad Request
{
  "error": "Status must be 'accept' or 'reject'"
}
```
```json
// 400 Bad Request
{
  "error": "Cannot accept application for a ASSIGNED job."
}
```

---

## 3.12 Assign Worker

**`POST /jobs/{id}/assign/`**

Assigns a worker to a job. **This grants the worker full access to location details.**

**Authentication:** Required (Client, Verified)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Job ID |

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
    "assigned_by": 1,
    "assigned_by_name": "Smart Mbuzi",
    "status": "ACTIVE",
    "status_display": "Active",
    "assigned_at": "2026-08-07T10:15:00Z",
    "completed_at": null,
    "cancelled_at": null
  },
  "job": {
    "id": 1,
    "status": "ASSIGNED",
    "status_display": "Assigned"
  },
  "withdrawn_applications": 2
}
```

**Error Responses:**
```json
// 400 Bad Request
{
  "error": "Worker is not available."
}
```
```json
// 400 Bad Request
{
  "error": "Worker is already assigned to another job."
}
```
```json
// 400 Bad Request
{
  "error": "Worker has not applied for this job."
}
```

---

## 3.13 Worker Mark Complete

**`POST /jobs/{id}/mark-complete/`**

Worker marks the job as complete (pending client confirmation).

**Authentication:** Required (Worker, Verified)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Job ID |

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

**Error Responses:**
```json
// 400 Bad Request
{
  "error": "Cannot mark a job with status 'ASSIGNED' as complete."
}
```
```json
// 400 Bad Request
{
  "error": "You are not assigned to this job."
}
```

---

## 3.14 Client Confirm Complete

**`POST /jobs/{id}/confirm/`**

Client confirms the job is complete.

**Authentication:** Required (Client who owns the job)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Job ID |

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

**Error Responses:**
```json
// 400 Bad Request
{
  "error": "Cannot confirm a job with status 'OPEN'."
}
```
```json
// 400 Bad Request
{
  "error": "You don't have permission to confirm this job."
}
```

---

## 3.15 My Jobs

**`GET /my-jobs/`**

Gets jobs posted by or assigned to the authenticated user.

**Authentication:** Required (Any authenticated user)

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
      "posted_at": "2026-08-07T10:00:00Z",
      "search_radius_km": 1.0,
      "is_urgent": true,
      "urgency_display": "Urgent (Within 3 days)",
      "job_display_date": "August 20, 2026"
    }
  ]
}
```

---

## 3.16 My Applications

**`GET /my-applications/`**

Gets all applications made by the authenticated worker.

**Authentication:** Required (Worker)

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

# Module 4: Matching (Location-Based)

The Matching module handles location-based filtering using a **fixed 1km radius**.

## 4.1 Find Nearby Jobs

**`GET /matching/nearby/`**

Finds jobs within 1km of the worker's location.

**Authentication:** Required (Worker, Verified)

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `radius` | float | 1.0 | Search radius in kilometers (min: 0.5, max: 10.0) |

**Request Headers:**
```http
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "count": 3,
  "radius_km": 1.0,
  "results": [
    {
      "job": {
        "id": 5,
        "title": "Plumbing Repair",
        "description": "Fix leaking pipe in kitchen",
        "budget": "500.00",
        "general_location": "Kamwala, Lusaka",
        "category_name": "Plumbing",
        "status": "OPEN",
        "urgency": "URGENT",
        "urgency_display": "Urgent (Within 3 days)",
        "job_date": "2026-08-20",
        "is_flexible": false,
        "duration_hours": "2.5",
        "posted_at": "2026-08-19T10:00:00Z"
      },
      "distance_km": 0.45,
      "distance_display": "450m"
    }
  ]
}
```

**Note:** Jobs outside the radius are **NOT shown** to the worker.

---

## 4.2 Count Nearby Jobs

**`GET /matching/nearby/count/`**

Gets the count of jobs within the worker's radius.

**Authentication:** Required (Worker, Verified)

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `radius` | float | 1.0 | Search radius in kilometers |

**Request Headers:**
```http
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "count": 3,
  "radius_km": 1.0
}
```

---

## 4.3 Get Nearby Applicants

**`GET /matching/jobs/{id}/applicants/nearby/`**

Gets applicants who are within 1km of the job location.

**Authentication:** Required (Client who owns the job)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Job ID |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `radius` | float | 1.0 | Search radius in kilometers |

**Request Headers:**
```http
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "count": 2,
  "radius_km": 1.0,
  "job_id": 5,
  "results": [
    {
      "application_id": 15,
      "application_status": "PENDING",
      "applied_at": "2026-08-21T10:00:00Z",
      "worker": {
        "id": 123,
        "full_name": "John Doe",
        "email": "john@example.com",
        "phone_number": "+260971234568",
        "bio": "Experienced plumber with 5 years experience",
        "average_rating": 4.5,
        "jobs_completed": 12,
        "skills": ["Plumbing", "Electrical"],
        "availability_status": "AVAILABLE"
      },
      "distance_km": 0.45,
      "distance_display": "450m"
    }
  ]
}
```

**Error Responses:**
```json
// 403 Forbidden - Not the job owner
{
  "error": "You don't have permission to view applicants for this job."
}
```

---

## 4.4 Get All Applicants

**`GET /matching/jobs/{id}/applicants/`**

Gets ALL applicants for a job (without distance filtering).

**Authentication:** Required (Client who owns the job)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Job ID |

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by application status: `PENDING`, `ACCEPTED`, `REJECTED`, `WITHDRAWN` |

**Request Headers:**
```http
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "count": 5,
  "job_id": 5,
  "filters": {
    "status": null
  },
  "results": [
    {
      "application_id": 15,
      "application_status": "PENDING",
      "applied_at": "2026-08-21T10:00:00Z",
      "distance_km": 0.45,
      "distance_display": "450m",
      "worker": {
        "id": 123,
        "full_name": "John Doe",
        "email": "john@example.com",
        "phone_number": "+260971234568",
        "bio": "Experienced plumber",
        "average_rating": 4.5,
        "jobs_completed": 12,
        "skills": ["Plumbing", "Electrical"],
        "availability_status": "AVAILABLE"
      }
    }
  ]
}
```

**Error Responses:**
```json
// 403 Forbidden - Not the job owner
{
  "error": "You don't have permission to view applicants for this job."
}
```

---

## 4.5 Geocoding: Reverse Geocode

**`GET /matching/geocode/reverse/`**

Converts GPS coordinates to a human-readable address.

**Authentication:** Required (Any authenticated user)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lat` | float | Yes | Latitude |
| `lng` | float | Yes | Longitude |

**Request Headers:**
```http
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "display_name": "Kamwala, Lusaka, Zambia",
  "full_address": "Kamwala, Lusaka, Zambia",
  "road": "Kamwala Road",
  "suburb": "Kamwala",
  "city": "Lusaka",
  "state": "Lusaka Province",
  "country": "Zambia",
  "postcode": "10101"
}
```

**Error Responses:**
```json
// 400 Bad Request
{
  "error": "lat and lng parameters are required"
}
```
```json
// 404 Not Found
{
  "error": "Could not find location for these coordinates"
}
```

---

## 4.6 Geocoding: Search Location

**`GET /matching/geocode/search/`**

Searches for a location by name.

**Authentication:** Required (Any authenticated user)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query (e.g., "Kamwala, Lusaka") |
| `limit` | integer | No | Max results (default: 5, max: 20) |

**Request Headers:**
```http
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "count": 3,
  "results": [
    {
      "display_name": "Kamwala, Lusaka, Zambia",
      "latitude": -15.3875,
      "longitude": 28.3412,
      "place_id": 123456,
      "class": "suburb",
      "type": "residential"
    }
  ]
}
```

**Error Responses:**
```json
// 400 Bad Request
{
  "error": "q parameter is required"
}
```

---

# Rate Limiting

| Endpoint | Rate Limit | Time Window |
|----------|------------|-------------|
| `/auth/register/` | 5 requests | 1 hour |
| `/auth/login/` | 10 requests | 1 minute |
| `/auth/refresh/` | 20 requests | 1 minute |
| `/auth/forgot-password/` | 3 requests | 1 hour |
| `/jobs/create/` | 10 requests | 1 minute |
| `/jobs/{id}/apply/` | 10 requests | 1 minute |
| `/matching/nearby/` | 30 requests | 1 minute |

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

## Conditional Disclosure Summary

| **Field** | **Before Assignment** | **After Assignment** |
|-----------|----------------------|---------------------|
| `general_location` | ✅ Visible | ✅ Visible |
| `latitude`/`longitude` | ✅ Visible | ✅ Visible |
| `exact_location` | Hidden | Visible |
| `map_url` | Hidden | Visible |
| `directions_url` | Hidden | Visible |
| `place_id` | Hidden | Visible |
| `client_name` | Hidden | Visible |
| `client_phone` | Hidden | Visible |
| `can_view_full_details` | `false` | `true` |

---
