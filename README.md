# KaJob

A two-sided job marketplace connecting clients with local workers in Zambia.

KaJob lets clients post jobs, workers apply and get assigned, both parties
complete the job lifecycle, and admins moderate reports and disputes — all
scoped by role so dual-role accounts get the right experience on each side.

Built as a final-year Software Engineering project at the University of Zambia.

---

## Tech Stack

**Backend**
- Django 6 + Django REST Framework
- PostgreSQL
- JWT authentication (SimpleJWT) with live role-switching
- Daphne ASGI + WebSocket channels for real-time notifications
- Custom middleware stack (JWT auth, audit log, CORS, performance, security headers)

**Frontend**
- React 18 + TypeScript + Vite
- Tailwind CSS
- React Router v6
- Axios-based API clients (separate admin + user clients)

**Infrastructure**
- Git + GitHub for version control
- Environment-driven config (`.env`)
- Gmail SMTP for transactional email

---

## Key Features

### Job Lifecycle
- 30+ REST endpoints covering post, apply, accept, complete, review, and cancel
- Atomic database transactions to prevent race conditions in the concurrent
  "accept application" flow (`select_for_update` + `transaction.atomic`)
- Guarded state machine: `OPEN → ASSIGNED → IN_PROGRESS → AWAITING_CONFIRMATION → COMPLETED`
- Worker withdraw is allowed only while `ASSIGNED`; after `IN_PROGRESS` the
  worker is committed and must raise a dispute instead

### Roles and Permissions
- Two-layer permission system: account-level capabilities + currently-selected role
- JWT carries the live `current_role` claim; endpoints read it to scope responses
- Dual-role users see different data per role — client jobs vs. worker jobs,
  role-tagged notifications, role-scoped reportable jobs
- Server-side participant checks enforced on every job-scoped action

### Matching and Discovery
- Distance-based job matching using haversine
- Client posts a job → all **available, verified** workers within **5 km**
  receive an in-app notification and email in real time
- Workers can filter the Find Jobs view by radius (0.5–50 km) via a query
  parameter; the backend clamps and echoes the value
- Unrelated workers see name-only details; assigned workers see full contact
  info, exact location, map, and directions

### Notifications
- Role-aware notification model (`CLIENT` / `WORKER` / `ADMIN` / `null`)
- Triple-channel delivery: in-app (bell + dropdown + full page), email (SMTP
  templates), and real-time WebSocket push
- Per-user preferences (email enabled, push enabled, per-type mute)
- Endpoints respect the current role from the JWT so each dashboard sees only
  its own stream

### Reports and Moderation
- Two report types: job-specific (job + reported user) and general platform
  complaints (no job)
- Full moderation workflow: list → detail → investigate → resolve with a
  category-restricted decision policy
- Reference numbers generated with soft-delete-safe aggregates
  (`_base_manager` + `MAX`)
- Admin dashboard on the frontend with stats, filters, and search

### Reliability
- Custom JWT middleware that attaches the user before DRF views run
- Audit middleware that logs every write request with sanitized bodies
- Reference-number uniqueness preserved across soft-deletes
- Atomic state transitions on accept, withdraw, start, complete, cancel, and
  dispute
- CORS handled at the middleware layer with preflight-safe responses
## Project Structure

```text
backend/
├── apps/
│   ├── accounts/          # user, worker profile, client profile, roles
│   ├── jobs/              # job, application, assignment, lifecycle
│   ├── matching/          # distance, geocoding, radius filtering
│   ├── notifications/     # in-app, email, WebSocket, preferences
│   ├── reports/           # user reports, admin investigation, moderation
│   ├── reviews/           # mutual reviews after job completion
│   └── admin_panel/       # admin URLs, dashboards, moderation
├── config/                # Django settings, URLs, ASGI
└── infrastructure/        # middleware (auth, audit, CORS, security)

frontend/
└── src/
    ├── api/               # API clients (user + admin)
    ├── components/        # shared UI
    ├── features/          # admin, jobs, reports, reviews
    ├── pages/             # dashboard pages by role
    ├── context/           # auth context
    └── types/             # shared TypeScript types
```




## Authors

**Smart Mbuzi** and **Christopher Banda**
4th-year Software Engineering, University of Zambia
