# Teacher Portal

The Teacher Portal is a multi-tenant platform designed to help educators manage their classrooms, track learner progress, and communicate with parents.

## Route Structure

- `/teacher/school`: School Browser - Search and discover schools.
- `/teacher/school/[schoolSlug]`: School Detail Page - Information about a specific school, with options to request access or view the parent portal.
- `/teacher/school/[schoolSlug]/teachers/[teacherSlug]/dashboard`: Teacher Dashboard - Main hub for an individual teacher's activities.
- `/teacher/school/[schoolSlug]/teachers/[teacherSlug]/grades/[gradeId]`: Grade Management - Manage a specific class, view learners, and send parent invitations.

## Invitation Flow

1. **Admin Generation**: Invitations are typically generated in the core backend API.
2. **Acceptance**: Teachers receive a magic link (`/schools/[schoolSlug]/teacher/invite/[token]`).
3. **Authentication**: Teachers must sign in via Auth0 to accept the invitation.
4. **Linkage**: Upon acceptance, the Auth0 user is linked to the teacher profile in the backend and the invitation record is updated.

## Key Components

- `AcceptInviteButton`: Handles session checking and invitation acceptance logic.
- `SchoolAPI`: Data fetching for school and teacher-related information.
- `InvitationAPI`: Handles invitation verification and acceptance with the backend.
- `MessagingSection`: Orchestrates the communication UI, toggling between active conversations and the directory.
- `DirectoryList`: Fetches and displays school-wide contacts grouped by role (Admins, Teachers, Parents).
- `ConversationList`: Lists active threads with unread indicators and real-time status updates.

## Phase 2: Two-Way Communication Implementation

Phase 2 introduces robust messaging capabilities between school staff and parents, secured by Auth0.

### 1. Secured API Integration
All communication endpoints are scoped to the authenticated user. The `apiClient` automatically includes the Bearer token for authorized requests, and the backend identifies the `@current_user` directly from the token.

### 2. School Directory
A unified directory component allows teachers to discover and contact:
- **School Admins**: For operational support.
- **Fellow Teachers**: For internal collaboration.
- **Parents**: For student-focused engagement.

**Key Logic**:
- Fetching: `GET /api/v1/schools/:id/directory`
- Initiation: Clicking a contact triggers a check for an existing conversation or creates a new one via `MessagingAPI.createConversation`.

### 3. Messaging Interface & Logic
- **Unread Status**: Conversations in the sidebar feature a pulsing badge showing the `unread_count`.
- **Mark as Read**: Opening a chat window triggers a `PUT /api/v1/conversations/:id/read` request. This updates the read-receipt on the backend and clears the visual notification.
- **Optimistic UI**: Messages appear instantly upon sending, with automatic deduplication when the polled response arrives.
- **AI Integration**: The `MessagingAgent` provides smart context-aware response suggestions based on the last few messages in the thread.

### 4. Robust Dashboard Access (Redirection Logic)
The system implements a resilient lookup strategy to handle multi-tenant slug collisions (e.g., multiple teachers with the same name).
- **Lookup Priority**:
  1. Auth0 Subject ID (`user.sub`)
  2. URL Slug (e.g., `jane-smith-19b1`)
  3. Short ID (Backend fallback)
- **Invitation Flow**: On invitation acceptance, the backend-assigned `teacher_slug` is captured and persisted to ensure stable redirection to the dashboard without authorization loops.

## Technical Inventory (Phase 2 Updates)

### API Layer (`lib/api/`)
- **`api-client.ts`**: Maintained stateless architecture to ensure compatibility between Client Components and Server Actions.
- **`school-api.ts`**:
    - Implemented `getDirectory(schoolId)`: Fetches categorized contacts (Admins, Teachers, Parents).
    - Updated `Teacher` and `Grade` interfaces for better type safety.
- **`invitation-api.ts`**:
    - Enhanced `InvitationSchema` to include `teacher_slug` and `school_name`.
    - Standardized `markAsRead` to use `PUT` method as per updated backend specs.
- **`messaging-api.ts`**:
    - Aligned messaging endpoints with Auth0-scoped backend routes.

### Messaging Components (`components/teacher/messaging/`)
- **`MessagingSection.tsx`**:
    - The primary container for the messaging feature.
    - Implements the state machine for switching between "Chat Mode" and "Directory Mode".
    - Handles the `useEffect` trigger for marking conversations as read on selection.
- **`DirectoryList.tsx`**:
    - **New Component**. Renders contact groups with role-based icons (Shield for Admins, Graduation Cap for Teachers, Users for Parents).
    - Supports real-time filtering/searching of the school directory.
- **`ConversationList.tsx`**:
    - Added pulsing notification badges that calculate unread status from the backend `unread_count`.
    - Integrated a "New Message" entry point that launches the Directory.
- **`ChatWindow.tsx`**:
    - Enhanced with 'New Messages' visual delimiters and framer-motion animations.

### Dashboard & Navigation (`pages/teacher/` & `components/teacher/`)
- **`dashboard.tsx` (Page)**:
    - **Critical Update**: Re-engineered the teacher lookup algorithm. It now performs a primary match on `auth0_id` from the session, treating the URL slug as a secondary hint. This prevents "Access Denied" loops caused by name collisions in multi-tenant environments.
- **`DashboardClient.tsx`**:
    - Propagated `schoolId` to child components to enable contextual directory lookups.
- **`AcceptInviteButton.tsx`**:
    - Restored stable redirection flow that honors the `teacherSlug` returned from the API response rather than client-calculated values.

### Server Actions (`lib/actions/`)
- **`inviteActions.ts`**:
    - Updated `acceptTeacherInviteAction` to return full teacher metadata (name, slug, school) to the caller, enabling precise client-side navigation.

## Deep Dive: Messaging Workflow & Logic

### 1. The Unread Notification Cycle
To maintain a high-performance sidebar without complex joins, we utilize the backend's pre-calculated `unread_count`.
- **Display**: Sidebar items monitor `conv.unread_count`. If `> 0`, a pulsing badge is rendered.
- **Trigger**: Upon selecting a conversation, a `PUT` request is dispatched to `/api/v1/conversations/:id/read`.
- **Synchronization**: After the read command succeeds, the client triggers `refreshConvs()` via SWR, which re-fetches the list and clears the badge.

### 2. Multi-Tenant Slug Collision Handling
In a school with multiple staff members named "Jane Smith", the standard slugging mechanism might append unique suffixes (e.g., `jane-smith-19b1`).
- **The Problem**: If a teacher clicks a generic link or the system miscalculates the slug, the dashboard may return a 403/404.
- **The Solution**: The Dashboard Server Component now uses a **Session-First Matching** strategy. It queries all teachers in the school and matches by the Auth0 `sub` first. This guarantees that the authenticated user always reaches their own data, regardless of the slug present in the URL.

### 3. Real-Time Experience (SWR Strategy)
- **Polling**: Active messages are polled every 3 seconds; the conversation list every 5 seconds.
- **Deduplication**: To prevent UI flickering, the `useMessages` hook filters out optimistic local messages only when a server-side message with the same content and sender arrives within a 60-second window.

## File Registry: Phase 2 Updates

| File Path | Description |
| :--- | :--- |
| `lib/api/school-api.ts` | Added `getDirectory` and updated data interfaces. |
| `lib/api/invitation-api.ts` | Enhanced `InvitationSchema` for slugs and updated `markAsRead`. |
| `components/teacher/messaging/DirectoryList.tsx` | **New component** for contact discovery. |
| `components/teacher/messaging/MessagingSection.tsx` | Integrated directory and read-receipt triggers. |
| `components/teacher/messaging/ConversationList.tsx` | Implemented pulsing unread badges. |
| `pages/teacher/school/.../dashboard.tsx` | Re-engineered lookup logic to fix slug collisions. |
| `lib/actions/inviteActions.ts` | Optimized invitation metadata return values. |
| `components/teacher/DashboardClient.tsx` | Propagated school context to messaging components. |
| `lib/api/api-client.ts` | Maintained statelessness for Server Action compatibility. |

## Tech Stack

- **Frontend**: Next.js (Hybrid Pages/App Router).
- **Authentication**: Auth0 via `@auth0/nextjs-auth0`.
- **Database**: MongoDB (Engagement System) and core Rails API (Primary Data).
- **Styling**: Tailwind CSS.
