# Admin Login Flow & User Synchronization Fix

## Problem Summary
When an administrator logged in directly at `/admin` (instead of `/`), two critical failures occurred:
1. `GET /api/v1/users/schools?auth0_id=admin-123` returned `404 {"success":false,"error":"User not found"}`.
   - If the client session had not yet completed `useUser()` resolution, `pages/admin/index.js` fell back to a hardcoded placeholder user object `{ sub: 'admin-123', name: 'System Admin', ... }`.
2. School creation (`POST /api/v1/schools`) failed with HTTP 500:
   - Raised at `app/controllers/api/v1/schoolsController.rb:194` in `create` (`User.find_by` with `Mongoid.raise_not_found_error = true`).
   - The `/admin` entry point never registered or synchronized the Auth0 user with the Rails backend MongoDB database upon login, whereas the root `/` path invoked a user registration/check step (`checkAndSaveUser`). Consequently, the user document did not exist in MongoDB when school creation was attempted.

## Root Cause Analysis
- **Missing User Sync on `/admin`**: While `/` (`pages/index.tsx`) registered/verified users via `POST /api/v1/users`, `/admin` (`pages/admin/index.js`) immediately queried `GET /api/v1/users/schools` and `GET /api/v1/users/onboarding_status` without ensuring the user record existed in the database.
- **Hardcoded Placeholder (`admin-123`)**: When `isAuthenticated` was true from SSR but `useUser()` client-side state was still loading or unpopulated, `pages/admin/index.js` injected a mock object containing `sub: 'admin-123'`. This fake ID was sent to `users/schools`.
- **Backend Error Handling in Rails**: `sho_backend_v2` executes `User.find_by(auth0_id: user_id)` in `schoolsController.rb:194`. With `Mongoid.raise_not_found_error` active, a non-existent user record causes an unhandled exception yielding HTTP 500 instead of a descriptive 404/422 response.

## Solution Implemented
1. **Removed Placeholder Fallback**:
   - Removed the hardcoded `admin-123` mock fallback in `pages/admin/index.js`.
   - Guaranteed that operations only proceed when a valid `user?.sub` is resolved from Auth0.
   - Handled session requirements and authentication errors gracefully with clear UI prompts and sign-in links.
2. **Idempotent User Synchronization**:
   - Created `syncUserWithBackend` in `pages/admin/index.js` that checks if the user exists via `GET /api/v1/users/:id`, and if not (HTTP 404), creates the record via `POST /api/v1/users` with the user's authentic `auth0_id`, name, email, and roles.
   - Handled HTTP 422 gracefully as an idempotent success (user already created).
   - Ensured `syncUserWithBackend` runs and completes BEFORE calling `fetchSchools` (`GET /api/v1/users/schools`) or onboarding status.
3. **Provisioning Validation in `schoolService.js`**:
   - Hardened `buildSchoolPayload` and `provisionNewSchool` in `components/Schoolpage/CreateSchoolForm/services/schoolService.js` to assert `user?.sub` is defined.
   - Ensured user creation is checked/ensured prior to `createSchool` (`POST /api/v1/schools`) to guarantee MongoDB contains the user document.
4. **Resilient UI Error Handling**:
   - Added user synchronization loading status (`syncingUser`).
   - If user synchronization or school fetching fails, displayed an error card with a readable message and a "Retry" button rather than a blank screen or unhandled exception.

## Files Changed
- `pages/admin/index.js`: Removed `admin-123` fallback, added `syncUserWithBackend` step before fetching schools/roles, and added error state with retry button.
- `components/Schoolpage/CreateSchoolForm/services/schoolService.js`: Hardened `user.sub` verification in school creation payload and ensured user existence before `POST /api/v1/schools`.
- `docs/ADMIN_LOGIN_FIX.md`: Documentation of root cause, architecture findings, and implemented solution.
