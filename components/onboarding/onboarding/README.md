# Onboarding System Documentation

This document outlines the architecture, usage, and development guidelines for the `components/onboarding` module. This system is designed to provide a flexible and role-based onboarding experience for users, ensuring a clean separation of concerns and adherence to modern React and TypeScript best practices.

## Table of Contents

1.  [Architecture Overview](#architecture-overview)
2.  [How the System Works](#how-the-system-works)
3.  [Adding New Onboarding Steps](#adding-new-onboarding-steps)
4.  [Coding Standards and Best Practices](#coding-standards-and-best-practices)
5.  [API Expectations](#api-expectations)
6.  [Folder Structure](#folder-structure)




## Architecture Overview

The onboarding system follows a clean architecture approach, separating concerns into distinct layers:

-   **UI Components (`components/`)**: Reusable presentational components (e.g., `ProgressIndicator`, `StepNavigation`).
-   **Layouts (`layouts/`)**: Structural components that define the overall page layout for onboarding (e.g., `OnboardingLayout`, `StepLayout`).
-   **Containers (`OnboardingFlow/`)**: Smart components that manage state and logic for specific features, orchestrating UI components and interacting with hooks/services (e.g., `OnboardingFlow`).
-   **Hooks (`hooks/`)**: Custom React hooks encapsulating reusable logic and stateful behavior (e.g., `useOnboardingFlow`, `useOnboardingStatus`, `useStepValidation`).
-   **Services (`services/`)**: Modules responsible for external interactions, primarily API calls and data persistence (e.g., `onboardingService.ts`, `stepProgressService.ts`).
-   **Utilities (`utils/`)**: Pure functions and helper modules for common tasks, data transformations, and configuration (e.g., `stepValidators`, `roleBasedSteps`).
-   **Types (`types/`)**: TypeScript type definitions and interfaces for strong typing throughout the module.
-   **Guards (`OnboardingGuard.tsx`)**: Components responsible for route protection based on onboarding status.

This separation ensures maintainability, testability, and scalability of the onboarding process.




## How the System Works

1.  **`OnboardingGuard.tsx`**: This component acts as a route guard. When a user navigates to a protected route, `OnboardingGuard` checks their onboarding status using `useOnboardingStatus`. If onboarding is not complete, it redirects the user to the `/onboarding` path (or a specified `redirectPath`).

2.  **`OnboardingFlowProvider` (from `useOnboardingFlow.ts`)**: This React Context Provider wraps the entire onboarding flow. It fetches the user's current onboarding status, manages the current step, and provides functions to navigate between steps, mark steps as complete, or skip steps.

3.  **`useOnboardingStatus.ts`**: This hook is responsible for fetching and updating the user's onboarding status from the `onboardingService`. It manages loading states and errors related to status retrieval.

4.  **`onboardingService.ts`**: This service handles all API interactions related to the onboarding status (fetching, updating, completing). It's a mock service in this setup but should be replaced with actual API calls.

5.  **`roleBasedSteps.ts`**: This utility defines all possible onboarding steps (`ONBOARDING_STEPS`) and their associated roles. It provides a function (`getRoleBasedSteps`) to filter steps relevant to a specific user role.

6.  **`stepProgressService.ts`**: This service provides utilities for calculating onboarding progress, determining the next and previous steps, and identifying skippable steps based on the user's role and completed steps.

7.  **`useStepValidation.ts`**: This hook integrates with `stepValidators` to perform client-side validation for individual onboarding steps.

8.  **`OnboardingFlow/index.tsx`**: This is the main container component for the onboarding process. It consumes the `OnboardingFlowContext`, renders the current step component dynamically, and provides navigation controls (`StepNavigation`). It also integrates `ProgressIndicator` and `SkipStepModal`.

9.  **Step Components (e.g., `Step1CreateGrades`)**: Each step is a functional React component responsible for its own UI and logic. It interacts with `useOnboardingFlow` to mark itself as completed when its task is done.

10. **Layouts (`OnboardingLayout`, `StepLayout`)**: These components provide consistent styling and structure for the overall onboarding page and individual step content.

This modular design allows for easy modification, addition, or removal of steps without affecting other parts of the system.




## Adding New Onboarding Steps

Adding a new onboarding step involves a few straightforward modifications:

1.  **Create the Step Component**: In the `OnboardingFlow/` directory, create a new React functional component for your step (e.g., `StepXNewFeature.tsx`). This component should contain the UI and any specific logic for that step. It should call `setStepCompleted("StepXNewFeature")` from `useOnboardingFlow` when its task is finished.

    ```typescript
    // components/onboarding/OnboardingFlow/StepXNewFeature.tsx
    import React from 'react';
    import { useOnboardingFlow } from '../../hooks/useOnboardingFlow';

    const StepXNewFeature: React.FC = () => {
      const { setStepCompleted } = useOnboardingFlow();

      const handleComplete = () => {
        // Logic for completing this step
        setStepCompleted('StepXNewFeature');
      };

      return (
        <div>
          <h3>New Feature Setup</h3>
          <p>Complete the setup for your new feature here.</p>
          <button onClick={handleComplete}>Mark as Complete</button>
        </div>
      );
    };

    export default StepXNewFeature;
    ```

2.  **Update `roleBasedSteps.ts`**: Import your new step component and add it to the `ONBOARDING_STEPS` array. Define its `id`, `name`, `component`, and the `roles` for which this step is relevant.

    ```typescript
    // components/onboarding/utils/roleBasedSteps.ts
    import { OnboardingStep } from "../types";
    // ... other imports
    import StepXNewFeature from "../OnboardingFlow/StepXNewFeature"; // Import your new step

    export const ONBOARDING_STEPS: OnboardingStep[] = [
      // ... existing steps
      {
        id: "StepXNewFeature",
        name: "New Feature Setup",
        component: StepXNewFeature,
        roles: ["admin", "teacher"], // Specify roles that see this step
      },
    ];
    ```

3.  **Add to `OnboardingFlow/index.tsx`**: Add your new step component to the `StepComponents` mapping so the `OnboardingFlow` container can dynamically render it.

    ```typescript
    // components/onboarding/OnboardingFlow/index.tsx
    // ... other imports and step components
    import StepXNewFeature from "./StepXNewFeature"; // Import your new step component

    // Map step IDs to their actual components
    const StepComponents: { [key: string]: React.ComponentType<any> } = {
      // ... existing mappings
      StepXNewFeature,
    };
    ```

4.  **(Optional) Add Validation**: If your step requires client-side validation, add a validation function to `stepValidators.ts` for your new step ID.

    ```typescript
    // components/onboarding/utils/stepValidators.ts
    import { StepValidationResult } from "../types";

    export const stepValidators = {
      async validateStep(stepId: string, data: any): Promise<StepValidationResult> {
        // ... existing cases
        case "StepXNewFeature":
          if (!data || !data.isConfigured) {
            return { isValid: false, errors: { isConfigured: "Please configure the new feature." } };
          }
          break;
        default:
          break;
      },
    };
    ```

By following these steps, you can easily extend the onboarding flow with new functionalities.




## Coding Standards and Best Practices

This module adheres to the following coding standards and best practices:

-   **TypeScript First**: All new code should be written in TypeScript, leveraging its features for type safety and improved developer experience.
-   **Functional Components and Hooks**: Prefer functional React components and utilize hooks for state management and side effects.
-   **Clean Architecture**: Maintain the separation of concerns as outlined in the Architecture Overview. UI, logic, and data fetching should reside in their respective layers.
-   **Modularity**: Components, hooks, services, and utilities should be small, focused, and reusable.
-   **Tailwind CSS**: Styling is handled using Tailwind CSS for utility-first styling. Avoid inline styles where possible.
-   **Context API**: Use React Context for global state management that needs to be accessible by multiple components without prop drilling.
-   **Meaningful Naming**: Use clear and descriptive names for variables, functions, components, and files.
-   **Error Handling**: Implement robust error handling in services and hooks, providing user-friendly feedback.
-   **Performance**: Optimize components for performance, especially in data-intensive parts of the application.
-   **Accessibility**: Ensure all UI components are built with accessibility in mind (e.g., proper ARIA attributes, keyboard navigation).
-   **No Direct DOM Manipulation**: Avoid direct manipulation of the DOM; let React manage the UI.
-   **Avoid Global State Unless Necessary**: Limit the use of global state (Context) to truly global concerns. Prefer local component state or prop drilling for localized data.




## API Expectations

The `onboardingService.ts` interacts with the backend API to manage the user's onboarding status. The following API endpoints and data structures are expected:

### `GET /api/onboarding/status`

**Description**: Fetches the current onboarding status for the authenticated user.
**Request**: No body.
**Response**: `OnboardingStatus` object.

```typescript
interface OnboardingStatus {
  currentStepId: string; // ID of the current active step
  completedSteps: string[]; // Array of IDs of completed steps
  isComplete: boolean; // True if onboarding is fully completed
  role: OnboardingRole; // User's role, influences visible steps
}

type OnboardingRole = 'admin' | 'teacher' | 'student';
```

### `POST /api/onboarding/status`

**Description**: Updates the user's onboarding status. This is typically used to advance steps or mark steps as completed.
**Request Body**: `Partial<OnboardingStatus>`

```typescript
interface PartialOnboardingStatus {
  currentStepId?: string;
  completedSteps?: string[];
  isComplete?: boolean;
}
```

**Response**: Updated `OnboardingStatus` object.

### `POST /api/onboarding/complete`

**Description**: Marks the entire onboarding process as complete for the user.
**Request**: No body.
**Response**: `boolean` (true on success).

**Note**: The current `onboardingService.ts` is a mock implementation using `localStorage`. In a production environment, these API calls should be replaced with actual network requests to your backend.




## Folder Structure

```
components/
└── onboarding/
    ├── OnboardingFlow/             # Main container for the onboarding flow and individual step components
    │   └── index.tsx
    │   └── Step1CreateGrades.tsx   # Example step component
    │   └── Step2UploadLearners.tsx # Example step component
    │   └── Step3SendInvites.tsx    # Example step component
    │   └── StepCompletion.tsx      # Example step component
    ├── components/                 # Reusable UI components
    │   ├── ProgressIndicator.tsx
    │   ├── SkipStepModal.tsx
    │   ├── StatusBadge.tsx
    │   └── StepNavigation.tsx
    ├── hooks/                      # Custom React hooks
    │   ├── useOnboardingFlow.ts
    │   ├── useOnboardingStatus.ts
    │   └── useStepValidation.ts
    ├── layouts/                    # Layout components for onboarding pages
    │   ├── OnboardingLayout.tsx
    │   └── StepLayout.tsx
    ├── services/                   # API interaction and business logic
    │   ├── onboardingService.ts
    │   └── stepProgressService.ts
    ├── types/                      # TypeScript type definitions
    │   └── index.ts
    ├── utils/                      # Utility functions and constants
    │   ├── roleBasedSteps.ts
    │   └── stepValidators.ts
    ├── OnboardingGuard.tsx         # Route guard component
    ├── index.ts                    # Main export file for the module
    └── README.md                   # This documentation file
```


