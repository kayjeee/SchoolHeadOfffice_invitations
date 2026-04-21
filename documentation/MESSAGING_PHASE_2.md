# Teacher Portal Messaging Phase 2: Comprehensive Documentation

This document serves as the primary technical reference for the Phase 2 implementation of the Messaging & Directory system within the SchoolHeadOffice (SHO) Teacher Portal.

## 1. Project Scope & Objectives
Phase 2 focused on transforming a basic messaging prototype into a robust, production-ready communication suite. Key goals included:
- **Zero-Friction Development**: Bypassing complex Auth0 JWT flows in local environments.
- **Data-Driven UI**: Replacing raw database IDs with human-readable names and avatars.
- **Optimized Navigation**: Ensuring teachers can find and message any school contact with a single click.
- **Runtime Stability**: Eliminating crashes caused by asynchronous data mismatches or malformed backend responses.

---

## 2. Technical Architecture & File Map

### Core API Layer
- **`lib/api/api-client.ts`**: The engine of all requests. Refactored to include a global `X-User-Email` header and support for `PUT` operations.
- **`lib/api/messaging-api.ts`**: Handles conversation lifecycles. Updated to include nested `school_id` objects in payloads to satisfy Rails strong parameter requirements.
- **`lib/api/school-api.ts`**: Provides the `getDirectory` service used for school-wide contact discovery.

### State & Authentication
- **`lib/hooks/useApi.ts`**: Synchronizes the logged-in Auth0 user's email with the `apiClient` singleton.
- **`lib/hooks/useMessaging.ts`**: Manages real-time polling (SWR) and optimistic UI updates for messages and conversation lists.

### Intelligent Components
- **`components/teacher/messaging/MessagingSection.tsx`**: The main orchestrator. Logic includes:
    - **Directory cross-referencing**: Resolves participant names by mapping conversation IDs to directory contacts.
    - **View State Management**: Controls transitions between the sidebar, directory, and active chat.
- **`components/teacher/messaging/DirectoryList.tsx`**: Grouped display of Admins, Teachers, and Parents with unique keying and duplicate prevention.
- **`components/teacher/messaging/ConversationList.tsx`**: Sidebar component with pulsing unread badges and search filtering.
- **`components/teacher/messaging/MessageInput.tsx`**: Input field with auto-focus logic and typing indicator support.

---

## 3. Key Implementation Logic

### A. The "Contact" Name Resolution Strategy
**The Problem**: The backend often returns conversations with only participant IDs (e.g., `["6979...", "69c1..."]`), leading the UI to display "Contact" or "Unknown".
**The Fix**:
1. `MessagingSection` fetches the entire school directory on mount and creates a memoized `contactMap`.
2. A `resolvedParticipants` selector cross-references conversation IDs against this map.
3. The UI now dynamically injects the correct Name, Role, and Avatar into the chat header and sidebar entries.

### B. Conditional Navigation & Layout Logic
To prevent the "Double Directory" render and ensure a smooth UX, we implemented a prioritized rendering stack in `MessagingSection.tsx`:
1. **If `activeConvId` is set**: Show `ChatWindow` (Main) + `ConversationList` (Sidebar).
2. **Else if `showDirectory` is true**: Show `DirectoryList` (Main) + `ConversationList` (Sidebar).
3. **Default**: Show `EmptyState` with navigation CTAs.

### C. Authentication Bypass (Development Mode)
To eliminate `401 Unauthorized` errors during feature development:
- The `apiClient` checks for a `userEmail` property.
- If present, it automatically injects `X-User-Email: kagiso.killagram@gmail.com`.
- This allows the Rails backend to skip JWT signature checks while still correctly identifying the current user context.

### D. Defensive Data Hardening
Implemented "Crash-Proof" patterns across the messaging stack:
- **Null Guards**: Every `.find()` or `.map()` operation is preceded by an `Array.isArray()` or null check.
- **ID Normalization**: Comparisons use `id.toString()` to handle both plain strings and BSON object representations from the database.
- **Fallback UI**: Conversations with missing participants are filtered out of the list rather than allowing the application to throw a `TypeError`.

---

## 4. UI/UX Features
- **Pulsing Notifications**: Unread messages trigger an `animate-pulse` badge with a `shadow-primary-accent/20` glow.
- **Auto-Focus Workflow**: Clicking "Message" in the directory opens the chat and immediately focuses the text input for instant typing.
- **Categorized Search**: Directory results are grouped by role (Lucide icons: Shield, GraduationCap, Users) and searchable in real-time.
