# Step1BasicInfo Component Overview



## Description
The `Step1BasicInfo` component is the first step in a multi-step school onboarding form. It collects essential school information, allows logo upload, and provides theme customization options for the school portal.

![Createschoolform_wireframe](../../../../documentation/createschoolimage.png)

## Features

### ✨ Enhanced UI/UX
- **Modern Card Layout**: Information is organized in clean, bordered cards with proper spacing
- **Visual Hierarchy**: Clear section headers and organized content flow
- **Responsive Design**: Works seamlessly across different screen sizes
- **Loading States**: Built-in loading indicators for better user feedback

### 🎨 Advanced Theme System
- **Preset Themes**: 5 carefully selected color presets (Green, Orange, Blue, Pink, Purple)
- **Custom Color Picker**: Allows unlimited color customization
- **Live Preview**: Real-time preview of selected theme with hover effects
- **Visual Feedback**: Selected themes show clear visual indicators
- **Accessibility**: Proper ARIA labels and keyboard navigation support

### ✅ Form Validation
- **Real-time Validation**: Validates fields as users interact with them
- **Required Field Handling**: Clear indication of required fields
- **Email Validation**: Proper email format checking
- **Error Display**: User-friendly error messages

### 📁 File Upload Integration
- **Logo Upload**: Dedicated section for school logo upload
- **File Type Restrictions**: Accepts only image files
- **Size Limitations**: 5MB maximum file size (configurable)

## Props Interface

```typescript
interface Step1BasicInfoProps {
  // Form Data
  schoolName?: string;
  schoolEmail?: string;
  phoneNumber?: string;
  
  // Event Handlers
  onFileChange: (file: File) => void;
  onSchoolNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSchoolEmailChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onPhoneNumberChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  
  // UI State
  isLoading?: boolean;
}
```

## Dependencies

### Required Components
- `FormComponent`: Custom form input component with error handling
- `FileUpload`: File upload component with drag & drop support

### Custom Hooks
- `useColorMode`: Hook for managing theme state and persistence

### Utilities
- `getBackgroundColor()`: Generates background colors based on theme
- `getHoverColor()`: Generates hover state colors based on theme

## Key Improvements from Original

### 🚀 Performance Optimizations
- **useMemo Hook**: Prevents unnecessary re-calculations of theme colors
- **Optimized Re-renders**: Better state management to reduce component updates
- **Event Handler Optimization**: Proper event handling with cleanup

### 🎯 Better User Experience
- **Form Validation**: Real-time validation with helpful error messages
- **Loading States**: Clear feedback during form submission
- **Accessibility**: Screen reader support and keyboard navigation
- **Visual Feedback**: Hover effects and selection indicators

### 🔧 Code Quality
- **TypeScript Ready**: Better prop definitions and type safety
- **Constants**: Moved theme presets to constants for maintainability
- **Error Handling**: Comprehensive error state management
- **Clean Architecture**: Separated concerns and improved readability

### 🎨 Visual Enhancements
- **Card-based Layout**: Professional, modern appearance
- **Better Spacing**: Consistent spacing using Tailwind's space utilities
- **Improved Buttons**: Better styling with hover and focus states
- **Theme Preview**: Enhanced preview with multiple UI elements

## Usage Example

```jsx
import Step1BasicInfo from './components/Step1BasicInfo';

function SchoolOnboarding() {
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolEmail: '',
    phoneNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    setIsLoading(true);
    // Process form data
    await submitStep1Data(formData);
    setIsLoading(false);
    // Navigate to next step
  };

  return (
    <Step1BasicInfo
      schoolName={formData.schoolName}
      schoolEmail={formData.schoolEmail}
      phoneNumber={formData.phoneNumber}
      onSchoolNameChange={(e) => setFormData(prev => ({
        ...prev,
        schoolName: e.target.value
      }))}
      onSchoolEmailChange={(e) => setFormData(prev => ({
        ...prev,
        schoolEmail: e.target.value
      }))}
      onPhoneNumberChange={(e) => setFormData(prev => ({
        ...prev,
        phoneNumber: e.target.value
      }))}
      onFileChange={(file) => console.log('Logo uploaded:', file)}
      onNext={handleNext}
      isLoading={isLoading}
    />
  );
}
```

## Styling Notes

The component uses Tailwind CSS for styling with:
- **Responsive Design**: Mobile-first approach
- **Dark Mode Ready**: Easy to extend for dark mode support
- **Custom Properties**: Uses CSS custom properties for dynamic theming
- **Consistent Spacing**: Follows design system spacing patterns

## Future Enhancements

### Potential Additions
- **Multi-language Support**: Internationalization ready structure
- **Dark Mode**: Toggle between light and dark themes
- **Advanced Validation**: Custom validation rules
- **Progress Indicator**: Show completion progress across steps
- **Auto-save**: Automatically sa