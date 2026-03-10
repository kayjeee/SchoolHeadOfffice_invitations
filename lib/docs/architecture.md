# Architecture Documentation - Teacher Engagement System

## Overview
The Teacher Engagement System is a ClassDojo-like platform integrated into the SchoolHeadOffice ecosystem. It leverages Next.js App Router for a modern, server-centric architecture with MongoDB for flexible data storage.

## Architecture Decisions

### 1. Next.js App Router
- **Server Components**: Used by default for data fetching to reduce client-side bundle size.
- **Server Actions**: Used for all mutations (creating classes, awarding points, posting stories) to provide a seamless, type-safe interface between client and server.
- **Dynamic Routing**: Implementation of `[schoolSlug]` and `[inviteToken]` for multi-tenant isolation and secure entry points.

### 2. Multi-tenancy
- **Tenant Isolation**: Every document in MongoDB includes a `schoolId`. All queries must filter by `schoolId` to prevent cross-tenant data leakage.
- **Contextual Routing**: Routes are nested under `[schoolSlug]` to maintain context.

### 3. Database: MongoDB
- **Flexible Schema**: Allows for evolving features like portfolios and story posts which might have varied metadata.
- **Indexing**: `schoolId` and `teacherId` will be indexed on all major collections.

### 4. Security
- **Invite Tokens**: Hashed using SHA-256 before storage. Verification involves hashing the incoming token and comparing it with the stored hash.
- **RBAC**: Middleware and Server Actions will verify user roles (Admin, Teacher, Parent).
- **Zod Validation**: All inputs (API and Server Actions) are validated against strict Zod schemas.

### 5. AI Extension Layer
- **Decoupled Modules**: AI logic resides in `/lib/ai/`, separated from core business logic.
- **Hooks/Triggers**: Core features provide hooks (e.g., after awarding a point) that can asynchronously trigger AI analysis.

## Logging Strategy
We use a structured logging standard for observability:
`console.log("[FEATURE_NAME_ACTION]", { schoolId, userId, timestamp, metadata })`

### Audit Logs
All sensitive actions (invite generation, role changes, data deletion) are recorded in the `audit_logs` collection.

## Folder Structure
```
/app
  /schools
    /[schoolSlug]
      /teacher
        /invite/[token]    # Invite validation & Onboarding
        /dashboard         # Main dashboard
        /classroom         # Class management
/lib
  /actions                 # Server Actions
  /ai                      # AI extension modules
  /docs                    # Technical documentation
  /models                  # Zod schemas and DB models
  /services                # Business logic
/components
  /teacher                 # UI components
```
