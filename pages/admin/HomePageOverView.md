Home Page Overview

This file defines the main Home page of the application. It manages school-related workflows, user roles, and page layouts for both desktop and mobile users.

Key Responsibilities

Responsive Layout

Detects if the user is on mobile or desktop (isMobile state).

Renders FrontPageLayout (desktop) or FrontPageLayoutMobileView (mobile).

User Authentication & Roles

Uses Auth0 (useUser) to get the logged-in user.

Fetches an access token and retrieves user roles from the Auth0 Management API.

Stores roles in state (userRoles).

School Management

Fetches schools associated with the logged-in user.

Handles loading state (isLoading) and error messages (message).

If no schools are found, prompts user to create a new one.

Multi-Step Workflow (Stepper)
Guides users through creating and validating a school with 4 steps:

Search → AdminSearchPage

Create → CreateSchoolForm

Validate → ValidateSchoolStep

Complete → ReviewSchoolStep

Step navigation handled with Next/Back buttons.

UI updates dynamically to highlight the current step.

Conditional Rendering

If loading → show LoadingSpinner.

If no schools → show stepper workflow or AdminSearchPage.

If schools exist → show SettingsLayout.

Main Components Used

Layouts:
FrontPageLayout, FrontPageLayoutMobileView, SettingsLayout

School Workflow:
AdminSearchPage, CreateSchoolForm, ValidateSchoolStep, ReviewSchoolStep

Helpers/Utilities:
LoadingSpinner, Auth0 (useUser)

High-Level Flow

Detect user & device type.

Fetch user roles and associated schools.

If schools exist → show settings.

If not → walk user through the 4-step school creation workflow.

Display within mobile or desktop layout depending on screen size.

```mermaid
flowchart TD

%% User + Layout Selection
A[User visits Home Page] --> B{Check screen size}
B -- Mobile --> C[FrontPageLayoutMobileView]
B -- Desktop --> D[FrontPageLayout]

%% User + Roles
A --> E[Fetch Auth0 User]
E --> F[Fetch Access Token]
F --> G[Fetch User Roles]
G --> H[Set userRoles in state]

%% Schools
E --> I[Fetch User Schools]
I -->|Schools Found| J[Show SettingsLayout]
I -->|No Schools Found| K{Stepper Workflow}

%% Stepper Workflow
K --> L1[Step 1: AdminSearchPage]
K --> L2[Step 2: CreateSchoolForm]
K --> L3[Step 3: ValidateSchoolStep]
K --> L4[Step 4: ReviewSchoolStep]

%% Loading / Error States
I -->|Loading| M[Show LoadingSpinner]
I -->|Error| N[Show Error Message]

```