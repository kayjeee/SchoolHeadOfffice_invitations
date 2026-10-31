# 01 — Product Requirements Document (PRD)

## 1. Product Overview & Context

**SchoolHeadOffice (SHO)** is a comprehensive multi-tenant school administration, communication, and educational portal ecosystem. The platform connects five core user personas—School Administrators, Teachers, Parents, Students, and System Operators—into an integrated workflow engine.

### Core Mission & Problem Statement
Educational institutions frequently suffer from fragmented operational silos:
1. **Communication Friction:** Parents rely on unmonitored messaging apps or lost paper notices, leading to missed announcements and delayed academic interventions.
2. **Onboarding & Enrollment Administrative Overhead:** Onboarding parents and students requires manual data entry, physical forms, and paper verification.
3. **Information Asymmetry for Learners & Families:** Parents and students lack real-time visibility into daily attendance registers, grade assessments, timetable schedules, and academic progress reports.
4. **Subscription & Payment Bottlenecks:** Collecting school fees and managing premium portal upgrades involves disjointed invoicing and manual reconciliation.

The **Parent** and **Student** portals in SchoolHeadOffice solve these challenges by delivering dedicated digital workspaces. Parents gain verified access to link their dependent learners, track daily attendance and academic performance, communicate with teachers in scope-controlled channels, and manage school subscription payments. Students receive a tailored portal to view their class schedules, attendance records, academic report cards, and subject progress.

---

## 2. Target Personas & User Roles

The codebase supports role-based access control (RBAC) with user accounts supporting multi-role arrays (e.g. `roles: ['parent', 'teacher']`).

| Persona / Role | System Access | Primary Objectives & Capabilities |
| :--- | :--- | :--- |
| **Parent (`parent`)** | `/parent`, `/parent/[school_slug]/dashboard/[email]/*` | Onboard via magic links or phone number matching, link dependent learners, view real-time attendance and academic mark sheets, communicate with educators, and manage premium fee subscriptions. |
| **Student (`student`)** | `/student`, `/student/[school_slug]/dashboard/[email]/*` | Access individual student workspace, view personal class schedules and timetables, review attendance registers, inspect assessment scores and report cards, and complete student onboarding. |
| **Teacher (`teacher`)** | `/teacher/[schoolSlug]/*` | Mark daily class attendance registers, enter assessment marks, create subject assignments, initiate class/grade messaging channels, and review supply requisitions. |
| **School Admin (`admin` / `principal`)** | `/admin/[schoolSlug]/*` | Provision grades/classes/subjects, manage teacher/learner directories, dispatch single and bulk WhatsApp invitations, run bulk student promotions, and oversee supply requisitions. |
| **Super Admin (`super_admin` / `district`)** | Global `/admin` routes | Global tenant oversight, multi-school provisioning, system audit logging, and platform analytics. |

---

## 3. Parent Product Requirements

### 3.1 Parent Invitation Landing & Onboarding Gateway
- **Route:** `pages/parent/[school_slug]/join.tsx` & `pages/parent/index.tsx`
- **Purpose:** Entry point for new or returning parents arriving via tokenized invitation links or direct login.
- **User Needs:** Simple one-click magic link entry, identity setup, automatic phone-to-learner reconciliation, and guided step-by-step onboarding.
- **Main Features & User-Facing Behavior:**
  - Token Verification: Extracts invitation tokens from query parameters (`?token=...&school=...`) and calls backend token verification.
  - Profile & Identity Setup: Captures parent title, first name, surname, phone number, and email.
  - Learner Linkage: Automatically matches pending learner invitations via phone number (`/api/v1/invitations/match_by_phone`) or manual student accession number lookup.
  - Terms Acceptance & Subscription Choice: Captures agreement to school policies and presents fee tier options before launching PayFast payment checkout.
- **Inputs & Outputs:**
  - Inputs: Query params `token`, `school`, form inputs (`title`, `first_name`, `surname`, `phone`, `email`).
  - Outputs: Created/updated `User` profile, linked `Learner` relationships, completed `onboarding_status`.
- **Navigation Behavior:** Unauthenticated users see `AuthGate`; on completed onboarding, server-side `getServerSideProps` or client hook redirects immediately to `/parent/${encodeURIComponent(schoolName)}/dashboard/${encodeURIComponent(email)}`.
- **Status:** **Implemented**.

---

### 3.2 Parent Overview Dashboard
- **Route:** `pages/parent/[school_slug]/dashboard/[email]/index.tsx`
- **Purpose:** Primary landing hub displaying summary KPI cards, linked student cards, quick action shortcuts, and school notifications.
- **User Needs:** At-a-glance status of linked learners, recent school notices, attendance overview, and quick links to academic tabs.
- **Main Features & User-Facing Behavior:**
  - Dynamic Welcome Banner: Personalized greeting with primary school name and account email.
  - Linked Learner Cards: Renders cards for every linked dependent showing grade, class section, attendance percentage, and academic average.
  - KPI Stat Cards: Highlights overall attendance percentage, pending assignments, and active communication threads.
  - Notification Feed: Recent school announcements and event notices.
- **Inputs & Outputs:**
  - Inputs: URL parameters `school_slug`, `email`, server-resolved `initialProfile`, `initialLearners`.
  - Outputs: Interactive dashboard shell with sub-tab navigation.
- **Status:** **Implemented**.

---

### 3.3 Parent Academics & Report Cards
- **Route:** `pages/parent/[school_slug]/dashboard/[email]/academics.tsx`
- **Purpose:** Detailed academic performance view displaying assessment marks, subject breakdowns, term averages, and digital report cards.
- **User Needs:** View subject-by-subject grades, track assignment results over terms, and download/view term report cards.
- **Main Features & User-Facing Behavior:**
  - Learner Selector: Switch view between multiple linked dependents.
  - Subject Performance Breakdown: Progress bars and percentage scores per subject (e.g. Mathematics, English, Natural Sciences).
  - Assessment History: Detailed table of past tests, exams, and projects with maximum marks and obtained scores.
  - Report Card View: On-screen digital report card summary displaying term totals, class position/averages, and teacher comments.
- **Inputs & Outputs:**
  - Inputs: Selected learner ID, term filter.
  - Outputs: Rendered mark sheets and report card cards (`AcademicsTab.tsx`).
- **Status:** **Implemented**.

---

### 3.4 Parent Attendance Logs
- **Route:** `pages/parent/[school_slug]/dashboard/[email]/attendance.tsx`
- **Purpose:** Detailed attendance tracking showing daily register history and attendance statistics.
- **User Needs:** Verify student presence, review marked absences or late arrivals, and monitor overall term attendance percentage.
- **Main Features & User-Facing Behavior:**
  - Attendance KPI Cards: Total Days School Opened, Days Present, Days Absent, Days Late, Excused Absences.
  - Calendar / Monthly Register Log: Visual calendar grid displaying status badges (`present` [green], `absent` [red], `late` [amber], `excused` [blue]).
  - Filter Controls: Date range picker and learner selector dropdown.
- **Inputs & Outputs:**
  - Inputs: Selected learner ID, date range filters.
  - Outputs: Attendance statistics and status log (`AttendanceTab.tsx`).
- **Status:** **Implemented**.

---

### 3.5 Parent–Teacher Communications
- **Route:** `pages/parent/[school_slug]/dashboard/[email]/communications.tsx`
- **Purpose:** Real-time scope-controlled messaging hub for direct messaging teachers and receiving class/grade announcements.
- **User Needs:** Message form teachers and subject educators directly, receive class-wide notices, and upload attachment files.
- **Main Features & User-Facing Behavior:**
  - ActionCable WebSocket Chat: Real-time message streaming with message delivery/read receipts and emoji reactions.
  - Scope-Gated Access: Parents can participate in 1:1 direct threads with assigned teachers and view class/grade broadcast channels (initiating broad scope groups is restricted to educators/admins).
  - File Attachment Preview: Image and document attachment support.
- **Inputs & Outputs:**
  - Inputs: User messages, media attachments, selected conversation ID.
  - Outputs: ActionCable payload to `/api/v1/conversations/:id/messages`.
- **Status:** **Implemented**.

---

### 3.6 Parent Premium & Subscription Management
- **Route:** `pages/parent/[school_slug]/dashboard/[email]/premium.tsx`
- **Purpose:** Subscription portal for upgrading to Premium parent features and settling annual school fee items.
- **User Needs:** Review premium plan benefits (e.g., advanced analytics, instant SMS notifications, digital report card downloads), select billing cycle, and make secure digital payments.
- **Main Features & User-Facing Behavior:**
  - Plan Comparison Matrix: Free vs. Premium plan feature comparison.
  - PayFast Integration: Initiates secure checkout via `/api/create-payment`, generating PayFast HTML form redirection.
  - Billing History & Invoice Receipt: Displays past payment transaction records and current subscription status (`free` / `premium`).
- **Inputs & Outputs:**
  - Inputs: Selected subscription plan ID.
  - Outputs: PayFast transaction payload, Instant Transaction Notification (ITN) webhook processing.
- **Status:** **Implemented**.

---

## 4. Student Product Requirements

### 4.1 Student Portal Entry & Onboarding
- **Route:** `pages/student/index.tsx`
- **Purpose:** Dedicated entry route for student authentication, role resolution, profile synchronization, and onboarding execution.
- **User Needs:** Simple Auth0 sign-in, account profile verification, terms of service acceptance, and seamless redirection to the student dashboard.
- **Main Features & User-Facing Behavior:**
  - Role Preservation: Synchronizes student profile via `StudentService.syncStudentRole`, appending `'student'` to the user's role array without clobbering existing roles (`parent`, `teacher`, etc.).
  - Student Onboarding Flow (`StudentOnboardingFlow.tsx`): Two-step wizard:
    1. Step 1 (`PROFILE_SETUP`): First Name, Surname, Contact Phone (optional), and School Name.
    2. Step 2 (`TERMS_ACCEPTANCE`): Student Acceptable Use Policy and digital code of conduct acceptance.
  - Automatic Dashboard Navigation: Upon verifying onboarding completion, redirects user to `/student/${encodeURIComponent(schoolSlug)}/dashboard/${encodeURIComponent(email)}`.
- **Status:** **Implemented**.

---

### 4.2 Student Overview Dashboard
- **Route:** `pages/student/[school_slug]/dashboard/[email]/index.tsx`
- **Purpose:** Student personal workspace landing hub.
- **User Needs:** View personal academic summary, school details, active student account status, assigned roles, and quick access modules.
- **Main Features & User-Facing Behavior:**
  - Student Profile Header: Displays student display name, school name, and active status indicator.
  - Account Metadata Cards: Shows verified student email, school slug, primary school name, and assigned role tags.
  - Academic Module Cards: Quick navigation cards for My Timetable, Attendance Record, and Report Cards & Marks.
- **Status:** **Implemented**.

---

## 5. End-to-End User Journeys

### 5.1 Journey 1: Parent Arriving via WhatsApp / SMS Magic Link
```
[Parent clicks WhatsApp Link] -> /parent?token=TOKEN&school=SLUG
  |
  +--> [SSR GSSP] verifies token via GET /api/v1/invitations/:token/verify_with_details
  |
  +--> [AuthGate] Prompt Auth0 Login / Signup
  |
  +--> [Auth0 Callback] User returns authenticated
  |
  +--> [ParentService.syncParentRole] Creates user record or appends 'parent' role
  |
  +--> [Parent Onboarding Wizard]
         1. PROFILE_SETUP -> updates title, first_name, surname, phone
         2. LINK_LEARNERS -> executes match_by_phone to auto-reconcile student records
         3. TERMS & PAYMENT -> accepts terms, completes PayFast subscription checkout
  |
  +--> Redirect to /parent/[school_slug]/dashboard/[email]
```

### 5.2 Journey 2: Student Login & Onboarding
```
[Student opens /student]
  |
  +--> [SSR GSSP] Checks Auth0 Session
  |      |
  |      +-- (Unauthenticated) -> Render AuthGate with returnTo="/student"
  |      |
  |      +-- (Authenticated) -> Call StudentService.syncStudentRole(sub)
  |
  +--> [Student Onboarding Check]
  |      |
  |      +-- Incomplete -> Render StudentOnboardingFlow (Profile -> Terms)
  |      |
  |      +-- Complete -> Redirect to /student/[school_slug]/dashboard/[email]
  |
  +--> [Student Dashboard] Displays student workspace, school details, and academic cards
```

---

## 6. Functional & Non-Functional Requirements

### 6.1 Functional Requirements
1. **Multi-Role Coexistence:** System MUST maintain role arrays (e.g. `['parent', 'student']`) without overwriting or deleting pre-existing user roles during role synchronization.
2. **Phone Reconciliation:** Parent onboarding MUST execute phone normalization (converting numbers to international format `27XXXXXXXXX` and matching the last 9 digits) to auto-link learner records.
3. **URL Parameter Encoding:** All route parameters (`school_slug`, `email`) MUST be safely encoded and decoded to support spaces, special characters, and email symbols (`+`, `%`, `@`).
4. **WebSocket Streaming:** Communications workspace MUST establish ActionCable WebSocket subscriptions to `ConversationChannel` for real-time chat updates.

### 6.2 Non-Functional Requirements
1. **Performance & Responsiveness:** Dashboard pages MUST load within 1.5 seconds on average mobile 4G connections, utilizing SWR/React Query for cached background refetches.
2. **Security & Data Isolation:** SWR keys and API queries MUST enforce user-scoped or school-scoped parameters to prevent cross-tenant data leaks.
3. **Responsive Mobile-First UI:** All parent and student views MUST adapt seamlessly across mobile (320px+), tablet, and desktop viewports using Tailwind CSS breakpoints.

---

## 7. Feature Prioritization & Implementation Status Matrix

| Feature Module | Scope / Target | Status | Implementation Evidence |
| :--- | :--- | :--- | :--- |
| **Parent Magic Link Entry & Token Verification** | Parent | **Implemented** | `pages/parent/[school_slug]/join.tsx`, `InvitationAPI.verifyToken` |
| **Parent Identity & Profile Setup** | Parent | **Implemented** | `components/parent/Onboarding/steps/ProfileSetup.tsx` |
| **Phone-Based Learner Reconciliation** | Parent | **Implemented** | `POST /api/v1/invitations/match_by_phone`, `LinkLearners.tsx` |
| **Parent Dashboard Overview & Stats** | Parent | **Implemented** | `pages/parent/[school_slug]/dashboard/[email]/index.tsx` |
| **Learner Academics & Report Cards** | Parent | **Implemented** | `AcademicsTab.tsx`, `GET /api/v1/results/report_card` |
| **Learner Attendance Registers** | Parent | **Implemented** | `AttendanceTab.tsx`, `GET /api/v1/attendance/summary` |
| **ActionCable Real-Time Chat** | Parent / Student | **Implemented** | `MessagesTab.tsx`, `MessagingSection.tsx`, `lib/cable.ts` |
| **PayFast Subscription Checkout** | Parent | **Implemented** | `PremiumTab.tsx`, `/api/create-payment`, `/api/payfast/notify` |
| **Student Role Sync & Multi-Role Support** | Student | **Implemented** | `StudentService.syncStudentRole`, `lib/services/student.service.ts` |
| **Student Two-Step Onboarding** | Student | **Implemented** | `StudentOnboardingFlow.tsx`, `useStudentOnboarding.ts` |
| **Student Dashboard Workspace** | Student | **Implemented** | `pages/student/[school_slug]/dashboard/[email]/index.tsx` |
