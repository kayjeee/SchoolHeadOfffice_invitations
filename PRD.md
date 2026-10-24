# Product Requirements Document (PRD)

## 1. Overview
**School Head Office (SHO) Invitations & Management Platform** is an enterprise-grade school management and stakeholder communication ecosystem. The application addresses the operational fragmentation experienced by educational institutions when managing student enrollment, parent communication, academic scheduling, attendance, marks recording, and supply logistics.

By bridging school administrators, educators, parents, and students into a unified web application, SHO replaces disjointed manual processes (such as paper forms, unmonitored messaging groups, and disconnected spreadsheets) with automated, audit-logged workflows. Central to the platform is its multi-channel invitation and onboarding system, enabling school administrators to onboard parents and teachers via localized WhatsApp, SMS, and magic link workflows, auto-reconciling parent profiles with student records via phone number matching.

---

## 2. Goals & Objectives
- **Automate Stakeholder Onboarding:** Streamline parent and educator onboarding through bulk multi-channel invitations (WhatsApp Business API, SMS, Email) and dynamic token-based magic links, reducing onboarding processing time by over 80%.
- **Secure Communication & Collaboration:** Deliver real-time, scope-based end-to-end communication channels (1:1 direct messages, class groups, grade groups, school-wide, and staff-only channels) with ActionCable WebSocket integration, attachments, emoji reactions, and read status tracking while maintaining strict data privacy.
- **Centralize Academic & Operational Management:** Provide school administrators and teachers with integrated tools for managing academic hierarchies (Grades, Classes, Subjects), academic calendars (Terms, Timetables), daily attendance registers, assessment mark entries, and student report card generation.
- **Automate Administrative Workflows:** Support bulk student promotion across academic years, supply requisition management with admin approval/fulfillment workflows, and digital payment processing via PayFast.
- **Ensure Multi-Tenant Security:** Maintain strict role-based access control (RBAC) and school-level isolation across Super Admin, School Admin, Teacher, Parent, and Student roles using Auth0 JWT authentication.

---

## 3. Target Users / Personas

| Persona | Description | Key Objectives & Motivations |
| :--- | :--- | :--- |
| **Super Admin / System Administrator** | Platform operator overseeing all onboarded schools and global system health. | Provision new school entities, monitor audit logs, manage system configuration, and inspect cross-school analytics. |
| **School Admin / Principal** | Operational leadership at an individual school (e.g., Principal, Vice Principal, Head Administrator). | Issue bulk learner and teacher invitations, manage academic hierarchies (grades, classes, subjects, terms), approve supply requests, run student promotions, and oversee school-wide communications. |
| **Teacher / Educator** | Classroom teachers and subject educators assigned to specific grades, classes, or subjects. | View assigned class rosters, log daily attendance registers, create assessments, record marks, submit supply requisitions, and communicate with parents and colleagues. |
| **Parent / Guardian** | Parents or guardians of enrolled learners. | Accept school invitations, complete onboarding verification, link dependent learners, view academic reports/attendance/assignments, pay school fees/subscriptions via PayFast, and communicate with teachers. |
| **Student / Learner** | Enrolled students within the school ecosystem. | Represented as data entities within class rosters, grade hierarchies, report cards, and attendance records; can access learner-scoped dashboard views when configured. |

---

## 4. Tech Stack

### Frontend Architecture
- **Framework:** Next.js (Hybrid App Router under `app/` and Pages Router under `pages/`)
- **Language:** TypeScript / JavaScript (ES6+)
- **Styling:** Tailwind CSS, PostCSS, Lucide React (Icons), Framer Motion
- **Data Fetching & State Management:** SWR (`useSWR`), React Context API (`SchoolContext`, `GodmodeContext`, `ThemeContext`), Custom Hooks (`useAuth`, `useSchool`, `useMessaging`, `useParentOnboarding`, `usePresence`)
- **Authentication & Security:** Auth0 Next.js SDK (`@auth0/nextjs-auth0`), JWT bearer tokens passed via `apiClient` (`lib/api/api-client.ts`)
- **Real-Time Integration:** `@rails/actioncable` via `lib/cable.ts`
- **Third-Party Libraries:** PayFast Payment Gateway Integration, XLSX / SheetJS (Excel bulk upload processing)

### Backend Architecture
- **Framework:** Ruby on Rails (v7.x) in API-only mode
- **Language:** Ruby 3.3.7
- **Database:** MongoDB (via Mongoid ODM v8.x)
- **Real-Time Engine:** ActionCable with Puma Web Server (`ConversationChannel`)
- **Authentication & Authorization:** Auth0 JWT Validation (`JWT.decode` with Auth0 JWKS public keys), `Secured` concern, `OnboardingAuthorization` concern
- **Deployment & DevOps:** Docker (`Dockerfile`), Render (`render.yaml`), Kamal (`config/deploy.yml`), Puma app server

---

## 5. System Architecture

The frontend application (Next.js) serves as a client rendering interface that interacts with the Rails backend API via HTTP/REST endpoints and persistent WebSocket connections (ActionCable).

```
 +-----------------------------------------------------------------------------------+
 |                              Client Browser / Device                              |
 +-----------------------------------------------------------------------------------+
        |                                       |                               |
        | HTTP/REST (JSON)                      | WebSockets (ActionCable)      | Auth0 OIDC
        v                                       v                               v
 +-----------------------+               +-----------------------+     +-------------------+
 | Next.js Frontend App  |               | Rails API Backend     |     | Auth0 Identity    |
 | (App Router / Pages)  |               | (Controllers/Services)|     | Provider          |
 +-----------------------+               +-----------------------+     +-------------------+
        |                                       |
        | API Client (`lib/api/api-client.ts`)  | Mongoid ODM
        +-------------------------------------> v
                                         +-----------------------+
                                         |    MongoDB Database   |
                                         |   (Document Store)    |
                                         +-----------------------+
```

---

## 6. Feature Breakdown

### 6.1 Invitation Management (Learners & Teachers)
- **Description:** Allows administrators to issue, track, resend, cancel, and manually accept individual or bulk invitations for parents/learners and teachers via WhatsApp, SMS, and Email channels.
- **User-Facing Behavior:**
  - Admin navigates to Learners CRM or Teachers CRM in `app/admin/[schoolSlug]/learners/page.tsx` or `teachers/page.tsx`.
  - Admin opens Single or Bulk Invitation Modals, inputs recipient details, selects channel (WhatsApp active, SMS/Email disabled), and submits.
  - Bulk invitation flow supports pasting comma/newline-separated rows or uploading Excel files.
  - Generates dynamic token magic links sent via WhatsApp Business API (`/api/whatsapp-business/send-bulk`).
  - CRM view renders status badges (`pending`, `accepted`, `expired`, `cancelled`), learner/grade mappings, and action menus (Resend, Cancel, Accept).
- **Frontend Implementation:**
  - Pages: `app/admin/[schoolSlug]/learners/page.tsx`, `app/admin/[schoolSlug]/teachers/page.tsx`, `pages/parent/[school_slug]/join.tsx`
  - Components: Single/Bulk Learner Invite Modals, Teacher Invite Modals, Invitations CRM Table.
  - APIs: `lib/api/invitation-api.ts`, `pages/api/whatsapp-business/send-bulk.js`
- **Backend Implementation:**
  - Endpoints: `POST /api/v1/invitations`, `POST /api/v1/invitations/bulk_create`, `GET /api/v1/invitations`, `POST /api/v1/invitations/:token/resend`, `POST /api/v1/invitations/:token/cancel`, `POST /api/v1/invitations/:token/admin_accept`, `GET /api/v1/invitations/:token/verify_with_details`
  - Controllers: `Api::V1::InvitationsController`, `Api::V1::LearnerInvitationsController`, `Api::Public::InvitationsController`
  - Models: `Invitation`, `LearnerInvitation`, `TeacherInvitation`
- **Data Model Touched:** `Invitation`, `LearnerInvitation`, `TeacherInvitation`, `Learner`, `User`, `School`
- **Auth/Roles Required:** Admin (`admin`, `super_admin`)
- **Status:** Fully Implemented

---

### 6.2 Parent Onboarding & Learner Linkage
- **Description:** Multi-step wizard guiding newly invited parents through identity verification, profile completion, automatic student reconciliation by phone number, and subscription payment processing.
- **User-Facing Behavior:**
  - Parent lands via magic link token `/parent/[school_slug]/join?token=...` or opens `/parent/[school_slug]/index.tsx`.
  - Step 1 (Identity/Profile): Collects title, first name, surname, phone number, and email. Updates user profile via backend API.
  - Step 2 (Phone Reconciliation & Linkage): Calls `POST /api/v1/invitations/match_by_phone` to automatically reconcile phone numbers with pending invitations and link student profiles (`POST /api/parent/link-learners`).
  - Step 3 (Terms & Preferences): Captures terms acceptance and notification preferences.
  - Step 4 (Subscription & Payment): Presents plan selection and redirects to PayFast gateway for fee payment.
  - On completion, parent lands on Parent Portal Dashboard (`pages/parent/[school_slug]/dashboard/[email]/`).
- **Frontend Implementation:**
  - Pages: `pages/parent/[school_slug]/join.tsx`, `pages/parent/[school_slug]/dashboard/[email]/index.tsx`
  - Components: `components/parent/Onboarding/OnboardingFlow.tsx`, `ProfileSetup.tsx`, `LinkLearners.tsx`, `TermsAcceptance.tsx`, `PaymentSetup.tsx`
  - Services/Hooks: `lib/hooks/useParentOnboarding.ts`, `lib/services/parent.service.ts`
- **Backend Implementation:**
  - Endpoints: `PATCH /api/v1/users/update_profile`, `POST /api/v1/invitations/match_by_phone`, `GET /api/v1/my_learners`, `POST /api/v1/request_accesses`
  - Controllers: `Api::V1::UsersController`, `Api::V1::InvitationsController`, `Api::V1::MyLearnersController`
  - Models: `User`, `Learner`, `Invitation`, `RequestAccess`, `UserSchoolRole`
- **Data Model Touched:** `User`, `Learner`, `Invitation`, `RequestAccess`, `UserSchoolRole`
- **Auth/Roles Required:** Authenticated Parent (`parent`)
- **Status:** Fully Implemented

---

### 6.3 Academic Structure Management (Grades, Classes, Subjects, Terms)
- **Description:** Configuration hub for school administrators to define and maintain grades, class sections, subject catalogues, and academic calendar terms.
- **User-Facing Behavior:**
  - Admin accesses Management Hub from Learners CRM or Settings page (`app/admin/[schoolSlug]/settings/page.tsx`).
  - Class Management: Create/edit class sections (e.g. Grade 10A), monitor enrollment capacity progress bars, assign form teachers, and delete classes.
  - Subject Management: Add new subjects, set codes, assign default teachers, toggle active/inactive status.
  - Terms & Academic Year: Define term start/end dates, set active term, and enforce non-overlapping date validations.
- **Frontend Implementation:**
  - Pages: `app/admin/[schoolSlug]/learners/page.tsx`, `app/admin/[schoolSlug]/settings/page.tsx`
  - Components: Class Management Modal, Subject Management Modal, Terms Panel, School Context header selectors.
  - APIs: `lib/api/school-api.ts` (`getClasses`, `createClass`, `getSubjects`, `getTerms`, etc.)
- **Backend Implementation:**
  - Endpoints: `GET/POST/PUT/DELETE /api/v1/schools/:school_id/grades`, `GET/POST/PUT/DELETE /api/v1/classes`, `GET/POST/PATCH/DELETE /api/v1/subjects`, `GET/POST/PUT/DELETE /api/v1/terms`
  - Controllers: `Api::V1::GradesController`, `Api::V1::ClassesController`, `Api::V1::SubjectsController`, `Api::V1::TermsController`
  - Models: `Grade`, `SchoolClass`, `Subject`, `Term`
- **Data Model Touched:** `Grade`, `SchoolClass`, `Subject`, `Term`, `School`, `User`
- **Auth/Roles Required:** Admin (`admin`, `super_admin`)
- **Status:** Fully Implemented

---

### 6.4 Attendance & Timetabling
- **Description:** Features for capturing class attendance registers and scheduling weekly class/teacher timetables.
- **User-Facing Behavior:**
  - Attendance Tracking: Admin or Teacher selects grade, class section, and date to mark student presence (Present, Absent, Late, Excused) in bulk (`POST /api/v1/attendance/bulk_mark`). Summary statistics show attendance rates over selected date ranges.
  - Timetable Hub: View weekly schedule grid filtered by Class or Teacher. Add/edit schedule slots specifying day of week, start/end time (minutes from midnight), room, subject, and teacher. Backend rejects conflicting schedule assignments.
- **Frontend Implementation:**
  - Pages: `app/admin/[schoolSlug]/learners/page.tsx`, `app/teacher/[schoolSlug]/page.tsx`
  - Components: Attendance Tracking Modal, Timetable Hub Modal.
  - APIs: `SchoolAPI.getAttendanceRegister`, `SchoolAPI.bulkMarkAttendance`, `SchoolAPI.getTimetableEntries`, `SchoolAPI.createTimetableEntry`
- **Backend Implementation:**
  - Endpoints: `GET /api/v1/attendance/register`, `POST /api/v1/attendance/bulk_mark`, `GET /api/v1/attendance/summary`, `GET/POST/PUT/DELETE /api/v1/timetable_entries`
  - Controllers: `Api::V1::AttendanceController`, `Api::V1::TimetableEntriesController`
  - Models: `AttendanceRecord`, `TimetableEntry`
- **Data Model Touched:** `AttendanceRecord`, `TimetableEntry`, `Learner`, `SchoolClass`, `Subject`, `User`
- **Auth/Roles Required:** Admin (`admin`), Teacher (`teacher`)
- **Status:** Fully Implemented

---

### 6.5 Assessment & Academic Reporting
- **Description:** Complete cycle for creating academic assessments, logging student scores in bulk, calculating averages, and rendering digital report cards.
- **User-Facing Behavior:**
  - Assessments: Add assessments by subject, grade, term, maximum marks, weightage, and due date.
  - Record Marks: Open class roster view to input student marks in bulk with auto-saving.
  - Report Cards: Select learner and term to generate dynamic on-screen report cards displaying subject breakdown, marks obtained, percentage scores, subject averages, and overall grade performance.
- **Frontend Implementation:**
  - Pages: `app/admin/[schoolSlug]/learners/page.tsx`, `pages/parent/[school_slug]/dashboard/[email]/academics.tsx`
  - Components: Academic Reports Modal (Assessments, Record Marks, Report Cards tabs), Parent AcademicsTab.
  - APIs: `SchoolAPI.getAssessments`, `SchoolAPI.createAssessment`, `SchoolAPI.bulkRecordResults`, `SchoolAPI.getReportCard`
- **Backend Implementation:**
  - Endpoints: `GET/POST /api/v1/assessments`, `POST /api/v1/results/bulk_record`, `GET /api/v1/results/report_card`
  - Controllers: `Api::V1::AssessmentsController`, `Api::V1::ResultsController`
  - Models: `Assessment`, `Result`
- **Data Model Touched:** `Assessment`, `Result`, `Learner`, `Subject`, `Term`, `School`
- **Auth/Roles Required:** Admin (`admin`), Teacher (`teacher`), Parent (`parent` - read-only)
- **Status:** Fully Implemented

---

### 6.6 Real-Time Communications & Scope-Based Messaging
- **Description:** Omni-channel chat interface enabling direct 1:1 messaging and scope-based group channels (Class, Grade, School-wide, Staff-only) backed by ActionCable WebSockets.
- **User-Facing Behavior:**
  - Main messaging workspace rendered in Admin (`app/admin/[schoolSlug]/communications`), Teacher (`app/teacher/[schoolSlug]/communications`), and Parent Dashboard (`.../communications.tsx`).
  - Left panel displays conversation threads, directory lookup, search, and "New Group" initiation modal.
  - Initiation modal allows admins/teachers to select scope (e.g. Class 10A or Grade 10) auto-populating total parent and teacher participant counts.
  - Chat window supports live streaming messages, attachment uploads (images/documents), message read receipts, emoji reactions, and sender role badges (Parent, Teacher, Admin).
  - Scope guards dictate participant actions (e.g., parents cannot initiate scope groups).
- **Frontend Implementation:**
  - Pages: `app/admin/[schoolSlug]/communications/page.tsx`, `app/teacher/[schoolSlug]/communications/page.tsx`, `pages/parent/[school_slug]/dashboard/[email]/communications.tsx`
  - Components: `MessagingSection.tsx`, `ChatWindow.tsx`, `ConversationList.tsx`, `GroupInitiation.tsx`, `MessageBubble.tsx`, `MessageInput.tsx`
  - Hooks/APIs: `lib/hooks/useMessaging.ts`, `lib/api/messaging-api.ts`, `lib/cable.ts`
- **Backend Implementation:**
  - Endpoints: `GET/POST /api/v1/conversations`, `GET/POST /api/v1/conversations/:id/messages`, `POST /api/v1/conversations/:id/leave`, `POST /api/v1/conversations/:id/remove_participant`
  - Controllers: `Api::V1::ConversationsController`, `Api::V1::MessagesController`, `ConversationChannel`
  - Models: `Conversation`, `Message`
- **Data Model Touched:** `Conversation`, `Message`, `User`, `School`
- **Auth/Roles Required:** All authenticated users (`admin`, `teacher`, `parent`)
- **Status:** Fully Implemented

---

### 6.7 Supply Requisitions Management
- **Description:** Material and textbook request workflow allowing educators to log needed inventory and school administrators to review, approve, reject, or fulfill requests.
- **User-Facing Behavior:**
  - Teachers log supply requests from `app/teacher/[schoolSlug]/supply-requests/page.tsx` or teacher profile drawer.
  - Displays summary counters (Requested, Approved, Fulfilled) and request history table.
  - Admins inspect school-wide supply requests tab in `app/admin/[schoolSlug]/teachers/page.tsx`, filtering by status (`pending`, `approved`, `fulfilled`, `rejected`).
  - Admin can perform inline actions: Approve, Reject (with mandatory rejection reason note), or Fulfill. Status updates sync immediately across drawer and CRM tables.
- **Frontend Implementation:**
  - Pages: `app/admin/[schoolSlug]/teachers/page.tsx`, `app/teacher/[schoolSlug]/supply-requests/page.tsx`
  - Components: Supply Requisitions Tab, Teacher Profile Drawer (`TeacherProfileDrawer.tsx`)
  - APIs: `SchoolAPI.getSupplyRequests`, `SchoolAPI.createSupplyRequest`, `SchoolAPI.approveSupplyRequest`, `SchoolAPI.rejectSupplyRequest`, `SchoolAPI.fulfillSupplyRequest`
- **Backend Implementation:**
  - Endpoints: `GET/POST /api/v1/supply_requests`, `GET /api/v1/supply_requests/summary`, `PATCH /api/v1/supply_requests/:id/approve`, `PATCH /api/v1/supply_requests/:id/reject`, `PATCH /api/v1/supply_requests/:id/fulfill`
  - Controllers: `Api::V1::SupplyRequestsController`
  - Models: `SupplyRequest`
- **Data Model Touched:** `SupplyRequest`, `User`, `School`
- **Auth/Roles Required:** Teacher (`teacher` - submit), Admin (`admin` - review & triage)
- **Status:** Fully Implemented

---

### 6.8 Learner Promotion & Student Lifecycle Management
- **Description:** Bulk transition of student records across academic years and management of student active/graduate/transferred states.
- **User-Facing Behavior:**
  - Admin opens Promotion System modal in Learners CRM (`app/admin/[schoolSlug]/learners/page.tsx`).
  - Selects source academic year, destination academic year, source grade, and target destination grade.
  - Selects all or specific learners to promote.
  - Submits promotion payload. Directory data refreshes instantly without page reload.
  - Individual student drawer allows toggling status (`activate`, `deactivate`, `graduate`, `transfer`).
- **Frontend Implementation:**
  - Pages: `app/admin/[schoolSlug]/learners/page.tsx`
  - Components: Promotion Modal, Learner Drawer
  - APIs: `SchoolAPI.promoteLearners`, `SchoolAPI.updateLearnerStatus`
- **Backend Implementation:**
  - Endpoints: `POST /api/v1/schools/:school_id/learners/promote`, `PATCH /api/v1/learners/:id/graduate`, `PATCH /api/v1/learners/:id/transfer`, `PATCH /api/v1/learners/:id/activate`, `PATCH /api/v1/learners/:id/deactivate`
  - Controllers: `Api::V1::LearnersController`, `Api::V1::Schools::StudentsController`
  - Models: `Learner`
- **Data Model Touched:** `Learner`, `Grade`, `School`
- **Auth/Roles Required:** Admin (`admin`, `super_admin`)
- **Status:** Fully Implemented

---

### 6.9 User Profile & Multi-School Role Management
- **Description:** Centralized identity and role management linking Auth0 identities to multi-school memberships and contextual permissions.
- **User-Facing Behavior:**
  - Users authenticate via Auth0 OIDC flow.
  - On first sign-in, onboarding flow enforces profile completion (`title`, `first_name`, `surname`, `phone`).
  - School selection allows users with multi-school roles (e.g. admin in School A, parent in School B) to switch active context smoothly.
- **Frontend Implementation:**
  - Pages: `pages/api/auth/[...auth0].tsx`, `pages/profile.tsx`, `components/teacher/Onboarding/TeacherOnboardingFlow.tsx`
  - Hooks/APIs: `lib/hooks/useAuth.ts`, `lib/api/users-api.ts`
- **Backend Implementation:**
  - Endpoints: `POST /api/v1/users`, `PATCH /api/v1/users/update_profile`, `GET /api/v1/users/schools`, `POST /api/v1/users/:id/add_role`
  - Controllers: `Api::V1::UsersController`
  - Models: `User`, `UserSchoolRole`
- **Data Model Touched:** `User`, `UserSchoolRole`, `School`
- **Auth/Roles Required:** Authenticated User
- **Status:** Fully Implemented

---

### 6.10 PayFast Payment Gateway & Financial Management
- **Description:** Payment gateway integration for parent subscription fees and administrative fee recording.
- **User-Facing Behavior:**
  - Parent onboarding or Premium tab presents fee items and subscription choices.
  - Clicking "Pay Now" posts transaction parameters to `/api/create-payment`, generating PayFast HTML form redirection.
  - PayFast ITN (Instant Transaction Notification) webhooks update transaction status asynchronously (`pages/api/payfast/notify.ts`).
  - Admin view in settings/billing lists recorded transactions and user balance accounts.
- **Frontend Implementation:**
  - Pages: `pages/api/create-payment.ts`, `pages/api/payfast/notify.ts`, `pages/api/payfast/success.ts`, `pages/parent/[school_slug]/dashboard/[email]/premium.tsx`
  - APIs: PayFast service handlers
- **Backend Implementation:**
  - Endpoints: `GET/POST /api/v1/transactions`, `POST /api/v1/transactions/:id/process_payment`, `GET /api/v1/accounts`
  - Controllers: `Api::V1::TransactionsController`, `Api::V1::AccountsController`
  - Models: `Transaction`, `Account`, `Payment`
- **Data Model Touched:** `Transaction`, `Account`, `Payment`, `User`, `School`
- **Auth/Roles Required:** Parent (`parent`), Admin (`admin`)
- **Status:** Fully Implemented

---

## 7. Data Models

### 7.1 `User`
Representing individual user identities across all personas.
- **Fields:**
  - `_id` (ObjectId): Primary Key
  - `name` (String): Full display name
  - `first_name` (String): First name
  - `surname` (String): Last name / Surname
  - `title` (String): Salutation (e.g., Mr, Mrs, Dr, Prof)
  - `email` (String, required, unique): Email address
  - `auth0_id` (String, required, unique): Auth0 subject identifier
  - `phone` / `phone_number` (String): Phone number (normalized format `27XXXXXXXXX`)
  - `roles` (Array of Strings): System-wide roles (`['super_admin', 'admin', 'teacher', 'parent', 'learner']`)
  - `status` (String, default: `'active'`): Account status (`'active'`, `'inactive'`, `'suspended'`)
  - `department` (String): Academic department (for teachers)
  - `position` (String): Staff job title
  - `cash_account` (Float, default: `0.0`): User virtual wallet balance
  - `payment_history` (Array): Embedded transaction logs
  - `onboarding_completed` (Boolean, default: `false`): Onboarding completion marker
  - `onboarding_progress` (Float, default: `0.0`): Progress percentage
  - `last_login` (Time): Last login timestamp
  - `created_at`, `updated_at` (DateTime)
- **Relationships:**
  - `has_many :user_school_roles`
  - `has_many :conversations`
  - `has_many :supply_requests`
  - `has_many :teacher_grade_assignments`

### 7.2 `School`
Educational institution entity.
- **Fields:**
  - `_id` (ObjectId): Primary Key
  - `name` (String, required): School display name
  - `slug` (String, required, unique): URL-friendly slug
  - `code` (String, unique): Short school code
  - `address` (String), `city` (String), `province` (String), `postal_code` (String)
  - `phone` (String), `email` (String)
  - `created_at`, `updated_at` (DateTime)
- **Relationships:**
  - `has_many :grades`
  - `has_many :school_classes`
  - `has_many :learners`
  - `has_many :user_school_roles`

### 7.3 `Grade`
Academic grade level within a school (e.g., Grade 8, Grade 10).
- **Fields:**
  - `_id` (ObjectId): Primary Key
  - `school_id` (String / BSON::ObjectId, required): Associated school reference
  - `name` (String, required): Grade name (e.g., `"Grade 10"`)
  - `code` (String): Grade code
  - `level` (Integer, required): Numerical grade order (e.g., `10`)
  - `description` (String)
  - `created_at`, `updated_at` (DateTime)
- **Relationships:**
  - `belongs_to :school`
  - `has_many :school_classes`
  - `has_many :learners`

### 7.4 `SchoolClass`
Class section within a grade (e.g., Grade 10A).
- **Fields:**
  - `_id` (ObjectId): Primary Key
  - `school_id` (String, required): School reference
  - `grade_id` (String, required): Parent grade reference
  - `name` (String, required): Section name (e.g., `"10A"`)
  - `code` (String)
  - `capacity` (Integer, default: `35`): Max student capacity
  - `class_teacher_id` (String): Form teacher user reference
  - `class_teacher_name` (String): Form teacher cached name
  - `created_at`, `updated_at` (DateTime)
- **Relationships:**
  - `belongs_to :grade`
  - `belongs_to :school`
  - `has_many :learners`

### 7.5 `Learner`
Student record enrolled within a school.
- **Fields:**
  - `_id` (ObjectId): Primary Key
  - `school_id` (String, required): School reference
  - `grade_id` (String, required): Grade reference
  - `school_class_id` (String): Assigned class section reference
  - `first_name` (String, required): Student first name
  - `last_name` (String, required): Student surname
  - `accession_number` / `learner_number` (String, required): Student ID / Admission number
  - `gender` (String), `dob` (Date)
  - `status` (String, default: `'active'`): `'active'`, `'transferred'`, `'graduated'`, `'inactive'`
  - `parent_ids` (Array of Strings): Linked parent user references
  - `parent_phone` (String): Contact phone for parent matching
  - `created_at`, `updated_at` (DateTime)
- **Relationships:**
  - `belongs_to :school`
  - `belongs_to :grade`
  - `belongs_to :school_class`
  - `has_many :results`
  - `has_many :attendance_records`

### 7.6 `Subject`
Academic subject offered by a school.
- **Fields:**
  - `_id` (ObjectId): Primary Key
  - `school_id` (String, required): School reference
  - `name` (String, required): Subject name (e.g. `"Mathematics"`)
  - `code` (String, required): Subject code (e.g. `"MATH10"`)
  - `department` (String)
  - `is_active` (Boolean, default: `true`)
  - `default_teacher_id` (String): Default teacher reference
  - `created_at`, `updated_at` (DateTime)

### 7.7 `Term`
Academic calendar period.
- **Fields:**
  - `_id` (ObjectId): Primary Key
  - `school_id` (String, required): School reference
  - `academic_year` (Integer, required): Year (e.g. `2025`)
  - `term_number` (Integer, required): Term index (`1`..`4`)
  - `name` (String): Cached term name (e.g., `"Term 1"`)
  - `start_date` (Date, required), `end_date` (Date, required)
  - `created_at`, `updated_at` (DateTime)

### 7.8 `TimetableEntry`
Weekly class timetable slot.
- **Fields:**
  - `_id` (ObjectId): Primary Key
  - `school_id` (String, required)
  - `grade_id` (String, required)
  - `school_class_id` (String, required)
  - `subject_id` (String, required)
  - `teacher_id` (String, required)
  - `academic_year` (String, required)
  - `day_of_week` (Integer, required): `0` (Mon) .. `6` (Sun)
  - `start_minute` (Integer, required): Minutes from midnight (e.g. `540` = 09:00)
  - `end_minute` (Integer, required): Minutes from midnight (e.g. `585` = 09:45)
  - `room` (String)

### 7.9 `Assessment`
Academic evaluation item.
- **Fields:**
  - `_id` (ObjectId): Primary Key
  - `school_id` (String, required)
  - `grade_id` (String, required)
  - `subject_id` (String, required)
  - `term_id` (String, required)
  - `title` (String, required): Assessment name (e.g. `"Mid-Term Exam"`)
  - `max_mark` (Float, default: `100.0`)
  - `weight` (Float, default: `1.0`)
  - `due_date` (Date)
  - `is_published` (Boolean, default: `false`)

### 7.10 `Result`
Marks scored by a learner on an assessment.
- **Fields:**
  - `_id` (ObjectId): Primary Key
  - `assessment_id` (String, required)
  - `learner_id` (String, required)
  - `marks_obtained` (Float, required)
  - `percentage` (Float)
  - `grade_symbol` (String)
  - `comments` (String)
  - `status` (String, default: `'pending'`): `'pending'`, `'approved'`, `'rejected'`

### 7.11 `AttendanceRecord`
Daily/period attendance register log.
- **Fields:**
  - `_id` (ObjectId): Primary Key
  - `school_id` (String, required)
  - `grade_id` (String, required)
  - `school_class_id` (String, required)
  - `learner_id` (String, required)
  - `date` (Date, required)
  - `status` (String, required): `'present'`, `'absent'`, `'late'`, `'excused'`
  - `remarks` (String)
  - `marked_by_id` (String)

### 7.12 `Invitation` / `LearnerInvitation`
Parent/Learner onboarding invitation record.
- **Fields:**
  - `_id` (ObjectId): Primary Key
  - `school_id` (String, required)
  - `grade_id` (String, required)
  - `learner_id` (String)
  - `learner_name` (String), `learner_number` (String)
  - `parent_name` (String), `parent_email` (String), `parent_phone` (String)
  - `invitation_token` (String, required, unique)
  - `status` (String/Integer): `'pending'` (`0`), `'accepted'` (`1`), `'cancelled'` (`2`), `'expired'` (`3`)
  - `sender_id` (String)
  - `sent_at` (DateTime), `expires_at` (DateTime), `accepted_at` (DateTime)

### 7.13 `TeacherInvitation`
Faculty onboarding invitation.
- **Fields:**
  - `_id` (ObjectId): Primary Key
  - `school_id` (String, required)
  - `teacher_email` (String, required)
  - `teacher_phone` (String)
  - `invitation_token` (String, required, unique)
  - `status` (Integer, default: `0`): `0` (pending), `1` (accepted), `2` (declined), `3` (expired), `4` (cancelled)
  - `assigned_grades` (Array of Strings)
  - `invitation_data` (Hash): Additional scope/subject metadata
  - `expires_at` (DateTime)

### 7.14 `Conversation` & `Message`
Real-time messaging channels and chat messages.
- **Conversation Fields:**
  - `_id` (ObjectId): Primary Key
  - `school_id` (String, required)
  - `title` (String)
  - `scope_type` (String, required): `'direct'`, `'class'`, `'grade'`, `'school'`, `'teachers'`, `'self'`
  - `scope_id` (String)
  - `participant_ids` (Array of Strings)
  - `academic_year` (Integer)
  - `term_id` (String)
- **Message Fields:**
  - `_id` (ObjectId): Primary Key
  - `conversation_id` (String, required)
  - `user_id` (String, required): Sender reference
  - `content` (String, required)
  - `sent_as_role` (String): Role active at dispatch (`'parent'`, `'teacher'`, `'admin'`)
  - `attachments` (Array of Hashes): File metadata
  - `reactions` (Hash): Emoji reaction counts
  - `read_by` (Array of Strings): User IDs who read the message

### 7.15 `SupplyRequest`
Teacher inventory requisition log.
- **Fields:**
  - `_id` (ObjectId): Primary Key
  - `school_id` (String, required)
  - `teacher_id` (String, required)
  - `item_name` (String, required)
  - `category` (String)
  - `quantity_requested` (Integer, required)
  - `urgency` (String, default: `'medium'`): `'low'`, `'medium'`, `'high'`, `'urgent'`
  - `status` (String, default: `'pending'`): `'pending'`, `'approved'`, `'rejected'`, `'fulfilled'`
  - `admin_notes` (String)
  - `approved_at` (DateTime), `fulfilled_at` (DateTime)

### 7.16 `Transaction` & `Account`
Billing and subscription records.
- **Transaction Fields:**
  - `_id` (ObjectId): Primary Key
  - `user_id` (String, required), `school_id` (String, required)
  - `amount` (Float, required)
  - `status` (String): `'pending'`, `'completed'`, `'failed'`, `'refunded'`
  - `transaction_type` (String): `'payment'`, `'refund'`, `'fee'`
  - `reference_number` (String), `payment_method` (String)
  - `payment_gateway_response` (Hash)

---

## 8. API Reference

| Method | Endpoint Path | Purpose | Parameters / Payload | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/invitations` | Create single learner invite | `{ school_id, grade_id, learner_id, parent_phone, parent_name, sender_id }` | Admin Token |
| **POST** | `/api/v1/invitations/bulk_create` | Create bulk learner invites | `{ school_id, grade_id, invitations: [...] }` | Admin Token |
| **GET** | `/api/v1/invitations` | List school invitations | `?school_id=...&status=...&role=...` | Admin Token |
| **POST** | `/api/v1/invitations/:token/resend` | Resend invitation | Path token | Admin Token |
| **POST** | `/api/v1/invitations/:token/cancel` | Cancel invitation | Path token | Admin Token |
| **POST** | `/api/v1/invitations/:token/admin_accept` | Admin manually accepts invite | Path token | Admin Token |
| **GET** | `/api/v1/invitations/:token/verify_with_details` | Unauthenticated token check | Path token | None (Public) |
| **POST** | `/api/v1/invitations/match_by_phone` | Reconcile parent phone to learners | `{ phone_number }` | Parent Token |
| **PATCH** | `/api/v1/users/update_profile` | Update user profile details | `{ title, first_name, surname, phone, email }` | User Token |
| **GET** | `/api/v1/users/schools` | List schools for user | `?auth0_id=...` | User Token |
| **POST** | `/api/v1/users/:id/add_role` | Assign role to user in school | `{ role, school_id }` | Admin Token |
| **GET** | `/api/v1/schools/:id` / `:slug` | Fetch school details | Path ID or Slug | Authenticated |
| **GET** | `/api/v1/schools/:id/learners` | List all learners in school | Path school ID | Authenticated |
| **POST** | `/api/v1/schools/:id/learners/promote` | Promote learners to new grade | `{ source_academic_year, destination_academic_year, source_grade_id, destination_grade_id, learner_ids }` | Admin Token |
| **GET/POST**| `/api/v1/schools/:id/grades` | List / Create grades | `{ name, level, code }` | Admin Token |
| **GET/POST**| `/api/v1/classes` | List / Create class sections | `{ school_id, grade_id, name, capacity, class_teacher_id }` | Admin Token |
| **POST** | `/api/v1/classes/:id/assign_teacher` | Assign form teacher to class | `{ teacher_id }` | Admin Token |
| **GET/POST**| `/api/v1/subjects` | List / Create subjects | `{ school_id, name, code, department }` | Admin Token |
| **GET/POST**| `/api/v1/terms` | List / Create calendar terms | `{ school_id, academic_year, term_number, start_date, end_date }` | Admin Token |
| **GET/POST**| `/api/v1/timetable_entries` | List / Create timetable slots | `{ school_id, grade_id, school_class_id, subject_id, teacher_id, day_of_week, start_minute, end_minute }` | Admin Token |
| **GET** | `/api/v1/attendance/register` | Get class attendance register | `?school_id=...&grade_id=...&class_id=...&date=...` | Educator Token |
| **POST** | `/api/v1/attendance/bulk_mark` | Record class attendance | `{ school_id, date, records: [{ learner_id, status }] }` | Educator Token |
| **GET/POST**| `/api/v1/assessments` | List / Create assessments | `{ school_id, grade_id, subject_id, term_id, title, max_mark }` | Educator Token |
| **POST** | `/api/v1/results/bulk_record` | Record assessment results | `{ assessment_id, results: [{ learner_id, marks_obtained }] }` | Educator Token |
| **GET** | `/api/v1/results/report_card` | Generate learner report card | `?learner_id=...&term_id=...` | Authenticated |
| **GET/POST**| `/api/v1/conversations` | List / Create message channels | `{ conversation: { school_id, title, scope_type, scope_id } }` | Authenticated |
| **POST** | `/api/v1/conversations/:id/messages` | Send message in channel | `{ message: { content, attachments, user_id, school_id } }` | Authenticated |
| **GET/POST**| `/api/v1/supply_requests` | List / Create supply requests | `{ school_id, item_name, quantity_requested, urgency }` | Educator Token |
| **PATCH** | `/api/v1/supply_requests/:id/approve` | Approve supply requisition | Path ID | Admin Token |
| **PATCH** | `/api/v1/supply_requests/:id/reject` | Reject supply request | `{ admin_notes }` | Admin Token |
| **PATCH** | `/api/v1/supply_requests/:id/fulfill` | Mark supply fulfilled | Path ID | Admin Token |
| **POST** | `/api/whatsapp-business/send-bulk` | Bulk WhatsApp dispatch | `{ personalizedMessages: [{ phone, message, token }] }` | Next.js Local |

---

## 9. User Flows

### 9.1 Admin Learner Invitation & Bulk Onboarding Flow
1. **Initiation:** School Admin logs in and opens Learners CRM (`/admin/[schoolSlug]/learners`).
2. **Selection:** Admin chooses "Invite Parent" (Single) or "Bulk Invite".
3. **Data Entry:** For bulk invite, Admin selects target Grade and imports/pastes learner details with parent phone numbers.
4. **Invitation Creation:** Frontend submits `POST /api/v1/invitations/bulk_create` to Rails backend. Backend returns created invitation records with generated tokens.
5. **WhatsApp Dispatch:** Next.js invokes `/api/whatsapp-business/send-bulk`, formatting localized WhatsApp messages with dynamic magic links (`https://app.../parent/[school_slug]/join?token=TOKEN`).
6. **CRM Status Update:** CRM table displays new invitations in `pending` state.

### 9.2 Parent Onboarding & Learner Reconciliation Flow
1. **Access:** Parent receives WhatsApp message and clicks magic link token.
2. **Token Verification:** Next.js frontend calls `GET /api/v1/invitations/:token/verify_with_details` to preload school and learner details.
3. **Profile Setup:** Parent completes profile details (First Name, Surname, Phone Number).
4. **Reconciliation:** Next.js submits `POST /api/v1/invitations/match_by_phone` using normalized phone number. Backend matches phone against invitations database and associates matching `Learner` records with Parent's `User` account.
5. **Fee Payment & Completion:** Parent accepts school terms, selects subscription tier, completes PayFast payment flow, and lands on Parent Dashboard (`/parent/[school_slug]/dashboard/[email]`).

### 9.3 Teacher Onboarding & Faculty Integration Flow
1. **Invitation:** Admin invites teacher via Teachers CRM (`/admin/[schoolSlug]/teachers`), specifying assigned grades/subjects.
2. **Acceptance:** Teacher receives WhatsApp/Email invitation link and logs in via Auth0.
3. **Profile Setup:** Teacher updates profile details and credentials.
4. **Access Grant:** Backend assigns `teacher` role and maps assigned grades/classes.
5. **Teacher Portal Access:** Teacher lands on Teacher Portal (`/teacher/[schoolSlug]`), viewing assigned class rosters and timetable.

### 9.4 Real-Time Communications Flow
1. **Initiation:** Admin or Teacher opens Communications Hub and clicks "New Group".
2. **Scope Selection:** Selects scope type (e.g., Grade 10 or Class 10A). Backend computes participant list automatically.
3. **Channel Creation:** `POST /api/v1/conversations` creates channel and broadcasts ActionCable event.
4. **Messaging:** Participants send messages, attachments, and emoji reactions. ActionCable streams updates in real-time (`ConversationChannel`) to all subscribed clients.

---

## 10. Roles & Permissions Matrix

| Feature / Action | Super Admin | School Admin | Teacher | Parent | Learner |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Provision Schools | **X** | - | - | - | - |
| Single/Bulk Learner Invitations | **X** | **X** | - | - | - |
| Manage Grades, Classes, Subjects | **X** | **X** | - | - | - |
| Run Student Promotions | **X** | **X** | - | - | - |
| Approve / Reject Supply Requests | **X** | **X** | - | - | - |
| Submit Supply Requisitions | **X** | **X** | **X** | - | - |
| Log Daily Class Attendance | **X** | **X** | **X** | - | - |
| Create Assessments & Input Marks | **X** | **X** | **X** | - | - |
| Initiate Scope Group Chat | **X** | **X** | **X** | - | - |
| 1:1 Direct Messaging | **X** | **X** | **X** | **X** | - |
| View Student Report Cards | **X** | **X** | **X** | **X** | **X** |
| Pay Subscription / Fees | - | - | - | **X** | - |

---

## 11. Integrations & Dependencies

### External Integrations
- **Auth0 Identity Platform:** OIDC Authentication, JWT token verification (`@auth0/nextjs-auth0`, Auth0 JWKS endpoint).
- **WhatsApp Business API (Meta Graph API):** Bulk template dispatch (`parent_invitation_2`) with dynamic magic links via Next.js API routes (`pages/api/whatsapp-business/send-bulk.js`).
- **PayFast Payment Gateway:** South African payment processor integration for school fees and parent subscription checkout (`pages/api/create-payment.ts`, `pages/api/payfast/notify.ts`).
- **Twilio / SMS Gateway:** Secondary fallback channel for invitation dispatches (`lib/services/SmsService.ts`).

### Infrastructure & Deployment
- **Database:** MongoDB Atlas / MongoDB Server v6.0+ via Mongoid v8 ODM.
- **Frontend Hosting:** Vercel / Next.js Node server environment.
- **Backend Infrastructure:** Render Cloud Hosting (`render.yaml`) and Kamal Docker Container Deployment (`config/deploy.yml`) running Puma web server on Ruby 3.3.7.

---

## 12. Open Questions & Gaps

1. **Local Next.js Mock API Routes vs. Rails Backend Endpoints:**
   - Next.js includes local API routes for `/api/v1/invitations` and `/api/v1/request_accesses` under `pages/api/v1/` that write directly to a local MongoDB instance. In production, requests are intended to route directly to the Rails API backend via `apiClient`.
2. **Channel Activation Discrepancy:**
   - In UI invitation modals (`app/admin/[schoolSlug]/learners/page.tsx`), SMS and Email channel choices are visibly flagged with a "Coming soon" tag and disabled, forcing all dispatches through WhatsApp Business API.
3. **ActionCable Dynamic Auth Token Renewal:**
   - ActionCable WebSocket connections (`lib/cable.ts`) initialize with bearer tokens passed via query parameters during connection establishment. Token expiration during extended active browser sessions requires explicit re-subscription handling.
4. **Trip Model Unused Endpoints:**
   - Rails backend contains a `Trip` model (`app/models/trip.rb`) and routes, but frontend UI views for school field trips remain unlinked in primary navigation tabs.

---

## 13. Appendix: Route & File Inventory

### 13.1 Frontend App & Pages Inventory
- `app/admin/[schoolSlug]/layout.tsx` - Admin Portal Layout Shell (Sidebar, Header, Context)
- `app/admin/[schoolSlug]/page.tsx` - Admin Overview Dashboard
- `app/admin/[schoolSlug]/learners/page.tsx` - Learners CRM, Invitations, Academic Modules, Timetables, Reports
- `app/admin/[schoolSlug]/teachers/page.tsx` - Teachers CRM, Faculty Invitations, Supply Requisitions Hub
- `app/admin/[schoolSlug]/communications/page.tsx` - Admin Real-time Communications Workspace
- `app/admin/[schoolSlug]/settings/page.tsx` - School Settings, Terms & Academic Calendar Configuration
- `app/teacher/[schoolSlug]/layout.tsx` - Teacher Portal Layout Shell
- `app/teacher/[schoolSlug]/page.tsx` - Teacher Overview Dashboard & Class Attendance
- `app/teacher/[schoolSlug]/learners/page.tsx` - Teacher Read-Only Class Roster
- `app/teacher/[schoolSlug]/teachers/page.tsx` - Teacher Staff Directory
- `app/teacher/[schoolSlug]/communications/page.tsx` - Teacher Communications Workspace
- `app/teacher/[schoolSlug]/supply-requests/page.tsx` - Teacher Supply Requisitions Submission & History
- `pages/parent/[school_slug]/join.tsx` - Parent Invitation Landing & Onboarding Gateway
- `pages/parent/[school_slug]/dashboard/[email]/index.tsx` - Parent Overview Dashboard
- `pages/parent/[school_slug]/dashboard/[email]/academics.tsx` - Parent Student Academics & Report Cards
- `pages/parent/[school_slug]/dashboard/[email]/attendance.tsx` - Parent Attendance Logs
- `pages/parent/[school_slug]/dashboard/[email]/communications.tsx` - Parent Teacher Communications
- `pages/parent/[school_slug]/dashboard/[email]/premium.tsx` - Parent Subscriptions & Fee Payments

### 13.2 Backend Controllers Inventory
- `Api::V1::InvitationsController` - Learner/Parent Invitation Management & Phone Reconciliation
- `Api::V1::LearnerInvitationsController` - Bulk Invitation Processing
- `Api::Public::InvitationsController` - Unauthenticated Magic Link Token Verification
- `Api::V1::UsersController` - User Profile Updates & Role Assignment
- `Api::V1::SchoolsController` - School Provisioning & Student Rosters
- `Api::V1::GradesController` - Academic Grades Management
- `Api::V1::ClassesController` - Class Section CRUD & Teacher Assignment
- `Api::V1::SubjectsController` - Subject Catalog CRUD
- `Api::V1::TermsController` - Terms & Academic Calendar Configuration
- `Api::V1::TimetableEntriesController` - Weekly Schedule Slot Allocations
- `Api::V1::AttendanceController` - Class Attendance Register & Summaries
- `Api::V1::AssessmentsController` - Assessment Item Creation & Management
- `Api::V1::ResultsController` - Mark Entries, Bulk Recording & Report Cards
- `Api::V1::ConversationsController` - Scope-based Chat Channel Management
- `Api::V1::MessagesController` - Real-time Chat Message Dispatch
- `Api::V1::SupplyRequestsController` - Teacher Supply Requisition Triage
- `Api::V1::TransactionsController` - Fee Transactions & Payment Gateway Callbacks
