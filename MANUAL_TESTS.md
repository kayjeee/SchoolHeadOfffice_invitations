# Manual Test Steps for Parent Magic Link Onboarding

This document outlines the manual testing steps to verify the parent magic link onboarding flow.

## Prerequisites

1.  An invitation token for a parent. This can be generated from the admin dashboard.
2.  The school slug for the school the parent is being invited to.

## Test Cases

### 1. New User Onboarding Flow

1.  **Construct the magic link URL:**
    -   Format: `/parent/[school]/join?token=[token]`
    -   Example: `/parent/kamohighschool/join?token=12345`
2.  **Visit the magic link.**
    -   You should be redirected to `/parent?token=12345&school=kamohighschool`.
3.  **Verify the `AuthGate` component:**
    -   The component should display "You're Invited!" and the school and learner's name.
    -   Click "Accept & Continue".
4.  **Auth0 Login/Signup:**
    -   You should be redirected to the Auth0 login page.
    -   Create a new account.
5.  **Redirect back to the app:**
    -   After successful signup, you should be redirected back to the app.
    -   The URL should still contain the `token` and `school` query parameters.
6.  **Verify `sessionStorage`:**
    -   Open the browser's developer tools and check `sessionStorage`.
    -   There should be a key named `sho_invitation` with a JSON object containing the invitation data.
7.  **Onboarding Flow:**
    -   The onboarding flow should be displayed.
    -   The "Invitation detected" banner should be visible.
    -   The parent's phone number and the learner's name should be pre-filled.
    -   The school should be pre-selected and read-only.
8.  **Complete the onboarding flow:**
    -   Fill in the remaining fields and complete all the steps.
9.  **Verify invitation claim:**
    -   After completing the final step, the `InvitationService.claim()` method should be called.
    -   The `sho_invitation` key in `sessionStorage` should be removed.
10. **Verify dashboard:**
    -   You should be redirected to the parent dashboard.

### 2. Existing User Onboarding Flow

1.  **Log in to the app as an existing parent.**
2.  **Construct the magic link URL:**
    -   Format: `/parent?token=[token]`
    -   Example: `/parent?token=12345`
3.  **Visit the magic link in the same browser session.**
4.  **Verify the redirect:**
    -   You should be redirected to `/parent?token=12345&start_onboarding=true`.
5.  **Verify `sessionStorage`:**
    -   Open the browser's developer tools and check `sessionStorage`.
    -   There should be a key named `sho_invitation` with a JSON object containing the invitation data.
6.  **Onboarding Flow:**
    -   The onboarding flow should be displayed.
    -   The "Invitation detected" banner should be visible.
    -   The parent's phone number and the learner's name should be pre-filled.
    -   The school should be pre-selected and read-only.
7.  **Complete the onboarding flow:**
    -   Fill in the remaining fields and complete all the steps.
8.  **Verify invitation claim:**
    -   After completing the final step, the `InvitationService.claim()` method should be called.
    -   The `sho_invitation` key in `sessionStorage` should be removed.
9.  **Verify dashboard:**
    -   You should be redirected to the parent dashboard.

### 3. Edge Cases

1.  **Invalid Token:**
    -   Visit a magic link with an invalid or expired token.
    -   You should see an error message: "Invalid or expired invitation link."
2.  **Missing Token:**
    -   Visit `/parent` without a token.
    -   You should be redirected to the login page.
3.  **Auth0 Login Failure:**
    -   Intentionally fail the Auth0 login (e.g., by entering the wrong password).
    -   You should see a friendly error message on the Auth0 login page.
