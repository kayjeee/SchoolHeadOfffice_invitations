# Parent Onboarding Step Components

This directory contains the individual React components that make up the steps of the parent onboarding flow. Each component is responsible for a single piece of the onboarding process, such as collecting profile information or linking learners.

## New Components

### `SubscriptionChoice.tsx`

- **Purpose:** Presents the user with a choice between the Standard (Free) and Premium (Paid) subscription tiers.
- **Props:**
  - `onComplete`: A callback function that is called when the user selects a tier. It passes an object with the selected `tier` (`'standard'` or `'premium'`).
- **Usage:** This component is rendered as the `SUBSCRIPTION_CHOICE` step in the `OnboardingFlow`.

### `PaymentSetup.tsx`

- **Purpose:** Collects payment information from the user if they select the Premium subscription tier. It supports both Credit Card and Mobile Money payments.
- **Props:**
  - `onComplete`: A callback function that is called when the user submits their payment information. It passes an object with the `paymentMethod` and `details` of the payment.
- **Usage:** This component is rendered as the `PAYMENT_SETUP` step in the `OnboardingFlow` if the user chooses the 'premium' tier.


├─ steps/ │
│
├─ ConfirmLearner.tsx │ 
│ 
├─ ConfirmLearners.tsx │ 
│ 
├─ IdentityVerification.tsx │ │ ├─ LearnerCard.tsx │ │ ├─ LearnerDetailsModal.tsx │ │ ├─ LearnerSelection.tsx │ 
│ 
├─ LinkLearners.tsx │ 
│ 
├─ NotificationPreferences.tsx │ 
│ 
├─ ParentContactSummary.tsx │ 
│ 
├─ ProfileSetup.tsx │
│ 
├─ TermsAcceptance.tsx │ 
│ 
└─ README.md │ 
├─ BackButton.tsx │ 
├─ OnboardingFlow.tsx 
│
└─ OnboardingProgress.tsx