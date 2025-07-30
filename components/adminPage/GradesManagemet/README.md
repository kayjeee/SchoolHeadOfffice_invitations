# Grades Management Components

A comprehensive React UI component library for grades management systems, focusing on clean UI elements without backend calls or API integrations.

## Overview

This package provides a complete set of React components for managing grades, learners, and parent communications in educational institutions. The components are designed to be UI-focused, allowing you to integrate them with your own backend systems and APIs.

## Features

- **Grades Management**: Create, edit, and delete grades with comprehensive CRUD operations
- **Learners Management**: Manage learner information with advanced filtering and bulk operations
- **Invitation System**: Template-based email invitations with status tracking
- **Credit System**: Manage invitation credits with purchase options
- **Responsive Design**: Mobile-friendly components with Tailwind CSS styling
- **Accessibility**: WCAG compliant components with proper ARIA labels
- **TypeScript Ready**: Full TypeScript support (types included)

## Installation

```bash
npm install grades-management-components
# or
yarn add grades-management-components
```

### Peer Dependencies

Make sure you have the following peer dependencies installed:

```bash
npm install react react-dom react-icons
```

## Quick Start

```jsx
import React from 'react';
import { GradesContainer } from 'grades-management-components';

function App() {
  const selectedSchool = {
    _id: 'school-123',
    schoolName: 'Greenwood Primary School'
  };

  const user = {
    _id: 'user-123',
    name: 'John Admin'
  };

  return (
    <div className="App">
      <GradesContainer 
        selectedSchool={selectedSchool}
        user={user}
      />
    </div>
  );
}

export default App;
```

## Component Structure

```
components/
├── adminPage/
│   ├── grades/
│   │   ├── GradesContainer.js          # Main container component
│   │   ├── GradesCRUD/
│   │   │   ├── CreateGradeModal.js     # Create new grade modal
│   │   │   ├── EditGradeModal.js       # Edit existing grade modal
│   │   │   └── DeleteGradeModal.js     # Delete grade confirmation modal
│   │   ├── LearnersManager/
│   │   │   ├── LearnersTable.js        # Learners data table with pagination
│   │   │   ├── LearnersFilters.js      # Advanced filtering component
│   │   │   ├── BulkUpload.js           # Bulk learner upload with validation
│   │   │   └── LearnerDetail.js        # Individual learner detail modal
│   │   ├── Invitations/
│   │   │   ├── TemplateManager.js      # Email template management
│   │   │   ├── InvitationComposer.js   # Compose and send invitations
│   │   │   ├── StatusTracker.js        # Track invitation delivery status
│   │   │   └── CreditSystem.js         # Manage invitation credits
│   │   └── sidebar/
│   │       └── GradesNavigation.js     # Navigation component for grades section
```

## Components Documentation

### GradesContainer

The main container component that orchestrates all grades management functionality.

**Props:**
- `selectedSchool` (object): School information object
- `user` (object): Current user information

**Example:**
```jsx
<GradesContainer 
  selectedSchool={{
    _id: 'school-123',
    schoolName: 'Greenwood Primary School'
  }}
  user={{
    _id: 'user-123',
    name: 'John Admin'
  }}
/>
```

### CRUD Components

#### CreateGradeModal
Modal component for creating new grades.

**Props:**
- `isOpen` (boolean): Controls modal visibility
- `onClose` (function): Callback when modal is closed
- `selectedSchool` (object): School information

#### EditGradeModal
Modal component for editing existing grades.

**Props:**
- `isOpen` (boolean): Controls modal visibility
- `onClose` (function): Callback when modal is closed
- `grade` (object): Grade data to edit

#### DeleteGradeModal
Confirmation modal for deleting grades.

**Props:**
- `isOpen` (boolean): Controls modal visibility
- `onClose` (function): Callback when modal is closed
- `grade` (object): Grade data to delete

### Learners Management Components

#### LearnersTable
Comprehensive table component for displaying learner information.

**Features:**
- Sortable columns
- Pagination
- Bulk selection
- Individual learner actions

**Props:**
- `selectedGrade` (object): Currently selected grade
- `onSelectLearner` (function): Callback when learner is selected

#### LearnersFilters
Advanced filtering component for learners.

**Features:**
- Search by name, email, or student ID
- Filter by status, age range, enrollment period
- Quick filter buttons
- Active filters display

**Props:**
- `selectedGrade` (object): Currently selected grade
- `onFiltersChange` (function): Callback when filters change

#### BulkUpload
Multi-step bulk upload component for learners.

**Features:**
- File validation (Excel/CSV)
- Data preview
- Error reporting
- Progress tracking

**Props:**
- `isOpen` (boolean): Controls modal visibility
- `onClose` (function): Callback when modal is closed
- `selectedGrade` (object): Target grade for upload

#### LearnerDetail
Comprehensive learner detail modal with tabbed interface.

**Features:**
- Personal information tab
- Contact details tab
- Medical information tab
- Academic records tab
- Inline editing capability

**Props:**
- `isOpen` (boolean): Controls modal visibility
- `onClose` (function): Callback when modal is closed
- `learner` (object): Learner data to display

### Invitation System Components

#### TemplateManager
Email template management component.

**Features:**
- Create/edit/delete templates
- Template preview
- Variable insertion
- Template categorization

#### InvitationComposer
Compose and send invitation emails.

**Features:**
- Template selection
- Recipient targeting
- Scheduling options
- Preview functionality

#### StatusTracker
Track invitation delivery and engagement status.

**Features:**
- Status filtering
- Delivery timeline
- Resend functionality
- Detailed analytics

#### CreditSystem
Manage invitation credits and purchases.

**Features:**
- Credit balance display
- Package selection
- Usage history
- Low balance warnings

### Navigation Component

#### GradesNavigation
Sidebar navigation component for grades section.

**Features:**
- Collapsible navigation
- Active state indication
- Quick stats display
- Responsive design

**Props:**
- `tabs` (object): Navigation configuration
- `activeTab` (string): Currently active tab ID
- `onTabChange` (function): Tab change callback
- `isExpanded` (boolean): Sidebar expansion state

## Styling

This component library uses Tailwind CSS for styling. Make sure you have Tailwind CSS configured in your project:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Add the following to your `tailwind.config.js`:

```js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/grades-management-components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## Data Integration

Since these components focus on UI only, you'll need to integrate them with your backend systems. Here are the key integration points:

### API Endpoints Expected

The components are designed to work with these types of API endpoints:

```javascript
// Grades
POST /api/grades/create
PUT /api/grades/:id
DELETE /api/grades/:id
GET /api/grades/school/:schoolId

// Learners
GET /api/learners/grade/:gradeId
POST /api/learners/create
PUT /api/learners/:id
DELETE /api/learners/:id
POST /api/learners/bulk-upload

// Invitations
GET /api/invitations/templates
POST /api/invitations/send
GET /api/invitations/status
POST /api/invitations/resend

// Credits
GET /api/credits/balance
POST /api/credits/purchase
GET /api/credits/history
```

### Data Structures

#### Grade Object
```javascript
{
  id: number,
  name: string,
  description: string,
  capacity: number,
  academicYear: string,
  gradeLevel: string,
  subjects: string[],
  learnerCount: number,
  teacherCount: number
}
```

#### Learner Object
```javascript
{
  id: number,
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  dateOfBirth: string,
  parentName: string,
  parentEmail: string,
  parentPhone: string,
  enrollmentDate: string,
  status: 'active' | 'inactive' | 'pending',
  studentId: string,
  address: string,
  medicalInfo: string,
  emergencyContact: string
}
```

## Customization

### Theming

You can customize the appearance by overriding Tailwind CSS classes:

```css
/* Custom styles */
.grades-container {
  @apply bg-custom-bg text-custom-text;
}

.grades-button-primary {
  @apply bg-custom-primary hover:bg-custom-primary-dark;
}
```

### Component Extension

Components can be extended or wrapped for additional functionality:

```jsx
import { LearnersTable } from 'grades-management-components';

function CustomLearnersTable(props) {
  const handleCustomAction = (learner) => {
    // Custom logic here
    console.log('Custom action for:', learner);
  };

  return (
    <div className="custom-wrapper">
      <LearnersTable 
        {...props}
        onCustomAction={handleCustomAction}
      />
    </div>
  );
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on GitHub or contact our support team.

## Changelog

### v1.0.0
- Initial release
- Complete grades management system
- Learners management with bulk operations
- Invitation system with templates
- Credit management system
- Responsive design
- Accessibility compliance

