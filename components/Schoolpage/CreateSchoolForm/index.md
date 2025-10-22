import React from 'react';
import { useRouter } from 'next/router';
import useSchoolForm from './hooks/useSchoolForm';
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2AddressInfo from './steps/Step2AddressInfo';
import Step3AdminUsers from './steps/Step3AdminUsers';

console.log('📋 CreateSchoolForm component loaded');

const CreateSchoolForm = ({ user }) => {
  const router = useRouter();
  
  // Use custom hook to manage all form state and logic
  const {
    step,
    loading,
    error,
    formData,
    currentLocation,
    setFile,
    setSchoolName,
    setSchoolEmail,
    setPhone,
    setTheme,
    setSchoolAddressLine1,
    setSchoolAddressLine2,
    setCountry,
    setProvince,
    setCity,
    setPostalCode,
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
  } = useSchoolForm(user);

  console.log('🎨 Current theme state:', formData.theme);
  console.log('📍 Current step:', step);

  // Handler for theme changes from Step1
  const handleThemeChange = (mode, value) => {
    console.log('🎨 Theme changed:', { mode, value });
    setTheme({ mode, value });
  };

  // Handler for file changes
  const handleFileChange = (file) => {
    console.log('📁 File selected:', file?.name);
    setFile(file);
  };

  // Handler for location changes
  const handleLocationChange = (location) => {
    console.log('📍 Location changed:', location);
    setSelectedLocation(location);
    if (location?.lat && location?.lng) {
      setLatitude(location.lat);
      setLongitude(location.lng);
    }
  };

  // Render the appropriate step component
  const renderStep = () => {
    console.log(`🔄 Rendering step ${step}`);

    switch (step) {
      case 1:
        return (
          <Step1BasicInfo
            schoolName={formData.schoolName}
            schoolEmail={formData.schoolEmail}
            phone={formData.phone}
            theme={formData.theme}
            onFileChange={handleFileChange}
            onSchoolNameChange={(e) => setSchoolName(e.target.value)}
            onSchoolEmailChange={(e) => setSchoolEmail(e.target.value)}
            onPhoneChange={(e) => setPhone(e.target.value)}
            onThemeChange={handleThemeChange}
            onNext={handleNextStep}
            isLoading={loading}
          />
        );

      case 2:
        return (
          <Step2AddressInfo
            addressLine1={formData.schoolAddressLine1}
            addressLine2={formData.schoolAddressLine2}
            country={formData.country}
            province={formData.province}
            city={formData.city}
            postalCode={formData.postalCode}
            currentLocation={currentLocation}
            selectedLocation={formData.selectedLocation}
            latitude={formData.latitude}
            longitude={formData.longitude}
            onAddressLine1Change={(e) => setSchoolAddressLine1(e.target.value)}
            onAddressLine2Change={(e) => setSchoolAddressLine2(e.target.value)}
            onCountryChange={(e) => setCountry(e.target.value)}
            onProvinceChange={(e) => setProvince(e.target.value)}
            onCityChange={(e) => setCity(e.target.value)}
            onPostalCodeChange={(e) => setPostalCode(e.target.value)}
            onLocationChange={handleLocationChange}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
            isLoading={loading}
          />
        );

      case 3:
        return (
          <Step3AdminUsers
            adminUser1Name={formData.adminUser1Name}
            adminUser1Email={formData.adminUser1Email}
            adminUser2Name={formData.adminUser2Name}
            adminUser2Email={formData.adminUser2Email}
            website={formData.website}
            facebook={formData.facebook}
            tiktok={formData.tiktok}
            linkedin={formData.linkedin}
            onAdminUser1NameChange={(e) => setAdminUser1Name(e.target.value)}
            onAdminUser1EmailChange={(e) => setAdminUser1Email(e.target.value)}
            onAdminUser2NameChange={(e) => setAdminUser2Name(e.target.value)}
            onAdminUser2EmailChange={(e) => setAdminUser2Email(e.target.value)}
            onWebsiteChange={(e) => setWebsite(e.target.value)}
            onFacebookChange={(e) => setFacebook(e.target.value)}
            onTikTokChange={(e) => setTikTok(e.target.value)}
            onLinkedInChange={(e) => setLinkedIn(e.target.value)}
            onSubmit={handleFormSubmission}
            onPrevious={handlePreviousStep}
            isLoading={loading}
          />
        );

      default:
        console.warn('⚠️ Unknown step:', step);
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Invalid Step
            </h2>
            <p className="text-gray-600 mb-6">
              Something went wrong. Please refresh the page.
            </p>
            <button
              onClick={() => router.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        );
    }
  };

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-red-900 mb-4">
            Error Occurred
          </h2>
          <p className="text-red-700 mb-6">
            {error}
          </p>
          <button
            onClick={() => router.reload()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-3 rounded-lg z-50 max-w-xs">
          <div className="font-bold mb-1">Debug Info:</div>
          <div>Step: {step}/3</div>
          <div>Loading: {loading ? 'Yes' : 'No'}</div>
          <div>Theme: {formData.theme?.mode || 'N/A'}</div>
          <div>School: {formData.schoolName || 'Not set'}</div>
        </div>
      )}

      {/* Main form container */}
      <div className="w-full">
        {renderStep()}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Creating Your School...
            </h3>
            <p className="text-gray-600">
              Please wait while we set everything up for you.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateSchoolForm;