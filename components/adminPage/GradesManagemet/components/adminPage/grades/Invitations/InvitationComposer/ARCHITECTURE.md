# Architecture Documentation

This document explains the architectural decisions and patterns used in the refactored invitation components.

## 🏗️ Overall Architecture

### Layered Architecture

```
┌─────────────────────────────────────┐
│           Presentation Layer        │  ← React Components
├─────────────────────────────────────┤
│           Business Logic Layer      │  ← Services & Validation
├─────────────────────────────────────┤
│           Data Access Layer         │  ← API Calls & State Management
└─────────────────────────────────────┘
```

### Component Hierarchy

```
InvitationComposer (Root)
├── RecipientSelector
│   ├── SearchInput (shared)
│   ├── LoadingSpinner (shared)
│   └── RecipientItem (internal)
├── MessageEditor
│   ├── TemplateSelector
│   │   └── TemplatePreviewModal (internal)
│   ├── RichTextEditor (shared)
│   └── VariableInserter (shared)
├── SchedulingOptions
│   └── DateTimePicker (shared)
├── PreviewPanel
│   └── ValidationItem (internal)
└── SendingControls
    └── ConfirmationModal (shared)
```

## 🎯 Design Principles

### 1. Single Responsibility Principle (SRP)
Each component has one clear purpose:
- `RecipientSelector`: Only handles recipient selection
- `MessageEditor`: Only handles message composition
- `SchedulingOptions`: Only handles scheduling configuration

### 2. Open/Closed Principle (OCP)
Components are open for extension but closed for modification:
- Shared components accept props for customization
- New features can be added without changing existing components
- Plugin-like architecture for templates and variables

### 3. Dependency Inversion Principle (DIP)
High-level components don't depend on low-level details:
- Components depend on service interfaces, not implementations
- Services can be swapped without changing components
- Mock services can be used for testing

### 4. Composition over Inheritance
Components are composed of smaller components:
- `MessageEditor` composes `RichTextEditor` and `VariableInserter`
- `InvitationComposer` orchestrates all sub-components
- Shared components are reused across different contexts

## 🔄 Data Flow Architecture

### Unidirectional Data Flow

```
┌─────────────────┐
│ InvitationData  │ ← Single source of truth
└─────────┬───────┘
          │ Props (down)
          ▼
┌─────────────────┐
│ Child Component │
└─────────┬───────┘
          │ Callbacks (up)
          ▼
┌─────────────────┐
│ State Updates   │
└─────────────────┘
```

### State Management Strategy

1. **Local State**: Component-specific UI state (loading, errors, form inputs)
2. **Lifted State**: Shared data managed in parent components
3. **Service State**: API data and business logic in service layer

```javascript
// Example of state lifting
const InvitationComposer = () => {
  const [invitationData, setInvitationData] = useState({
    recipients: [],    // Shared between RecipientSelector and PreviewPanel
    subject: '',       // Shared between MessageEditor and PreviewPanel
    message: '',       // Shared between MessageEditor and PreviewPanel
    // ... other shared state
  });

  // State update function passed to children
  const updateInvitationData = (field, value) => {
    setInvitationData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <RecipientSelector 
        selectedRecipients={invitationData.recipients}
        onRecipientsChange={(recipients) => updateInvitationData('recipients', recipients)}
      />
      <MessageEditor 
        subject={invitationData.subject}
        message={invitationData.message}
        onSubjectChange={(subject) => updateInvitationData('subject', subject)}
        onMessageChange={(message) => updateInvitationData('message', message)}
      />
      <PreviewPanel invitationData={invitationData} />
    </div>
  );
};
```

## 🔧 Service Layer Architecture

### Service Responsibilities

1. **API Communication**: Handle HTTP requests and responses
2. **Data Transformation**: Convert API data to component-friendly formats
3. **Error Handling**: Centralized error handling and retry logic
4. **Caching**: Implement caching strategies for performance
5. **Business Logic**: Complex operations that don't belong in components

### Service Interface Pattern

```javascript
// Abstract interface (conceptual)
interface InvitationServiceInterface {
  getAvailableRecipients(gradeId: string): Promise<Recipient[]>;
  sendInvitation(data: InvitationData): Promise<SendResult>;
  // ... other methods
}

// Concrete implementation
class InvitationService implements InvitationServiceInterface {
  async getAvailableRecipients(gradeId) {
    // Implementation details
  }
  
  async sendInvitation(data) {
    // Implementation details
  }
}

// Singleton instance
export const invitationService = new InvitationService();
```

### Validation Architecture

```javascript
// Validation as pure functions
class InvitationValidation {
  static validateRecipients(recipients) {
    // Pure function - no side effects
    // Returns validation result object
  }
  
  static validateComplete(invitationData) {
    // Composes multiple validation functions
    // Returns comprehensive validation result
  }
}
```

## 🧩 Component Patterns

### 1. Container/Presentational Pattern

**Container Components** (Smart Components):
- Manage state and business logic
- Handle API calls and data fetching
- Pass data and callbacks to presentational components

**Presentational Components** (Dumb Components):
- Focus on rendering UI
- Receive data via props
- Communicate via callbacks

```javascript
// Container Component
const RecipientSelectorContainer = ({ gradeId, onRecipientsChange }) => {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadRecipients();
  }, [gradeId]);
  
  const loadRecipients = async () => {
    // Business logic
  };
  
  return (
    <RecipientSelectorPresentation
      recipients={recipients}
      loading={loading}
      onSelectionChange={onRecipientsChange}
    />
  );
};

// Presentational Component
const RecipientSelectorPresentation = ({ recipients, loading, onSelectionChange }) => {
  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      {recipients.map(recipient => (
        <RecipientItem key={recipient.id} recipient={recipient} />
      ))}
    </div>
  );
};
```

### 2. Compound Component Pattern

Components that work together as a cohesive unit:

```javascript
// Main component provides context
const TemplateSelector = ({ children, selectedTemplate, onTemplateSelect }) => {
  return (
    <TemplateSelectorContext.Provider value={{ selectedTemplate, onTemplateSelect }}>
      <div className="template-selector">
        {children}
      </div>
    </TemplateSelectorContext.Provider>
  );
};

// Sub-components use context
TemplateSelector.Grid = ({ children }) => {
  return <div className="template-grid">{children}</div>;
};

TemplateSelector.Card = ({ template }) => {
  const { selectedTemplate, onTemplateSelect } = useContext(TemplateSelectorContext);
  // Component implementation
};

// Usage
<TemplateSelector selectedTemplate={template} onTemplateSelect={handleSelect}>
  <TemplateSelector.Grid>
    {templates.map(template => (
      <TemplateSelector.Card key={template.id} template={template} />
    ))}
  </TemplateSelector.Grid>
</TemplateSelector>
```

### 3. Render Props Pattern

For maximum flexibility and reusability:

```javascript
const DataFetcher = ({ url, children }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchData();
  }, [url]);
  
  const fetchData = async () => {
    // Fetch logic
  };
  
  return children({ data, loading, error, refetch: fetchData });
};

// Usage
<DataFetcher url="/api/recipients">
  {({ data, loading, error, refetch }) => {
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage error={error} onRetry={refetch} />;
    return <RecipientList recipients={data} />;
  }}
</DataFetcher>
```

### 4. Higher-Order Component (HOC) Pattern

For cross-cutting concerns:

```javascript
const withLoading = (WrappedComponent) => {
  return (props) => {
    const [loading, setLoading] = useState(false);
    
    const withLoadingProps = {
      ...props,
      setLoading,
      isLoading: loading
    };
    
    if (loading) {
      return <LoadingSpinner />;
    }
    
    return <WrappedComponent {...withLoadingProps} />;
  };
};

// Usage
const EnhancedRecipientSelector = withLoading(RecipientSelector);
```

## 🎨 Styling Architecture

### CSS-in-JS vs CSS Modules vs Styled Components

This project uses traditional CSS with BEM methodology:

```css
/* Block */
.invitation-composer { }

/* Element */
.invitation-composer__header { }
.invitation-composer__content { }

/* Modifier */
.invitation-composer--loading { }
.invitation-composer__button--primary { }
```

### Component-Specific Styles

Each component has its own stylesheet:

```
components/
├── InvitationComposer/
│   ├── InvitationComposer.js
│   ├── InvitationComposer.css
│   └── index.js
```

### Shared Style Variables

```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  
  --font-family: 'Inter', sans-serif;
  --border-radius: 4px;
  --box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

## 🔒 Error Handling Architecture

### Error Boundaries

```javascript
class InvitationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Invitation component error:', error, errorInfo);
    // Log to error reporting service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    
    return this.props.children;
  }
}
```

### Service Error Handling

```javascript
class InvitationService {
  async sendInvitation(data) {
    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new InvitationError(
          `Failed to send invitation: ${response.status}`,
          response.status,
          await response.json()
        );
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof InvitationError) {
        throw error; // Re-throw custom errors
      }
      
      // Wrap unknown errors
      throw new InvitationError(
        'An unexpected error occurred',
        'UNKNOWN_ERROR',
        error
      );
    }
  }
}

class InvitationError extends Error {
  constructor(message, code, details) {
    super(message);
    this.name = 'InvitationError';
    this.code = code;
    this.details = details;
  }
}
```

## 🚀 Performance Considerations

### Component Optimization

1. **React.memo**: Prevent unnecessary re-renders
2. **useMemo**: Memoize expensive calculations
3. **useCallback**: Memoize callback functions
4. **Code Splitting**: Lazy load components

```javascript
// Memoized component
const RecipientItem = React.memo(({ recipient, isSelected, onToggle }) => {
  return (
    <div className={`recipient-item ${isSelected ? 'selected' : ''}`}>
      {/* Component content */}
    </div>
  );
});

// Memoized calculations
const ExpensiveComponent = ({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => expensiveProcessing(item));
  }, [data]);
  
  return <div>{/* Render processed data */}</div>;
};

// Memoized callbacks
const ParentComponent = () => {
  const handleItemClick = useCallback((id) => {
    // Handle click
  }, []);
  
  return (
    <div>
      {items.map(item => (
        <ChildComponent key={item.id} onClick={handleItemClick} />
      ))}
    </div>
  );
};
```

### Bundle Optimization

```javascript
// Lazy loading
const InvitationComposer = React.lazy(() => import('./InvitationComposer'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <InvitationComposer />
</Suspense>
```

## 🧪 Testing Architecture

### Testing Strategy

1. **Unit Tests**: Individual component testing
2. **Integration Tests**: Component interaction testing
3. **End-to-End Tests**: Full workflow testing

### Testing Patterns

```javascript
// Component testing with React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InvitationComposer } from './InvitationComposer';

describe('InvitationComposer', () => {
  it('should update subject when MessageEditor changes', async () => {
    render(<InvitationComposer />);
    
    const subjectInput = screen.getByLabelText(/subject/i);
    fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Subject')).toBeInTheDocument();
    });
  });
});

// Service testing
import { invitationService } from './invitationService';

describe('InvitationService', () => {
  it('should send invitation successfully', async () => {
    const mockData = { recipients: [], subject: 'Test', message: 'Test' };
    
    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
    
    const result = await invitationService.sendInvitation(mockData);
    
    expect(result.success).toBe(true);
    expect(fetch).toHaveBeenCalledWith('/api/invitations/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockData)
    });
  });
});
```

## 📈 Scalability Considerations

### Future Enhancements

1. **State Management**: Consider Redux or Zustand for complex state
2. **TypeScript**: Add type safety for better developer experience
3. **Internationalization**: Support multiple languages
4. **Accessibility**: Ensure WCAG compliance
5. **Performance Monitoring**: Add performance tracking

### Migration Path

1. **Phase 1**: Replace monolithic component with refactored version
2. **Phase 2**: Add TypeScript definitions
3. **Phase 3**: Implement advanced state management
4. **Phase 4**: Add comprehensive testing
5. **Phase 5**: Performance optimization and monitoring

This architecture provides a solid foundation for building maintainable, scalable, and testable React applications while following industry best practices and design patterns.

