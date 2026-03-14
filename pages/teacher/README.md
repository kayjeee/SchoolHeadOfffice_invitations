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

## Tech Stack

- **Frontend**: Next.js (Hybrid Pages/App Router).
- **Authentication**: Auth0 via `@auth0/nextjs-auth0`.
- **Database**: MongoDB (Engagement System) and core Rails API (Primary Data).
- **Styling**: Tailwind CSS.
