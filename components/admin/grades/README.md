# Grades Management Interface

This directory contains the components for the School Management Hierarchy Interface, specifically for managing grades, classes, and learner allocations.

## Key Components

### `GradeCard.tsx`
The primary unit for grade-level management. It features an accordion design that expands to reveal classes.
- **Features**: Grade metadata, class list.
- **Dynamic Fetching**: On expand, it triggers a fetch for classes under that specific grade if they haven't been loaded.

### `ClassCard.tsx`
Represents individual class sections (e.g., 9A, 9B).
- **Features**: Capacity tracking via dynamic progress bars (Emerald -> Amber -> Red), teacher assignments, and learner list.
- **Drag & Drop**: Acts as a **Drop Target** for learners. Highlighted visually when a learner is dragged over.

### `LearnersSidebar.tsx`
A dedicated, stateful sidebar on the right side of the main grid.
- **Features**:
  - Tabs for **Unassigned** vs **All Learners**.
  - Search by name or accession number.
  - Grade-level filtering dropdown.
  - Parent invitation status badges ("Accepted", "Pending", "No Parent").
- **Drag & Drop**: Acts as the **Drag Source** for unassigned learners.

### `BulkUploadModal.tsx`
A high-performance wrapper around the onboarding CSV parser.
- **Usage**: Triggered via the "Import" button in the sidebar header.
- **API**: Sends records to `POST /api/v1/learners/bulk_upload`.

### `LearnerTransitionModal.tsx`
A 2-step wizard for shifting learners between classes within the same grade.
- **Step 1**: Search and select learner from the grade roster.
- **Step 2**: Select target class stream.
- **Action**: Dispatches `onTransition` callback which triggers `move_learner` API.

## State & Data Flow
The interface follows a **Single-Fetch Strategy** for global school data combined with **On-Demand Hydration** for nested resources.

1. **Initialization**: `page.tsx` fetches all school learners and grades once on mount.
2. **Expansion**: `GradeCard` fetches its own classes when expanded.
3. **Allocation**: Dragging a learner from `LearnersSidebar` to `ClassCard` triggers an **Optimistic Update**.
4. **Optimistic Update**:
   - `allLearners` state is updated to set the new `class_id`.
   - `grades` state is updated to increment the `current_learners` of the target class.
   - UI reflects the move immediately while the API request (`move_learner`) runs in the background.

## Styling & UX
- **Theme**: Strictly uses the school emerald primary color (#059669).
- **Animations**: `framer-motion` for accordion transitions and layout shifts.
- **Feedback**: `react-hot-toast` for success/error notifications.
