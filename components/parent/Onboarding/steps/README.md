# Parent Onboarding: Learner Selection Components

This directory contains the React components responsible for the "Link Your Children" step in the parent onboarding flow.

## Overview

The primary goal of this feature is to allow a parent to view a list of learners potentially associated with them, manually add learners by their unique learner number, and confirm their selection to proceed with onboarding.

The flow is managed by three main components:
1.  `LearnerSelection.tsx`: The main container component for the step.
2.  `LearnerCard.tsx`: A reusable card to display individual learner information.
3.  `LearnerDetailsModal.tsx`: A modal dialog to show detailed information for a learner.

---

## Components

### 1. `LearnerSelection.tsx`

This is the primary component for the `LINK_LEARNERS` step in the parent onboarding process. It orchestrates the display of learners, handles user interactions like searching and adding learners, and manages the selection state.

#### State Management

-   It uses the `useParentOnboarding` hook to get the list of learners and access functions for linking/unlinking them.
-   Local state is used to manage the search query, the list of selected learner IDs, the visibility of the "add learner" form, and the state of the details modal.

#### Props

| Prop         | Type                             | Description                                            |
| ------------ | -------------------------------- | ------------------------------------------------------ |
| `onComplete` | `(selectedLearnerIds: string[]) => void` | **Required.** Callback function that is executed when the user confirms their selection. It passes an array of the selected learner IDs. |

#### Usage Example

```tsx
// In OnboardingFlow.tsx
import LearnerSelection from './steps/LearnerSelection';

// ...

case 'LINK_LEARNERS':
  return <LearnerSelection onComplete={handleLearnersConfirmed} />;
```

---

### 2. `LearnerCard.tsx`

This component displays a single learner's information in a card format. It includes action buttons for selecting, viewing details, and removing the learner.

#### Props

| Prop            | Type                       | Description                                            |
| --------------- | -------------------------- | ------------------------------------------------------ |
| `learner`       | `Learner`                  | **Required.** The learner object containing all data to display. |
| `isSelected`    | `boolean`                  | **Required.** Controls the visual selected state of the card. |
| `onSelect`      | `(learnerId: string) => void` | **Required.** Callback for when the user clicks the select button. |
| `onViewDetails` | `(learner: Learner) => void` | **Required.** Callback to open the details modal for the learner. |
| `onRemove`      | `(learnerId: string) => void` | *Optional.* Callback for when the user clicks the remove button. If not provided, the button is hidden. |

---

### 3. `LearnerDetailsModal.tsx`

A modal dialog that presents a detailed, read-only view of a learner's information.

#### Props

| Prop      | Type                | Description                                            |
| --------- | ------------------- | ------------------------------------------------------ |
| `learner` | `Learner \| null`   | **Required.** The learner object to display. If `null`, the modal is not rendered. |
| `onClose` | `() => void`        | **Required.** Callback function to close the modal.      |
