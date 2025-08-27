Great! Let's continue the refactoring process. Now that we've separated the API calls and validation logic into their own files, the next crucial step is to create our custom hook. This hook will be the central brain of the form, managing all the state and business logic.

Step 3: Create useSchoolForm.js
This custom hook will replace most of the logic currently inside CreateSchoolForm.js. It will handle all useState declarations, the step navigation, and the main handleFormSubmission function, which will now use the service and utility files we just created.

Create the file at components/schoolpage/CreateSchoolForm/hooks/useSchoolForm.js.

Move all the state declarations (useState) from the original CreateSchoolForm component into this new hook.

Import the functions from schoolService.js and validators.js.

Move the navigation logic (handleNextStep, handlePreviousStep) and the main submission handler (handleAuthenticationAndFormSubmission) into the hook.

Update the submission handler to call the functions from schoolService.js instead of having the fetch calls directly inside the component.

The hook should return an object containing all the state variables and handler functions that the index.js container will need.

components/schoolpage/CreateSchoolForm/hooks/useSchoolForm.js

JavaScript

import { useState, useEffect } from 'react';
import {
  getAccessToken,
  uploadFileToCloudinary,
  createSchool,
  assignAuth0Role,
  syncBackendRole,
  addSchoolToUser,
} from '../services/schoolService';
import { validateStep1, validateStep2 } from '../utils/validators';

console.log('🧠 useSchoolForm.js hook loaded');

const useSchoolForm = (user) => {
  // ==================== STATE DECLARATIONS ====================
  const [file, setFile] = useState(null);
  const [schoolName, setSchoolName] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [theme, setTheme] = useState('#20B486');

  const [schoolAddressLine1, setSchoolAddressLine1] = useState('');
  const [schoolAddressLine2, setSchoolAddressLine2] = useState('');
  const [country, setCountry] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [adminUser1Name, setAdminUser1Name] = useState('');
  const [adminUser1Email, setAdminUser1Email] = useState('');
  const [adminUser2Name, setAdminUser2Name] = useState('');
  const [adminUser2Email, setAdminUser2Email] = useState('');

  const [website, setWebsite] = useState('');
  const [facebook, setFacebook] = useState('');
  const [tiktok, setTikTok] = useState('');
  const [linkedin, setLinkedIn] = useState('');

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);

  // Combine all form data into a single object for easier access and validation
  const formData = {
    schoolName,
    schoolEmail,
    file,
    theme,
    schoolAddressLine1,
    schoolAddressLine2,
    country,
    province,
    city,
    postalCode,
    selectedLocation,
    latitude,
    longitude,
    adminUser1Name,
    adminUser1Email,
    adminUser2Name,
    adminUser2Email,
    website,
    facebook,
    tiktok,
    linkedin,
  };

  // ==================== EFFECT HOOKS ====================

  // Effect to get the user's current location on mount
  useEffect(() => {
    console.log('🌍 Geolocation effect triggered');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log('✅ Geolocation retrieved:', coords);
          setCurrentLocation(coords);
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (err) => {
          console.error('❌ Geolocation error:', err.message);
          console.log('📍 Falling back to default location');
          setError('Geolocation not available. Please select your location on the map.');
        }
      );
    } else {
      console.warn('⚠️ Geolocation is not supported by this browser');
      setError('Geolocation is not supported by your browser.');
    }
  }, []);

  // ==================== HANDLERS & LOGIC ====================

  const handleNextStep = () => {
    console.log(`➡️ Attempting to move from step ${step} to step ${step + 1}`);
    setError(null);

    // Validation for each step
    let isValid = true;
    switch (step) {
      case 1:
        isValid = validateStep1(formData);
        break;
      case 2:
        isValid = validateStep2(formData);
        break;
      // Add validation for other steps if needed
      default:
        break;
    }

    if (!isValid) {
      alert('Please fill in all required fields to proceed.');
      return;
    }

    const nextStep = step + 1;
    console.log(`✅ Moving to step ${nextStep}`);
    setStep(nextStep);
  };

  const handlePreviousStep = () => {
    const prevStep = step - 1;
    console.log(`⬅️ Moving from step ${step} to step ${prevStep}`);
    setStep(prevStep);
    setError(null);
  };

  const handleFormSubmission = async () => {
    console.log('🚀 Starting form submission process...');
    setLoading(true);
    setError(null);

    try {
      // 1. Upload file to Cloudinary
      const cloudinaryImageUrl = await uploadFileToCloudinary(file);

      // 2. Create school record in the backend
      const schoolPayload = {
        schoolName,
        logo: cloudinaryImageUrl,
        schoolEmail,
        line1: schoolAddressLine1,
        line2: schoolAddressLine2,
        country,
        province,
        city,
        postalCode,
        theme,
        latitude,
        longitude,
        website,
        facebook,
        tiktok,
        linkedin,
        user_id: user?.sub,
        user_email: user?.email,
        school_created_by: user?.email,
      };
      const schoolCreationResponse = await createSchool(schoolPayload);
      const schoolId = schoolCreationResponse.schoolId;

      // 3. Get Auth0 Management API access token
      const accessToken = await getAccessToken();
      const userId = user?.sub;

      // 4. Assign Admin role in Auth0
      await assignAuth0Role(userId, accessToken, ['rol_a6KrxwaZ1CguNPXS']);

      // 5. Synchronize role in backend
      await syncBackendRole(userId, ['Admin']);

      // 6. Add the new school to the user's schools array
      await addSchoolToUser(userId, schoolId);

      console.log('🎉 Form submission completed successfully!');
      alert('School created and roles assigned successfully!');
      window.location.reload(); // Or redirect to the new school's page

    } catch (err) {
      console.error('💥 Error during form submission:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      alert(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      console.log('🔄 Setting loading state to false');
      setLoading(false);
    }
  };

  // Return all state and handlers needed by the component
  return {
    step,
    loading,
    error,
    formData,
    setFile,
    setSchoolName,
    setSchoolEmail,
    setTheme,
    setSchoolAddressLine1,
    setSchoolAddressLine2,
    setCountry,
    setProvince,
    setCity,
    setPostalCode,
    setCurrentLocation,
    setSelectedLocation,
    setLatitude,
    setLongitude,
    setAdminUser1Name,
    setAdminUser1Email,
    setAdminUser2Name,
    setAdminUser2Email,
    setWebsite,
    setFacebook,
    setTikTok,
    setLinkedIn,
    handleNextStep,
    handlePreviousStep,
    handleFormSubmission,
  };
};

export default useSchoolForm;
Step 4: Refactor the Main Stepper Container (index.js)
With the custom hook in place, the main CreateSchoolForm component can now be simplified significantly. It will no longer manage any state or API calls directly. Its only job is to get the state and handlers from the useSchoolForm hook and render the appropriate step component.

Rename your original CreateSchoolForm.js file to index.js.

Import useSchoolForm and the step components.

Inside the component, call useSchoolForm to get all the necessary state and handlers.

Use a switch statement or a series of conditional renderings to display the correct step component based on the step value from the hook.

Pass the relevant state variables and handlers as props to each step component.

This approach makes the main component extremely clean and easy to follow.

components/schoolpage/CreateSchoolForm/index.js