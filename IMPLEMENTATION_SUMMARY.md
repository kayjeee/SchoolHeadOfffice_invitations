# Phase 1: School Management Hierarchy Interface

## Overview
This phase delivers a modern, interactive academic management interface for administrators, replacing legacy flat tables with a responsive, accordion-based grid system.

## Key Deliverables

### 1. Interactive Hierarchy Interface
- **Path**: `/admin/[schoolSlug]/grades`
- **Grid-First Design**: Grades are presented as high-level summary cards.
- **Accordion Logic**: Expanding a Grade card reveals nested Class cards using `framer-motion` for smooth transitions.
- **Dynamic Branding**: The interface utilizes the school's primary color (`#059669`) for all active states, progress bars, and call-to-action triggers.

### 2. Class-Level Intelligence
- **Capacity Tracking**: Visual progress bars show real-time occupancy.
- **Violation Alerts**: Warning states trigger when a class exceeds its capacity limit.
- **Staffing Blocks**: Displays the assigned Class Teacher and a summary of Subject Teachers.

### 3. Management Operations
- **Teacher Assignment**: A dedicated modal for allocating staff as either Class or Subject Teachers, with support for multi-subject scoping.
- **Learner Movement**: A transition modal that allows moving students between class structures with a single click.
- **Global Search**: A stateful, debounced top-nav search that categorizes results into Learners, Teachers, and Classes.

## Technical Alignment

### API & Data Flow
- **Proxy Architecture**: Client-side calls are routed through secure Next.js API routes (`/api/admin/*`) which handle Auth0 session verification and forward requests to the internal Rails API.
- **Unified ID Handling**: Components and API methods are designed to handle both standard IDs and MongoDB BSON ObjectIDs.
- **Real-time Feedback**: Integrated `react-hot-toast` for optimistic UI feedback on all administrative actions.

### Schema Alignment
- **Teacher Assignment**: Target payload: `{ teacher_id, role: 'class_teacher' | 'subject_teacher', subject_ids: [] }`.
- **Learner Movement**: Target endpoint `/learners/[id]/move` with payload `{ target_class_id }`.
- **Global Search**: Unified response format handling categorized results with metadata.

## Verification
- **Visual**: Verified responsive layouts and branding consistency.
- **Functional**: Validated modal triggers, stateful search, and API proxy routing.
- **Build**: Confirmed successful production build and linting.
