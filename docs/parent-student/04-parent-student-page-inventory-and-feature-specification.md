# 04 — Parent & Student Page Inventory & Feature Specification

## 1. Parent Page Inventory & Technical Analysis

### 1.1 `pages/parent/[school_slug]/join.tsx` (Invitation Redirect Gateway)
- **Primary Responsibility:** Intercepts parent magic links sent via WhatsApp or SMS containing school slug and token parameters.
- **Access Control:** Publicly accessible.
- **Dependencies & Imports:** Next.js `getServerSideProps`.
- **Observed Behavior:**
  - Extracts `school` from route parameters and `token` from query parameters.
  - If `token` is missing, redirects to `/parent?error=missing_token`.
  - If `token` is present, performs an immediate non-permanent redirect to `/parent?token=${token}&school=${school}`.
- **API Endpoints Triggered:** None directly (delegates verification to `/parent`).
- **Implementation Status:** **Fully Implemented**.

---

### 1.2 `pages/parent/index.tsx` (Parent Onboarding & Entry Gateway)
- **Primary Responsibility:** Orchestrates parent login, invitation token verification, profile synchronization, onboarding step execution, and dashboard redirection.
- **Access Control:** Public for login / Authenticated for onboarding.
- **Dependencies & Imports:**
  - Components: `AuthGate.tsx`, `FrontPageLayout.tsx`, `OnboardingFlow.tsx`, `ParentDashboard.tsx`, `LoadingScreen.tsx`, `ErrorBoundary.tsx`.
  - Services & Hooks: `InvitationAPI`, `ParentService`, `useParentOnboarding`.
- **Observed Behavior:**
  - `getServerSideProps`: Verifies invitation tokens via `InvitationAPI.verifyToken(token)`. If logged in, calls `ParentService.syncParentRole`, preloads profile and linked learners, and checks `parent_onboarding_completed`.
  - Client Page: If unauthenticated, renders `AuthGate`. If authenticated but onboarding is incomplete, renders `OnboardingFlow.tsx`. If onboarding is complete, executes `router.replace` to `/parent/${encodeURIComponent(schoolName)}/dashboard/${encodeURIComponent(email)}`.
- **API Endpoints Triggered:**
  - `GET /api/v1/invitations/:token/verify_with_details`
  - `POST /api/v1/users` & `PATCH /api/v1/users/:id/update_roles`
  - `GET /api/v1/users/show?auth0_id=...`
  - `GET /api/v1/parents/my_learners?auth0_id=...`
  - `GET /api/v1/users/onboarding_status?auth0_id=...`
- **Implementation Status:** **Fully Implemented**.

---

### 1.3 `pages/parent/[school_slug]/dashboard/[email]/index.tsx` (Overview Dashboard)
- **Primary Responsibility:** Main landing view for onboarded parents displaying student overview cards, attendance KPI summaries, and school announcements.
- **Access Control:** Authenticated Parent (`roles` contains `'parent'`).
- **Dependencies & Imports:**
  - Components: `DashboardShell.tsx`, `OverviewTab.tsx`, `AuthGate.tsx`, `ErrorBoundary.tsx`.
  - Service: `resolveParentDashboardProps` (`lib/services/resolveParentDashboardProps.ts`).
  - Hook: `useParentDashboard` (`components/parent/Dashboard/hooks/useParentDashboard.ts`).
- **Observed Behavior:**
  - SSR pre-loads parent profile and linked learners array.
  - Renders `DashboardShell` persistent header and sidebar navigation layout.
  - Passes `learners` and `stats` to `OverviewTab.tsx`, rendering individual learner progress cards.
- **API Endpoints Triggered:**
  - `GET /api/v1/users/show?auth0_id=...`
  - `GET /api/v1/parents/my_learners?auth0_id=...`
- **Implementation Status:** **Fully Implemented**.

---

### 1.4 `pages/parent/[school_slug]/dashboard/[email]/academics.tsx` (Academics & Report Cards)
- **Primary Responsibility:** Displays assessment test scores, subject mark percentages, and downloadable digital report card summaries for linked students.
- **Access Control:** Authenticated Parent.
- **Dependencies & Imports:**
  - Components: `DashboardShell.tsx`, `AcademicsTab.tsx`, `AuthGate.tsx`, `ErrorBoundary.tsx`.
  - Service: `resolveParentDashboardProps`.
- **Observed Behavior:**
  - Renders learner dropdown selector allowing parents with multiple linked children to switch views.
  - Displays subject breakdown cards with score progress bars.
  - Fetches and renders digital report cards using `SchoolAPI.getReportCard`.
- **API Endpoints Triggered:**
  - `GET /api/v1/results/report_card?learner_id=...&term_id=...`
  - `GET /api/v1/assessments?school_id=...&grade_id=...`
- **Implementation Status:** **Fully Implemented**.

---

### 1.5 `pages/parent/[school_slug]/dashboard/[email]/attendance.tsx` (Attendance Registers)
- **Primary Responsibility:** Displays daily attendance register logs and monthly status summaries for linked students.
- **Access Control:** Authenticated Parent.
- **Dependencies & Imports:**
  - Components: `DashboardShell.tsx`, `AttendanceTab.tsx`, `AuthGate.tsx`, `ErrorBoundary.tsx`.
  - Service: `resolveParentDashboardProps`.
- **Observed Behavior:**
  - Displays KPI summary counters: Days Present, Days Absent, Days Late, Excused.
  - Renders monthly register grid color-coding daily presence status.
- **API Endpoints Triggered:**
  - `GET /api/v1/attendance/summary?school_id=...&learner_id=...`
  - `GET /api/v1/attendance/register?school_id=...&grade_id=...`
- **Implementation Status:** **Fully Implemented**.

---

### 1.6 `pages/parent/[school_slug]/dashboard/[email]/communications.tsx` (Real-Time Chat)
- **Primary Responsibility:** Omni-channel chat interface for direct messaging teachers and receiving school announcements.
- **Access Control:** Authenticated Parent.
- **Dependencies & Imports:**
  - Components: `DashboardShell.tsx`, `MessagesTab.tsx`, `MessagingSection.tsx`, `ChatWindow.tsx`, `MessageInput.tsx`.
  - Service: `resolveParentDashboardProps`.
  - Real-Time Engine: `lib/cable.ts` (`@rails/actioncable`).
- **Observed Behavior:**
  - Resolves active school ID and user ID.
  - Establishes WebSocket connection to ActionCable `ConversationChannel`.
  - Renders message thread list, chat message bubbles with sender role badges, and message input composer.
- **API Endpoints Triggered:**
  - `GET /api/v1/conversations?school_id=...&user_id=...`
  - `GET /api/v1/conversations/:id/messages`
  - `POST /api/v1/conversations/:id/messages`
- **Implementation Status:** **Fully Implemented**.

---

### 1.7 `pages/parent/[school_slug]/dashboard/[email]/premium.tsx` (Subscriptions & Fees)
- **Primary Responsibility:** Fee settlement and portal subscription upgrade portal.
- **Access Control:** Authenticated Parent.
- **Dependencies & Imports:**
  - Components: `DashboardShell.tsx`, `PremiumTab.tsx`, `AuthGate.tsx`, `ErrorBoundary.tsx`.
  - Service: `resolveParentDashboardProps`.
- **Observed Behavior:**
  - Displays Free vs. Premium plan comparison.
  - Initiates PayFast digital checkout via `/api/create-payment`.
  - Displays transaction payment history.
- **API Endpoints Triggered:**
  - `POST /api/create-payment`
  - `GET /api/v1/transactions`
- **Implementation Status:** **Fully Implemented**.

---

## 2. Student Page Inventory & Technical Analysis

### 2.1 `pages/student/index.tsx` (Student Entry & Onboarding Gateway)
- **Primary Responsibility:** Entry route for student login, role synchronization, profile setup, terms acceptance, and dashboard redirection.
- **Access Control:** Public / Authenticated Student.
- **Dependencies & Imports:**
  - Components: `AuthGate.tsx`, `FrontPageLayout.tsx`, `StudentOnboardingFlow.tsx`, `LoadingScreen.tsx`, `ErrorBoundary.tsx`.
  - Services & Hooks: `StudentService`, `StudentAPI`, `useStudentOnboarding`.
- **Observed Behavior:**
  - `getServerSideProps`: Checks Auth0 session. If authenticated, executes `StudentService.syncStudentRole`, appending `'student'` to user roles without overwriting existing roles.
  - Client Page: If unauthenticated, displays `AuthGate`. If onboarding is incomplete, renders `StudentOnboardingFlow.tsx` (Profile setup and Terms acceptance). When onboarding is complete, redirects to `/student/${encodeURIComponent(schoolName)}/dashboard/${encodeURIComponent(email)}`.
- **API Endpoints Triggered:**
  - `GET /api/v1/users/show?auth0_id=...`
  - `PATCH /api/v1/users/:id/update_roles`
  - `GET /api/v1/users/onboarding_status?auth0_id=...`
  - `PATCH /api/v1/users/:id/update_profile`
  - `POST /api/v1/users/:id/onboarding_status/complete_step`
- **Implementation Status:** **Fully Implemented**.

---

### 2.2 `pages/student/[school_slug]/dashboard/[email]/index.tsx` (Student Dashboard Workspace)
- **Primary Responsibility:** Personal workspace landing hub for students.
- **Access Control:** Authenticated Student (`roles` contains `'student'`).
- **Dependencies & Imports:**
  - Components: `FrontPageLayout.tsx`, `AuthGate.tsx`, `ErrorBoundary.tsx`.
  - Service: `resolveStudentDashboardProps` (`lib/services/resolveStudentDashboardProps.ts`).
- **Observed Behavior:**
  - Preloads student profile via `resolveStudentDashboardProps`.
  - Displays personalized welcome header, school entity information, verified email, assigned role tags, and quick access academic module cards.
- **API Endpoints Triggered:**
  - `GET /api/v1/users/show?auth0_id=...`
- **Implementation Status:** **Fully Implemented**.

---

## 3. Feature Completeness Matrix

| Feature / Page | Target Persona | Auth Required | Endpoints Used | Implementation Status |
| :--- | :--- | :---: | :--- | :---: |
| **Parent Join Gateway** (`/parent/[school_slug]/join`) | Parent | No | None (Redirect) | **Implemented** |
| **Parent Auth & Onboarding** (`/parent`) | Parent | Yes | `/invitations/*`, `/users/*`, `/parents/my_learners` | **Implemented** |
| **Parent Dashboard Overview** (`.../dashboard/[email]`) | Parent | Yes | `/users/show`, `/parents/my_learners` | **Implemented** |
| **Parent Academics** (`.../dashboard/[email]/academics`) | Parent | Yes | `/results/report_card`, `/assessments` | **Implemented** |
| **Parent Attendance** (`.../dashboard/[email]/attendance`) | Parent | Yes | `/attendance/summary`, `/attendance/register` | **Implemented** |
| **Parent Communications** (`.../dashboard/[email]/communications`) | Parent | Yes | `/conversations`, `/conversations/:id/messages`, ActionCable | **Implemented** |
| **Parent Premium & Fees** (`.../dashboard/[email]/premium`) | Parent | Yes | `/api/create-payment`, `/transactions` | **Implemented** |
| **Student Auth & Onboarding** (`/student`) | Student | Yes | `/users/show`, `/users/:id/update_roles`, `/onboarding_status/*` | **Implemented** |
| **Student Dashboard Workspace** (`/student/[school_slug]/dashboard/[email]`) | Student | Yes | `/users/show` | **Implemented** |
