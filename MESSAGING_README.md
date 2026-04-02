# Messaging Agent v2 - SchoolHeadOffice

## Overview
Messaging Agent v2 is an intelligent, real-time communication platform designed to power interactions between Teachers, Parents, and Principals. It provides a "Messenger/WhatsApp" style experience with built-in AI to enhance school-related communication.

## Core Features
### 1. Intelligent Conversations
- **1-on-1 Chats:** Secure messaging between Teachers ↔ Parents and Teachers ↔ Principals.
- **Group Chats:** Contextual groups for Classes, Grade levels, and School staff.
- **Real-time Experience:** Polling-based live updates, bi-directional typing indicators, and read receipts.

### 2. Smart Context Awareness (AI Sentinel)
The AI agent automatically scans message content to detect:
- **Learner Names:** Links messages to specific students via MongoDB lookups.
- **Grade Levels:** Identifies mentions of grades (e.g., "Grade 10").
- **Subjects:** Detects academic subjects (e.g., "Mathematics", "Science").
- **Intent Detection:** Recognizes issues like late homework or performance alerts.

### 3. AI Assistance
- **Smart Suggestions:** Provides teachers with context-aware reply buttons.
- **Automated Alerts:** Generates drafts for urgent parent updates based on detected context.
- **Audience Intelligence:** Suggests broad distribution (e.g., "Send to all Grade 10 parents") when appropriate.

### 4. Safety & Control
- **School Isolation:** Users can only communicate within their authorized school.
- **Role-based Access:** Principals have full visibility; Parents only see relevant teachers.
- **Secure APIs:** All endpoints verify participant identity and school membership.

## Technical Architecture

### Backend Services (`lib/services/MessagingService.ts`)
Handles the core business logic for conversation management, message delivery, and status tracking. Enforces security boundaries.

### AI Layer (`lib/ai/messaging-agent.ts`)
Implements the NLP-lite engine for context detection and suggestion generation. It is decoupled from business logic to allow for future LLM integration.

### API Layer (`pages/api/v1/messaging/`)
- `conversations.ts`: Manage direct and group chat sessions.
- `messages.ts`: CRUD operations for individual messages and status updates (read/typing).
- `agent.ts`: Endpoint for AI-powered message analysis and suggestion retrieval.

### Frontend Component (`components/teacher/MessagingSection.tsx`)
A high-fidelity React component that integrates into the Teacher Dashboard and Parent Portal. It handles state management for real-time polling and UI interactions.

## Deployment & Integration
- **Next.js 15 Support:** Uses `withPageAuthRequired` and explicitly awaits request context for Auth0 stability.
- **Database:** Fully integrated with MongoDB collections (`conversations`, `messages`, `students`, `teachers`).
- **Styling:** Built with Tailwind CSS following the "Intelligent Canvas" design system.

---
*Maintained by the SchoolHeadOffice Engineering Team.*
