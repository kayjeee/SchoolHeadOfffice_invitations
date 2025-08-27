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