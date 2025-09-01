import React, { useState } from 'react';
import { useRouter } from "next/router";
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2Address from './steps/Step2Address';
import Step3Admins from './steps/Step3Admins';
import Step4Social from './steps/Step4Social';
import Step5InviteStaff from './steps/Step5InviteStaff';

import LoadingSpinner from '../../spinners/LoadingSpinner';
import { provisionNewSchool } from './services/schoolService';

// Success Popup Component
const SuccessPopup = ({ isVisible, schoolName }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl transform animate-pulse">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-600 mb-4">
          Success! 🚀
        </h2>
        <p className="text-gray-700 mb-4">
          <span className="font-semibold">{schoolName}</span> has been successfully created! 
        </p>
        <div className="flex justify-center space-x-2 text-2xl">
          <span>✅</span>
          <span>🏫</span>
          <span>👨‍🎓</span>
          <span>📚</span>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Redirecting in a moment... ⏳
        </p>
      </div>
    </div>
  );
};

const CreateSchoolForm = ({ user }) => {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [formData, setFormData] = useState({
    schoolName: '',
    schoolEmail: '',
    phone: '',
    theme: { mode: 'green', value: '#20B486' },
    logo: null,
    addressLine1: '',
    addressLine2: '',
    country: '',
    province: '',
    city: '',
    postalCode: '',
    location: null,
    adminUsers: [],
    website: '',
    facebook: '',
    tiktok: '',
    linkedin: '',
    invites: [],
    status: 'active', // 👈 default
  });

  const updateField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleNextStep = () => setStep((prev) => prev + 1);
  const handlePreviousStep = () => setStep((prev) => prev - 1);

  const handleFormSubmission = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      console.log('📤 Submitting full school provisioning flow:', formData);
      const school = await provisionNewSchool(formData, user);

      console.log('✅ Provisioning complete:', school);
      setSuccess(true);
      setShowSuccessPopup(true);
      
      // ✅ Show success popup, then reload after delay
      setTimeout(() => {
        setShowSuccessPopup(false);
        //router.reload();
      }, 3000); // 3 seconds to show the popup
      
    } catch (err) {
      console.error('💥 Error during provisioning:', err);
      setError('Failed to create and provision school. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
         // In the CreateSchoolForm component, update the Step1BasicInfo props:
<Step1BasicInfo
  schoolName={formData.schoolName}
  schoolEmail={formData.schoolEmail}
  phone={formData.phone}
  theme={formData.theme}
  onFileChange={(file) => updateField('logo', file)}
  onSchoolNameChange={(e) => updateField('schoolName', e.target.value)}
  onSchoolEmailChange={(e) => updateField('schoolEmail', e.target.value)}
  onPhoneChange={(e) => updateField('phone', e.target.value)}
  onThemeChange={(mode, value) => updateField('theme', { mode, value })}
  onNext={handleNextStep}
/>
        );
      case 2:
        return (
          <Step2Address
            formData={formData}
            onLine1Change={(e) => updateField('addressLine1', e.target.value)}
            onLine2Change={(e) => updateField('addressLine2', e.target.value)}
            onCountryChange={(e) => updateField('country', e.target.value)}
            onProvinceChange={(e) => updateField('province', e.target.value)}
            onCityChange={(e) => updateField('city', e.target.value)}
            onPostalCodeChange={(e) => updateField('postalCode', e.target.value)}
            onMapClick={(coords) => updateField('location', coords)}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        );
      case 3:
        return (
          <Step3Admins
            adminUsers={formData.adminUsers}
            onAdminUsersChange={(admins) => updateField('adminUsers', admins)}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        );
      case 4:
        return (
          <Step4Social
            formData={formData}
            onWebsiteChange={(e) => updateField('website', e.target.value)}
            onFacebookChange={(e) => updateField('facebook', e.target.value)}
            onTikTokChange={(e) => updateField('tiktok', e.target.value)}
            onLinkedInChange={(e) => updateField('linkedin', e.target.value)}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        );
      case 5:
        return (
          <Step5InviteStaff
            formData={formData}
            setFormData={setFormData}
            onPrevious={handlePreviousStep}
            onSubmit={handleFormSubmission}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto mt-8 p-4 bg-gray-100 border rounded-md">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto mt-8 p-4 bg-gray-100 border rounded-md">
        <h1 className="text-2xl font-bold mb-4">Create a School 🏫</h1>
        {error && (
          <div className="text-red-500 mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            ❌ {error}
          </div>
        )}
        {success && !showSuccessPopup && (
          <div className="text-green-600 mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            🎉 School created and you've been set as Admin!
          </div>
        )}
        {renderStep()}
      </div>
      
      {/* Success Popup */}
      <SuccessPopup 
        isVisible={showSuccessPopup} 
        schoolName={formData.schoolName}
      />
    </>
  );
};

export default CreateSchoolForm;