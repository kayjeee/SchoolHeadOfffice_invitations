# Step3SendInvites

This project implements a multi-step invitation sending component for selecting learners, choosing communication channels, composing messages, and reviewing results.

## Architecture

```
Step3SendInvites/
├── index.tsx                          # Main container component
├── components/                        # Presentational components
│   ├── LearnerSelection/
│   │   ├── index.tsx                 # Learner selection interface
│   │   ├── LearnerCard.tsx           # Individual learner card
│   │   └── GradeFilter.tsx           # Grade filtering component (placeholder)
│   ├── ChannelSelection/
│   │   └── index.tsx                 # Communication channel selection
│   ├── MessageComposer/
│   │   └── index.tsx                 # Message composition interface
│   ├── InviteResults/
│   │   ├── index.tsx                 # Results overview
│   │   ├── InviteCard.tsx            # Individual invite status card (placeholder)
│   │   └── BulkActions.tsx           # Bulk operation controls (placeholder)
│   └── UI/
│       ├── Icon.tsx                  # Icon component (placeholder)
│       ├── LoadingState.tsx          # Loading state indicator
│       └── ErrorState.tsx            # Error state display
├── hooks/                             # Custom React hooks
│   ├── useLearnerData.ts             # Learner data management (fetching grades and learners)
│   ├── useInviteManagement.ts        # Invite operations (placeholder for sending invites)
│   ├── useFormState.ts               # Form state management (placeholder)
│   └── useStepValidation.ts          # Step validation logic
├── services/                          # API services
│   ├── inviteService.ts              # Invite-related API calls (mocked)
│   ├── learnerService.ts             # Learner data API calls
│   └── gradeService.ts               # Grade data API calls
├── utils/                             # Utility functions
│   ├── validation.ts                 # Input validation utilities
│   ├── download.ts                   # File download utilities
│   ├── clipboard.ts                  # Clipboard operations
│   └── constants.ts                  # Application constants (e.g., CHANNELS, API_BASE_URL)
├── types.ts                           # TypeScript type definitions
└── README.md                          # This documentation
```

## How to Run (Conceptual)

This is a component, not a standalone application. To run this, you would integrate it into a larger React application.

1.  **Install dependencies**: `npm install` or `yarn install`
2.  **Start your React application**: `npm start` or `yarn start`

Ensure your backend API is running at `http://localhost:4000` as the services are configured to fetch data from there.

## Key Features

*   **Multi-step Form**: Guides the user through grade selection, channel selection, message composition, and results.
*   **Grade and Learner Management**: Fetches and displays grades and associated learners, with selection and expansion capabilities.
*   **Channel Selection**: Allows users to choose communication channels for sending invites.
*   **Message Composition**: Provides an interface for writing the invitation message.
*   **Validation**: Basic validation for form steps.
*   **Modular Design**: Separated into components, hooks, services, and utilities for maintainability and scalability.

## Components Overview

*   **`Step3SendInvites/index.tsx`**: The main orchestrator. Manages the overall step flow and state, delegating rendering to child components.
*   **`LearnerSelection/index.tsx`**: Displays grades and learners, handles selection and expansion. Uses `LearnerCard`.
*   **`LearnerSelection/LearnerCard.tsx`**: Renders individual learner details.
*   **`ChannelSelection/index.tsx`**: Presents communication channels for selection.
*   **`MessageComposer/index.tsx`**: Text area for composing the invitation message.
*   **`InviteResults/index.tsx`**: Placeholder for displaying the summary of sent invites.

## Hooks Overview

*   **`useLearnerData.ts`**: Custom hook for fetching and managing grade and learner data from API services.
*   **`useStepValidation.ts`**: Custom hook for handling validation logic across different steps of the form.

## Services Overview

*   **`gradeService.ts`**: Encapsulates API calls related to fetching grades.
*   **`learnerService.ts`**: Encapsulates API calls related to fetching learners.
*   **`inviteService.ts`**: Placeholder for API calls related to sending invites.

## Utilities Overview

*   **`types.ts`**: Centralized TypeScript type definitions for the application.
*   **`constants.ts`**: Defines application-wide constants like `CHANNELS` and `API_BASE_URL`.
*   **`validation.ts`**: Provides helper functions for input validation.
*   **`download.ts`**: Utility for client-side file downloads.
*   **`clipboard.ts`**: Utility for clipboard operations.

## New Data Flow

The data fetching logic has been refactored to fetch all learners for a school at once, rather than fetching learners for each selected grade. This improves performance by reducing the number of network requests.

```mermaid
graph TD
    A[Step3SendInvites Component] -->|1. on mount| B(useEffect fetches data);
    B --> C{gradeService.getGrades(schoolId)};
    B --> D{learnerService.getLearnersBySchool(schoolId)};
    C --> E[Set Grades State];
    D --> F[Set Learners State];
    E --> G[LearnerSelection Component];
    F --> G;
    G -->|2. User selects grades| H(handleGradeSelection);
    H --> I[Set SelectedGrades State];
    I --> J[UI Updates];
```
