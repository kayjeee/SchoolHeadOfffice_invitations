# School Management Hierarchy - Phase 1 Implementation

## Overview
This phase implements a modern, interactive interface for managing the academic hierarchy of a school, moving from flat tables to a modular grid system with accordion-enhanced details.

## Features
- **Dynamic Hierarchy**: Visual representation of Grades and nested Classes.
- **Accordion Expansion**: Interactive drawers reveal class-level details, including learner capacity and teacher assignments.
- **Real-time Capacity Tracking**: Visual progress bars highlighting classroom occupancy with warning states for violations.
- **Management Modals**:
  - **Teacher Assignment**: Configure roles (Class/Subject Teacher) and select multi-subject scopes.
  - **Learner Transition**: Move students between classes with single-click execution.
- **Global Search**: Integrated top-nav lookup for Learners, Teachers, and Classes.

## Architecture
### Frontend Components (`components/admin/grades/`)
- `GradeCard.tsx`: Orchestrates the grade-level view and accordion logic.
- `ClassCard.tsx`: Renders class-specific metrics and assignments.
- `TeacherAssignmentModal.tsx`: Accessible dialog for staff allocation.
- `LearnerTransitionModal.tsx`: Accessible dialog for student movement.

### API Layer
- **Client**: `lib/api/school-api.ts` extended with:
  - `getGrades(schoolId)`
  - `getClasses(gradeId)`
  - `assignTeacher(classId, data)`
  - `transitionLearner(learnerId, data)`
- **Proxy Routes**: `pages/api/admin/` provides secure Auth0-verified endpoints:
  - `/api/admin/grades`
  - `/api/admin/classes`
  - `/api/admin/assign-teacher`
  - `/api/admin/transition-learner`

## Data Flow
1. Admin navigates to `/admin/[schoolSlug]/grades`.
2. Frontend calls `SchoolAPI.getGrades` via the `pages/api/admin/grades` proxy.
3. Proxy verifies Auth0 session and forwards request to the internal Rails API (`GET /api/v1/schools/[id]/grades`).
4. Data is hydrated into the responsive grid cards.
5. Expanding a Grade reveals Classes with their respective metrics.
6. Action triggers (Assign/Transition) call respective POST proxies to update the backend state.

## Theme & UI
- **Accent Color**: `#059669` (School Primary)
- **Library**: Tailwind CSS + Framer Motion + Radix UI
- **Icons**: Lucide React

## Development
To run the project in development mode:
```bash
npm run dev
```

To build the project:
```bash
npm run build
```
