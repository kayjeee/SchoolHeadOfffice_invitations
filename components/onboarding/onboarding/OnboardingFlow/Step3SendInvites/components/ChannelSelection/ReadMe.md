# ChannelSelection Component Overview

This directory contains the components, hooks, and services responsible for the communication channel selection and invitation sending phase of the onboarding flow.

## Directory Structure

```
ChannelSelection/
├── components/                # Presentational components
│   ├── ChannelCard.tsx       # Individual channel card in the grid
│   ├── ChannelModal.tsx      # Main modal orchestrator for channel actions
│   ├── EmailModalContent.tsx # UI content for the Email channel
│   ├── EmailScheduler.tsx    # Email scheduling interface
│   ├── EmailTesterSection.tsx# Email testing and bulk send UI
│   ├── InvitationComposer.tsx# Final invitation preview and sending
│   ├── QrCodeWithCopy.tsx    # QR code display and link copy
│   ├── SchoolInfoHeader.tsx  # Header with school and PR code info
│   ├── WhatsAppScheduler.tsx # WhatsApp scheduling interface
│   └── WhatsAppTesterSection.tsx # WhatsApp testing and bulk send UI
├── hooks/                     # Custom hooks for ChannelSelection
│   ├── useAudienceData.ts    # Fetches grades and learners for the selected audience
│   └── usePrCode.ts          # Manages PR code generation and state
├── services/                  # Local API services
│   ├── EmailService.ts       # Service for email operations
│   ├── gradeService.ts       # Service for grade-related API calls
│   └── learnerService.ts     # Service for learner-related API calls
├── ui/                        # Reusable UI components
│   ├── CopyButton.tsx        # Styled button for clipboard operations
│   ├── LoadingSpinner.tsx    # Loading indicator
│   └── Modal.tsx             # Generic modal component
├── utils/                     # Utility functions
│   └── logger.ts             # Module-specific logging
├── ChannelSelection.tsx      # Main entry component for channel selection
├── index.tsx                 # Module entry point
└── types/                    # TypeScript definitions
    └── channel.ts            # Channel-related interfaces
```

## Key Workflows

### 1. Audience Loading
When the `ChannelModal` is opened, the `useAudienceData` hook fetches all grades and learners for the given school. It then filters them based on the selected grades and the communication channel (e.g., filtering for learners with valid phone numbers for WhatsApp/SMS).

### 2. Channel Selection
The `ChannelSelection` component displays a grid of available channels (`Email`, `SMS`, `WhatsApp`, `Portal`). Clicking a channel card opens the `ChannelModal`.

### 3. Invitation Sending (WhatsApp/SMS)
Both WhatsApp and SMS follow a similar flow in the modal:
- **Contacts Tab**: View the filtered list of recipients.
- **Test Message Tab**: Send a single test message to verify the template. This involves:
  1. Calling the invitation API to generate a magic link.
  2. Sending the message via the respective messaging service.
- **Bulk Send**: Send messages to all selected recipients.
- **Schedule**: Set a future time for the messages to be sent.

### 4. PR Code & Sharing
The `SchoolInfoHeader` and `QrCodeWithCopy` components handle the generation and display of the school's unique PR code and the sharing link, allowing for manual distribution of invitations.

## Integration with Services
The components interact with centralized services located in `lib/services/`:
- `WhatsAppBusinessService.ts`: For WhatsApp operations.
- `SmsService.ts`: For SMS operations.
- `invitationService.ts`: For creating invitation records in the backend.
