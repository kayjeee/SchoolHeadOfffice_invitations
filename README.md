# SchoolHeadOffice (SHO)



SchoolHeadOffice is an all-in-one educational communication, school administration, and learning support platform connecting school administrators, educators, parents, and students. Built to serve resource-constrained and developing school ecosystems—particularly in South Africa—the platform digitizes routine school workflows, eliminates paper expenses, bridges communication gaps through multi-channel delivery, and empowers teachers and students with purpose-built digital tools.

---
[![School-Head-Office: Unifying Education](https://repoclip.io/api/badge/d9821a32-9789-4985-a444-f0b03be2ad98)](https://repoclip.io/v/d9821a32-9789-4985-a444-f0b03be2ad98)

## 🌟 Executive Summary

SchoolHeadOffice addresses the operational fragmentation experienced by educational institutions when managing student enrollment, parent communication, academic scheduling, attendance, marks recording, and learning support.

By replacing disconnected spreadsheets, paper-based slips, and unmonitored chat groups with a unified web ecosystem, SchoolHeadOffice delivers:
- **Instant Stakeholder Onboarding:** Fast-track parent and teacher onboarding using WhatsApp Business API, SMS, and magic links with automatic phone-number reconciliation.
- **Dedicated Portals for Every Role:** Purpose-built, role-scoped workspaces for School Administrators, Teachers, Parents, and Students.
- **Real-Time Communication Channels:** ActionCable WebSocket chat rooms for direct messaging, class groups, grade groups, and staff-wide communications with strict data privacy.
- **Academic & Operational Logistics:** Integrated tools for academic calendars, class sections, subjects, timetables, daily attendance registers, assessment marks, report cards, supply requisitions, and student promotion.
- **Practical Student Empowerment:** Practical learning resources including a Learner Print Shop with local delivery, peer tutoring opportunities, AI homework assistance, and an open-source school project hub.

---

## Features

### 🏢 Core Administration & Multi-Channel Communication
* **Unified School Portal:** Centralized digital hub for school administrators to manage announcements, student updates, and routine notices.
* **Multi-Channel Delivery:** Instant communication reach across WhatsApp, SMS, email, and web/in-app messaging to ensure no parent is left behind regardless of digital access.
* **Paperless Workflows:** Replaces costly paper-based letters and physical notices, cutting down administrative and operational expenses.

### 🤖 AI-Powered Educator Tools
* **Automated Assessment Generation:** Uses fine-tuned, open-source AI models (Meta Llama) to allow teachers to instantly generate test papers, question papers, and mock exams.
* **Curriculum Alignment:** Tailors generated questions, marking schemes, and educational resources directly to South African CAPS curriculum standards and specific classroom topics.
* **Resource & Lesson Planning:** Helps teachers rapidly draft classroom content, lesson outlines, and study materials, drastically reducing daily prep time.
* **WhatsApp AI Delivery:** Delivers teacher-generated materials and AI updates directly through accessible channels like WhatsApp for quick access and low latency.

### 🔒 Access Control & Infrastructure
* **Role-Based Portals:** Dedicated access interfaces tailored for administrators, teachers, and parents.
* **Secure Authentication:** Integrated user management and access control handling securely across all web and mobile platforms.
* **Low-Resource Optimization:** Engineered to operate efficiently across varying bandwidth environments, resource-constrained schools, and diverse device types.

---

## 🎓 The Four Core Student Features

To support learners who need affordable educational resources, academic support, income opportunities through approved educational work, and practical software development experience, SchoolHeadOffice provides four dedicated student workspaces:

1. **Learner Print Shop & Local Delivery (`/student/[schoolSlug]/dashboard/[email]/print-shop`):**
   - Access subsidized curriculum revision packs, worksheets, and study notes tailored to South African grades.
   - Submit custom print requests with transparent page pricing (B&W or Color) and binding options.
   - Choose between free School Office Collection or Local Community Delivery.
   - Real-time order tracking and history.

2. **Marking & Tutoring Opportunities (`/student/[schoolSlug]/dashboard/[email]/opportunities`):**
   - Approved peer tutoring and academic assistant work opportunities.
   - Applications for homework assistance, content digitization, and educator-supervised assessment marking.
   - Transparent weekly stipends and earnings tracking.
   - Built-in academic integrity and child-safeguarding rules.

3. **AI Homework Helper (`/student/[schoolSlug]/dashboard/[email]/ai-helper`):**
   - Guided study companion providing step-by-step problem explanations, hints, and concept breakdowns rather than merely producing answers.
   - Contextualized by subject and CAPS grade levels.
   - Interactive practice mode with instant explanatory feedback.

4. **Open-Source School Project Hub (`/student/[schoolSlug]/dashboard/[email]/projects`):**
   - Practical software and IT project workspace addressing real school problems (e.g. library scanners, load-shedding alerts, offline worksheet PWAs).
   - Direct educator mentorship from computer science teachers and IT specialists.
   - Full open-source contribution lifecycle from proposal to maintainer review and integration.

---

## 👨‍👩‍👧 Parent Experience & Portal Workspaces

Parents access a comprehensive suite of tools located at `/parent/[school_slug]/dashboard/[email]/`:
- **Overview Dashboard:** Linked learner cards, attendance percentage KPIs, and recent school announcements.
- **Academics & Report Cards:** Subject-by-subject assessment scores, term averages, and digital report card cards.
- **Attendance Register:** Visual calendar logs displaying daily present, absent, late, and excused status records.
- **Real-Time Communications:** 1:1 chat with teachers and access to class/grade broadcast channels.
- **Premium & Fees:** Fee settlement and portal subscription upgrade portal powered by PayFast.

---

## 🛠️ Architecture & Tech Stack

### Frontend Application
- **Framework:** Next.js (Hybrid App Router & Pages Router) with TypeScript
- **UI & Styling:** Tailwind CSS, Radix UI, Headless UI, Lucide React, Framer Motion
- **State & Data Fetching:** SWR, TanStack React Query, Custom React Hooks
- **Authentication:** Auth0 Next.js SDK (`@auth0/nextjs-auth0`) with multi-role array preservation
- **Real-Time Messaging:** `@rails/actioncable` over WebSockets (`ConversationChannel`)
- **Payments:** PayFast Payment Gateway Integration

### Backend API
- **Framework:** Ruby on Rails (v7.x, API-only)
- **Database:** MongoDB (via Mongoid ODM v8.x)
- **Real-Time Engine:** ActionCable with Puma Web Server
- **Authentication:** Auth0 JWT verification with public JWKS key rotation
- **Deployment:** Render (`render.yaml`), Kamal Container Deployment (`config/deploy.yml`), Docker

```
 +------------------------------------+          +------------------------------------+
 |        Client Web Browser          |          |        Auth0 Identity Server       |
 +------------------------------------+          +------------------------------------+
       |                           \                          /
       | HTTP/REST (JSON)           \ WebSocket              / OIDC / JWT
       v                             v                      v
 +------------------------------------+          +------------------------------------+
 | Next.js Frontend App (Port 3000)   |          | Rails API Backend (Port 4000)      |
 +------------------------------------+          +------------------------------------+
                                                        |
                                                        | Mongoid ODM
                                                        v
                                                 +------------------------------------+
                                                 | MongoDB Database Collections       |
                                                 | (users, learners, invitations,     |
                                                 |  attendance, conversations, etc.)  |
                                                 +------------------------------------+
```

---

## 📂 Route Directory Structure

```text
pages/
├── index.tsx                                        # Platform Landing Page
├── admin/index.js                                   # Admin Login Gateway
├── parent/
│   ├── index.tsx                                    # Parent Auth Gate & Onboarding Flow
│   └── [school_slug]/
│       ├── join.tsx                                 # Tokenized Invitation Gateway
│       └── dashboard/[email]/
│           ├── index.tsx                            # Parent Overview Dashboard
│           ├── academics.tsx                        # Student Academics & Report Cards
│           ├── attendance.tsx                       # Daily Attendance Registers
│           ├── communications.tsx                   # ActionCable Real-Time Chat
│           ├── premium.tsx                          # PayFast Subscription Checkout
│           └── ... (assignments, events, etc.)
└── student/
    ├── index.tsx                                    # Student Entry & Onboarding Wizard
    └── [school_slug]/
        └── dashboard/[email]/
            ├── index.tsx                            # Student Overview Dashboard
            ├── print-shop.tsx                       # Learner Print Shop & Delivery
            ├── opportunities.tsx                    # Tutoring & Opportunities Hub
            ├── ai-helper.tsx                        # AI Homework & Concept Helper
            └── projects.tsx                         # Open-Source School Project Hub

app/
├── admin/[schoolSlug]/                              # App Router School Admin Portal
│   ├── learners/page.tsx                            # Learner CRM & Academic Modules
│   ├── teachers/page.tsx                            # Teacher CRM & Supply Requisitions
│   ├── communications/page.tsx                      # Communications Hub
│   └── settings/page.tsx                            # Terms & School Calendar Configuration
└── teacher/[schoolSlug]/                            # App Router Teacher Portal
    ├── page.tsx                                     # Teacher Overview & Attendance
    ├── learners/page.tsx                            # Assigned Learners Directory
    ├── communications/page.tsx                      # Educator Messaging Workspace
    └── supply-requests/page.tsx                     # Supply Requisition Submission
```

---

## 📚 Documentation Index

Comprehensive technical documentation is maintained in the repository:
- `PRD.md` — Complete Product Requirements Document covering the full frontend and backend architecture, models, API reference, and user flows.
- `docs/parent-student/01-product-requirements-document.md` — Parent & Student PRD specification.
- `docs/parent-student/02-technical-requirements-document.md` — Detailed TRD covering tech stack, auth lifecycle, and API contracts.
- `docs/parent-student/03-application-flow-map.md` — Mermaid architecture diagrams and application phase mappings.
- `docs/parent-student/04-parent-student-page-inventory-and-feature-specification.md` — Complete page inventory and technical component specs.
- `docs/parent-student/05-integration-data-security-and-testing-document.md` — Data model, multi-tenancy isolation, security, and QA guidelines.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.x or v20.x)
- npm or yarn
- Ruby on Rails backend running (`sho_backend_v2`) on port `4000` or configured via `NEXT_PUBLIC_API_BASE_URL`
- Auth0 Account & Application Credentials

### Installation & Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kayjeee/SchoolHeadOfffice_invitations.git
   cd SchoolHeadOfffice_invitations
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
   NEXT_PUBLIC_AUTH0_DOMAIN=your-auth0-domain.auth0.com
   AUTH0_CLIENT_ID=your_auth0_client_id
   AUTH0_CLIENT_SECRET=your_auth0_client_secret
   AUTH0_SECRET=your_32_character_session_secret
   NEXT_PUBLIC_ACTIONCABLE_URL=ws://localhost:4000/cable
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📄 License

Proprietary & Confidential. All rights reserved by **SchoolHeadOffice**.
