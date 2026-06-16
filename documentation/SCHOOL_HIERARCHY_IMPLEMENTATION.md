# School Management Hierarchy Implementation (Phase 1)

## Overview
This documentation summarizes the architectural decisions, infrastructure improvements, and data normalization strategies implemented during Phase 1 of the School Management Hierarchy interface. The goal was to transform a flat table structure into a modular, resilient, and interactive grid-and-accordion system.

## Key Path: `/admin/[schoolSlug]/grades`

---

## 1. Architectural Architecture & Resilience

### Centralized School Context Resolution
We implemented a strict resolution strategy in the `AdminDashboardLayout` using the `useSchool` hook.
- **Slug to ID Mapping:** The system extracts the `schoolSlug` from the dynamic route and resolves it to a database-safe MongoDB `_id` via `SchoolAPI.getSchoolBySlug`.
- **Strict Match:** We removed unsafe fallbacks (like returning the first available school) to ensure that administrators always operate within the correct school context.
- **Loading & Error Guards:** The layout now handles "Resolving School Context..." states and "School Not Found" errors globally, preventing child components from firing API calls with incomplete data.

### Resilient API Client (`api-client.ts`)
- **Array Integrity:** Fixed a critical bug where array responses were being spread into objects with numeric keys. The client now explicitly identifies and preserves arrays.
- **Request Timeouts:** Added a 15-second timeout to all fetch requests using `AbortController` to prevent the UI from hanging during backend instability.
- **HTML Error Handling:** The client now captures and logs raw HTML error dumps from the Rails backend, preventing "Unexpected token < in JSON" crashes.

---

## 2. Zod Data Normalization (Avoiding Schema Drift)

To handle inconsistencies between production and development databases, we utilized **Zod** as a robust transformation layer. This ensures the frontend remains stable even when the Rails backend changes property casing or nesting.

### Normalization Transforms
Every core model (Grade, Class, Learner, Teacher, Parent) uses `.transform()` to standardize data:
- **Identifier Aliasing:** Automatically maps MongoDB's `_id` to the frontend's expected `id`.
- **Property Casing:** Normalizes both `camelCase` (e.g., `gradeId`) and `snake_case` (e.g., `grade_id`) into a single consistent property.
- **Name Reconstruction:** Safely constructs a unified `name` field from `firstName` and `lastName` if the backend fails to provide a combined string.

### ⚠️ Implementation Alerts to Avoid Future Errors

#### 1. Schema Initialization Order
**Problem:** `ReferenceError: Cannot access 'XSchema' before initialization`.
**Cause:** Referencing a schema (e.g., in a union or array) before it has been defined in the file.
**Solution:** Always define "Leaf" schemas (like `ParentSchema` or `LearnerSchema`) at the top of the file before they are included in "Parent" schemas (like `ClassSchema` or `GradesResponseSchema`).

#### 2. Unions and `.passthrough()`
**Problem:** `TypeError: zod.union(...).passthrough is not a function`.
**Cause:** `.passthrough()` is an object-level method and cannot be called on a `z.union()`.
**Solution:** Apply `.passthrough()` to the individual `z.object()` definitions inside the union:
```typescript
export const MyResponseSchema = z.union([
  z.object({ success: z.boolean(), items: z.array(ItemSchema) }).passthrough(),
  z.object({ success: z.boolean(), data: z.object({ items: z.array(ItemSchema) }).passthrough() }).passthrough()
]);
```

#### 3. Handling Varied Response Shapes
We implemented `GradesResponseSchema` and `LearnersResponseSchema` as unions to support:
- Root-level arrays (`{ learners: [...] }`)
- Nested data objects (`{ data: { learners: [...] } }`)
- Raw arrays (handled via `z.any()` and manual parsing in service methods)

---

## 3. UI/UX Interaction Design

### Dynamic Grid & Accordions
- **Grade Cards:** Summarize learner counts and classes, expanding via `framer-motion` to reveal class streams.
- **Class Cards:** Feature intelligent capacity tracking with color-coded progress bars (Emerald -> Amber -> Red) based on occupancy limits.

### Learner Allocation System
- **Drag-and-Drop:** Admins can drag learners from the global `LearnersSidebar` and drop them onto `ClassCard` targets.
- **Optimistic UI:** The interface updates immediately to show the new allocation, with a rollback mechanism if the API call fails.

### Management Modals
- **Teacher Assignment:** Supports dual roles (Class Teacher vs Subject Teacher) and multi-subject scopes.
- **Learner Transition:** A wizard-based approach to move students between streams within a grade.

---

## 4. Best Practices for Future Extensions

1.  **Always use `useSchoolContext`:** Retrieve the resolved database `schoolId` from context rather than trying to parse the URL slug in every component.
2.  **Strict Schema Parsing:** In `SchoolAPI`, use `Schema.parse(data)` to trigger Zod's transformation layer. Avoid using `as any` which bypasses these safety guards.
3.  **Defensive Mapping:** When adding new fields to `LearnerSchema` or `GradeSchema`, provide a default fallback (e.g., `.default(0)` or `.optional()`) to prevent crashes when the field is missing from old records.
4.  **Backend Proxying:** Use relative paths (e.g., `/api/v1/...`) in API calls. The infrastructure is configured via `next.config.mjs` to proxy these correctly to `127.0.0.1:4000`.
