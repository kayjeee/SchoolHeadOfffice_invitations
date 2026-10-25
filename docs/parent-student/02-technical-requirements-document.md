# 02 — Technical Requirements Document (TRD)

## 1. Technology Stack Inventory

The SchoolHeadOffice (SHO) frontend application is built on a modern Next.js architecture designed for high responsiveness, real-time WebSocket communication, and robust server-side rendering.

### 1.1 Core Frontend Technologies

| Layer | Technology | Version | Purpose & Usage Evidence |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js | `^15.0.7` | Hybrid App Router (`app/`) and Pages Router (`pages/`) providing server-side rendering (SSR) via `getServerSideProps` for portal routes. |
| **UI Library** | React | `^18.2.0` | Declarative component UI rendering and state hooks (`useState`, `useEffect`, `useCallback`, `useMemo`). |
| **Language** | TypeScript | `5.9.3` | Type-safe interfaces, API schemas, and strict compile-time checking (`tsconfig.json`). |
| **Styling System** | Tailwind CSS | `^3.4.17` | Utility-first CSS styling with PostCSS (`postcss.config.js`) and Tailwind Merge (`tailwind-merge`). |
| **Component Primitives** | Radix UI / Headless UI | `^1.1.x` / `^2.2.0` | Accessible, unstyled UI primitives for dialogs, tabs, dropdowns, switches, and toasts. |
| **Icons & Animations** | Lucide React / Framer Motion | `^0.526.0` / `^11.18.2` | Clean vector iconography and layout transition animations. |

### 1.2 Data Fetching, State & Real-Time Engines

| Engine | Technology / Library | Version | Implementation Usage |
| :--- | :--- | :--- | :--- |
| **Server State Management** | SWR & TanStack React Query | `^2.3.6` / `^5.90.5` | SWR used in messaging and school data hooks (`useSWR`); React Query used in parent onboarding workflows (`useQuery`, `useMutation`). |
| **Real-Time WebSockets** | `@rails/actioncable` | `^8.1.300` | Persistent ActionCable WebSocket connection engine (`lib/cable.ts`) subscribing to Rails `ConversationChannel`. |
| **Form Validation** | Zod & React Hook Form | `^4.3.6` / `^7.63.0` | Runtime payload schema validation and form input state binding (`lib/api/api-client.ts`, `lib/api/invitation-api.ts`). |
| **Authentication SDK** | `@auth0/nextjs-auth0` | `^2.2.0` | Auth0 OIDC authentication integration (`getSession`, `useUser`, `withPageAuthRequired`, `/api/auth/[...auth0]`). |
| **Payment Gateway** | PayFast Direct API | Custom REST | South African payment gateway integration (`pages/api/create-payment.ts`, `pages/api/payfast/notify.ts`). |

---

## 2. Frontend Architecture & Routing Mechanics

The application employs a dual routing strategy using Next.js Pages Router for parent/student portal routes and App Router for admin/teacher management modules.

```
pages/
├── parent/
│   ├── index.tsx                         <-- Parent Auth Gate & Onboarding Gateway
│   └── [school_slug]/
│       ├── join.tsx                      <-- Magic Link Redirect Gateway
│       └── dashboard/
│           └── [email]/
│               ├── index.tsx              <-- Parent Overview Dashboard
│               ├── academics.tsx          <-- Student Academics & Report Cards
│               ├── attendance.tsx         <-- Student Attendance Registers
│               ├── communications.tsx     <-- Real-time Parent-Teacher Chat
│               ├── premium.tsx            <-- Plan Upgrade & Fee Checkout
│               └── ... (assignments, behavior, events, reports, resources)
└── student/
    ├── index.tsx                         <-- Student Auth Gate & Onboarding Entry
    └── [school_slug]/
        └── dashboard/
            └── [email]/
                └── index.tsx              <-- Student Personal Workspace
```

### Server-Side Data Resolution Helper (`resolveParentDashboardProps` & `resolveStudentDashboardProps`)
Parent and student dashboard routes delegate server-side pre-fetching to central GSSP services (`lib/services/resolveParentDashboardProps.ts` and `lib/services/resolveStudentDashboardProps.ts`).

1. **URL Parameter Decoding:** Extracts and decodes dynamic parameters `school_slug` and `email` from `context.params`.
2. **Session Verification:** Invokes `getSession(req, res)` from `@auth0/nextjs-auth0`. If session is missing, returns `isAuthenticated: false` to trigger `AuthGate`.
3. **Role Synchronization:** Executes `ParentService.syncParentRole` or `StudentService.syncStudentRole` to ensure the user record exists in MongoDB and contains the required role tag without removing existing roles.
4. **Data Preloading:** Executes concurrent backend queries to retrieve profile details and linked learner rosters (`ParentService.getProfile`, `ParentService.getLearners`).

---

## 3. Authentication & Authorization Lifecycle

```
 +------------------+           +------------------+           +----------------------+
 | User Browser     |           | Next.js Frontend |           | Rails / MongoDB API  |
 +------------------+           +------------------+           +----------------------+
          |                              |                                |
          | 1. Open Portal Route         |                                |
          |----------------------------->|                                |
          |                              | 2. Exec GSSP getSession()      |
          |                              |------------------+             |
          |                              |                  |             |
          |                              |<-----------------+             |
          |                              |                                |
          |                              | 3. POST /api/v1/users (Sync)   |
          |                              |------------------------------->|
          |                              |                                |
          |                              | 4. GET /api/v1/users/show      |
          |                              |------------------------------->|
          |                              |                                |
          | 5. Render Dashboard Shell    |<-------------------------------|
          |<-----------------------------|                                |
```

### Multi-Role Array Coexistence
SchoolHeadOffice user accounts support multi-role arrays (e.g., `roles: ['parent', 'teacher', 'student']`).
- When a user accesses `/parent`, `ParentService.syncParentRole` fetches the user's existing roles array and appends `'parent'` if not already present.
- When accessing `/student`, `StudentService.syncStudentRole` appends `'student'` to the existing array.
- Role synchronization NEVER overwrites or clears existing roles in the database.

---

## 4. API & Data Contracts Reference

All frontend API calls utilize the custom `apiClient` (`lib/api/api-client.ts`), which automatically prepends `NEXT_PUBLIC_API_BASE_URL` (defaulting to `http://localhost:4000/api/v1` or Railway production API) and handles Zod schema parsing.

### 4.1 User & Identity Endpoints

| Method | Endpoint | Payload / Params | Purpose | Calling Service / Component |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/users` | `{ auth0_id, email, name, roles }` | Create user record on initial Auth0 sign-up | `ParentService.syncParentRole`, `userSyncService.ts` |
| `GET` | `/users/show` | `?auth0_id=...` | Fetch user profile, school info, and onboarding status | `ParentService.getProfile`, `StudentService.getProfile` |
| `PATCH` | `/users/:id/update_profile` | `{ title, first_name, surname, phone, email }` | Update user personal details | `ProfileSetup.tsx`, `StudentOnboardingFlow.tsx` |
| `PATCH` | `/users/:id/update_roles` | `{ roles: ['parent', 'student'] }` | Append new role to existing user role array | `ParentService.syncParentRole`, `StudentService.syncStudentRole` |
| `POST` | `/users/:id/add_role` | `{ role: 'student' }` | Fallback single-role assignment | `StudentService.syncStudentRole` |
| `GET` | `/users/onboarding_status` | `?auth0_id=...` | Fetch step progress and onboarding completion flags | `useParentOnboarding.ts`, `useStudentOnboarding.ts` |
| `POST` | `/users/:id/onboarding_status/complete_step` | `{ step_name, metadata }` | Mark onboarding step completed | `useParentOnboarding.ts`, `useStudentOnboarding.ts` |

### 4.2 Invitations & Learner Reconciliation Endpoints

| Method | Endpoint | Payload / Params | Purpose | Calling Service / Component |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/invitations/:token/verify_with_details` | Path token | Unauthenticated token check returning school and grade details | `InvitationAPI.verifyToken`, `getServerSideProps` |
| `POST` | `/invitations/match_by_phone` | `{ phone_number, auth0_id, school_id }` | Reconcile parent phone number with student invitations | `InvitationAPI.matchByPhone`, `LinkLearners.tsx` |
| `GET` | `/parents/my_learners` | `?auth0_id=...` | Fetch array of linked student records for parent | `ParentService.getLearners`, `ParentAPI.getMyLearners` |

### 4.3 Academic & Attendance Endpoints

| Method | Endpoint | Payload / Params | Purpose | Calling Service / Component |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/attendance/summary` | `?school_id=...&learner_id=...` | Retrieve attendance KPI summary statistics | `AttendanceTab.tsx`, `SchoolAPI.getAttendanceSummary` |
| `GET` | `/attendance/register` | `?school_id=...&grade_id=...&date=...` | Retrieve detailed daily attendance register entries | `AttendanceTab.tsx`, `SchoolAPI.getAttendanceRegister` |
| `GET` | `/results/report_card` | `?learner_id=...&term_id=...` | Generate on-screen digital report card summary | `AcademicsTab.tsx`, `SchoolAPI.getReportCard` |
| `GET` | `/assessments` | `?school_id=...&grade_id=...` | Fetch list of term assessment evaluations | `AcademicsTab.tsx`, `SchoolAPI.getAssessments` |

### 4.4 Real-Time Communications Endpoints

| Method | Endpoint | Payload / Params | Purpose | Calling Service / Component |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/conversations` | `?school_id=...&user_id=...` | List available chat threads for user | `MessagingSection.tsx`, `useMessaging.ts` |
| `POST` | `/conversations` | `{ conversation: { school_id, title, scope_type, scope_id } }` | Create new messaging channel | `GroupInitiation.tsx`, `MessagingAPI.createConversation` |
| `GET` | `/conversations/:id/messages` | Path ID | Fetch historical message log in channel | `ChatWindow.tsx`, `MessagingAPI.getMessages` |
| `POST` | `/conversations/:id/messages` | `{ message: { content, user_id, school_id, attachments } }` | Dispatch new message | `MessageInput.tsx`, `MessagingAPI.sendMessage` |

---

## 5. Data Models & Entity Relationships

```
 +-----------------------------------+          +-----------------------------------+
 |               User                |          |              Learner              |
 +-----------------------------------+          +-----------------------------------+
 | _id: ObjectId                     |          | _id: ObjectId                     |
 | email: String (unique)            |          | school_id: String                 |
 | auth0_id: String (unique)         |          | grade_id: String                  |
 | roles: Array[String]              |          | school_class_id: String           |
 | phone / phone_number: String      |<-------->| parent_ids: Array[String]         |
 | onboarding_completed: Boolean     |          | parent_phone: String              |
 | primary_school_name: String       |          | accession_number: String          |
 +-----------------------------------+          +-----------------------------------+
                  |                                               |
                  | 1:N                                           | 1:N
                  v                                               v
 +-----------------------------------+          +-----------------------------------+
 |           Conversation            |          |         AttendanceRecord          |
 +-----------------------------------+          +-----------------------------------+
 | _id: ObjectId                     |          | _id: ObjectId                     |
 | school_id: String                 |          | learner_id: String                |
 | scope_type: String                |          | date: Date                        |
 | scope_id: String                  |          | status: 'present'|'absent'|'late' |
 | participant_ids: Array[String]    |          +-----------------------------------+
 +-----------------------------------+
                  |
                  | 1:N
                  v
 +-----------------------------------+
 |              Message              |
 +-----------------------------------+
 | _id: ObjectId                     |
 | conversation_id: String           |
 | user_id: String                   |
 | content: String                   |
 | sent_as_role: String              |
 +-----------------------------------+
```

---

## 6. Environment Variables & Configuration

The application relies on environment variables configured in `.env.local` or deployment server environments.

| Environment Variable | Description & Purpose | Scope / Visibility |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL for Rails API backend (e.g. `http://localhost:4000/api/v1` or Railway backend URL). | Public (Browser & Server) |
| `NEXT_PUBLIC_AUTH0_DOMAIN` | Auth0 tenant domain identifier (e.g. `dev-q3l2f3kyx1zmv3iq.us.auth0.com`). | Public (Browser & Server) |
| `AUTH0_CLIENT_ID` | Auth0 Application Client ID for authentication flow. | Server & Browser |
| `AUTH0_CLIENT_SECRET` | Auth0 Client Secret for management token acquisition in `ParentService`. | Server Only |
| `AUTH0_SECRET` | 32-byte secret key used by `@auth0/nextjs-auth0` to encrypt session cookies. | Server Only |
| `NEXT_PUBLIC_ACTIONCABLE_URL` | WebSocket URL for ActionCable connection (e.g. `ws://localhost:4000/cable`). | Public (Browser Only) |
| `NEXT_PUBLIC_PAYFAST_MERCHANT_ID` | PayFast merchant account ID for fee payment processing. | Public (Browser Only) |
| `NEXT_PUBLIC_PAYFAST_MERCHANT_KEY` | PayFast merchant key for checkout transaction signing. | Public (Browser Only) |
