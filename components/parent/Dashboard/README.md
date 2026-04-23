# Parent Dashboard – SchoolHeadOffice

## Overview
The Parent Dashboard is the central intelligence hub for parents using SchoolHeadOffice. It provides real-time visibility into their children's educational journey, from academic performance to school communications.

## Architecture Principles
To ensure scalability and maintainability, the dashboard follows a strict separation of concerns:

- **UI Components (`components/`)**: Purely presentational components and page structure.
- **Business Logic (`hooks/`)**: Custom hooks (e.g., `useParentDashboard`) managing state and side effects.
- **API Layer (`services/`)**: Centralized service modules for backend communication.
- **Type Safety (`types/`)**: TypeScript interfaces and types for consistent data handling.
- **Reusable UI (`widgets/`)**: Modular cards and banners used across different tabs.

## Features & Tiers

### Standard Plan (Included)
- **Overview Tab**: Snapshot of children, recent notifications, and key stats.
- **Academics Tab**: View academic progress and grades.
- **Attendance Tab**: Monitor school attendance and late arrivals.
- **Assignments Tab**: Track upcoming homework and project deadlines.
- **Messages Tab**: Direct communication with teachers and school admin.
- **Reports Tab**: Access and download periodic progress reports.

### Premium Plan (Enhanced)
- **Advanced Analytics**: Deep dive into subject mastery and growth trends.
- **Real-time Updates**: Instant notifications for grades and behavioral events.
- **Behavioral Insights**: Detailed tracking and pattern analysis.
- **Teacher Scheduling**: Book meetings directly from the dashboard.
- **Enhanced Reports**: PDF exports and custom performance summaries.
- **Priority Support**: 24/7 access to dedicated support.

## Folder Structure
```
components/parent/Dashboard/
├── ParentDashboard.tsx      # Main dashboard entry point
├── DashboardLayout.tsx     # Persistent layout (header, sidebar/nav)
├── tabs/                   # Individual feature tabs
│   ├── OverviewTab.tsx
│   ├── AcademicsTab.tsx
│   ├── AnalyticsTab.tsx
│   └── ...
├── widgets/                # Reusable UI elements (cards, banners)
├── hooks/                  # Logic and state management
├── services/               # API and data fetching
└── types/                  # TypeScript definitions
```

## Getting Started
The `ParentDashboard` component expects the following props:
- `user`: Auth0 user object.
- `profile`: Parent profile including subscription status.
- `learners`: Array of learner (children) data.

```tsx
<ParentDashboard
  user={user}
  profile={profile}
  learners={learners}
/>
```

## Future Roadmap
- AI-driven academic insights and performance predictions.
- Integration with mobile push notifications.
- Parent performance scoring and community benchmarks.
