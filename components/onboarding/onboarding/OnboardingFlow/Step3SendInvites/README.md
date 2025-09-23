# Step3SendInvites Component

A comprehensive React component for managing learner invitations in an onboarding flow. This component provides a multi-step interface for selecting learners, choosing communication channels, composing messages, and tracking invitation results.

## Overview

The Step3SendInvites component is designed with a modular architecture that separates concerns into distinct layers:

- **Components Layer**: Presentational components for UI rendering
- **Hooks Layer**: Custom React hooks for state management and business logic
- **Services Layer**: API communication and data fetching
- **Utils Layer**: Utility functions for validation, data processing, and helper operations

## Architecture

```
Step3SendInvites/
├── index.tsx                          # Main container component
├── components/                        # Presentational components
│   ├── LearnerSelection/
│   │   ├── index.tsx                 # Learner selection interface
│   │   ├── LearnerCard.tsx           # Individual learner card
│   │   └── GradeFilter.tsx           # Grade filtering component
│   ├── ChannelSelection/
│   │   └── index.tsx                 # Communication channel selection
│   ├── MessageComposer/
│   │   └── index.tsx                 # Message composition interface
│   ├── InviteResults/
│   │   ├── index.tsx                 # Results overview
│   │   ├── InviteCard.tsx            # Individual invite status card
│   │   └── BulkActions.tsx           # Bulk operation controls
│   └── UI/
│       ├── Icon.tsx                  # Icon component
│       ├── LoadingState.tsx          # Loading state indicator
│       └── ErrorState.tsx            # Error state display
├── hooks/                             # Custom React hooks
│   ├── useLearnerData.ts             # Learner data management
│   ├── useInviteManagement.ts        # Invite operations
│   ├── useFormState.ts               # Form state management
│   └── useStepValidation.ts          # Step validation logic
├── services/                          # API services
│   ├── inviteService.ts              # Invite-related API calls
│   ├── learnerService.ts             # Learner data API calls
│   └── gradeService.ts               # Grade data API calls
├── utils/                             # Utility functions
│   ├── validation.ts                 # Input validation utilities
│   ├── download.ts                   # File download utilities
│   ├── clipboard.ts                  # Clipboard operations
│   └── constants.ts                  # Application constants
├── types.ts                           # TypeScript type definitions
└── README.md                          # This documentation
```

## Features

### Multi-Step Workflow
- **Step 1**: Learner Selection with grade filtering and bulk operations
- **Step 2**: Communication Channel Selection with feature comparison
- **Step 3**: Message Composition with templates and preview
- **Step 4**: Results Tracking with status monitoring and bulk actions

### Learner Management
- Grade-based filtering and selection
- Bulk select/deselect operations
- Search functionality
- Individual learner cards with status indicators
- Duplicate email detection

### Communication Channels
- Email with customizable subject and body
- SMS with character limit validation
- App notifications with title and body
- Portal messages with rich formatting support

### Message Composition
- Channel-specific templates
- Variable substitution (learnerName, inviteLink, etc.)
- Real-time preview with sample data
- Character limit validation for SMS and notifications
- Message validation and error handling

### Results Management
- Real-time status tracking
- Bulk resend and cancel operations
- Data export (CSV, JSON, TXT)
- Clipboard operations for links and data
- Detailed invite cards with timestamps and error messages

## Installation

```bash
# Copy the Step3SendInvites directory to your project
cp -r Step3SendInvites/ your-project/src/components/onboarding/

# Install required dependencies (if not already installed)
npm install react react-dom
```

## Usage

### Basic Implementation

```tsx
import React from 'react';
import { Step3SendInvites } from './components/onboarding/Step3SendInvites';

function OnboardingFlow() {
  const handleNext = () => {
    // Navigate to next step in onboarding
    console.log('Moving to next step');
  };

  const handlePrevious = () => {
    // Navigate to previous step in onboarding
    console.log('Moving to previous step');
  };

  const handleComplete = () => {
    // Complete the invitation process
    console.log('Invitation process completed');
  };

  return (
    <Step3SendInvites
      onNext={handleNext}
      onPrevious={handlePrevious}
      onComplete={handleComplete}
    />
  );
}
```

### Advanced Configuration

```tsx
import React from 'react';
import { Step3SendInvites } from './components/onboarding/Step3SendInvites';
import { Learner, InviteChannel } from './components/onboarding/Step3SendInvites/types';

function AdvancedOnboarding() {
  const preselectedLearners: Learner[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      gradeId: 'grade-1',
      gradeName: 'Grade 10'
    }
  ];

  const preselectedChannel: InviteChannel = {
    id: 'email',
    name: 'Email',
    description: 'Send invites via email',
    icon: 'mail',
    features: ['Customizable message', 'Delivery tracking'],
    recommended: true
  };

  const handleStepChange = (step: string) => {
    console.log('Step changed to:', step);
  };

  return (
    <Step3SendInvites
      initialStep="learner-selection"
      preselectedLearners={preselectedLearners}
      preselectedChannel={preselectedChannel}
      onStepChange={handleStepChange}
      onNext={() => console.log('Next')}
      onPrevious={() => console.log('Previous')}
      onComplete={() => console.log('Complete')}
    />
  );
}
```

## API Configuration

### Environment Variables

```bash
# API Configuration
REACT_APP_API_BASE_URL=https://api.yourplatform.com
REACT_APP_API_KEY=your-api-key-here
```

### Service Configuration

```tsx
// Custom service configuration
import { InviteService, LearnerService, GradeService } from './services';

const customInviteService = new InviteService({
  apiBaseUrl: 'https://custom-api.com',
  apiKey: 'custom-key'
});
```

## Component Props

### Step3SendInvites Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onNext` | `() => void` | Yes | Callback for next step navigation |
| `onPrevious` | `() => void` | Yes | Callback for previous step navigation |
| `onComplete` | `() => void` | Yes | Callback for completion |
| `initialStep` | `StepState` | No | Initial step to display |
| `preselectedLearners` | `Learner[]` | No | Pre-selected learners |
| `preselectedChannel` | `InviteChannel` | No | Pre-selected channel |
| `onStepChange` | `(step: StepState) => void` | No | Step change callback |

## Hooks

### useLearnerData

Manages learner data, selection, and grade filtering.

```tsx
const {
  learners,
  selectedLearners,
  grades,
  selectedGrades,
  loading,
  error,
  selectLearner,
  deselectLearner,
  selectAllLearners,
  deselectAllLearners
} = useLearnerData();
```

### useInviteManagement

Handles invite operations and status tracking.

```tsx
const {
  invites,
  sendingInvites,
  sendInvites,
  resendInvite,
  cancelInvite,
  downloadInviteData,
  copyInviteLinks
} = useInviteManagement();
```

### useFormState

Manages form state for channel and message selection.

```tsx
const {
  selectedChannel,
  inviteMessage,
  isDirty,
  isValid,
  setSelectedChannel,
  setInviteMessage,
  resetForm
} = useFormState();
```

### useStepValidation

Provides validation logic for each step.

```tsx
const {
  isStepValid,
  canProceedToNext,
  validationErrors,
  stepErrors
} = useStepValidation({
  currentStep,
  selectedLearners,
  selectedChannel,
  inviteMessage
});
```

## Services

### InviteService

Handles all invite-related API operations.

```tsx
import { inviteService } from './services/inviteService';

// Send invites
const response = await inviteService.sendInvites({
  learners: selectedLearners,
  channel: selectedChannel,
  message: inviteMessage
});

// Resend invite
await inviteService.resendInvite(inviteId);

// Cancel invite
await inviteService.cancelInvite(inviteId);
```

### LearnerService

Manages learner data operations.

```tsx
import { learnerService } from './services/learnerService';

// Get learners with filters
const learners = await learnerService.getLearners({
  gradeIds: ['grade-1', 'grade-2'],
  searchTerm: 'john',
  status: 'active'
});

// Search learners
const results = await learnerService.searchLearners('john doe');
```

### GradeService

Handles grade-related operations.

```tsx
import { gradeService } from './services/gradeService';

// Get all grades
const grades = await gradeService.getGrades();

// Get grade statistics
const stats = await gradeService.getGradeStats();
```

## Utilities

### Validation Utils

```tsx
import { validationUtils } from './utils/validation';

// Validate email
const isValid = validationUtils.validateEmail('user@example.com');

// Validate invite message
const errors = validationUtils.validateInviteMessage(message, channel);

// Validate learner selection
const result = validationUtils.validateLearnerSelection(learners);
```

### Download Utils

```tsx
import { downloadUtils } from './utils/download';

// Download invite data as CSV
const csvData = downloadUtils.convertInvitesToCSV(invites);
downloadUtils.downloadCSV(csvData, 'invites.csv');

// Download invite report
downloadUtils.downloadInviteReport(invites, 'csv');
```

### Clipboard Utils

```tsx
import { clipboardUtils } from './utils/clipboard';

// Copy invite links
await clipboardUtils.copyInviteLinks(invites, 'detailed');

// Copy learner emails
await clipboardUtils.copyLearnerEmails(learners, 'names-emails');

// Copy invite summary
await clipboardUtils.copyInviteSummary(invites);
```

## Types

The component uses comprehensive TypeScript types for type safety:

```tsx
import {
  Learner,
  Grade,
  InviteChannel,
  InviteMessage,
  Invite,
  StepState,
  InviteStatus
} from './types';
```

## Styling

The component uses CSS classes for styling. You can customize the appearance by providing your own CSS:

```css
/* Main container */
.step3-send-invites {
  /* Your styles */
}

/* Step progress indicator */
.step-progress {
  /* Your styles */
}

/* Learner cards */
.learner-card {
  /* Your styles */
}

/* Channel selection */
.channel-card {
  /* Your styles */
}

/* Message composer */
.message-composer {
  /* Your styles */
}

/* Invite results */
.invite-card {
  /* Your styles */
}
```

## Error Handling

The component includes comprehensive error handling:

- Network errors with retry mechanisms
- Validation errors with user-friendly messages
- Service errors with fallback options
- Loading states for better user experience

## Performance Considerations

- Lazy loading of learner data
- Debounced search functionality
- Memoized calculations for large datasets
- Efficient re-rendering with React hooks
- Pagination for large learner lists

## Browser Support

- Modern browsers with ES6+ support
- Clipboard API support for copy operations
- File download support for data export

## Contributing

When contributing to this component:

1. Follow the established architecture patterns
2. Add comprehensive TypeScript types
3. Include proper error handling
4. Write unit tests for new functionality
5. Update documentation for API changes

## License

This component is part of the learning platform project and follows the project's licensing terms.

