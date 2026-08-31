# KaJob API Documentation

## Overview

KaJob is a job marketplace platform that connects workers with clients for small tasks. This API provides endpoints for user management, identity verification, job operations, and reviews.

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

Creates a new user account with role-based registration. Supports the Role Player Pattern where one user can have multiple roles.

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
| `phone_number` | string | Yes | User's phone number (validated for Zambia format) |
| `password` | string | Yes | Min 8 characters |
| `role` | string | Yes | `WORKER` or `CLIENT` |

**Phone Number Validation:**
- Zambia format: `0971234567` → normalized to `+260971234567`
- International format: `+260971234567`
- Invalid format returns error message

**Success Response (201 Created):**
```json
{
  "message": "Registration successful! Please verify your phone to continue.",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Banda",
    "full_name": "John Banda",
    "email": "john@example.com",
    "phone_number": "+260971234567",
    "account_status": "ACTIVE",
    "is_verified": false,
    "roles": ["WORKER"],
    "available_roles": ["WORKER"],
    "is_admin": false,
    "is_worker": true,
    "is_client": false,
    "created_at": "2026-08-07T10:00:00Z"
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIs...",
    "refresh": "eyJhbGciOiJIUzI1NiIs..."
  },
  "next_step": "phone_verification"
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
```json
// 400 Bad Request - Invalid phone format
{
  "error": "Invalid phone number format. Please use a valid Zambia number (e.g., 0971234567) or international format (e.g., +260971234567)."
}
```

---

## 1.2 Login User

**`POST /auth/login/`**

Authenticates a user and returns JWT tokens with role context.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "WORKER"  // Optional: Specify which role to login as
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User's email |
| `password` | string | Yes | User's password |
| `role` | string | No | `WORKER` or `CLIENT` (if user has multiple roles) |

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
    "phone_number": "+260971234567",
    "account_status": "ACTIVE",
    "is_verified": true,
    "roles": ["WORKER", "CLIENT"],
    "available_roles": ["WORKER", "CLIENT"],
    "is_admin": false,
    "is_worker": true,
    "is_client": true,
    "last_login": "2026-08-07T10:05:00Z",
    "created_at": "2026-08-07T10:00:00Z",
    "updated_at": "2026-08-07T10:05:00Z"
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIs...",
    "refresh": "eyJhbGciOiJIUzI1NiIs..."
  },
  "selected_role": "WORKER",
  "available_roles": ["WORKER", "CLIENT"]
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
```json
// 400 Bad Request - Role not found
{
  "error": "User does not have the 'CLIENT' role. Available roles: WORKER"
}
```

---

## 1.3 Add Role to Existing User

**`POST /auth/add-role/`**

Adds a new role to an existing user. **NO RE-REGISTRATION NEEDED!**

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "role": "CLIENT"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `role` | string | Yes | `WORKER`, `CLIENT`, or `ADMIN` |

**Success Response (200 OK):**
```json
{
  "message": "CLIENT role added successfully!",
  "user": {
    "id": 1,
    "full_name": "John Banda",
    "roles": ["WORKER", "CLIENT"],
    "available_roles": ["WORKER", "CLIENT"],
    "is_verified": true
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIs...",
    "refresh": "eyJhbGciOiJIUzI1NiIs..."
  },
  "is_verified": true,
  "available_roles": ["WORKER", "CLIENT"]
}
```

**Error Responses:**
```json
// 400 Bad Request - Role not found
{
  "error": "Role 'CLIENT' does not exist."
}
```
```json
// 400 Bad Request - Already has role
{
  "error": "User already has the 'CLIENT' role."
}
```

---

## 1.4 Switch Role

**`POST /auth/switch-role/`**

Switches between roles for users with multiple roles.

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "role": "WORKER"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `role` | string | Yes | Role to switch to (must be one of user's available roles) |

**Success Response (200 OK):**
```json
{
  "message": "Switched to WORKER role.",
  "user": {
    "id": 1,
    "full_name": "John Banda",
    "available_roles": ["WORKER", "CLIENT"]
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIs...",
    "refresh": "eyJhbGciOiJIUzI1NiIs..."
  },
  "current_role": "WORKER",
  "available_roles": ["WORKER", "CLIENT"]
}
```

**Error Responses:**
```json
// 400 Bad Request - Role not available
{
  "error": "User does not have the 'ADMIN' role. Available roles: WORKER, CLIENT"
}
```

---

## 1.5 Get User Roles

**`GET /auth/roles/`**

Gets all roles for the authenticated user.

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "roles": ["WORKER", "CLIENT"],
  "current_role": "WORKER"
}
```

---

## 1.6 Refresh Token

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

---

## 1.7 Logout

**`POST /auth/logout/`**

Blacklists the refresh token.

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <access_token>
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

---

## 1.8 Get Current User

**`GET /auth/me/`**

Returns the authenticated user's profile with roles.

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
    "phone_number": "+260971234567",
    "account_status": "ACTIVE",
    "is_verified": true,
    "roles": ["WORKER", "CLIENT"],
    "available_roles": ["WORKER", "CLIENT"],
    "is_admin": false,
    "is_worker": true,
    "is_client": true,
    "created_at": "2026-08-07T10:00:00Z"
  }
}
```

---

## 1.9 Change Password

**`POST /auth/change-password/`**

Changes the authenticated user's password.

**Authentication:** Required

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

---

## 1.10 Forgot Password

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

## 1.11 Reset Password

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

**Success Response (200 OK):**
```json
{
  "message": "Password reset successfully"
}
```

---

## 1.12 Verify Email

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

## 1.13 Resend Verification Email

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

## 1.14 Update Profile

**`PUT /auth/profile/update/`**

Updates the user's profile information.

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "bio": "Experienced plumber with 5 years experience",
  "address": "15 Kamwala Road, Lusaka",
  "province": "Lusaka",
  "district": "Lusaka"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `bio` | string | No | User biography |
| `address` | string | No | Physical address |
| `province` | string | No | Province |
| `district` | string | No | District |
| `latitude` | decimal | No | Current latitude |
| `longitude` | decimal | No | Current longitude |

**Success Response (200 OK):**
```json
{
  "message": "Profile updated successfully!",
  "profile": {
    "id": 1,
    "bio": "Experienced plumber with 5 years experience",
    "address": "15 Kamwala Road, Lusaka",
    "province": "Lusaka",
    "district": "Lusaka",
    "latitude": "-15.3875",
    "longitude": "28.3412"
  }
}
```

---

## 1.15 Update Phone Number

**`PUT /auth/profile/phone/`**

Updates the user's phone number. Resets verification status.

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "phone_number": "0977654321"
}
```

**Success Response (200 OK):**
```json
{
  "status": "updated",
  "message": "Phone number updated successfully. Please verify your new phone number.",
  "phone_number": "+260977654321",
  "verification_reset": true,
  "next_step": "phone_verification"
}
```

**Error Responses:**
```json
// 400 Bad Request - Invalid format
{
  "error": "Invalid phone number format. Please use a valid Zambia number (e.g., 0971234567) or international format (e.g., +260971234567)."
}
```
```json
// 400 Bad Request - Already registered
{
  "error": "This phone number is already registered to another account."
}
```

---

## 1.16 Update Location

**`PUT /auth/profile/location/`**

Updates the user's current location.

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "latitude": -15.3875,
  "longitude": 28.3412
}
```

**Success Response (200 OK):**
```json
{
  "message": "Location updated successfully!",
  "profile": {
    "id": 1,
    "latitude": "-15.3875",
    "longitude": "28.3412"
  }
}
```

---

# Module 2: Identity Verification

## 2.1 Send Phone OTP

**`POST /verification/phone/send-otp/`**

Sends a 6-digit OTP to the user's phone number via email (SMS fallback).

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <access_token>
```

**Request Body:** (empty)
```json
{}
```

**Success Response (200 OK):**
```json
{
  "status": "otp_sent",
  "message": "OTP sent to +260971234567 via email (SMS fallback).",
  "phone_number": "+260971234567",
  "via": "email",
  "expires_in": 10
}
```

**Error Responses:**
```json
// 400 Bad Request - Invalid phone
{
  "status": "invalid_phone",
  "message": "Invalid phone number format. Please use a valid Zambia number (e.g., 0971234567) or international format (e.g., +260971234567).",
  "phone_number": "0971234567",
  "suggestion": "Please update your phone number to a valid format."
}
```
```json
// 200 OK - Already verified
{
  "status": "already_verified",
  "message": "Phone number is already verified.",
  "phone_number": "+260971234567"
}
```

---

## 2.2 Verify Phone OTP

**`POST /verification/phone/verify-otp/`**

Verifies the phone number using OTP.

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "otp": "123456"
}
```

**Success Response (200 OK):**
```json
{
  "status": "verified",
  "message": "Phone number verified successfully!",
  "next_step": "email_verification"
}
```

**Error Responses:**
```json
// 400 Bad Request - Invalid OTP
{
  "status": "invalid",
  "message": "Invalid OTP. Please try again.",
  "attempts_remaining": 4
}
```
```json
// 400 Bad Request - Max attempts
{
  "status": "max_attempts",
  "message": "Maximum attempts exceeded. Please request a new OTP."
}
```
```json
// 400 Bad Request - Expired
{
  "status": "expired",
  "message": "OTP has expired. Please request a new one."
}
```

---

## 2.3 Send Email Verification

**`POST /verification/email/send/`**

Sends email verification link to the user.

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "status": "email_sent",
  "message": "Verification email sent to your email address.",
  "email": "john@example.com"
}
```

**Error Responses:**
```json
// 400 Bad Request - Phone not verified
{
  "status": "phone_not_verified",
  "message": "Please verify your phone number first.",
  "required_phase": "phone_verification"
}
```

---

## 2.4 Verify Email

**`GET /verification/email/verify/`**

Verifies the email using a token.

**Authentication:** Not required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | string | Yes | Verification token from email |

**Success Response (200 OK):**
```json
{
  "status": "verified",
  "message": "Email verified successfully!",
  "next_step": "document_upload"
}
```

**Error Responses:**
```json
// 400 Bad Request - Invalid token
{
  "status": "invalid_token",
  "message": "Invalid or expired verification token."
}
```
```json
// 400 Bad Request - Expired
{
  "status": "expired",
  "message": "Verification link has expired. Please request a new one."
}
```

---

## 2.5 Submit Documents

**`POST /verification/documents/submit/`**

Submits identity verification documents for admin review.

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "document_type": "NRC",
  "document_number": "123456/78/1",
  "documents": [
    {
      "document_type": "SELFIE",
      "file_path": "/media/verification/selfie.jpg",
      "file_name": "selfie.jpg",
      "file_size": 543210,
      "mime_type": "image/jpeg"
    },
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
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `document_type` | string | Yes | `NRC`, `PASSPORT`, `DRIVERS_LICENSE` |
| `document_number` | string | Yes | Document identification number |
| `documents` | array | Yes | List of document uploads |

**Document Number Validation:**
| Document Type | Format | Example |
|---------------|--------|---------|
| `NRC` | `\d{6}/\d{2}/\d{1}` | `123456/78/1` |

**Success Response (200 OK):**
```json
{
  "status": "documents_submitted",
  "message": "Documents submitted successfully. Awaiting admin review.",
  "verification_id": 1
}
```

**Error Responses:**
```json
// 400 Bad Request - Duplicate document
{
  "error": "This document number is already registered. Please use a different one or contact support."
}
```
```json
// 400 Bad Request - Email not verified
{
  "error": "Please verify your email before submitting documents."
}
```
```json
// 400 Bad Request - Already pending
{
  "error": "You already have a pending verification request. Please wait for admin review."
}
```

---

## 2.6 Get Verification Status

**`GET /verification/status/`**

Gets the current verification status.

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "has_submitted": true,
  "verification_id": 1,
  "verification_status": "DOCUMENTS_PENDING",
  "status_display": "Documents Pending Review",
  "phone_verified": true,
  "email_verified": true,
  "fully_verified": false,
  "phone_number": "+260971234567",
  "email": "john@example.com",
  "document_type": "NRC",
  "document_number": "123456/78/1",
  "submitted_at": "2026-08-07T10:00:00Z",
  "reviewed_at": null,
  "rejection_reason": null,
  "message": "Documents submitted. Waiting for admin review.",
  "next_step": "admin_review"
}
```

**Verification Statuses:**
| Status | Description |
|--------|-------------|
| `NOT_STARTED` | Verification not started |
| `PHONE_PENDING` | Phone OTP sent, waiting for verification |
| `PHONE_VERIFIED` | Phone verified |
| `EMAIL_PENDING` | Email verification sent |
| `EMAIL_VERIFIED` | Email verified |
| `DOCUMENTS_PENDING` | Documents submitted, awaiting admin review |
| `DOCUMENTS_REJECTED` | Documents rejected |
| `VERIFIED` | Fully verified ✅ |

---

# Module 3: Jobs

## 3.1 Create Job

**`POST /jobs/create/`**

Creates a new job posting. Auto-generates map URLs from GPS coordinates.

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
| `general_location` | string | No | Area/neighborhood |
| `latitude` | decimal | No | Auto-detected from GPS |
| `longitude` | decimal | No | Auto-detected from GPS |
| **Timing Fields** | | | |
| `job_date` | date | No | Date job needs to be done |
| `job_time` | time | No | Time job should start |
| `timeframe` | string | No | `MORNING`, `AFTERNOON`, `EVENING`, `ANYTIME` |
| `is_flexible` | boolean | No | Can worker choose time? Default: true |
| `duration_hours` | decimal | No | Estimated duration in hours |
| `urgency` | string | No | `IMMEDIATE`, `URGENT`, `NORMAL`, `FLEXIBLE` |
| **Skills** | | | |
| `required_skills` | array | No | List of skill IDs |

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
    "latitude": "-15.38750000",
    "longitude": "28.34120000",
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
    "latitude": "-15.38750000",
    "longitude": "28.34120000",
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
| `general_location` ✅ | `general_location` ✅ |
| `latitude`/`longitude` ✅ | `latitude`/`longitude` ✅ |
| `exact_location` ❌ | `exact_location` ✅ |
| `map_url` ❌ | `map_url` ✅ |
| `directions_url` ❌ | `directions_url` ✅ |
| `client_name` ❌ | `client_name` ✅ |
| `client_phone` ❌ | `client_phone` ✅ |
| `can_view_full_details: false` | `can_view_full_details: true` |

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
    "latitude": "-15.38750000",
    "longitude": "28.34120000",
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
    "assignment_status": null,
    "assigned_at": null,
    "can_view_full_details": false
  },
  "can_view_full_details": false,
  "assignment_status": null
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
    "latitude": "-15.38750000",
    "longitude": "28.34120000",
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
    "assignment_status": "ACTIVE",
    "assigned_at": "2026-08-07T10:15:00Z",
    "can_view_full_details": true
  },
  "can_view_full_details": true,
  "assignment_status": "ACTIVE"
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

## 3.5 Apply for Job

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
// 400 Bad Request - Outside radius
{
  "error": "You must be within 1km of the job location to apply. Please move closer to the job area and try again."
}
```
```json
// 400 Bad Request - Already applied
{
  "error": "You have already applied for this job."
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

---

## 3.6 Assign Worker

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

# Module 4: Matching (Location-Based)

The Matching module handles location-based filtering with configurable radius.

## 4.1 Find Nearby Jobs (WebSocket)

**`ws://localhost:8000/ws/notifications/?token=<access_token>`**

Real-time location-based job matching via WebSocket.

**Connection:**
```javascript
const token = 'YOUR_ACCESS_TOKEN';
const ws = new WebSocket(`ws://localhost:8000/ws/notifications/?token=${token}`);
```

**Send Location (Every 10 seconds):**
```javascript
ws.send(JSON.stringify({
    type: 'location_update',
    latitude: -15.3875,
    longitude: 28.3412,
    accuracy: 10
}));
```

**Receive Nearby Jobs (Auto-pushed):**
```json
{
  "type": "nearby_jobs_updated",
  "jobs": [
    {
      "id": 5,
      "title": "Plumbing Repair",
      "description": "Fix leaking pipe in kitchen",
      "budget": "500.00",
      "general_location": "Kamwala, Lusaka",
      "category": "Plumbing",
      "urgency": "URGENT",
      "distance_km": 0.45,
      "distance_display": "450m",
      "posted_at": "2026-08-19T10:00:00Z",
      "is_urgent": true
    }
  ],
  "count": 3,
  "radius_km": 1.0,
  "message": "📍 Found 3 jobs near you!",
  "timestamp": "2026-08-29T10:00:00Z"
}
```

**Set Search Radius:**
```javascript
ws.send(JSON.stringify({
    type: 'set_search_radius',
    radius: 5.0  // 5km
}));
```

**Manual Refresh:**
```javascript
ws.send(JSON.stringify({
    type: 'refresh_nearby_jobs',
    radius: 1.0
}));
```

---

## 4.2 Get Nearby Workers (WebSocket)

**For Clients - Find nearby workers in real-time.**

```javascript
ws.send(JSON.stringify({
    type: 'get_nearby_workers',
    radius: 5.0
}));
```

**Response:**
```json
{
  "type": "nearby_workers",
  "data": [
    {
      "id": 123,
      "name": "John Doe",
      "latitude": -15.3850,
      "longitude": 28.3390,
      "distance_km": 0.45,
      "distance_display": "450m",
      "hourly_rate": "75.00",
      "rating": 4.5,
      "verified": true
    }
  ],
  "count": 1
}
```

---

## 4.3 Worker Location Broadcast (WebSocket)

**When a worker's location changes, nearby clients receive updates:**

```json
{
  "type": "nearby_worker_update",
  "worker_id": 123,
  "worker_name": "John Doe",
  "latitude": -15.3850,
  "longitude": 28.3390,
  "distance_km": 0.45,
  "distance_display": "450m",
  "timestamp": "2026-08-29T10:00:00Z"
}
```

---

# Module 5: Reviews

## 5.1 Create Review

**`POST /reviews/create/`**

Creates a review for a worker. Only clients can review workers.

**Authentication:** Required (Client)

**Request Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "job_id": 5,
  "reviewee_id": 123,
  "rating": 5,
  "comment": "Excellent work! Fixed everything quickly and professionally.",
  "job_completed": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `job_id` | integer | Yes | ID of the completed job |
| `reviewee_id` | integer | Yes | ID of the worker being reviewed |
| `rating` | integer | Yes | Rating 0-5 |
| `comment` | string | No | Review comment |
| `job_completed` | boolean | Yes | Did the worker actually complete the job? |

**Rating Guide:**
| Rating | Description |
|--------|-------------|
| `0` | Did Not Complete |
| `1` | Poor |
| `2` | Fair |
| `3` | Good |
| `4` | Very Good |
| `5` | Excellent |

**Success Response (201 Created):**
```json
{
  "message": "Review submitted successfully!",
  "review": {
    "id": 1,
    "job": 5,
    "job_title": "Plumbing Repair",
    "reviewer": 1,
    "reviewer_name": "John Client",
    "reviewee": 123,
    "reviewee_name": "Jane Worker",
    "rating": 5,
    "rating_display": "5 - Excellent",
    "comment": "Excellent work! Fixed everything quickly and professionally.",
    "job_completed": true,
    "created_at": "2026-08-22T10:30:00Z"
  }
}
```

---

## 5.2 Get Worker Reviews

**`GET /reviews/worker/{worker_id}/`**

Gets all reviews for a specific worker.

**Authentication:** Required (Any authenticated user)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `worker_id` | integer | Worker's user ID |

**Success Response (200 OK):**
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "job_title": "Plumbing Repair",
      "rating": 5,
      "rating_display": "5 - Excellent",
      "comment": "Excellent work!",
      "job_completed": true,
      "reviewer_name": "John Client",
      "created_at": "2026-08-22T10:30:00Z"
    }
  ]
}
```

---

## 5.3 Get Worker Rating Stats

**`GET /reviews/stats/{worker_id}/`**

Gets rating statistics for a worker.

**Authentication:** Required (Any authenticated user)

**Success Response (200 OK):**
```json
{
  "average_rating": 4.5,
  "total_reviews": 15,
  "completed_jobs": 14,
  "incomplete_jobs": 1,
  "completion_rate": 93.3,
  "rating_distribution": {
    "0": 0,
    "1": 0,
    "2": 1,
    "3": 2,
    "4": 5,
    "5": 7
  }
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
| `/reviews/create/` | 10 requests | 1 minute |

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

# WebSocket Events Summary

| Event | Sender | Purpose |
|-------|--------|---------|
| `location_update` | Both | Send current location |
| `nearby_jobs_updated` | Backend | Push updated job list to worker |
| `nearby_jobs_initial` | Backend | Initial job list on connect |
| `set_search_radius` | Worker | Change search radius |
| `refresh_nearby_jobs` | Worker | Manual refresh |
| `get_nearby_workers` | Client | Get nearby workers |
| `nearby_worker_update` | Backend | Worker location update to client |
| `new_job_notification` | Backend | New job broadcast to workers |
| `notification_read` | Both | Mark notification as read |
| `mark_all_read` | Both | Mark all notifications as read |
| `ping` / `pong` | Both | Keep connection alive |

---

# Conditional Disclosure Summary

| Field | Before Assignment | After Assignment |
|-------|-------------------|------------------|
| `general_location` | ✅ Visible | ✅ Visible |
| `latitude`/`longitude` | ✅ Visible | ✅ Visible |
| `exact_location` | ❌ Hidden | ✅ Visible |
| `map_url` | ❌ Hidden | ✅ Visible |
| `directions_url` | ❌ Hidden | ✅ Visible |
| `place_id` | ❌ Hidden | ✅ Visible |
| `client_name` | ❌ Hidden | ✅ Visible |
| `client_phone` | ❌ Hidden | ✅ Visible |
| `can_view_full_details` | `false` | `true` |

---

# Review System Summary

| Feature | Implementation |
|---------|----------------|
| Who can review? | Only clients |
| Who gets reviewed? | Only workers |
| Job-specific | Reviews tied to specific jobs |
| Rating scale | 0-5 (0 = Did Not Complete) |
| Self-review | Blocked by validation |
| One review per job | Unique constraint on (job, reviewer) |
| Completion tracking | `job_completed` flag |
| Rating stats | Average, distribution, completion rate |

---

# Smart Location Saving (WebSocket)

| Threshold | Value |
|-----------|-------|
| MIN_DISTANCE_CHANGE_METERS | 50 meters |
| MIN_TIME_CHANGE_SECONDS | 30 seconds |

Location is only saved when:
1. User moves more than 50 meters, OR
2. More than 30 seconds have passed since last save

This reduces database writes by ~50-70%.
