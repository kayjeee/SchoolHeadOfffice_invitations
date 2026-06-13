# Grades Management Interface

This directory contains the components for the School Management Hierarchy Interface, specifically for managing grades, classes, and learner allocations.

## Key Components

### `GradeCard.tsx`
The primary unit for grade-level management. It features an accordion design that expands to reveal classes.
- **Features**: Grade metadata, class list, and unassigned learners panel.
- **Interactions**: Acts as a container for class-level actions.

### `ClassCard.tsx`
Represents individual class sections (e.g., 9A, 9B).
- **Features**: Capacity tracking via dynamic progress bars, teacher assignments, and learner list.
- **Drag & Drop**: Acts as a **Drop Target** for learners. Highlighted visually when a learner is dragged over.

### `LearnersSidebar.tsx`
A stateful sidebar providing a centralized view of all school learners.
- **Features**:
  - Tabs for **Unassigned** vs **Assigned** learners.
  - Grade-level filtering.
  - Parent invitation status badges.
- **Drag & Drop**: Acts as the **Drag Source** for unassigned learners.

### `BulkUploadModal.tsx`
A high-performance wrapper around the onboarding CSV parser.
- **Usage**: Triggered via the "Import Learners" button in the header or sidebar.
- **Features**: CSV drag-and-drop, field mapping, and bulk backend insertion.

### `Modals/`
- `GradeModal.tsx`: CRUD for grade levels.
- `TeacherAssignmentModal.tsx`: Role-based teacher allocation (Class vs Subject).
- `LearnerTransitionModal.tsx`: Quick shifting of learners between classes.

## State & Data Flow
The interface uses a combination of **SWR** (for data fetching) and **Optimistic Updates** (for learner allocation) to ensure a zero-latency feel.

1. **Allocation**: When a learner is dropped onto a `ClassCard`, the `onAllocateLearner` handler in `page.tsx` is triggered.
2. **Optimistic Update**: The UI immediately moves the learner and updates capacity counters.
3. **API Sync**: A background request is sent to `POST /api/v1/.../move_learner`.
4. **Revalidation**: Data is refetched to ensure consistency with the backend.

## Styling
Components strictly adhere to the school's theme identity:
- **Primary Color**: Emerald (#059669) for primary actions and accents.
- **Secondary Colors**: Slate for text/borders, Amber for warnings/pending states.
