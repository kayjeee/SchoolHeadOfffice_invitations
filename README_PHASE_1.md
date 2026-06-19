# SchoolHeadOffice - Phase 1: Foundations

Welcome to the documentation for **Phase 1** of the SchoolHeadOffice administrative platform. Phase 1 focuses on establishing the core infrastructure for school onboarding, academic hierarchy management, and initial parent-learner communication.

## 🎯 Phase 1 Objectives
The primary goal was to create a seamless "Zero to Operational" experience for school administrators. This includes setting up their school structure, importing student data, and initiating the first wave of community engagement.

---

## 🚀 Core Features

### 1. Interactive Onboarding Flow
A streamlined 3-step wizard that guides administrators through school setup:
- **Step 1: Grade Creation**: Define the academic levels supported by the school.
- **Step 2: Bulk Data Ingestion**: High-performance CSV/Excel uploader for learner rosters. Includes a **Smart Mapping Engine** that handles various header formats and data inconsistencies.
- **Step 3: Multi-Channel Invitations**:
    - Automated generation of School PR Codes and Join Links.
    - Direct invitation delivery via **WhatsApp**, **SMS**, and **Email**.
    - Real-time audience overview and message scheduling.

### 2. Academic Hierarchy Dashboard (`/admin/[schoolSlug]/grades`)
A sophisticated management console for day-to-day school organization:
- **Grade & Class CRUD**: Full lifecycle management for academic levels and class streams.
- **Intelligent Class Cards**:
    - Real-time capacity tracking (Visual progress bars: Emerald -> Amber -> Red).
    - Teacher assignment management (Class vs. Subject teachers).
- **Drag-and-Drop Allocation**: Effortlessly move learners from a dedicated "Unassigned" sidebar into specific classes.
- **Learner Transition Tool**: A dedicated interface for moving students between streams within a grade, featuring pre-selection and conflict prevention.

### 3. Data Resilience & Intelligence
- **Heuristic Contact Detection**: Automatically identifies phone numbers hidden in "Accession Number" or other non-standard fields.
- **Unified Normalization**: A robust service layer that bridges backend API variations (camelCase/snake_case) to provide a consistent frontend model.
- **Global Search**: Search across Learners, Teachers, and Classes from any administrative view.

---

## 🛠 Technology Stack
- **Framework**: Next.js 15 (App Router) & React 18.
- **Styling**: Tailwind CSS with dynamic school-based theming (CSS Variables).
- **Icons & Motion**: Lucide React & Framer Motion.
- **API Client**: Custom Axios-based `ApiClient` with global authorization synchronization and 15s timeouts.
- **Validation**: Zod (for API schemas) & React Hook Form.
- **UI Components**: Radix UI (Dialogs, Tabs) & custom interactive elements.

---

## 📁 Key Modules

### `components/onboarding`
Contains the end-to-end setup logic, including the bulk upload system and the communication channel modals.

### `components/admin/grades`
Handles the academic hierarchy, drag-and-drop logic, and the learner transition engine.

### `lib/api`
The central hub for all backend communication, featuring the `SchoolAPI` and `MessagingAPI`.

---

## ✅ Phase 1 Completion Checklist
- [x] Multi-step onboarding sequence.
- [x] Excel/CSV Bulk Upload with validation.
- [x] WhatsApp/SMS/Email invitation modals.
- [x] Grade/Class management (CRUD).
- [x] Drag-and-drop learner allocation.
- [x] Intra-grade learner transition tool.
- [x] Responsive layout with dynamic branding.

---
*Last Updated: February 2024*
