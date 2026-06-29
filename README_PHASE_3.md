# School Management System - Phase 3 Foundations

## Architecture & Navigation
- Restructured `app/admin/[schoolSlug]` to support a modern, modular dashboard.
- Implemented a collapsible sidebar with "Management Hub" and "Academic Modules".
- Standardized layouts using `PageHeader`, `StatsCard`, and `DashboardSection`.

## Core Modules (Phase 3 Foundation)
1. **Communications Hub**
   - High-fidelity real-time messaging interface.
   - Support for Direct Messages, Group Chats, and Broadcasts.
   - Integration with school directory for contact resolution.
2. **Teacher CRM (Enhanced)**
   - Faceted grid view for faculty management.
   - Detailed slide-over profile drawer with employment, qualifications, and performance data.
3. **Subject Curriculum**
   - CRUD foundation for academic subjects.
   - Analytics for performance trends per subject.
   - Shared curriculum resource repository.
4. **Attendance Tracking**
   - Real-time school presence metrics.
   - Detailed class-level registry status.
   - Automated alerts for at-risk learners based on attendance thresholds.
5. **Classroom Management**
   - Grid and List views for class groups.
   - Capacity tracking with utilization heatmaps.

## Technical Implementation
- **Next.js 15 (App Router)** for all new modules.
- **Framer Motion** for smooth transitions and drawer interactions.
- **Lucide React** for consistent iconography.
- **Tailwind CSS** with a custom green branding system (`school-primary`).
- **Playwright** for E2E verification of new academic modules.

## API Integration & Endpoints (Phase 3)

The following backend endpoints (Rails API v1) are integrated into the Phase 3 modules:

### Communications Hub (`MessagingAPI`)
- `GET /api/v1/conversations` - Fetch user's conversation list.
- `POST /api/v1/conversations` - Create or retrieve a 1-to-1 conversation.
- `GET /api/v1/conversations/:id/messages` - Retrieve message history.
- `POST /api/v1/conversations/:id/messages` - Send a new message (supports attachments & replies).
- `POST /api/v1/conversations/:id/messages/:msg_id/react` - Add emoji reactions.
- `POST /api/v1/conversations/:id/messages/:msg_id/pin` - Pin important messages.
- `POST /api/v1/conversations/:id/messages/:msg_id/star` - Star messages for personal bookmarks.
- `GET /api/v1/messages/starred` - Retrieve all user-starred messages.
- `PUT /api/v1/conversations/:id/read` - Mark all messages in a thread as read.
- `POST /api/v1/conversations/:id/typing` - Broadcast typing status via Action Cable.
- `POST /api/v1/conversations/group_initiation` - Scope-based group creation (Broadcasts, Grades, Classes).
- `GET /api/v1/conversations/:id/messages/search?q=...` - Search within a conversation.

### Teacher & Staff CRM (`SchoolAPI`)
- `GET /api/v1/schools/:school_id/teachers` - List all faculty members with high-level stats.
- `GET /users/:teacher_id` - Detailed teacher profile, qualifications, bio, and performance metrics.
- `POST /api/v1/classes/:class_id/assign_teacher` - Map teachers to classes with specific roles and subjects.

### Learner Lifecycle & CRM (`SchoolAPI`)
- `GET /api/v1/schools/:school_id/learners` - Paginated master roster for the school.
- `GET /api/v1/learners/statistics?school_id=...` - Aggregate data on enrollment, status, and gender.
- `GET /api/v1/learners/:id/history` - Comprehensive timeline of academic and behavioral changes.
- `GET /api/v1/learners/:id/grades` - Historic grade and class placement record.
- `GET /api/v1/learners/search?q=...` - Direct learner search by name or accession number.
- `POST /api/v1/learners/bulk_upload` - Batch ingestion of learner records via JSON.
- `POST /api/v1/schools/:school_id/grades/:grade_id/classes/:class_id/move_learner` - Move student between classes.

### Academic Modules & Hierarchy (`SchoolAPI`)
- `GET /api/v1/schools/:school_id/grades` - Resolve full academic hierarchy (Grades -> Classes).
- `GET /api/v1/grades/:id` - Fetch single grade details and statistics.
- `POST /api/v1/schools/:school_id/grades` - Create a new academic grade level.
- `PATCH /api/v1/grades/:id` - Update grade details or order.
- `DELETE /api/v1/grades/:id` - Remove an academic grade.
- `GET /api/v1/grades/:grade_id/classes` - List all classrooms under a specific grade.
- `GET /api/v1/schools/:school_id/grades/:grade_id/classes/:class_id/learners` - Fetch class-specific student roster.
- `POST /api/v1/schools/:school_id/grades/:grade_id/classes` - Create a new classroom group.
- `PATCH /api/v1/schools/:school_id/grades/:grade_id/classes/:class_id` - Update classroom details.
- `DELETE /api/v1/schools/:school_id/grades/:grade_id/classes/:class_id` - Archive or remove a classroom.

### Global Services
- `GET /api/v1/schools/:school_id/global_search?q=...` - Cross-entity search for learners, teachers, and groups.

## How to Verify
Run the Playwright test suite:
```bash
npx playwright test verify_phase3.spec.ts
```
Captured screenshots:
- `verify_communications.png`
- `verify_teachers_phase3.png`
- `verify_teachers_drawer.png`
- `verify_subjects.png`
- `verify_attendance.png`
