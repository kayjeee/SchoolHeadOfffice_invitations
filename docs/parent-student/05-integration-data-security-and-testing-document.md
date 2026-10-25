# 05 — Integration, Data, Security, and Testing Document

## 1. Backend Integration Architecture

The SchoolHeadOffice (SHO) frontend application acts as a decoupled rendering client communicating with a Ruby on Rails API backend (`sho_backend_v2`) powered by MongoDB (via Mongoid ODM).

```
 +-----------------------------------+           +-----------------------------------+
 |     Next.js Frontend Client       |           |    Ruby on Rails API Backend      |
 +-----------------------------------+           +-----------------------------------+
 | - Pages Router Server Components  |           | - Api::V1::UsersController        |
 | - React Client Components         |  HTTP/    | - Api::V1::InvitationsController   |
 | - Custom SWR / React Query Hooks  |  JSON     | - Api::V1::AttendanceController   |
 | - Custom `apiClient` Axios Module |---------->| - Api::V1::ResultsController      |
 +-----------------------------------+           | - Api::V1::ConversationsController |
                  |                              +-----------------------------------+
                  |                                                |
                  | ActionCable                                    | Mongoid
                  | WebSockets                                     v
                  v                              +-----------------------------------+
 +-----------------------------------+           |         MongoDB Database          |
 |    ActionCable WebSocket Server   |           +-----------------------------------+
 |     (`ConversationChannel`)       |           | Collections: users, learners,     |
 +-----------------------------------+           | invitations, attendance_records,  |
                                                 | conversations, messages, etc.     |
                                                 +-----------------------------------+
```

### 1.1 Custom API Client Standardisation (`lib/api/api-client.ts`)
All backend REST requests pass through a centralized `apiClient` instance that enforces:
- **Base URL Prepending:** Automatically resolves `NEXT_PUBLIC_API_BASE_URL` (defaulting to `http://localhost:4000/api/v1` or Railway backend).
- **Zod Schema Runtime Validation:** Every response is validated against Zod schemas before returning data to component logic.
- **Error Normalization:** Converts HTTP error responses into structured `APIError` objects containing status codes and detailed validation messages.

---

## 2. Data Model & Entity Relationships

### 2.1 Core Mongoid Document Schemas

```
                       +-------------------------+
                       |          User           |
                       +-------------------------+
                       | _id: ObjectId           |
                       | email: String           |
                       | auth0_id: String        |
                       | roles: Array[String]    |
                       | phone: String           |
                       +-------------------------+
                                    |
            +-----------------------+-----------------------+
            | 1:N (parent_ids)                              | 1:N (user_id)
            v                                               v
+-------------------------+                     +-------------------------+
|         Learner         |                     |      Conversation       |
+-------------------------+                     +-------------------------+
| _id: ObjectId           |                     | _id: ObjectId           |
| school_id: String       |                     | school_id: String       |
| grade_id: String        |                     | scope_type: String      |
| accession_number: String|                     | participant_ids: Array  |
+-------------------------+                     +-------------------------+
    |               |                                       |
    | 1:N           | 1:N                                   | 1:N
    v               v                                       v
+--------+     +------------------+             +-------------------------+
| Result |     | AttendanceRecord |             |         Message         |
+--------+     +------------------+             +-------------------------+
```

1. **`User` Document:**
   - Identity record linked to Auth0 subject ID (`auth0_id`).
   - Fields: `name`, `first_name`, `surname`, `title`, `email`, `phone`, `roles` (`['parent', 'teacher', 'student']`), `onboarding_completed`, `primary_school_name`.
2. **`Learner` Document:**
   - Student record enrolled within a school.
   - Fields: `first_name`, `last_name`, `accession_number`, `school_id`, `grade_id`, `school_class_id`, `parent_ids` (Array of linked Parent `User` IDs), `parent_phone`.
3. **`Invitation` / `LearnerInvitation` Document:**
   - Tokenized invitation record for parent/student onboarding.
   - Fields: `invitation_token`, `status` (`'pending'`, `'accepted'`, `'expired'`), `school_id`, `grade_id`, `parent_phone`, `learner_number`.
4. **`Conversation` & `Message` Documents:**
   - Real-time messaging entities.
   - Conversation fields: `school_id`, `scope_type` (`'direct'`, `'class'`, `'grade'`, `'school'`), `participant_ids`.
   - Message fields: `conversation_id`, `user_id`, `content`, `sent_as_role`, `attachments`.

---

## 3. Security, Multi-Tenancy & Role Isolation

### 3.1 Role Array Preservation Principle
A critical architectural constraint in SchoolHeadOffice is that **users can hold multiple roles simultaneously**.
- When synchronizing user roles during parent login (`ParentService.syncParentRole`), the system fetches the existing `roles` array and appends `'parent'` if not already present.
- When synchronizing student access (`StudentService.syncStudentRole`), the system appends `'student'` to the existing array.
- **Rule:** The frontend and backend MUST NEVER overwrite or clobber existing role entries.

### 3.2 School Multi-Tenancy Isolation
Data isolation across school tenants is enforced at both API and UI levels:
- Every academic request requires `school_id` or `school_slug` parameters.
- SWR data keys include `schoolId` and `auth0Id` to prevent caching data across different school contexts or users.

---

## 4. Error Handling & Recovery Strategies

| Error Scenario | Detection Mechanism | Recovery Action / User Experience |
| :--- | :--- | :--- |
| **Unauthenticated Route Access** | `getServerSideProps` checks `getSession()`. | Renders `AuthGate` component with return path parameter (`returnTo=...`), prompting Auth0 sign-in. |
| **Expired Invitation Token** | `InvitationAPI.verifyToken` returns 404/410 status. | Displays inline error banner on `AuthGate` letting user know token expired while offering fallback login. |
| **Incomplete Onboarding** | `onboarding_status.parent_onboarding_completed === false`. | Redirects or holds user within onboarding wizard (`OnboardingFlow.tsx` / `StudentOnboardingFlow.tsx`). |
| **API Network Failure** | `apiClient` catches network exception. | SWR / React Query triggers exponential backoff retry; UI falls back to graceful error state. |
| **Component Rendering Error** | React Lifecycle Error. | Caught by top-level `ErrorBoundary` wrapper, displaying user-friendly error UI with "Try Again" reload button. |

---

## 5. Testing Strategy & QA Guidelines

### 5.1 Test Frameworks & Utilities
- **Component & Integration Testing:** React Testing Library and Jest configuration (`package.json`).
- **End-to-End & Visual Testing:** Playwright (`@playwright/test`, `playwright.config.ts`).
- **Type Checking:** TypeScript strict mode compiler (`npx tsc --noEmit`).

### 5.2 Verification Checklist for Parent & Student Workflows

#### A. Parent Workflow Verification
- [x] **Magic Link Handling:** Arriving at `/parent/[school_slug]/join?token=TOKEN` correctly redirects to `/parent` with token query intact.
- [x] **Phone Reconciliation:** Submitting parent phone number during profile setup triggers `POST /api/v1/invitations/match_by_phone` and links student records.
- [x] **Dashboard Navigation:** Onboarding completion updates `parent_onboarding_completed` and redirects to `/parent/[school_slug]/dashboard/[email]`.
- [x] **Real-time Chat:** Messaging tab connects to ActionCable WebSocket and streams messages with correct sender role badges (`sent_as_role: 'parent'`).

#### B. Student Workflow Verification
- [x] **Multi-Role Sync:** Opening `/student` as an existing parent appends `'student'` to the `roles` array without removing `'parent'`.
- [x] **Student Onboarding:** Incomplete student accounts complete Profile Setup and Terms Acceptance before dashboard access.
- [x] **Student Dashboard Route:** Redirects to canonical route `/student/[school_slug]/dashboard/[email]`.
- [x] **URL Parameter Encoding:** Special characters in emails (e.g. `kagiso.killagram@gmail.com`) and school slugs (`Kagiso High code`) decode cleanly without 404 or infinite redirect loops.
